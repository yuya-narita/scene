/* AHAKO RPG Command Phase C — additive Player layer; no changes to backgrounds. */
(function(global){
'use strict';
const API=global.AhakoRpgCommand, Core=global.ScenePlayerCore;
if(!API||!Core||Core.prototype.__ahakoRpgInstalled)return;
const proto=Core.prototype;proto.__ahakoRpgInstalled=true;
const instances=new WeakMap();
// Keep the currently opened card across Studio preview rebuilds.
const studioViewByHost=new WeakMap();
let activeKeyboardPlayer=null;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function attach(player){
 let ui=instances.get(player);if(ui)return ui;
 const host=player.host, layer=document.createElement('div');layer.className='ahako-rpg-layer';layer.hidden=true;
 host.appendChild(layer);
 ui={layer,stack:[],index:-1,dragging:false,lock:false,handlers:[],selected:null,cover:true,tabs:{}};instances.set(player,ui);
 if(global.__ahakoRpgStudioPlayer===player){const saved=studioViewByHost.get(host);if(saved){ui.stack=saved.stack.slice();ui.tabs={...saved.tabs};ui.index=saved.index;}}
 const onScene=e=>{ui.cover=false;update(player,e.detail?.index);animateEntrance(ui,player);};
 // PAST is a separate history surface: hide the active card until history closes.
 const onHistoryOpen=()=>{ui.layer.hidden=true;};
 const onHistoryClose=()=>{if(!ui.cover){update(player,player.index);animateEntrance(ui,player);}};
 const onCover=()=>{ui.cover=true;ui.layer.hidden=true;ui.stack=[];};
 const onCoverStart=()=>{ui.cover=false;const reveal=()=>{if(ui.cover)return;if(player.els?.cover?.hidden===false){requestAnimationFrame(reveal);return;}update(player,player.index);animateEntrance(ui,player);};requestAnimationFrame(reveal);};
 host.addEventListener('sceneplayer:coverstart',onCoverStart);
 host.addEventListener('sceneplayer:end',onCover);
 host.addEventListener('sceneplayer:scenechange',onScene);
 host.addEventListener('sceneplayer:historyopen',onHistoryOpen);
 host.addEventListener('sceneplayer:historyclose',onHistoryClose);
 const onKey=e=>{
  if(ui.layer.hidden||!ui.stack.length||activeKeyboardPlayer!==player||e.target.closest?.('input,textarea,select,[contenteditable]'))return;
  const card=ui.layer.lastElementChild;
  const rows=[...card.querySelectorAll('.ahako-rpg-row')];
  const tabs=[...card.querySelectorAll('.ahako-rpg-tab')];
  const isTab=card.classList.contains('is-character-detail');
  let handled=true;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   if(rows.length){const index=Math.max(0,rows.findIndex(b=>b.classList.contains('is-selected')));
    const next=(index+(e.key==='ArrowDown'?1:-1)+rows.length)%rows.length;
    rows.forEach((b,i)=>b.classList.toggle('is-selected',i===next));
   }
  }else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
   if(isTab&&tabs.length){
    const index=Math.max(0,tabs.findIndex(b=>b.classList.contains('is-active')));
    tabs[(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length].click();
   }else if(e.key==='ArrowRight'&&ui.stack.length>1){back(player,true);}
   else handled=false;
  }else if(e.key==='Enter'||e.key===' '){
   const row=rows.find(b=>b.classList.contains('is-selected'));if(row)row.click();else handled=false;
  }else if((e.key==='Escape'||e.key==='Backspace')&&ui.stack.length>1){back(player,true);}
  else handled=false;
  if(handled){e.preventDefault();e.stopPropagation();}
 };
 // Only react when focus is in this Player. Avoid capturing Studio editor shortcuts.
 document.addEventListener('keydown',onKey,true);
 layer.addEventListener('pointerdown',()=>{activeKeyboardPlayer=player;});
 layer.addEventListener('touchstart',()=>{activeKeyboardPlayer=player;},{passive:true});
 ui.cleanup=()=>{host.removeEventListener('sceneplayer:scenechange',onScene);host.removeEventListener('sceneplayer:historyopen',onHistoryOpen);host.removeEventListener('sceneplayer:historyclose',onHistoryClose);host.removeEventListener('sceneplayer:coverstart',onCoverStart);host.removeEventListener('sceneplayer:end',onCover);document.removeEventListener('keydown',onKey,true);layer.remove();};
 return ui;
}
function animateEntrance(ui,player){
 if(ui.layer.hidden)return;
 // Restart the animation even when revisiting a previously displayed Scene.
 for(const card of ui.layer.querySelectorAll('.ahako-rpg-card')){
  card.classList.remove('ahako-rpg-enter-card');
  card.style.animation='none';void card.offsetWidth;card.style.animation='';
  card.classList.add('ahako-rpg-enter-card');
 }
}
function visibleEntries(snapshot){const visible=new Set(API.visibleNodes(snapshot));return Object.entries(snapshot.nodes).filter(([id])=>visible.has(id));}
function update(player,index){
 const ui=attach(player),work=player.document;
 const i=Number.isInteger(index)?index:player.index;
 if(player.historyOpen){ui.layer.hidden=true;return;}
 if(ui.cover||player.els?.cover?.hidden===false||!work?.scenes||i<0||i>=work.scenes.length){ui.layer.hidden=true;ui.stack=[];return;}
 const local=work.scenes[i]?.extensions?.ahakoRpgScene;
 // Only explicitly inserted scenes show a command. Never inherit it to other scenes.
 if(!local?.nodes||!Object.keys(local.nodes).length){ui.layer.hidden=true;ui.stack=[];return;}
 const snapshot={nodes:local.nodes,position:local.position||'center'};
 const sameScene=ui.index===i;ui.index=i;ui.snapshot=snapshot;ui.entries=Object.entries(snapshot.nodes).filter(([id,n])=>{if(n.visible===false)return false;let p=n.parentId;const visited=new Set([id]);while(p){if(visited.has(p)||snapshot.nodes[p]?.visible===false||!snapshot.nodes[p])return false;visited.add(p);p=snapshot.nodes[p].parentId;}return true;});ui.map=new Map(ui.entries);
 if(!ui.entries.length){ui.layer.hidden=true;ui.stack=[];return;}
 // One initial root card, or the configured root with visible descendants.
 const previousStack=((sameScene||global.__ahakoRpgStudioPlayer===player)&&ui.stack.length)?ui.stack.slice():[null];
 ui.stack=[null];for(const id of previousStack.slice(1)){if(ui.map.has(id)&&children(ui,ui.stack[ui.stack.length-1]).some(([key])=>key===id))ui.stack.push(id);else break;}
 ui.lock=false;ui.layer.hidden=false;
 if(global.__ahakoRpgStudioPlayer===player)studioViewByHost.set(player.host,{stack:ui.stack.slice(),tabs:{...ui.tabs},index:i});
 ui.layer.dataset.position=({top:'left',bottom:'right'}[snapshot.position]||(['left','center','right'].includes(snapshot.position)?snapshot.position:'center'));
 draw(player);
}
function children(ui,parent){return ui.entries.filter(([id,node])=>(node.parentId||null)===parent);}
function make(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;}
// Direct authoring: click the displayed text to edit it in place.
// Commit on blur/Enter; Escape restores the original without touching Scene data.
function directText(player,element,id,key,initial,convert){
 if(!editing(player))return;
 element.classList.add('ahako-rpg-edit-target');
 element.title='ダブルクリック（スマホは長押し）で編集';
 const openEditor=e=>{
  e.preventDefault();e.stopPropagation();
  if(element.querySelector('input'))return;
  const original=String(initial??'');
  const input=make('input','ahako-rpg-direct-input');input.type='text';input.value=original;
  input.setAttribute('aria-label','直接編集');
  const width=Math.max(58,element.getBoundingClientRect().width+22);
  input.style.width=Math.min(300,width)+'px';
  element.textContent='';element.append(input);
  let done=false;
  const finish=save=>{
   if(done)return;done=true;
   const value=input.value;
   if(save&&value!==original){
    const fields=convert?convert(value):{[key]:value};
    global.AhakoRpgSceneEditor?.update?.(id,fields);
   }else{element.textContent=original;}
  };
  input.addEventListener('click',ev=>ev.stopPropagation());
  input.addEventListener('pointerdown',ev=>ev.stopPropagation());
  input.addEventListener('keydown',ev=>{
   ev.stopPropagation();
   if(ev.key==='Enter'){ev.preventDefault();finish(true);}
   if(ev.key==='Escape'){ev.preventDefault();finish(false);}
  });
  input.addEventListener('blur',()=>finish(true),{once:true});
  input.focus();input.select();
 };
 element.addEventListener('dblclick',openEditor);
 // Keep the first click from navigating away before a double-click can be recognized.
 element.addEventListener('click',e=>{e.stopPropagation();});
 let holdTimer=null,holdStart=null;
 element.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;holdStart={x:e.clientX,y:e.clientY};holdTimer=setTimeout(()=>{holdTimer=null;openEditor(e);},520);});
 element.addEventListener('pointermove',e=>{if(holdStart&&Math.hypot(e.clientX-holdStart.x,e.clientY-holdStart.y)>12){clearTimeout(holdTimer);holdTimer=null;}});
 for(const ev of ['pointerup','pointercancel','pointerleave'])element.addEventListener(ev,()=>{clearTimeout(holdTimer);holdTimer=null;});
 element.addEventListener('contextmenu',e=>{e.preventDefault();openEditor(e);});
}
function draw(player){
 const ui=instances.get(player);if(!ui||ui.layer.hidden)return;
 const {layer,stack}=ui;layer.replaceChildren();
 if(global.__ahakoRpgStudioPlayer===player)studioViewByHost.set(player.host,{stack:stack.slice(),tabs:{...ui.tabs},index:ui.index});
 for(let d=0;d<stack.length;d++){
  const parent=stack[d],isTop=d===stack.length-1,node=parent===null?null:ui.map.get(parent);
  const card=make('section','ahako-rpg-card'+(isTop?' is-top':' is-behind'));
  card.style.setProperty('--rpg-depth',String(d));card.dataset.depth=String(d);card.style.zIndex=String(100+d);
  card.setAttribute('aria-label',node?.label||'コマンド');
  const tabs=node?children(ui,parent).filter(([,n])=>n.type==='tab'):[];
  const kind=node?.cardKind||'auto';
  const isDetail=tabs.length>0 && kind!=='message' && kind!=='choice';
  if(kind!=='auto')card.classList.add('ahako-rpg-kind-'+kind);
  // Character status uses the sample's compact heading, three horizontal tabs and stat rows.
  if(isDetail){
   card.classList.add('is-character-detail');
   const head=make('div','ahako-rpg-heading');const name=make('span','',node.label||'');
   const [level,job]=String(node.value||'').split('|');const headingText=Object.prototype.hasOwnProperty.call(node,'levelText')?String(node.levelText||'').trim():(level?(/^Lv\s*/i.test(level)?level:'Lv '+level):'');if(headingText)name.textContent+=' '+headingText;
   const jobSpan=make('span','',job||'');head.append(name,jobSpan);
   if(editing(player)){
    directText(player,name,parent,'label',node.label||'',v=>({label:v}));
    // Level and job are independent inline fields; an empty level stays hidden.
    const levelSpan=make('span','ahako-rpg-heading-level',headingText);
    name.textContent=node.label||'';head.insertBefore(levelSpan,jobSpan);
    directText(player,levelSpan,parent,'levelText',headingText,v=>({levelText:v}));
    directText(player,jobSpan,parent,'value',job||'',v=>({value:String(node.value||'').split('|')[0]+'|'+v}));
   }
   card.append(head);
   const nav=make('div','ahako-rpg-tabs');let current=ui.tabs[parent];if(!tabs.some(([id])=>id===current))current=tabs[0][0];ui.tabs[parent]=current;
   tabs.forEach(([id,t])=>{const btn=make('button','ahako-rpg-tab'+(id===current?' is-active':''));btn.type='button';const text=make('span','',t.label);btn.append(text);btn.onclick=e=>{e.stopPropagation();if(!isTop)return;ui.tabs[parent]=id;draw(player);};directText(player,text,id,'label',t.label);nav.append(btn);});card.append(nav);
  }else if(node&&d>=2){
   // Non-character detail cards show the selected item only when it has children.
   const direct=children(ui,parent);if(direct.length){const head=make('div','ahako-rpg-heading',node.label||'');directText(player,head,parent,'label',node.label||'');card.append(head);}
  }
  const list=isDetail?children(ui,ui.tabs[parent]):children(ui,parent);
  if(node && kind==='message'){const msg=make('div','ahako-rpg-message',node.value||node.label||'');card.append(msg);if(editing(player)){const pencil=make('button','ahako-rpg-edit-pencil','✎');pencil.type='button';pencil.setAttribute('aria-label','メッセージを編集');pencil.onclick=e=>{e.stopPropagation();editNode(player,parent);};card.append(pencil);}}
  if(isDetail)card.classList.add('has-stats');
  list.forEach(([id,item],n)=>{
   const hasChildren=children(ui,id).length>0;
   const btn=make('button','ahako-rpg-row'+(n===0?' is-selected':''));btn.type='button';
   const label=make('span','ahako-rpg-label',item.label||id);btn.append(label);directText(player,label,id,'label',item.label||id);
   if((item.value!==undefined&&item.value!=='')||(editing(player)&&item.type==='detail')){
    const display=item.type==='list'&&Object.prototype.hasOwnProperty.call(item,'levelText')?item.levelText:((item.type==='list'&&String(item.value).includes('|'))?String(item.value).split('|')[0]:item.value);
    const valueSpan=make('span','ahako-rpg-row-value',display);btn.append(valueSpan);
    if(!display&&editing(player)){valueSpan.textContent='＋ 値';valueSpan.classList.add('ahako-rpg-empty-value');}
    directText(player,valueSpan,id,'value',display,v=>item.type==='list'?({levelText:v}):({value:v}));
   }
   if(editing(player)){const pencil=make('span','ahako-rpg-row-pencil','✎');pencil.title='この項目を編集';pencil.setAttribute('role','button');pencil.setAttribute('aria-label','編集');pencil.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();editNode(player,id);});btn.append(pencil);}
   btn.addEventListener('click',e=>{e.stopPropagation();if(!isTop||ui.lock||e.target.closest('input'))return;
    if(editing(player)&&e.detail>0){
     if(e.detail>=2){clearTimeout(btn._rpgClickTimer);return;}
     clearTimeout(btn._rpgClickTimer);
     btn._rpgClickTimer=setTimeout(()=>{if(!btn.isConnected)return;btn._rpgClickTimer=null;btn.dispatchEvent(new CustomEvent('rpg-single-navigate'));},290);return;
    }
    btn.dispatchEvent(new CustomEvent('rpg-single-navigate'));
   });
   btn.addEventListener('rpg-single-navigate',()=>{if(!isTop||ui.lock)return;activeKeyboardPlayer=player;
    if(hasChildren){ui.stack.push(id);draw(player);}
    else if(editing(player)){
     // A leaf is allowed; offer an optional next card instead of silently doing nothing.
     ui.stack.push(id);draw(player);
    }
    if(editing(player)){global.AhakoRpgSceneEditor?.select?.(id);}
   });
   card.append(btn);
  });
  if(!list.length&&node?.value&&!isDetail&&kind!=='message'){const val=make('div','ahako-rpg-value',node.value);directText(player,val,parent,'value',node.value);card.append(val);}
  if(!list.length&&parent!==null&&editing(player)){
   const empty=make('div','ahako-rpg-empty','ここで終了（次のカードはありません）');card.append(empty);
  }
  if(!list.length&&parent===null)card.append(make('div','ahako-rpg-empty','表示項目なし'));
  if(isTop&&editing(player)){
   const tools=make('div','ahako-rpg-author-tools'),plus=make('button','ahako-rpg-author-add','＋ このカードに追加');plus.type='button';
   plus.onclick=e=>{e.stopPropagation();global.AhakoRpgSceneEditor?.add?.(isDetail?ui.tabs[parent]:parent);};tools.append(plus);card.append(tools);
  }
  for(const ev of ['click','dblclick','pointerdown','pointerup','touchstart','touchend'])card.addEventListener(ev,e=>e.stopPropagation());
  if(isTop&&d>0)bindSwipe(player,card);
  layer.append(card);
 }
}
function editing(player){return !!(global.AhakoRpgSceneEditor?.active?.() && global.__ahakoRpgStudioPlayer && (global.__ahakoRpgStudioPlayer===player || global.__ahakoRpgStudioPlayer.host===player.host));}
function editNode(player,id){
 const ui=instances.get(player),node=ui?.map?.get(id);if(!node||!editing(player))return;
 const card=ui.layer.lastElementChild;if(!card)return;
 card.querySelector('.ahako-rpg-inline-editor')?.remove();
 const form=make('div','ahako-rpg-inline-editor');
 const field=(label,v)=>{const wrap=make('label','ahako-rpg-edit-field');wrap.append(make('span','',label));const input=make('input');input.value=v??'';wrap.append(input);form.append(wrap);return input;};
 const name=field('名前',node.label||'');const kindWrap=make('label','ahako-rpg-edit-field');kindWrap.append(make('span','','カードの種類'));const kindSelect=make('select');[['auto','自動（従来どおり）'],['menu','メニュー'],['status','ステータス'],['list','一覧'],['detail','詳細'],['message','メッセージ'],['choice','選択肢']].forEach(([k,v])=>{const opt=make('option','',v);opt.value=k;opt.selected=(node.cardKind||'auto')===k;kindSelect.append(opt);});kindWrap.append(kindSelect);form.append(kindWrap);let value,level,job;
 if(node.type==='list'){const parts=String(node.value||'').split('|');level=field('名前の横に表示する文字（空欄で非表示）',Object.prototype.hasOwnProperty.call(node,'levelText')?node.levelText:(parts[0]||''));job=field('職業',parts.slice(1).join('|'));}
 else value=field('値（空欄でもOK）',node.value??'');
 const actions=make('div','ahako-rpg-edit-actions');
 const save=make('button','','保存'),del=make('button','','削除'),cancel=make('button','','閉じる');
 [save,del,cancel].forEach(b=>{b.type='button';actions.append(b);});
 save.onclick=e=>{e.stopPropagation();global.AhakoRpgSceneEditor.update(id,level?{label:name.value,value:level.value+'|'+job.value,levelText:level.value,cardKind:kindSelect.value}:{label:name.value,value:value.value,cardKind:kindSelect.value});};
 del.onclick=e=>{e.stopPropagation();if(global.confirm('この項目と子項目を削除しますか？'))global.AhakoRpgSceneEditor.remove(id);};
 cancel.onclick=e=>{e.stopPropagation();form.remove();};form.append(actions);
 for(const ev of ['click','pointerdown','pointerup','touchstart','touchend'])form.addEventListener(ev,e=>e.stopPropagation());
 card.append(form);name.focus();
}
function back(player,animate,offset=0,velocity=0){
 const ui=instances.get(player);if(!ui||ui.stack.length<=1||ui.lock)return;
 const card=ui.layer.lastElementChild;if(!animate||global.matchMedia?.('(prefers-reduced-motion: reduce)').matches){ui.stack.pop();draw(player);return;}
 ui.lock=true;const behind=card.previousElementSibling;if(behind)behind.classList.add('is-revealing');
 card.classList.add('is-flying');card.style.transition='none';card.style.transform=`translate3d(${offset}px,0,0)`;void card.offsetWidth;
 const duration=Math.max(125,Math.min(245,(global.innerWidth+card.offsetWidth-offset)/Math.max(2.8,velocity*2.3)));
 card.style.transition=`transform ${duration}ms cubic-bezier(.18,.72,.28,1),opacity ${duration}ms ease-in`;
 requestAnimationFrame(()=>{card.style.transform=`translate3d(${global.innerWidth+card.offsetWidth}px,0,0)`;card.style.opacity='.75';});
 global.setTimeout(()=>{if(!ui.layer.isConnected)return;ui.stack.pop();ui.lock=false;draw(player);},duration+28);
}
function bindSwipe(player,card){
 const ui=instances.get(player);let active=false,swiping=false,sx=0,sy=0,lastX=0,lastT=0,velocity=0,offset=0;
 const behind=card.previousElementSibling;
 function begin(x,y){if(ui.lock)return;active=true;swiping=false;sx=lastX=x;sy=y;lastT=performance.now();velocity=offset=0;}
 function move(x,y,e){if(!active)return;const dx=x-sx,dy=y-sy;
  if(!swiping){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>9){active=false;return;}if(dx>3&&dx>Math.abs(dy)*.85){swiping=true;card.classList.add('is-dragging');}}
  if(!swiping)return;if(e?.cancelable)e.preventDefault();offset=Math.max(0,dx);const now=performance.now(),dt=now-lastT;
  if(dt>0)velocity=velocity*.35+((x-lastX)/dt)*.65;lastX=x;lastT=now;
  card.style.transform=`translate3d(${offset}px,0,0)`;card.style.opacity=String(Math.max(.85,1-offset/1800));
  if(behind)behind.style.filter=`brightness(${Math.min(1,.42+offset/190)})`;
 }
 function end(cancel=false){if(!active&&!swiping)return;active=false;if(!swiping)return;swiping=false;card.classList.remove('is-dragging');
  if(!cancel&&(offset>Math.min(72,card.offsetWidth*.20)||(offset>15&&velocity>.35))){back(player,true,offset,Math.max(0,velocity));return;}
  card.style.transition='transform 220ms cubic-bezier(.2,.85,.25,1),opacity 220ms ease';card.style.transform='translate3d(0,0,0)';card.style.opacity='1';if(behind)behind.style.filter='brightness(.42)';
 }
 card.addEventListener('touchstart',e=>{if(e.touches.length===1)begin(e.touches[0].clientX,e.touches[0].clientY)},{passive:true});
 card.addEventListener('touchmove',e=>{if(e.touches.length===1)move(e.touches[0].clientX,e.touches[0].clientY,e)},{passive:false});
 card.addEventListener('touchend',()=>end(),{passive:true});card.addEventListener('touchcancel',()=>end(true),{passive:true});
 card.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0&&!e.target.closest('button,input,select,textarea'))begin(e.clientX,e.clientY)});
 const mm=e=>{if(e.pointerType==='mouse'&&active){move(e.clientX,e.clientY,e)}};
 const mu=e=>{if(e.pointerType==='mouse'&&active){end();global.removeEventListener('pointermove',mm);global.removeEventListener('pointerup',mu);}};
 card.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0&&active){global.addEventListener('pointermove',mm);global.addEventListener('pointerup',mu);}});
 card.addEventListener('click',e=>{if(offset>5){e.preventDefault();e.stopImmediatePropagation();}},true);
}
global.AhakoRpgPlayer={refresh(player,index){if(player){const ui=attach(player);if(global.__ahakoRpgStudioPlayer===player&&player.els?.cover?.hidden!==false)ui.cover=false;update(player,Number.isInteger(index)?index:player.index);}}};
// Render a read-only command-card snapshot inside its own PAST Scene item.
// Never reuse the live overlay: PAST has a separate scrollable DOM.
function historySnapshot(scene){
 const nodes=scene?.extensions?.ahakoRpgScene?.nodes;
 if(!nodes||!Object.keys(nodes).length)return null;
 const visible=id=>{let n=nodes[id],seen=new Set();while(n){if(n.visible===false||seen.has(n))return false;seen.add(n);n=n.parentId?nodes[n.parentId]:null;}return true;};
 const roots=Object.entries(nodes).filter(([id,n])=>!n.parentId&&visible(id));
 if(!roots.length)return null;
 const wrap=make('span','ahako-rpg-history-snapshot');
 const panel=make('span','ahako-rpg-history-panel');wrap.append(panel);
 // Show the top-level command as it appeared on arrival. No interactive buttons.
 roots.forEach(([id,n],i)=>{
  const row=make('span','ahako-rpg-history-row');
  row.append(make('span','',(i===0?'▶ ':'')+(n.label||id)));
  if(n.value)row.append(make('span','ahako-rpg-history-value',String(n.value).split('|')[0]));
  panel.append(row);
 });
 return wrap;
}
const oldHistoryRender=proto._renderHistory;
if(typeof oldHistoryRender==='function')proto._renderHistory=function(...args){
 const result=oldHistoryRender.apply(this,args);
 // Studio and Public Player both need the same read-only PAST snapshot.
 if(this.els?.historyList&&Array.isArray(this.document?.scenes)){
  for(const item of this.els.historyList.querySelectorAll('.sp-history-item[data-index]')){
   const scene=this.document.scenes[Number(item.dataset.index)];
   const snapshot=historySnapshot(scene);
   if(snapshot&&!item.querySelector('.ahako-rpg-history-snapshot')){const body=item.querySelector('.sp-history-body');if(body){body.append(snapshot);item.classList.add('ahako-rpg-history-item');}}
  }
 }
 return result;
};
const oldLoad=proto.load;
proto.load=function(...args){const result=oldLoad.apply(this,args);attach(this);update(this,this.index);return result;};
const oldDestroy=proto.destroy;
proto.destroy=function(...args){const ui=instances.get(this);if(ui){ui.cleanup();instances.delete(this);}return oldDestroy.apply(this,args);};
})(window);
