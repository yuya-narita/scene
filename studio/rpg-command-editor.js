/* RPG command: scene-local, visual authoring. No work-wide inherited state. */
(function(global){
'use strict';
const KEY='ahakoRpgScene', $=id=>document.getElementById(id);
let getWork=()=>null,getIndex=()=>0,onEdit=()=>{},beforeEdit=()=>{},editing=true,selectedId=null,details=false;
const panels=new WeakSet();
const cardKinds={auto:'自動（従来どおり）',menu:'メニュー',status:'ステータス',list:'一覧',detail:'詳細',message:'メッセージ（文章）',choice:'選択肢'};
// Scene-local presets. All fields remain editable; no inherited data is required.
const presetNames={party:'RPGパーティ（4人・3タブ）',status:'人物ステータス（1人・3タブ）',items:'どうぐ・持ち物',record:'冒険の記録',daily:'きょうのおれ',romance:'恋愛ステータス',relationship:'ふたりの関係',office:'社会人ステータス',suspect:'容疑者ファイル',horror:'怪異調査記録',magic:'おぼえたじゅもん',blank:'空のコマンド'};
function preset(kind='party'){
 const nodes={};let seq=0;const add=(label,type='detail',parentId=null,value='')=>{const id='rpg_'+(++seq);nodes[id]={type,label,visible:true,...(parentId?{parentId}:{}),...(value!==''?{value:String(value)}:{})};return id;};
 if(kind==='blank')return {version:2,position:'center',preset:kind,nodes};
 const themed={
 romance:['恋愛ステータス','主人公','好きな人',[['好感度','30 / 100'],['素直さ','12'],['嫉妬心','85'],['秘密',''],['言えない一言','']]],
 relationship:['ふたりの関係','ふたり','幼なじみ',[['出会ってから','12年'],['最後に話した日',''],['既読','ついている'],['本音',''],['知られたくないこと','']]],
 office:['社会人ステータス','わたし','会社員',[['勤続年数',''],['体力','18 / 100'],['精神力','24 / 100'],['有給残日数',''],['今日の敵','月曜日'],['必殺技','聞こえないふり']]],
 suspect:['容疑者ファイル','容疑者A','',[['年齢',''],['職業',''],['アリバイ',''],['証言',''],['不審な行動',''],['隠していること',''],['危険度','？？？']]],
 horror:['怪異調査記録','名称未設定','',[['発見場所',''],['発生時刻',''],['目撃者',''],['危険度','不明'],['対処方法',''],['生存者','']]],
 magic:['おぼえたじゅもん','じゅもん','',[['ホイミ','MP 3'],['メラ','MP 2'],['ルーラ','未習得'],['？？？','？？？']]]
 };
 if(themed[kind]){const [heading,name,description,fields]=themed[kind];const root=add(heading,'menu');const who=add(name,'list',root,description);const tab=add(kind==='magic'?'一覧':'ステータス','tab',who);fields.forEach(([n,v])=>add(n,'detail',tab,v));return {version:2,position:'center',preset:kind,nodes};}

 if(kind==='items'){
  const m=add('アイテム','menu');[['やくそう','3こ'],['どくけしそう','2こ'],['キメラのつばさ','1こ'],['ふるいカギ','1こ']].forEach(([n,v])=>add(n,'detail',m,v));
  const r=add('だいじなもの','menu');add('旅の手紙','detail',r,'1通');return {version:2,position:'center',preset:kind,nodes};
 }
 if(kind==='record'){
  const m=add('きろく','menu');[['ぼうけんの記録','第1章'],['プレイ時間','02:35'],['たおした魔物','18'],['手に入れた宝','4']].forEach(([n,v])=>add(n,'detail',m,v));return {version:2,position:'center',preset:kind,nodes};
 }
 const root=add(kind==='daily'?'きょうのおれ':'なかま','menu');
 const chars=kind==='daily'?[['おれ','Lv 1','開発者',[['たいりょく','12 / 100'],['やるき','3 / 100'],['ねむけ','98'],['バグ','17']]]]:[['ロク','Lv 12','旅人',[['HP','86 / 86'],['MP','45 / 45'],['ちから','32'],['すばやさ','24'],['みのまもり','22'],['かしこさ','18'],['こうげき力','34'],['しゅび力','27'],['けいけんち','1260']]],['ナナ','Lv 14','盗賊',[['HP','73 / 73'],['MP','28 / 28'],['ちから','27'],['すばやさ','49']]],['セラ','Lv 13','僧侶',[['HP','64 / 64'],['MP','91 / 91'],['かしこさ','52']]],['ガルド','Lv 15','戦士',[['HP','132 / 132'],['MP','8 / 8'],['ちから','61']]]];
 for(const [name,lv,job,stats] of (kind==='status'?chars.slice(0,1):chars)){
  const who=add(name,'list',root,lv+'|'+job);
  const strong=add('つよさ','tab',who);stats.forEach(([n,v])=>add(n,'detail',strong,v));
  const equip=add('そうび','tab',who);[['ぶき','ひのきのぼう'],['よろい','たびびとのふく'],['たて','なし'],['かざり','ふるいメガネ']].forEach(([n,v])=>add(n,'detail',equip,v));
  const history=add('しょくれき','tab',who);add(job,'detail',history,lv);
 }
 if(kind==='party'){const item=add('アイテム','menu');add('やくそう','detail',item,'3こ');add('どくけしそう','detail',item,'2こ');const record=add('きろく','menu');add('ぼうけんの記録','detail',record,'第1章');}
 return {version:2,position:'center',preset:kind,nodes};
}
const template=()=>preset('party');
function current(){const w=getWork(),i=getIndex();return {w,i,s:w?.scenes?.[i]};}
function data(){return current().s?.extensions?.[KEY];}
function changed(){onEdit();global.AhakoRpgSceneEditor?.refreshPreview?.();render();}
function setData(v){const {s}=current();if(!s)return;beforeEdit();s.extensions ||= {};if(v)s.extensions[KEY]=v;else delete s.extensions[KEY];changed();}
function add(parentId,kind='auto'){const d=data();if(!d)return;beforeEdit();let id;do{id='node_'+Math.random().toString(36).slice(2,10)}while(d.nodes[id]);d.nodes[id]={type:parentId?'detail':'menu',label:'新しい項目',value:'',visible:true,cardKind:kind,...(parentId?{parentId}:{})};selectedId=id;changed();}
function remove(id){const d=data();if(!d)return;beforeEdit();const removeIds=new Set([id]);let more=true;while(more){more=false;for(const [key,n] of Object.entries(d.nodes)){if(n.parentId&&removeIds.has(n.parentId)&&!removeIds.has(key)){removeIds.add(key);more=true;}}}for(const k of removeIds)delete d.nodes[k];if(removeIds.has(selectedId))selectedId=null;changed();}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){const panel=$('rpgCommandEditor');if(!panel)return;const d=data();
 const nodes=d?.nodes||{};
 if(selectedId&&!nodes[selectedId])selectedId=null;
 const choices=Object.entries(nodes).map(([id,n])=>`<button type="button" data-rpg-select="${escapeHtml(id)}" style="font-size:12px;padding:5px 7px;border:1px solid #ccd3df;border-radius:6px;background:${selectedId===id?'#e8efff':'white'};color:#182234">${escapeHtml(n.parentId?'↳ ':'')}${escapeHtml(n.label)}</button>`).join('');
 const selected=selectedId&&nodes[selectedId];
 panel.innerHTML=`<div class="rpg-scene-simple"><div class="rpg-editor-heading"><strong>コマンドカード</strong><small>このSceneだけに表示</small></div>${d?`<p class="rpg-editor-hint">プリセットを選び、必要な項目だけ書き換えてください。</p><label class="rpg-edit-field"><span>プリセットから作り直す</span><select data-rpg-preset><option value="">プリセットを選択</option>${Object.entries(presetNames).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><div class="rpg-editor-actions"><button type="button" data-rpg-add-root>＋ コマンド追加</button><button type="button" data-rpg-remove title="このSceneから削除">削除</button></div><label class="rpg-edit-field"><span>カード位置</span><select data-rpg-position><option value="left" ${['left','top'].includes(d.position)?'selected':''}>左</option><option value="center" ${d.position==='center'?'selected':''}>中央</option><option value="right" ${['right','bottom'].includes(d.position)?'selected':''}>右</option></select></label><div class="rpg-editor-actions"><button type="button" data-rpg-mode>${editing?'✎ 編集中（動作確認に切替）':'▶ 動作確認中（編集に切替）'}</button></div>${details?`<div style="display:flex;gap:5px;flex-wrap:wrap;margin:8px 0">${choices}</div>`:''}${selected?`<div style="border:1px solid #d7deea;border-radius:9px;padding:10px;display:grid;gap:7px"><strong style="font-size:13px">選択中：${escapeHtml(selected.label)}</strong><small>種類：${selected.type==='tab'?'横並びタブ':selected.type==='list'?'人物・一覧':selected.type==='menu'?'コマンド':'表示項目'}</small><label>カードの表示形式<select data-rpg-kind style="display:block;width:100%">${Object.entries(cardKinds).map(([k,v])=>`<option value="${k}" ${((selected.cardKind||'auto')===k)?'selected':''}>${v}</option>`).join('')}</select></label><label>名前<input data-rpg-label value="${escapeHtml(selected.label)}" style="display:block;width:100%"></label><label>値<input data-rpg-value value="${escapeHtml(selected.value??'')}" placeholder="空欄でもOK" style="display:block;width:100%"></label><div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" data-rpg-save-node>変更を保存</button><button type="button" data-rpg-add-child>＋ この中に追加</button><button type="button" data-rpg-remove-node>この項目を削除</button></div></div>`:'<p class="rpg-editor-hint">項目を選ぶと名前・値・子項目を編集できます。</p>'}`:`<p class="rpg-editor-hint">このSceneにはコマンドがありません。</p><label class="rpg-edit-field"><span>サンプルを選んで挿入</span><select data-rpg-preset><option value="">プリセットを選択</option>${Object.entries(presetNames).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><button type="button" data-rpg-insert>＋ RPGパーティを挿入</button>`}</div>`;
}
function install(){const panel=$('rpgCommandEditor');if(!panel||panels.has(panel))return;panels.add(panel);
 panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-rpg-mode')){editing=!editing;render();global.AhakoRpgSceneEditor?.refreshPreview?.();}
 if(b.hasAttribute('data-rpg-structure')){details=!details;render();}
 if(b.hasAttribute('data-rpg-insert')){selectedId=null;setData(template());}
 if(b.hasAttribute('data-rpg-add-root'))add(null,'menu');
 if(b.hasAttribute('data-rpg-select')){selectedId=b.getAttribute('data-rpg-select');render();}
 if(b.hasAttribute('data-rpg-add-child')&&selectedId){const d=data(),node=d?.nodes?.[selectedId];if(node)add(selectedId, 'auto');}
 if(b.hasAttribute('data-rpg-save-node')&&selectedId){const d=data();if(d?.nodes?.[selectedId]){beforeEdit();d.nodes[selectedId].label=panel.querySelector('[data-rpg-label]').value;d.nodes[selectedId].value=panel.querySelector('[data-rpg-value]').value;d.nodes[selectedId].cardKind=panel.querySelector('[data-rpg-kind]')?.value||'auto';changed();}}
 if(b.hasAttribute('data-rpg-remove-node')&&selectedId){if(confirm('この項目と子項目を削除しますか？'))remove(selectedId);}
 if(b.hasAttribute('data-rpg-remove')){if(confirm('このSceneのRPGコマンドを削除しますか？'))setData(null);}
 if(b.hasAttribute('data-rpg-copy')){selectedId=null;const {w,i}=current();let prior=null;for(let j=i-1;j>=0;j--){if(w.scenes[j]?.extensions?.[KEY]){prior=w.scenes[j].extensions[KEY];break;}}setData(prior?JSON.parse(JSON.stringify(prior)):template());}
 });
 panel.addEventListener('change',e=>{if(e.target.hasAttribute('data-rpg-preset')&&e.target.value){if(!data()||confirm('このSceneのコマンドを選択したプリセットで置き換えますか？')){selectedId=null;setData(preset(e.target.value));}else{e.target.value='';}}if(e.target.hasAttribute('data-rpg-position')){const d=data();if(d){beforeEdit();d.position=e.target.value;changed();}}if(e.target.hasAttribute('data-rpg-edit')){editing=e.target.checked;changed();}});
}
global.AhakoRpgSceneEditor={select(id){if(!data()?.nodes?.[id])return;selectedId=id;render();},connect(work,index,cb,pre){getWork=work;getIndex=index;if(cb)onEdit=cb;if(pre)beforeEdit=pre;install();render();},render,active:()=>!!data()&&editing,scene:()=>data(),refreshPreview:null,update(id,fields){const d=data();if(!d?.nodes?.[id])return;beforeEdit();Object.assign(d.nodes[id],fields);changed();},add,remove};
// Preserve old Studio connection points while replacing the former advanced data editor.
global.AhakoRpgEditor={connect:(...args)=>global.AhakoRpgSceneEditor.connect(...args),render:()=>global.AhakoRpgSceneEditor.render()};
})(window);
