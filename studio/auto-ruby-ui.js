/* Lightweight author UI; the Japanese dictionary stays in a lazy worker. */
(function(){
 'use strict';let active=null;
 const copy=x=>JSON.parse(JSON.stringify(x));
 const defaults={mode:'difficult',grade:3,repeat:'work'};
 function element(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
 function button(text,fn){const n=element('button',text);n.type='button';n.onclick=fn;return n;}
 function field(label,options,value){const row=element('label'),cap=element('span',label),select=element('select');for(const [v,t] of options){const o=element('option',t);o.value=v;select.append(o);}select.value=String(value);row.append(cap,select);return {row,select};}
 function close(){active?.close();}
 function open(ctx,quick=false){
  close();const doc=ctx.document,index=ctx.index,initial=doc.studio?.autoRuby||{};
  let dictionary=copy(initial.dictionary||{}),settings={...defaults,...initial.settings},worker=null,busy=false,seq=0,result=null,snapshot=null;
  const dialog=element('dialog');dialog.className='auto-ruby-dialog';
  const header=element('div');header.className='auto-ruby-header';header.append(element('h2','自動ルビ'),button('×',()=>dialog.close()));
  const intro=element('p','本文だけに付けます。手動ルビと、外した箇所は保護します。名前や造語は作者辞書で読みを指定できます。「難しい語だけ」は内蔵の初期辞書と作者辞書に登録された語が対象です。');intro.className='auto-ruby-note';
  const controls=element('div');controls.className='auto-ruby-controls';
  const mode=field('付け方',[['all','総ルビ'],['grade','学年別'],['difficult','難しい語だけ']],settings.mode);
  const grade=field('この学年まで既習',Array.from({length:6},(_,i)=>[i+1,`小学${i+1}年まで`]),settings.grade);
  const repeat=field('同じ語へのルビ',[['always','毎回'],['scene','各Sceneの初出だけ'],['work','作品の初出だけ']],settings.repeat);
  const scope=field('対象',[['current',`このScene（${index+1}）`],['forward','このScene以降'],['all','全Scene']],'current');
  controls.append(mode.row,grade.row,repeat.row,scope.row);
  const status=element('p','設定して「確認プレビュー」を押してください。');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const preview=element('div');preview.className='auto-ruby-preview';preview.hidden=true;
  const previewSelect=element('select');previewSelect.setAttribute('aria-label','確認するScene');
  const previewText=element('div');previewText.className='auto-ruby-preview-text';preview.append(previewSelect,previewText);
  function renderPreview(){
   const plan=result?.plans.find(p=>String(p.index)===previewSelect.value);if(!plan)return;
   const scene=snapshot.scenes[plan.index],text=scene.text||'';previewText.replaceChildren();let at=0;
   for(const r of plan.ranges.filter(r=>r.kind==='ruby').sort((a,b)=>a.start-b.start)){
    if(r.start<at)continue;previewText.append(document.createTextNode(text.slice(at,r.start)));const ruby=element('ruby'),rt=element('rt',r.reading);ruby.append(document.createTextNode(text.slice(r.start,r.end)),rt);previewText.append(ruby);at=r.end;
   }
   previewText.append(document.createTextNode(text.slice(at)));
  }
  previewSelect.onchange=renderPreview;
  const dict=element('details'),summary=element('summary','作者辞書');dict.append(summary);
  const dictList=element('div');dictList.className='auto-ruby-dictionary';dict.append(dictList);
  function storeConfig(){ctx.onConfig({version:1,settings:readSettings(),dictionary:copy(dictionary)});}
  function renderDictionary(){
   dictList.replaceChildren();
   for(const [word,reading] of Object.entries(dictionary)){
    const row=element('div');row.className='auto-ruby-dict-row';const w=element('input'),r=element('input');w.value=word;w.readOnly=true;w.setAttribute('aria-label','登録した語');r.value=reading;r.setAttribute('aria-label','ふりがな');r.maxLength=200;
    const save=button('更新',()=>{if(r.value.trim()){dictionary[word]=r.value.trim();storeConfig();invalidate();}});
    const del=button('削除',()=>{delete dictionary[word];storeConfig();invalidate();renderDictionary();});row.append(w,r,save,del);dictList.append(row);
   }
   const row=element('div');row.className='auto-ruby-dict-row';const word=element('input'),reading=element('input');word.placeholder='語（例：未来圧）';reading.placeholder='読み（例：みらいあつ）';word.setAttribute('aria-label','登録する語');reading.setAttribute('aria-label','ふりがな');word.maxLength=100;reading.maxLength=200;
   row.append(word,reading,button('登録',()=>{const w=word.value.trim(),r=reading.value.trim();if(!w||!r||/[\r\n]/.test(w+r))return;Object.defineProperty(dictionary,w,{value:r,writable:true,enumerable:true,configurable:true});storeConfig();invalidate();renderDictionary();}));dictList.append(row,element('small','辞書はこの作品のMaster .sceneに保存されます。既存のルビは再適用した時に見直します。'));
  }
  const foot=element('div');foot.className='auto-ruby-actions';
  const check=button('確認プレビュー',()=>analyze(false));
  const apply=button('適用',()=>commit());apply.className='is-primary';apply.disabled=true;
  const remove=button('自動ルビだけ解除',async()=>{
   if(busy||!await ctx.confirm('選んだ範囲の自動ルビだけを解除します。手動ルビは残します。'))return;
   if(ctx.getDocument()!==doc){status.textContent='作品が切り替わりました。開き直してください。';return;}
   ctx.onRemove(indices());invalidate();status.textContent='自動ルビを解除しました。Undoで戻せます。';
  });
  const exclusions=button('除外した箇所を再対象にする',async()=>{
   if(busy||!await ctx.confirm('選んだ範囲で、自動ルビを外した箇所を再び自動処理の対象にします。'))return;
   if(ctx.getDocument()!==doc)return;ctx.onResetExclusions(indices());invalidate();status.textContent='除外設定を解除しました。「確認プレビュー」で見直してください。';
  });
  foot.append(check,apply,button('閉じる',()=>dialog.close()));
  const advanced=element('details');advanced.append(element('summary','解除・除外の設定'),remove,exclusions);
  dialog.append(header,intro,controls,status,preview,dict,advanced,foot);document.body.append(dialog);
  function indices(){return doc.scenes.map((_,i)=>i).filter(i=>scope.select.value==='all'||(scope.select.value==='forward'?i>=index:i===index));}
  function readSettings(){return {mode:mode.select.value,grade:Number(grade.select.value),repeat:repeat.select.value};}
  function fingerprint(){return JSON.stringify([doc.scenes.map(s=>({text:s.text,richText:s.richText})),doc.studio?.autoRuby?.dictionary||{}]);}
  function invalidate(){seq++;worker?.terminate();worker=null;busy=false;result=null;apply.disabled=true;check.disabled=false;preview.hidden=true;grade.row.hidden=mode.select.value!=='grade';}
  for(const control of [mode,grade,repeat,scope])control.select.onchange=invalidate;
  function commit(){
   if(!result||busy)return;
   if(ctx.getDocument()!==doc||snapshot.fingerprint!==fingerprint()){invalidate();status.textContent='本文やルビが変わりました。確認プレビューをやり直してください。';return;}
   ctx.onApply(result.plans,{version:1,settings:readSettings(),dictionary:copy(dictionary)});
   status.textContent=`${result.total}箇所の自動ルビを適用しました。手動ルビは保持しています。Undoで戻せます。`;
   apply.disabled=true;worker?.terminate();worker=null;
  }
  function analyze(autoApply){
   if(busy)return;invalidate();busy=true;check.disabled=true;
   if(ctx.getDocument()!==doc){busy=false;check.disabled=false;status.textContent='作品が切り替わりました。開き直してください。';return;}
   const id=++seq;snapshot={scenes:copy(doc.scenes.map(scene=>({text:scene.text,richText:scene.richText}))),fingerprint:fingerprint()};settings=readSettings();
   try{worker=new Worker(new URL('./auto-ruby-worker.js?v=1',document.baseURI));}
   catch(e){busy=false;check.disabled=false;status.textContent='解析を開始できませんでした：'+e.message;return;}
   worker.onerror=e=>{if(id!==seq)return;busy=false;check.disabled=false;status.textContent='解析用ファイルを読み込めませんでした。更新ZIPをすべて配置してから再試行してください。';worker?.terminate();worker=null;};
   worker.onmessage=({data})=>{
    if(data.id!==id||id!==seq)return;
    if(data.type==='progress'){status.textContent=data.label;return;}
    busy=false;check.disabled=false;
    if(data.type==='error'){status.textContent='解析できませんでした：'+data.message;worker?.terminate();worker=null;return;}
    worker?.terminate();worker=null;
    result=data.result;preview.hidden=false;previewSelect.replaceChildren();
    for(const plan of result.plans){const o=element('option',`Scene ${plan.index+1}・自動 ${plan.added}箇所`);o.value=plan.index;previewSelect.append(o);}
    renderPreview();apply.disabled=false;
    status.textContent=`${result.plans.length} Sceneに自動 ${result.total}箇所を設定します。既存の自動ルビは置き換えます。`+(result.unknown?` 読みが確定できない${result.unknown}語は付けずに残します。`:'');
    if(autoApply)commit();
   };
   worker.postMessage({id,scenes:snapshot.scenes,settings:{...settings,indices:indices()},dictionary});
  }
  function cleanup(){seq++;worker?.terminate();worker=null;dialog.remove();if(active?.dialog===dialog)active=null;}
  dialog.addEventListener('close',cleanup,{once:true});dialog.addEventListener('keydown',e=>e.stopPropagation());
  active={dialog,close:()=>dialog.close()};renderDictionary();grade.row.hidden=settings.mode!=='grade';dialog.showModal();
  if(quick)analyze(true);
 }
 window.SceneAutoRubyUI={open,close};
})();
