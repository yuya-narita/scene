/* AHAKO RPG Command data layer v1.0 — no DOM dependencies.
   Work: extensions.ahakoRpgCommand; Scene: extensions.ahakoRpgCommand.
   IDs are stable strings. Changes apply in scene array order, not numeric IDs.
*/
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.AhakoRpgCommand=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const KEY='ahakoRpgCommand';
  const clone=v=>JSON.parse(JSON.stringify(v));
  const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  const id=v=>typeof v==='string'&&v.length>0;
  function validate(work){
    const errors=[];
    if(!object(work)){return {valid:false,errors:['work must be an object']};}
    const book=work.extensions&&work.extensions[KEY];
    if(book!==undefined){
      if(!object(book)) errors.push('work extension must be an object');
      else {
        if(book.version!==1) errors.push('book.version must be 1');
        if(!object(book.nodes)) errors.push('book.nodes must be an object');
        else for(const [key,node] of Object.entries(book.nodes)){
          if(!id(key)||!object(node)) errors.push('invalid node: '+key);
          else if(node.visible!==undefined&&typeof node.visible!=='boolean') errors.push('invalid visible: '+key);
        }
      }
    }
    if(Array.isArray(work.scenes)) for(const [i,scene] of work.scenes.entries()){
      const patch=scene&&scene.extensions&&scene.extensions[KEY];
      if(patch===undefined)continue;
      if(!object(patch)||!object(patch.nodes)){errors.push('invalid scene patch at '+i);continue;}
      for(const [key,delta] of Object.entries(patch.nodes)){
        if(!book||!book.nodes||!Object.prototype.hasOwnProperty.call(book.nodes,key))errors.push('unknown node '+key+' at '+i);
        if(!object(delta))errors.push('invalid node delta '+key+' at '+i);
        else if(delta.visible!==undefined&&typeof delta.visible!=='boolean')errors.push('invalid visibility '+key+' at '+i);
      }
    }
    return {valid:errors.length===0,errors};
  }
  function resolve(work,sceneIndex){
    const result=validate(work);
    if(!result.valid)throw new Error(result.errors.join('; '));
    const book=work.extensions&&work.extensions[KEY];
    if(!book)return {nodes:{},sources:{},position:'center'};
    const nodes=clone(book.nodes),sources={};
    for(const key of Object.keys(nodes))sources[key]={};
    const scenes=Array.isArray(work.scenes)?work.scenes:[];
    if(!Number.isInteger(sceneIndex)||sceneIndex<0||sceneIndex>=scenes.length)throw new RangeError('invalid scene index');
    let position=book.position||'center';
    for(let i=0;i<=sceneIndex;i++){
      const patch=scenes[i].extensions&&scenes[i].extensions[KEY];
      if(!patch)continue;
      if(patch.position!==undefined){position=patch.position;}
      for(const [key,delta] of Object.entries(patch.nodes)){
        for(const [field,value] of Object.entries(delta)){
          // null removes a prior override only if authoring layer resolves its inheritance;
          // persisted patches use concrete values, including false and zero.
          nodes[key][field]=clone(value);
          sources[key][field]=scenes[i].id||String(i);
        }
      }
    }
    return {nodes,sources,position};
  }
  function visibleNodes(snapshot){
    const nodes=snapshot.nodes, memo={};
    function shown(key,visiting){
      if(Object.prototype.hasOwnProperty.call(memo,key))return memo[key];
      if(visiting.has(key))return memo[key]=false;
      const n=nodes[key];if(!n||n.visible===false)return memo[key]=false;
      if(!n.parentId)return memo[key]=true;
      visiting.add(key);const result=shown(n.parentId,visiting);visiting.delete(key);
      return memo[key]=result;
    }
    return Object.keys(nodes).filter(key=>shown(key,new Set()));
  }
  function setScenePatch(work,sceneId,nodeId,fields){
    const copy=clone(work);
    const scene=copy.scenes&&copy.scenes.find(s=>s.id===sceneId);
    if(!scene)throw new Error('scene ID not found');
    const book=copy.extensions&&copy.extensions[KEY];
    if(!book||!book.nodes||!Object.prototype.hasOwnProperty.call(book.nodes,nodeId))throw new Error('node ID not found');
    if(!object(fields))throw new TypeError('fields must be an object');
    scene.extensions=scene.extensions||{};
    const patch=scene.extensions[KEY]=scene.extensions[KEY]||{nodes:{}};
    patch.nodes=patch.nodes||{};
    patch.nodes[nodeId]={...(patch.nodes[nodeId]||{}),...clone(fields)};
    const checked=validate(copy);if(!checked.valid)throw new Error(checked.errors.join('; '));
    return copy;
  }
  function clearSceneField(work,sceneId,nodeId,field){
    const copy=clone(work),scene=copy.scenes&&copy.scenes.find(s=>s.id===sceneId);
    if(!scene)throw new Error('scene ID not found');
    const patch=scene.extensions&&scene.extensions[KEY];
    if(patch&&patch.nodes&&patch.nodes[nodeId]){
      delete patch.nodes[nodeId][field];
      if(!Object.keys(patch.nodes[nodeId]).length)delete patch.nodes[nodeId];
    }
    return copy;
  }
  return {KEY,validate,resolve,visibleNodes,setScenePatch,clearSceneField};
});
