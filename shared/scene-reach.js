/* Exact observed Scene entries, batched and anonymous. No inferred intervening Scenes. */
(()=>{'use strict';const endpoint='https://scene-studio-api.a-hako.workers.dev/scene-reach';
window.AhakoSceneReach={create(publicationId,layout){
 if(!/^[A-Za-z0-9_-]{6,80}$/.test(publicationId||'')||layout?.schemaVersion!==1||!/^rv_[a-f0-9]{32}$/.test(layout.version||'')||!['preview','full'].includes(layout.scope)||!Number.isInteger(layout.sceneCount)||layout.sceneCount<1||layout.sceneCount>100000||!window.AhakoWorkMeasurement?.getSessionId)return null;
 const sessionId=window.AhakoWorkMeasurement.getSessionId(publicationId);const waiting=new Set(),sent=new Set();let timer=null,busy=false,disposed=false;
 const payload=indices=>({schemaVersion:1,publicationId,version:layout.version,scope:layout.scope,sessionId,indices});
 function schedule(){if(disposed||timer||!waiting.size)return;timer=setTimeout(()=>{timer=null;void flush();},1000);}
 async function flush(beacon=false){if(timer){clearTimeout(timer);timer=null;}if(!waiting.size)return;
  const indices=[...waiting].sort((a,b)=>a-b).slice(0,32),body=JSON.stringify(payload(indices));
  if(beacon){try{const all=[...waiting].sort((a,b)=>a-b);let queued=false;for(let offset=0;offset<Math.min(all.length,2048);offset+=32){const data=JSON.stringify(payload(all.slice(offset,offset+32)));if(!navigator.sendBeacon?.(endpoint,new Blob([data],{type:'text/plain;charset=UTF-8'})))break;queued=true;}if(queued)return;}catch{} }
  if(busy)return;busy=true;let ok=false;try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true,cache:'no-store'});ok=r.ok;if(ok)for(const i of indices){waiting.delete(i);sent.add(i);}}catch{}finally{busy=false;if(ok&&waiting.size&&!disposed)schedule();}}
 const online=()=>{void flush();},hide=()=>{void flush(true);};window.addEventListener('online',online);window.addEventListener('pagehide',hide);const visibility=()=>{if(document.hidden)hide();};document.addEventListener('visibilitychange',visibility);
 return {reach(index){if(disposed||document.hidden||!Number.isInteger(index)||index<0||index>=layout.sceneCount)return;if(!sent.has(index))waiting.add(index);if(waiting.size>=32)void flush();else schedule();},flush,dispose(){hide();disposed=true;if(timer)clearTimeout(timer);window.removeEventListener('online',online);window.removeEventListener('pagehide',hide);document.removeEventListener('visibilitychange',visibility);}};
}};
})();
