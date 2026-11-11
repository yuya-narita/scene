/* RPG command: scene-local, visual authoring. No work-wide inherited state. */
(function(global){
'use strict';
const KEY='ahakoRpgScene', $=id=>document.getElementById(id);
let getWork=()=>null,getIndex=()=>0,onEdit=()=>{},editing=true;
const panels=new WeakSet();
const template=()=>({version:1,position:'center',nodes:{
 menu:{type:'menu',label:'なかま',visible:true},
 items:{type:'menu',label:'アイテム',visible:true},
 records:{type:'menu',label:'きろく',visible:true},
 roku:{type:'list',parentId:'menu',label:'ロク',visible:true},
 nana:{type:'list',parentId:'menu',label:'ナナ',visible:true},
 hp:{type:'detail',parentId:'roku',label:'HP',value:'30 / 30',visible:true},
 mp:{type:'detail',parentId:'roku',label:'MP',value:'18 / 18',visible:true},
 job:{type:'detail',parentId:'roku',label:'しょくぎょう',value:'旅人',visible:true},
 hp2:{type:'detail',parentId:'nana',label:'HP',value:'26 / 26',visible:true},
 mp2:{type:'detail',parentId:'nana',label:'MP',value:'22 / 22',visible:true}
 }});
function current(){const w=getWork(),i=getIndex();return {w,i,s:w?.scenes?.[i]};}
function data(){return current().s?.extensions?.[KEY];}
function changed(){onEdit();global.AhakoRpgSceneEditor?.refreshPreview?.();render();}
function setData(v){const {s}=current();if(!s)return;s.extensions ||= {};if(v)s.extensions[KEY]=v;else delete s.extensions[KEY];changed();}
function add(parentId){const d=data();if(!d)return;let id;do{id='node_'+Math.random().toString(36).slice(2,10)}while(d.nodes[id]);d.nodes[id]={type:parentId?'detail':'menu',label:'新しい項目',value:'',visible:true,...(parentId?{parentId}:{})};changed();}
function remove(id){const d=data();if(!d)return;const removeIds=new Set([id]);let more=true;while(more){more=false;for(const [key,n] of Object.entries(d.nodes)){if(n.parentId&&removeIds.has(n.parentId)&&!removeIds.has(key)){removeIds.add(key);more=true;}}}for(const k of removeIds)delete d.nodes[k];changed();}
function render(){const panel=$('rpgCommandEditor');if(!panel)return;const d=data();panel.innerHTML=`<div class="rpg-scene-simple"><div class="rpg-editor-heading"><strong>RPGコマンド</strong><small>選択中のSceneだけに表示</small></div>${d?`<p class="rpg-editor-hint">左のカードをタップして階層を開きます。名前は鉛筆、項目はタップして編集。</p><div class="rpg-editor-actions"><button type="button" data-rpg-add-root>＋ コマンド追加</button><button type="button" data-rpg-copy>前のコマンドをコピー</button><button type="button" data-rpg-remove>このSceneから削除</button></div><label class="rpg-edit-field"><span>カード位置</span><select data-rpg-position><option value="top" ${d.position==='top'?'selected':''}>上</option><option value="center" ${d.position==='center'?'selected':''}>中央</option><option value="bottom" ${d.position==='bottom'?'selected':''}>下</option></select></label><label class="rpg-editor-toggle"><input type="checkbox" data-rpg-edit ${editing?'checked':''}> プレビューで直接編集する</label><p class="rpg-editor-hint">▶ 項目を開く／✎ 名前を編集／＋ この中に追加。編集OFFで読者操作を確認。</p>`:`<p class="rpg-editor-hint">このSceneにはコマンドがありません。挿入するとプレビューにサンプルが表示されます。</p><button type="button" data-rpg-insert>＋ RPGコマンドを挿入</button><button type="button" data-rpg-copy>前のコマンドをコピー</button>`}</div>`;
 global.AhakoRpgSceneEditor?.refreshPreview?.();}
function install(){const panel=$('rpgCommandEditor');if(!panel||panels.has(panel))return;panels.add(panel);
 panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-rpg-insert'))setData(template());
 if(b.hasAttribute('data-rpg-add-root'))add(null);
 if(b.hasAttribute('data-rpg-remove')){if(confirm('このSceneのRPGコマンドを削除しますか？'))setData(null);}
 if(b.hasAttribute('data-rpg-copy')){const {w,i}=current();let prior=null;for(let j=i-1;j>=0;j--){if(w.scenes[j]?.extensions?.[KEY]){prior=w.scenes[j].extensions[KEY];break;}}setData(prior?JSON.parse(JSON.stringify(prior)):template());}
 });
 panel.addEventListener('change',e=>{if(e.target.hasAttribute('data-rpg-position')){const d=data();if(d){d.position=e.target.value;changed();}}if(e.target.hasAttribute('data-rpg-edit')){editing=e.target.checked;changed();}});
}
global.AhakoRpgSceneEditor={connect(work,index,cb){getWork=work;getIndex=index;if(cb)onEdit=cb;install();render();},render,active:()=>!!data()&&editing,scene:()=>data(),refreshPreview:null,update(id,fields){const d=data();if(!d?.nodes?.[id])return;Object.assign(d.nodes[id],fields);changed();},add,remove};
// Preserve old Studio connection points while replacing the former advanced data editor.
global.AhakoRpgEditor={connect:(...args)=>global.AhakoRpgSceneEditor.connect(...args),render:()=>global.AhakoRpgSceneEditor.render()};
})(window);
