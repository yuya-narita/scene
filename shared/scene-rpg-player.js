/* AHAKO RPG Command Phase C — additive Player layer; no changes to backgrounds. */
(function(global){
'use strict';
const API=global.AhakoRpgCommand, Core=global.ScenePlayerCore;
if(!API||!Core||Core.prototype.__ahakoRpgInstalled)return;
const proto=Core.prototype;proto.__ahakoRpgInstalled=true;
const instances=new WeakMap();
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function attach(player){
 let ui=instances.get(player);if(ui)return ui;
 const host=player.host, layer=document.createElement('div');layer.className='ahako-rpg-layer';layer.hidden=true;
 host.appendChild(layer);
 ui={layer,stack:[],index:-1,dragging:false,lock:false,handlers:[],selected:null,cover:true,tabs:{}};instances.set(player,ui);
 const onScene=e=>{ui.cover=false;update(player,e.detail?.index);};
 const onCover=()=>{ui.cover=true;ui.layer.hidden=true;ui.stack=[];};
 host.addEventListener('sceneplayer:coverstart',onCover);
 host.addEventListener('sceneplayer:end',onCover);
 host.addEventListener('sceneplayer:scenechange',onScene);
 const onKey=e=>{if(ui.layer.hidden||!ui.stack.length||e.target.closest('input,textarea,select,[contenteditable]'))return;
  if((e.key==='Escape'||e.key==='Backspace'||e.key==='ArrowRight')&&ui.stack.length>1){e.preventDefault();e.stopPropagation();back(player,true);}
 };
 // Only react when focus is in this Player. Avoid capturing Studio editor shortcuts.
 host.addEventListener('keydown',onKey,true);
 ui.cleanup=()=>{host.removeEventListener('sceneplayer:scenechange',onScene);host.removeEventListener('sceneplayer:coverstart',onCover);host.removeEventListener('sceneplayer:end',onCover);host.removeEventListener('keydown',onKey,true);layer.remove();};
 return ui;
}
function visibleEntries(snapshot){const visible=new Set(API.visibleNodes(snapshot));return Object.entries(snapshot.nodes).filter(([id])=>visible.has(id));}
function update(player,index){
 const ui=attach(player),work=player.document;
 const i=Number.isInteger(index)?index:player.index;
 if((ui.cover&&!global.__ahakoRpgStudioPlayer)||!work?.scenes||i<0||i>=work.scenes.length){ui.layer.hidden=true;ui.stack=[];return;}
 const local=work.scenes[i]?.extensions?.ahakoRpgScene;
 // Only explicitly inserted scenes show a command. Never inherit it to other scenes.
 if(!local?.nodes||!Object.keys(local.nodes).length){ui.layer.hidden=true;ui.stack=[];return;}
 const snapshot={nodes:local.nodes,position:local.position||'center'};
 const sameScene=ui.index===i;ui.index=i;ui.snapshot=snapshot;ui.entries=Object.entries(snapshot.nodes).filter(([id,n])=>{if(n.visible===false)return false;let p=n.parentId;const visited=new Set([id]);while(p){if(visited.has(p)||snapshot.nodes[p]?.visible===false||!snapshot.nodes[p])return false;visited.add(p);p=snapshot.nodes[p].parentId;}return true;});ui.map=new Map(ui.entries);
 if(!ui.entries.length){ui.layer.hidden=true;ui.stack=[];return;}
 // One initial root card, or the configured root with visible descendants.
 const previousStack=(sameScene&&ui.stack.length)?ui.stack.slice():[null];
 ui.stack=[null];for(const id of previousStack.slice(1)){if(ui.map.has(id)&&children(ui,ui.stack[ui.stack.length-1]).some(([key])=>key===id))ui.stack.push(id);else break;}
 ui.lock=false;ui.layer.hidden=false;
 ui.layer.dataset.position=['top','center','bottom'].includes(snapshot.position)?snapshot.position:'center';
 draw(player);
}
function children(ui,parent){return ui.entries.filter(([id,node])=>(node.parentId||null)===parent);}
function make(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;}
function draw(player){
 const ui=instances.get(player);if(!ui||ui.layer.hidden)return;
 const {layer,stack}=ui;layer.replaceChildren();
 for(let d=0;d<stack.length;d++){
  const parent=stack[d],isTop=d===stack.length-1,node=parent===null?null:ui.map.get(parent);
  const card=make('section','ahako-rpg-card'+(isTop?' is-top':' is-behind'));
  card.style.setProperty('--rpg-depth',String(d));card.dataset.depth=String(d);card.style.zIndex=String(100+d);
  card.setAttribute('aria-label',node?.label||'コマンド');
  const tabs=node?children(ui,parent).filter(([,n])=>n.type==='tab'):[];
  const isDetail=tabs.length>0;
  // Character status uses the sample's compact heading, three horizontal tabs and stat rows.
  if(isDetail){
   card.classList.add('is-character-detail');
   const head=make('div','ahako-rpg-heading');const name=make('span','',node.label||'');
   const [level,job]=String(node.value||'').split('|');if(level)name.textContent+=' '+level;
   head.append(name,make('span','',job||''));card.append(head);
   const nav=make('div','ahako-rpg-tabs');let current=ui.tabs[parent];if(!tabs.some(([id])=>id===current))current=tabs[0][0];ui.tabs[parent]=current;
   tabs.forEach(([id,t])=>{const btn=make('button','ahako-rpg-tab'+(id===current?' is-active':''),t.label);btn.type='button';btn.onclick=e=>{e.stopPropagation();if(!isTop)return;ui.tabs[parent]=id;draw(player);if(editing(player))global.AhakoRpgSceneEditor?.select?.(id);};nav.append(btn);});card.append(nav);
  }else if(node&&d>=2){
   // Non-character detail cards show the selected item only when it has children.
   const direct=children(ui,parent);if(direct.length){const head=make('div','ahako-rpg-heading',node.label||'');card.append(head);}
  }
  const list=isDetail?children(ui,ui.tabs[parent]):children(ui,parent);
  if(isDetail)card.classList.add('has-stats');
  list.forEach(([id,item],n)=>{
   const hasChildren=children(ui,id).length>0;
   const btn=make('button','ahako-rpg-row'+(n===0&&!isDetail?' is-selected':''));btn.type='button';
   btn.append(make('span','ahako-rpg-label',item.label||id));
   if(item.value!==undefined&&item.value!==''){
    const display=(item.type==='list'&&String(item.value).includes('|'))?String(item.value).split('|')[0]:item.value;
    btn.append(make('span','ahako-rpg-row-value',display));
   }
   btn.addEventListener('click',e=>{e.stopPropagation();if(!isTop||ui.lock)return;
    if(hasChildren){ui.stack.push(id);draw(player);}
    if(editing(player))global.AhakoRpgSceneEditor?.select?.(id);
   });card.append(btn);
  });
  if(!list.length&&node?.value&&!isDetail)card.append(make('div','ahako-rpg-value',node.value));
  if(!list.length&&parent===null)card.append(make('div','ahako-rpg-empty','表示項目なし'));
  for(const ev of ['click','pointerdown','pointerup','touchstart','touchend'])card.addEventListener(ev,e=>e.stopPropagation());
  if(isTop&&d>0)bindSwipe(player,card);
  layer.append(card);
 }
}
function editing(player){return !!(global.AhakoRpgSceneEditor?.active?.() && global.__ahakoRpgStudioPlayer && (global.__ahakoRpgStudioPlayer===player || global.__ahakoRpgStudioPlayer.host===player.host));}
function editNode(player,id){
 const ui=instances.get(player),node=ui?.map?.get(id);if(!node)return;
 const card=ui.layer.lastElementChild;
 if(!card)return;
 const form=make('div','ahako-rpg-inline-editor');
 const name=make('input');name.value=node.label||'';name.placeholder='項目名';name.setAttribute('aria-label','項目名');
 const value=make('input');value.value=node.value??'';value.placeholder='値（空欄可）';value.setAttribute('aria-label','値');
 const save=make('button','','保存');save.type='button';
 const del=make('button','','削除');del.type='button';
 const cancel=make('button','','戻る');cancel.type='button';
 const close=()=>{form.remove();};
 save.addEventListener('click',e=>{e.stopPropagation();global.AhakoRpgSceneEditor.update(id,{label:name.value,value:value.value});close();});
 del.addEventListener('click',e=>{e.stopPropagation();if(global.confirm('この項目と子項目を削除しますか？'))global.AhakoRpgSceneEditor.remove(id);close();});
 cancel.addEventListener('click',e=>{e.stopPropagation();close();});
 form.append(name,value,save,del,cancel);form.addEventListener('click',e=>e.stopPropagation());
 card.querySelector('.ahako-rpg-inline-editor')?.remove();card.append(form);name.focus();
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
  if(!swiping){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>9){active=false;return;}if(dx>5&&dx>Math.abs(dy)*1.05){swiping=true;card.classList.add('is-dragging');}}
  if(!swiping)return;if(e?.cancelable)e.preventDefault();offset=Math.max(0,dx);const now=performance.now(),dt=now-lastT;
  if(dt>0)velocity=velocity*.35+((x-lastX)/dt)*.65;lastX=x;lastT=now;
  card.style.transform=`translate3d(${offset}px,0,0)`;card.style.opacity=String(Math.max(.85,1-offset/1800));
  if(behind)behind.style.filter=`brightness(${Math.min(1,.42+offset/190)})`;
 }
 function end(cancel=false){if(!active&&!swiping)return;active=false;if(!swiping)return;swiping=false;card.classList.remove('is-dragging');
  if(!cancel&&(offset>Math.min(90,card.offsetWidth*.24)||(offset>18&&velocity>.45))){back(player,true,offset,Math.max(0,velocity));return;}
  card.style.transition='transform 220ms cubic-bezier(.2,.85,.25,1),opacity 220ms ease';card.style.transform='translate3d(0,0,0)';card.style.opacity='1';if(behind)behind.style.filter='brightness(.42)';
 }
 card.addEventListener('touchstart',e=>{if(e.touches.length===1)begin(e.touches[0].clientX,e.touches[0].clientY)},{passive:true});
 card.addEventListener('touchmove',e=>{if(e.touches.length===1)move(e.touches[0].clientX,e.touches[0].clientY,e)},{passive:false});
 card.addEventListener('touchend',()=>end(),{passive:true});card.addEventListener('touchcancel',()=>end(true),{passive:true});
 card.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0)begin(e.clientX,e.clientY)});
 const mm=e=>{if(e.pointerType==='mouse'&&active)move(e.clientX,e.clientY,e)};
 const mu=e=>{if(e.pointerType==='mouse'&&active){end();global.removeEventListener('pointermove',mm);global.removeEventListener('pointerup',mu);}};
 card.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0){global.addEventListener('pointermove',mm);global.addEventListener('pointerup',mu);}});
 card.addEventListener('click',e=>{if(offset>5){e.preventDefault();e.stopImmediatePropagation();}},true);
}
global.AhakoRpgPlayer={refresh(player){if(player){const ui=attach(player);if(global.__ahakoRpgStudioPlayer===player)ui.cover=false;update(player,player.index);}}};
const oldLoad=proto.load;
proto.load=function(...args){const result=oldLoad.apply(this,args);attach(this);update(this,this.index);return result;};
const oldDestroy=proto.destroy;
proto.destroy=function(...args){const ui=instances.get(this);if(ui){ui.cleanup();instances.delete(this);}return oldDestroy.apply(this,args);};
})(window);
