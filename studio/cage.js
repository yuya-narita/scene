(()=>{
  'use strict';
  const root=document.querySelector('#cageHome');
  if(!root||!window.SceneStudioAPI?.cageSnapshot)return;
  const panel=document.querySelector('#cagePanel');
  const toggle=document.querySelector('#cageToggle');
  const status=document.querySelector('#cageStatus');
  const reaction=document.querySelector('#cageReaction');
  const question=document.querySelector('#cageQuestion');
  const read=document.querySelector('#cageRead');
  const trail=document.querySelector('#cageTrail');
  const aside=document.querySelector('#cageAside');
  const follow=document.querySelector('#cageFollow');
  const followRow=document.querySelector('#cageFollowRow');
  const preview=document.querySelector('#playerScreen');
  const playerHost=document.querySelector('#scenePlayer');
  const api='https://scene-studio-api.a-hako.workers.dev/cage/read';
  // Preview safety valve. Server-side CAGE_DAILY_LIMIT controls the actual daily allowance.
  const previewReadLimit=120;
  const scenesPerRead=6;
  let busy=false;
  let previewSteps=0,autoAttempts=0,autoTimer=null,bubbleTimer=null,endingPending=false;
  const getSnapshot=()=>window.SceneStudioAPI.cageSnapshot();
  const day=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function getSource(){
    const snap=getSnapshot();
    const scene=snap.mode==='easy'?null:snap.scenes[snap.sceneIndex];
    const text=String(snap.mode==='easy'?(snap.easyText||''):(scene?.text||'')).trim();
    return {draftId:String(snap.draftId||''),sceneId:String(scene?.id||'easy'),sceneIndex:scene?snap.sceneIndex:-1,text:text.slice(0,2500),truncated:text.length>2500,mode:snap.mode};
  }
  function key(draftId){return `ahako-cage-v1:${draftId||'unsaved'}`;}
  function load(draftId){
    try{const value=JSON.parse(localStorage.getItem(key(draftId))||'null');return value?.version===1?value:{version:1,observations:[],lambdas:[],jumps:[],sigmas:[],attention:[]};}
    catch{return {version:1,observations:[],lambdas:[],jumps:[],sigmas:[],attention:[]};}
  }
  function continuity(state){return state.continuity&&typeof state.continuity==='object'?state.continuity:{lastIndex:-1,summary:'',hash:''};}
  function timeline(scenes,end){return scenes.slice(0,end+1).map(s=>`${s.id}:${s.text}`).join('\n');}
  function save(id,state){
    for(const name of ['observations','lambdas','jumps','sigmas'])state[name]=state[name].slice(-80);
    localStorage.setItem(key(id),JSON.stringify(state));
  }
  async function fingerprint(input){
    const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input));
    return Array.from(new Uint8Array(bytes)).map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  function showState(){
    const source=getSource();
    const state=load(source.draftId);
    const latest=state.observations.at(-1);
    const readCount=Math.max(state.observations.length,continuity(state).lastIndex+1);
    status.textContent=latest?`読んだScene ${readCount}件 ・ 引っかかり ${state.lambdas.length}件 ・ 問い ${state.jumps.length}件`:'まだ読んでいない。';
    reaction.hidden=!latest?.reaction||latest.spoken===false;
    reaction.textContent=latest?.reaction||'';
    question.hidden=!latest?.question;
    question.textContent=latest?.question||'';
    trail.replaceChildren();
    for(const item of state.observations.slice(-5).reverse()){
      const p=document.createElement('p');
      p.textContent=`${new Date(item.at).toLocaleDateString('ja-JP')} ${item.sceneIndex<0?'本文':`Scene ${item.sceneIndex+1}`}：${item.question||item.lambda||item.reaction||'黙って読んだ'}`;
      trail.append(p);
    }
    read.textContent=source.mode==='easy'?'本文を読んで':'今のSceneを読んで';
    read.disabled=busy||!source.text||(source.mode==='preview'&&playerHost?.classList.contains('sp-cover-open'));
  }
  function speak(value,sceneId,ending=false){
    if(!value||preview.hidden||getSource().sceneId!==sceneId)return;
    aside.textContent=value;aside.hidden=false;
    clearTimeout(bubbleTimer);
    bubbleTimer=setTimeout(()=>{aside.hidden=true;},ending?20000:8500);
  }
  function signedInToken(){
    try{return String(JSON.parse(localStorage.getItem('ahako-author-session-v1')||'null')?.token||'');}
    catch{return '';}
  }
  function string(value,max){return typeof value==='string'?value.trim().slice(0,max):'';}
  function clean(value){
    const v=value&&typeof value==='object'?value:{};
    return {reaction:string(v.reaction,500),lambda:string(v.lambda,180),question:string(v.question,180),sigma:string(v.sigma,180),attention:Array.isArray(v.attention)?v.attention.filter(x=>typeof x==='string').slice(0,4).map(x=>x.slice(0,70)):[],anchor:string(v.anchor,120)};
  }
  async function observe(automatic=false,ending=false){
    if(preview.hidden)return;
    if(busy)return;
    const source=getSource();
    if(!source.text||source.mode==='preview'&&playerHost?.classList.contains('sp-cover-open')){
      if(!automatic)status.textContent='Sceneが表示されてから読ませて。';return;
    }
    const token=signedInToken();
    if(!token){status.textContent='読むには作者ログインが必要です。';if(automatic)follow.checked=false;return;}
    const hash=await fingerprint(`${source.sceneId}:${source.text}`);
    const state=load(source.draftId);
    const snap=getSnapshot();
    let memory=continuity(state);
    if(source.mode==='preview'&&memory.lastIndex>=0){
      const currentHash=await fingerprint(timeline(snap.scenes,memory.lastIndex));
      if(currentHash!==memory.hash){memory={lastIndex:-1,summary:'',hash:''};state.continuity=memory;}
    }
    const seen=state.observations.find(x=>x.hash===hash);
    if(seen&&source.mode!=='preview'){
      if(!automatic){reaction.textContent=seen.reaction||'この箇所は読んだ。今は黙っている。';reaction.hidden=false;question.textContent=seen.question||'';question.hidden=!seen.question;status.textContent='前に読んだ箇所の記録を表示中。';speak(seen.reaction||seen.question,source.sceneId);}
      return;
    }
    busy=true;read.disabled=true;status.textContent='読んでいる…';
    try{
      const start=source.mode==='preview'?(ending?Math.min(memory.lastIndex+1,source.sceneIndex):memory.lastIndex+1):source.sceneIndex;
      if(source.mode==='preview'&&start>source.sceneIndex){
        if(!automatic)status.textContent='ここまでは読んだ。今は黙っている。';
        return;
      }
      const end=source.mode==='preview'?(ending?source.sceneIndex:Math.min(source.sceneIndex,start+scenesPerRead-1)):source.sceneIndex;
      const batch=source.mode==='preview'?snap.scenes.slice(Math.max(start,end-scenesPerRead+1),end+1).map((item,i)=>({index:Math.max(start,end-scenesPerRead+1)+i,text:String(item.text||'').slice(0,450)})):[];
      const focus=end===source.sceneIndex;
      const currentScene=source.mode==='preview'?batch.at(-1)?.text||'':source.text;
      const prior=state.observations.filter(x=>source.mode!=='preview'||x.sceneIndex<start).slice(-4);
      const response=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({scene:currentScene,sceneId:source.sceneId,sceneIndex:end,mode:source.mode,truncated:source.truncated,contextScenes:batch,storyMemory:memory.summary,focus,ending,history:prior.map(x=>({lambda:x.lambda,question:x.question,sigma:x.sigma,anchor:x.anchor})),attention:source.mode==='preview'&&start===0?[]:state.attention.slice(-4)})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(string(data.error,130)||`読み込みに失敗しました（${response.status}）。`);
      const result=clean(data);
      // Reject a fabricated quotation: the cited phrase must occur in the submitted text.
      if(result.anchor&&!currentScene.includes(result.anchor))throw new Error('読んだ箇所を確認できなかった。もう一度試して。');
      const shouldSpeak=Boolean(data.speak&&focus&&(ending||end-Number(memory.lastSpokenIndex??-100)>=12));
      if(source.mode==='preview'){
        state.continuity={lastIndex:end,summary:string(data.storyMemory,900)||memory.summary,hash:await fingerprint(timeline(snap.scenes,end)),lastSpokenIndex:shouldSpeak?end:memory.lastSpokenIndex};
      }
      const at=new Date().toISOString();
      const entry={at,day:day(),hash:await fingerprint(`${snap.scenes[end]?.id||source.sceneId}:${currentScene}`),sceneId:String(snap.scenes[end]?.id||source.sceneId),sceneIndex:end,...result,spoken:shouldSpeak,ending};
      state.observations.push(entry);
      if(result.lambda)state.lambdas.push({at,sceneId:source.sceneId,anchor:result.anchor,text:result.lambda});
      if(result.question)state.jumps.push({at,sceneId:source.sceneId,question:result.question,lambda:result.lambda});
      if(result.sigma)state.sigmas.push({at,sceneId:source.sceneId,text:result.sigma,provisional:true});
      state.attention=result.attention;
      save(source.draftId,state);
      showState();
      if(shouldSpeak)speak(result.reaction||result.question,source.sceneId,ending);
      if(!result.reaction&&!result.question)status.textContent='読んだ。今は黙っている。';
    }catch(error){status.textContent=error.message||'読み込めなかった。';if(automatic)follow.checked=false;}
    finally{busy=false;read.disabled=false;if(endingPending){endingPending=false;readEnding();}else if(automatic&&follow.checked)schedulePreviewRead();}
  }
  toggle.addEventListener('click',()=>{if(preview.hidden)return;panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)showState();});
  document.querySelector('#cageClose').addEventListener('click',()=>{panel.hidden=true;toggle.setAttribute('aria-expanded','false');});
  read.addEventListener('click',()=>observe(false));
  function readEnding(){
    if(!follow.checked||preview.hidden)return;
    const source=getSource(),snap=getSnapshot();
    if(source.mode!=='preview'||source.sceneIndex!==snap.scenes.length-1||!source.text)return;
    if(load(source.draftId).observations.some(item=>item.ending&&item.sceneId===source.sceneId))return;
    if(busy){endingPending=true;return;}
    observe(true,true);
  }
  playerHost?.addEventListener('sceneplayer:end',()=>{clearTimeout(autoTimer);readEnding();});
  aside.addEventListener('click',()=>{aside.hidden=true;panel.hidden=false;toggle.setAttribute('aria-expanded','true');showState();});
  function schedulePreviewRead(){
    clearTimeout(autoTimer);
    if(!follow.checked||preview.hidden||autoAttempts>=previewReadLimit||busy)return;
    const source=getSource();
    if(!source.text||playerHost?.classList.contains('sp-cover-open'))return;
    const gap=source.sceneIndex-continuity(load(source.draftId)).lastIndex;
    const lastScene=source.sceneIndex===getSnapshot().scenes.length-1;
    if(gap<=0)return;
    const waitMs=gap<scenesPerRead&&autoAttempts>0&&!lastScene?12000:950;
    autoTimer=setTimeout(()=>{
      if(preview.hidden||!follow.checked||busy||getSource().sceneId!==source.sceneId)return;
      autoAttempts++;observe(true);
    },waitMs);
  }
  follow.addEventListener('change',()=>{if(follow.checked)schedulePreviewRead();else clearTimeout(autoTimer);});
  playerHost?.addEventListener('sceneplayer:scenechange',()=>{previewSteps++;aside.hidden=true;schedulePreviewRead();if(!panel.hidden)showState();});
  const visible=()=>{
    root.hidden=Boolean(preview.hidden&&document.querySelector('#editorScreen')?.hidden&&document.querySelector('#advancedScreen')?.hidden);
    followRow.hidden=preview.hidden;
    toggle.disabled=preview.hidden;
    if(preview.hidden){panel.hidden=true;toggle.setAttribute('aria-expanded','false');aside.hidden=true;clearTimeout(autoTimer);follow.checked=false;endingPending=false;autoAttempts=0;previewSteps=0;}
    if(!root.hidden&&!panel.hidden)showState();
  };
  const observer=new MutationObserver(visible);
  for(const id of ['playerScreen','editorScreen','advancedScreen']){const node=document.getElementById(id);if(node)observer.observe(node,{attributes:true,attributeFilter:['hidden']});}
  visible();
})();
