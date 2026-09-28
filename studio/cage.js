(()=>{
  'use strict';
  const root=document.querySelector('#cageHome');
  if(!root||!window.SceneStudioAPI?.cageSnapshot)return;
  const panel=document.querySelector('#cagePanel');
  const toggle=document.querySelector('#cageToggle');
  const status=document.querySelector('#cageStatus');
  const reaction=document.querySelector('#cageReaction');
  const question=document.querySelector('#cageQuestion');
  const questionLabel=document.querySelector('#cageQuestionLabel');
  const read=document.querySelector('#cageRead');
  const trail=document.querySelector('#cageTrail');
  const questionTrail=document.querySelector('#cageQuestionTrail');
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
  let previewSteps=0,autoAttempts=0,autoTimer=null,endingPending=false,bubbleSceneIndex=-1;
  // Preview text is immutable while the Player is open. Reuse its Scene list;
  // cageSnapshot otherwise maps every Scene on every tap and timer callback.
  let previewSnapshot=null;
  const getSnapshot=()=>{
    if(!preview.hidden)return previewSnapshot||(previewSnapshot=window.SceneStudioAPI.cageSnapshot());
    return window.SceneStudioAPI.cageSnapshot();
  };
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
    state.observations=state.observations.slice(-400);
    for(const name of ['lambdas','jumps','sigmas'])state[name]=state[name].slice(-80);
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
    const withinTimeline=item=>source.mode!=='preview'||item.sceneIndex<=source.sceneIndex;
    const spoken=item=>item.spoken&&Boolean(item.reaction)&&withinTimeline(item);
    const asked=item=>Boolean(item.question)&&withinTimeline(item);
    const lastSpoken=state.observations.findLast(spoken);
    const lastQuestion=state.observations.findLast(asked);
    const readCount=Math.max(state.observations.filter(item=>!item.manual).length,continuity(state).lastIndex+1);
    status.textContent=latest?`Scene ${readCount}まで読んだ ・ 引っかかり ${state.lambdas.length}件 ・ 問い ${state.jumps.length}件`:'まだ読んでいない。';
    reaction.hidden=!lastSpoken?.reaction;
    reaction.textContent=lastSpoken?.reaction||'';
    questionLabel.hidden=!lastQuestion;
    questionLabel.textContent=lastQuestion?`CAGEが残した問い ・ ${lastQuestion.sceneIndex<0?'本文':`Scene ${lastQuestion.sceneIndex+1}`}`:'';
    question.hidden=!lastQuestion;
    question.textContent=lastQuestion?.question||'';
    trail.replaceChildren();
    const utterances=state.observations.filter(spoken);
    if(!utterances.length){const empty=document.createElement('p');empty.textContent='まだ話していない。';trail.append(empty);}
    for(const item of utterances.slice(-30).reverse()){
      const button=document.createElement('button');
      button.type='button';button.className='cage-history-item';
      const label=document.createElement('small');label.textContent=item.sceneIndex<0?'本文':`Scene ${item.sceneIndex+1}`;
      const words=document.createElement('span');words.textContent=item.reaction;
      button.append(label,words);
      button.addEventListener('click',()=>speak(item.reaction,item.sceneId,item.ending,item.sceneIndex));
      trail.append(button);
    }
    questionTrail.replaceChildren();
    const questions=state.observations.filter(asked);
    if(!questions.length){const empty=document.createElement('p');empty.textContent='まだ問いはない。';questionTrail.append(empty);}
    for(const item of questions.slice(-40).reverse()){
      const button=document.createElement('button');
      button.type='button';button.className='cage-history-item';
      const label=document.createElement('small');label.textContent=item.sceneIndex<0?'本文':`Scene ${item.sceneIndex+1}`;
      const words=document.createElement('span');words.textContent=item.question;
      button.append(label,words);
      button.addEventListener('click',()=>{
        questionLabel.hidden=false;questionLabel.textContent=`CAGEが残した問い ・ ${label.textContent}`;
        question.hidden=false;question.textContent=item.question;
      });
      questionTrail.append(button);
    }
    read.textContent=source.mode==='easy'?'本文について聞く':'このSceneについて聞く';
    read.hidden=source.mode==='preview'&&follow.checked;
    document.querySelector('.cage-caption').hidden=source.mode==='preview'&&follow.checked;
    read.disabled=busy||!source.text||(source.mode==='preview'&&playerHost?.classList.contains('sp-cover-open'));
  }
  function speak(value,sceneId,ending=false,sceneIndex=-1){
    if(!value||preview.hidden)return;
    const current=getSource();
    // A reply can arrive after the author has moved on. Never show a future
    // Scene's reaction on an earlier Scene, but keep recent replies visible.
    if(current.mode==='preview'?(current.sceneIndex<sceneIndex):current.sceneId!==sceneId)return;
    const written=current.mode==='preview'&&current.sceneIndex>sceneIndex&&sceneIndex>=0
      ?`Scene ${sceneIndex+1}を読んで：${value}`:value;
    const ink=document.createElement('span');
    ink.className='cage-written';
    ink.textContent=written;
    ink.style.setProperty('--cage-write-time',`${Math.min(1600,Math.max(480,written.length*24))}ms`);
    aside.replaceChildren(ink);
    bubbleSceneIndex=sceneIndex;
    aside.hidden=false;
    aside.classList.remove('cage-pop');
    void aside.offsetWidth;
    aside.classList.add('cage-pop');
    toggle.classList.add('cage-has-reaction');
    toggle.setAttribute('aria-label','CAGEの新しい反応を開く');
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
    const manual=!automatic;
    busy=true;read.disabled=true;status.textContent='読んでいる…';
    try{
      const start=source.mode==='preview'?(manual?Math.max(0,source.sceneIndex-scenesPerRead+1):ending?Math.min(memory.lastIndex+1,source.sceneIndex):memory.lastIndex+1):source.sceneIndex;
      if(source.mode==='preview'&&start>source.sceneIndex){
        if(!automatic)status.textContent='ここまでは読んだ。今は黙っている。';
        return;
      }
      const end=source.mode==='preview'?(manual||ending?source.sceneIndex:Math.min(source.sceneIndex,start+scenesPerRead-1)):source.sceneIndex;
      const batch=source.mode==='preview'?snap.scenes.slice(Math.max(start,end-scenesPerRead+1),end+1).map((item,i)=>({index:Math.max(start,end-scenesPerRead+1)+i,text:String(item.text||'').slice(0,450)})):[];
      // Read each batch from its own position, even if the author advances
      // while inference is in flight. The bubble identifies the Scene later.
      const focus=true;
      const currentScene=manual?source.text:source.mode==='preview'?batch.at(-1)?.text||'':source.text;
      const revisiting=manual&&source.mode==='preview'&&memory.lastIndex>=source.sceneIndex;
      const prior=state.observations.filter(x=>!x.manual&&(source.mode!=='preview'||x.sceneIndex<start)).slice(-4);
      const response=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({scene:currentScene,sceneId:source.sceneId,sceneIndex:end,mode:source.mode,truncated:source.truncated,contextScenes:batch,storyMemory:revisiting?'':memory.summary,focus,ending,manual,history:prior.map(x=>({lambda:x.lambda,question:x.question,sigma:x.sigma,anchor:x.anchor})),attention:revisiting||source.mode==='preview'&&start===0?[]:state.attention.slice(-4)})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(string(data.error,130)||`読み込みに失敗しました（${response.status}）。`);
      const result=clean(data);
      // Reject a fabricated quotation: the cited phrase must occur in the submitted text.
      if(result.anchor&&!currentScene.includes(result.anchor))throw new Error('読んだ箇所を確認できなかった。もう一度試して。');
      if(manual&&!result.reaction)throw new Error('今のSceneについて、うまく言葉にできなかった。もう一度聞いて。');
      const shouldSpeak=Boolean(result.reaction)&&
        (manual||Boolean(data.speak&&(ending||end-Number(memory.lastSpokenIndex??-100)>=12)));
      if(source.mode==='preview'&&!manual){
        state.continuity={lastIndex:end,summary:string(data.storyMemory,900)||memory.summary,hash:await fingerprint(timeline(snap.scenes,end)),lastSpokenIndex:shouldSpeak?end:memory.lastSpokenIndex};
      }
      const at=new Date().toISOString();
      const entry={at,day:day(),hash,sceneId:String(snap.scenes[end]?.id||source.sceneId),sceneIndex:end,...result,spoken:shouldSpeak,ending,manual};
      state.observations.push(entry);
      if(result.lambda)state.lambdas.push({at,sceneId:source.sceneId,anchor:result.anchor,text:result.lambda});
      if(result.question)state.jumps.push({at,sceneId:source.sceneId,question:result.question,lambda:result.lambda});
      if(result.sigma)state.sigmas.push({at,sceneId:source.sceneId,text:result.sigma,provisional:true});
      if(!manual)state.attention=result.attention;
      save(source.draftId,state);
      if(!panel.hidden)showState();
      if(shouldSpeak)speak(result.reaction,source.sceneId,ending,end);
      if(!result.reaction&&!result.question)status.textContent='読んだ。今は黙っている。';
    }catch(error){status.textContent=error.message||'読み込めなかった。';if(automatic)follow.checked=false;}
    finally{busy=false;read.disabled=false;if(endingPending){endingPending=false;readEnding();}else if(automatic&&follow.checked)schedulePreviewRead();}
  }
  toggle.addEventListener('click',()=>{if(preview.hidden)return;panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden){aside.hidden=true;toggle.classList.remove('cage-has-reaction');toggle.setAttribute('aria-label','CAGEを開く');showState();}});
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
  aside.addEventListener('click',()=>{aside.hidden=true;panel.hidden=false;toggle.classList.remove('cage-has-reaction');toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','CAGEを開く');showState();});
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
  follow.addEventListener('change',()=>{if(follow.checked)schedulePreviewRead();else clearTimeout(autoTimer);showState();});
  playerHost?.addEventListener('sceneplayer:load',()=>{previewSnapshot=null;});
  playerHost?.addEventListener('sceneplayer:restart',()=>{previewSnapshot=null;});
  playerHost?.addEventListener('sceneplayer:scenechange',(event)=>{
    if(previewSnapshot)previewSnapshot.sceneIndex=Number(event.detail?.index??previewSnapshot.sceneIndex);
    previewSteps++;
    if(matchMedia('(max-width:600px)').matches){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}
    const source=getSource();
    if(source.sceneIndex<bubbleSceneIndex)aside.hidden=true;
    const previouslySpoken=load(source.draftId).observations.findLast(item=>item.sceneIndex===source.sceneIndex&&item.sceneId===source.sceneId&&item.spoken&&item.reaction);
    if(previouslySpoken)speak(previouslySpoken.reaction,previouslySpoken.sceneId,previouslySpoken.ending,previouslySpoken.sceneIndex);
    schedulePreviewRead();if(!panel.hidden)showState();
  });
  playerHost?.addEventListener('sceneplayer:coverstart',(event)=>{
    if(previewSnapshot)previewSnapshot.sceneIndex=Number(event.detail?.index??0);
    if(matchMedia('(max-width:600px)').matches){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}
    aside.hidden=true;
    schedulePreviewRead();
  });
  const visible=()=>{
    root.hidden=Boolean(preview.hidden&&document.querySelector('#editorScreen')?.hidden&&document.querySelector('#advancedScreen')?.hidden);
    followRow.hidden=preview.hidden;
    toggle.disabled=preview.hidden;
    if(preview.hidden){previewSnapshot=null;panel.hidden=true;toggle.setAttribute('aria-expanded','false');aside.hidden=true;clearTimeout(autoTimer);toggle.classList.remove('cage-has-reaction');toggle.setAttribute('aria-label','CAGEを開く');follow.checked=false;endingPending=false;autoAttempts=0;previewSteps=0;}
    if(!root.hidden&&!panel.hidden)showState();
  };
  const observer=new MutationObserver(visible);
  for(const id of ['playerScreen','editorScreen','advancedScreen']){const node=document.getElementById(id);if(node)observer.observe(node,{attributes:true,attributeFilter:['hidden']});}
  visible();
})();
