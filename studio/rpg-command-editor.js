/* RPG command: scene-local, visual authoring. No work-wide inherited state. */
(function(global){
'use strict';
const KEY='ahakoRpgScene', $=id=>document.getElementById(id);
let getWork=()=>null,getIndex=()=>0,onEdit=()=>{},editing=true,selectedId=null;
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
function add(parentId){const d=data();if(!d)return;let id;do{id='node_'+Math.random().toString(36).slice(2,10)}while(d.nodes[id]);d.nodes[id]={type:parentId?'detail':'menu',label:'新しい項目',value:'',visible:true,...(parentId?{parentId}:{})};selectedId=id;changed();}
function remove(id){const d=data();if(!d)return;const removeIds=new Set([id]);let more=true;while(more){more=false;for(const [key,n] of Object.entries(d.nodes)){if(n.parentId&&removeIds.has(n.parentId)&&!removeIds.has(key)){removeIds.add(key);more=true;}}}for(const k of removeIds)delete d.nodes[k];if(removeIds.has(selectedId))selectedId=null;changed();}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){const panel=$('rpgCommandEditor');if(!panel)return;const d=data();
 const nodes=d?.nodes||{};
 if(selectedId&&!nodes[selectedId])selectedId=null;
 const choices=Object.entries(nodes).map(([id,n])=>`<button type="button" data-rpg-select="${escapeHtml(id)}" style="font-size:12px;padding:5px 7px;border:1px solid #ccd3df;border-radius:6px;background:${selectedId===id?'#e8efff':'white'};color:#182234">${escapeHtml(n.parentId?'↳ ':'')}${escapeHtml(n.label)}</button>`).join('');
 const selected=selectedId&&nodes[selectedId];
 panel.innerHTML=`<div class="rpg-scene-simple"><div class="rpg-editor-heading"><strong>RPGコマンド</strong><small>このSceneだけに表示</small></div>${d?`<p class="rpg-editor-hint">左のカードをタップして階層を開き、編集したい項目を選択してください。</p><div class="rpg-editor-actions"><button type="button" data-rpg-add-root>＋ コマンド追加</button><button type="button" data-rpg-copy>前のコマンドをコピー</button><button type="button" data-rpg-remove>このSceneから削除</button></div><label class="rpg-edit-field"><span>カード位置</span><select data-rpg-position><option value="top" ${d.position==='top'?'selected':''}>上</option><option value="center" ${d.position==='center'?'selected':''}>中央</option><option value="bottom" ${d.position==='bottom'?'selected':''}>下</option></select></label><label class="rpg-editor-toggle"><input type="checkbox" data-rpg-edit ${editing?'checked':''}> プレビューで項目を選択する</label><div style="display:flex;gap:5px;flex-wrap:wrap;margin:8px 0">${choices}</div>${selected?`<div style="border:1px solid #d7deea;border-radius:9px;padding:10px;display:grid;gap:7px"><strong style="font-size:13px">選択中：${escapeHtml(selected.label)}</strong><label>名前<input data-rpg-label value="${escapeHtml(selected.label)}" style="display:block;width:100%"></label><label>値<input data-rpg-value value="${escapeHtml(selected.value??'')}" placeholder="空欄でもOK" style="display:block;width:100%"></label><div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" data-rpg-save-node>変更を保存</button><button type="button" data-rpg-add-child>＋ この中に追加</button><button type="button" data-rpg-remove-node>この項目を削除</button></div></div>`:'<p class="rpg-editor-hint">項目を選ぶと名前・値・子項目を編集できます。</p>'}`:`<p class="rpg-editor-hint">このSceneにはコマンドがありません。</p><button type="button" data-rpg-insert>＋ RPGコマンドを挿入</button><button type="button" data-rpg-copy>前のコマンドをコピー</button>`}</div>`;
 global.AhakoRpgSceneEditor?.refreshPreview?.();}
function install(){const panel=$('rpgCommandEditor');if(!panel||panels.has(panel))return;panels.add(panel);
 panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-rpg-insert')){selectedId=null;setData(template());}
 if(b.hasAttribute('data-rpg-add-root'))add(null);
 if(b.hasAttribute('data-rpg-select')){selectedId=b.getAttribute('data-rpg-select');render();}
 if(b.hasAttribute('data-rpg-add-child')&&selectedId)add(selectedId);
 if(b.hasAttribute('data-rpg-save-node')&&selectedId){const d=data();if(d?.nodes?.[selectedId]){d.nodes[selectedId].label=panel.querySelector('[data-rpg-label]').value;d.nodes[selectedId].value=panel.querySelector('[data-rpg-value]').value;changed();}}
 if(b.hasAttribute('data-rpg-remove-node')&&selectedId){if(confirm('この項目と子項目を削除しますか？'))remove(selectedId);}
 if(b.hasAttribute('data-rpg-remove')){if(confirm('このSceneのRPGコマンドを削除しますか？'))setData(null);}
 if(b.hasAttribute('data-rpg-copy')){selectedId=null;const {w,i}=current();let prior=null;for(let j=i-1;j>=0;j--){if(w.scenes[j]?.extensions?.[KEY]){prior=w.scenes[j].extensions[KEY];break;}}setData(prior?JSON.parse(JSON.stringify(prior)):template());}
 });
 panel.addEventListener('change',e=>{if(e.target.hasAttribute('data-rpg-position')){const d=data();if(d){d.position=e.target.value;changed();}}if(e.target.hasAttribute('data-rpg-edit')){editing=e.target.checked;changed();}});
}
global.AhakoRpgSceneEditor={select(id){if(!data()?.nodes?.[id])return;selectedId=id;render();},connect(work,index,cb){getWork=work;getIndex=index;if(cb)onEdit=cb;install();render();},render,active:()=>!!data()&&editing,scene:()=>data(),refreshPreview:null,update(id,fields){const d=data();if(!d?.nodes?.[id])return;Object.assign(d.nodes[id],fields);changed();},add,remove};
// Preserve old Studio connection points while replacing the former advanced data editor.
global.AhakoRpgEditor={connect:(...args)=>global.AhakoRpgSceneEditor.connect(...args),render:()=>global.AhakoRpgSceneEditor.render()};
})(window);
