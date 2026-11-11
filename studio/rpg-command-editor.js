/* RPG Command Phase B: Studio authoring only. Player display is Phase C. */
(function(){
'use strict';
const KEY='ahakoRpgCommand';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let getWork=()=>null,getIndex=()=>0,mode='book',selected='',installed=false;
const options=(items,value)=>items.map(([v,t])=>`<option value="${esc(v)}" ${String(value)===String(v)?'selected':''}>${esc(t)}</option>`).join('');
const positionOptions=[['top','上'],['center','中央'],['bottom','下']];
function ensureBook(work){
  work.extensions ||= {};
  return work.extensions[KEY] ||= {version:1,position:'center',nodes:{}};
}
function current(){const work=getWork(),i=getIndex();return {work,i,scene:work?.scenes?.[i]};}
function patchFor(scene,create=false){
  if(!scene)return null;
  if(create)scene.extensions ||= {};
  if(create)scene.extensions[KEY] ||= {nodes:{}};
  return scene.extensions?.[KEY]||null;
}
function addNode(){
  const {work}=current();if(!work)return;
  const book=ensureBook(work);let id;
  do{id='rpg_'+Math.random().toString(36).slice(2,11);}while(book.nodes[id]);
  book.nodes[id]={type:'item',label:'新しい項目',value:'',visible:true};selected=id;render();
}
function removeNode(){
  const {work}=current();if(!work||!selected)return;
  const book=ensureBook(work),children=Object.entries(book.nodes).filter(([,n])=>n.parentId===selected);
  if(children.length){window.alert('子項目があります。先に子項目を移動・削除してください。');return;}
  if(!window.confirm('この項目を削除しますか？ Sceneの変更履歴も削除されます。'))return;
  delete book.nodes[selected];
  for(const scene of work.scenes||[]){const patch=patchFor(scene);if(patch?.nodes)delete patch.nodes[selected];}
  selected=Object.keys(book.nodes)[0]||'';render();
}
function setBookField(field,value){const {work}=current();if(!work||!selected)return;ensureBook(work).nodes[selected][field]=value;render();}
function setSceneField(field,value,inherit=false){
  const {work,scene}=current();if(!work||!scene||!selected)return;
  ensureBook(work);
  const patch=patchFor(scene,true);patch.nodes ||= {};
  if(inherit){if(patch.nodes[selected]){delete patch.nodes[selected][field];if(!Object.keys(patch.nodes[selected]).length)delete patch.nodes[selected];}}
  else (patch.nodes[selected] ||= {})[field]=value;
  if(!Object.keys(patch.nodes).length&&patch.position===undefined)delete scene.extensions[KEY];
  render();
}
function setPosition(value){
  const {work,scene}=current();if(!work)return;
  if(mode==='book')ensureBook(work).position=value;
  else if(scene){const patch=patchFor(scene,true);if(value==='inherit')delete patch.position;else patch.position=value;if(!Object.keys(patch.nodes||{}).length&&patch.position===undefined)delete scene.extensions[KEY];}
  render();
}
function render(){
  const panel=$('rpgCommandEditor');if(!panel)return;
  const {work,i,scene}=current();if(!work||!scene){panel.hidden=true;return;}
  panel.hidden=false;
  const book=work.extensions?.[KEY];
  const nodes=book?.nodes||{};
  if(selected&&!nodes[selected])selected='';
  if(!selected)selected=Object.keys(nodes)[0]||'';
  const node=nodes[selected];
  const api=window.AhakoRpgCommand;
  let snapshot=null,error='';
  if(book&&api){try{snapshot=api.resolve(work,i);}catch(e){error=e.message;}}
  const effective=snapshot?.nodes?.[selected]||node||{};
  const scenePatch=patchFor(scene);
  const override=scenePatch?.nodes?.[selected]||{};
  const source=snapshot?.sources?.[selected]||{};
  const field=(key,label)=>{
    const base=mode==='book'?node?.[key]:effective?.[key];
    const changed=Object.prototype.hasOwnProperty.call(override,key);
    const text=key==='visible'?`<select data-rpg-field="${key}">${options(mode==='scene'?[['inherit','継承'],['true','表示'],['false','非表示']]:[['true','表示'],['false','非表示']],mode==='scene'?(changed?String(override[key]):'inherit'):String(base!==false))}</select>`:
      `<input data-rpg-field="${key}" value="${esc(base)}" ${mode==='scene'?'placeholder="継承値"':''}>`;
    return `<label class="rpg-edit-field"><span>${esc(label)} ${mode==='scene'?`<small>${changed?'このSceneで変更':source[key]?'Scene '+esc(source[key])+'から継承':'基本台帳から継承'}</small>`:''}</span>${text}${mode==='scene'&&key!=='visible'?`<button type="button" data-rpg-inherit="${key}" ${changed?'':'disabled'}>継承に戻す</button>`:''}</label>`;
  };
  const list=Object.entries(nodes).map(([id,n])=>`<button type="button" class="rpg-node ${selected===id?'is-selected':''}" data-rpg-select="${esc(id)}">${esc(n.label||id)} <small>${esc(n.type||'item')}</small></button>`).join('');
  const pos=mode==='book'?(book?.position||'center'):(scenePatch?.position||'inherit');
  const posOpts=mode==='book'?positionOptions:[['inherit','前Sceneから継承'],...positionOptions];
  const visible=api&&snapshot?new Set(api.visibleNodes(snapshot)):new Set(Object.keys(nodes));
  const preview=Object.entries(snapshot?.nodes||nodes).filter(([id])=>visible.has(id)).map(([,n])=>`<div>${esc(n.label||'項目')}${n.value!==undefined&&n.value!==''?'　'+esc(n.value):''}</div>`).join('');
  panel.innerHTML=`<div class="rpg-editor-heading"><strong>RPGコマンド</strong><small>Scene ${i+1} / ${work.scenes.length} · 編集専用（Player連携は次工程）</small></div>
    <div class="rpg-editor-modes"><button type="button" data-rpg-mode="book" class="${mode==='book'?'is-selected':''}">基本台帳</button><button type="button" data-rpg-mode="scene" class="${mode==='scene'?'is-selected':''}">このSceneから変更</button></div>
    ${!book?'<p class="rpg-editor-hint">基本台帳は未作成です。項目を追加すると作成されます。</p>':''}
    <div class="rpg-editor-actions"><button type="button" data-rpg-add>＋ 項目を追加</button>${selected?'<button type="button" data-rpg-delete>選択項目を削除</button>':''}</div>
    <div class="rpg-editor-list">${list||'<span class="rpg-editor-hint">項目がありません</span>'}</div>
    ${node?`<div class="rpg-editor-fields">${mode==='book'?`${field('label','表示名')}<label class="rpg-edit-field"><span>種類</span><select data-rpg-field="type">${options([['menu','メニュー'],['list','一覧'],['detail','詳細'],['item','項目']],node.type||'item')}</select></label><label class="rpg-edit-field"><span>親項目</span><select data-rpg-field="parentId">${options([['','なし（最上位）'],...Object.entries(nodes).filter(([id,n])=>id!==selected&&n.parentId!==selected).map(([id,n])=>[id,n.label||id])],node.parentId||'')}</select></label>`:''}${field('value','値')}${field('visible','公開状態')}</div>`:''}
    <label class="rpg-edit-field"><span>カードの表示位置</span><select data-rpg-position>${options(posOpts,pos)}</select></label>
    <div class="rpg-editor-preview"><strong>表示内容の確認（背景は変更しません）</strong><div class="rpg-editor-window">${preview||'表示する項目がありません'}</div></div>
    ${error?`<p class="rpg-editor-error">${esc(error)}</p>`:''}
    <p class="rpg-editor-hint">変更は作業中の.sceneデータに直接反映。通常の保存・書き出し操作を使ってください。</p>`;
}
function install(){
  if(installed)return;installed=true;
  const panel=$('rpgCommandEditor');if(!panel)return;
  panel.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.rpgMode){mode=b.dataset.rpgMode;render();}
    else if(b.hasAttribute('data-rpg-add'))addNode();
    else if(b.hasAttribute('data-rpg-delete'))removeNode();
    else if(b.dataset.rpgSelect){selected=b.dataset.rpgSelect;render();}
    else if(b.dataset.rpgInherit)setSceneField(b.dataset.rpgInherit,null,true);
  });
  panel.addEventListener('change',e=>{
    const el=e.target;if(el.hasAttribute('data-rpg-position')){setPosition(el.value);return;}
    const key=el.dataset.rpgField;if(!key)return;
    let value=el.value;
    if(key==='visible'){
      if(value==='inherit'){setSceneField(key,null,true);return;}
      value=value==='true';
    }
    if(key==='parentId'){
      const {work}=current(),nodes=ensureBook(work).nodes;let p=value,cycle=false;
      while(p){if(p===selected){cycle=true;break;}p=nodes[p]?.parentId;}
      if(cycle){window.alert('親子関係を循環させることはできません。');render();return;}
      if(!value){delete nodes[selected].parentId;render();return;}
    }
    if(mode==='book')setBookField(key,value);else setSceneField(key,value);
  });
}
window.AhakoRpgEditor={connect(work,index){getWork=work;getIndex=index;install();render();},render};
})();
