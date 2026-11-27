(()=>{'use strict';
const $=id=>document.getElementById(id),host=$('host'),stage=$('stage'),panel=$('panel'),status=$('status'),go=$('go');
let data,core,stream,output,recorder,timer=0,active=false,failed=false,done=false,token,started=0;
const report=(message)=>{try{window.opener?.postMessage({type:'ahako-record-status',token,message},location.origin);}catch{}};
function fit(){if(!data)return;const [w,h]=data.ratio.split(':').map(Number);const width=Math.min(innerWidth,innerHeight*w/h);stage.style.width=Math.floor(width)+'px';stage.style.height=Math.floor(width*h/w)+'px';}
function dispose(){cancelAnimationFrame(timer);try{core?.destroy();}catch{}core=null;host.replaceChildren();}
function cleanup(){active=false;dispose();output?.getTracks().forEach(t=>t.stop());output=null;stream?.getTracks().forEach(t=>t.stop());stream=null;}
function abort(message){if(done||failed)return;failed=true;cancelAnimationFrame(timer);if(recorder?.state==='recording')recorder.stop();cleanup();panel.hidden=false;status.textContent=message;report(message);}
function init(){dispose();core=new window.ScenePlayerCore(host,{allowPrevious:false,keyboard:false,swipe:false,endOnNextAction:true,uiLanguage:data.uiLanguage});core.load(data.doc,{startAt:data.rows[0]?.index??0});core.stopAuto();}
function enter(r,previous){if(previous&&(previous.kind==='ending'||r.kind==='cover')){init();core.unlockAudio(true);}if(r.kind==='cover'){core.showCover();return;}if(r.kind==='ending'){core.els.cover.hidden=true;core.host.classList.remove('sp-cover-open');core.finish();return;}if(previous?.kind==='scene'&&r.index===previous.index+1){core._finishVisibleEntranceEffects();core._clearPresentationTimers();core.index=r.index;core.maxVisitedIndex=Math.max(core.maxVisitedIndex,r.index);core._audioRenderMode='advance';core._render();}else{core.els.cover.hidden=true;core.host.classList.remove('sp-cover-open');core.goTo(r.index);core._queueInitialOneShots(data.doc.scenes[r.index]);}}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==window.opener||e.data?.type!=='ahako-record-init'||data)return;data=e.data;token=data.token;try{fit();$('mark').hidden=!data.watermark;init();navigator.mediaDevices?.setCaptureHandleConfig?.({handle:token,permittedOrigins:[location.origin]});status.textContent='録画開始を押し、この録画専用Playerのタブを音声付きで共有してください。録画中はこのタブを表示したままにしてください。';go.disabled=false;}catch(err){abort(String(err));}});
window.addEventListener('resize',()=>{if(active)abort('録画中に画面サイズが変更されました');else fit();});
window.addEventListener('pagehide',()=>{if(!done)abort('録画画面を閉じました');});
document.addEventListener('visibilitychange',()=>{if(active&&document.hidden)abort('録画タブが非表示になりました');});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&active)abort('録画中止');});
go.onclick=async()=>{go.disabled=true;try{
if(!navigator.mediaDevices?.getDisplayMedia||!window.MediaRecorder)throw Error('PC版Chrome/Edgeが必要です');
const mime=['video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));if(!mime)throw Error('WebM録画非対応');
stream=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:'browser',frameRate:{ideal:data.fps,max:data.fps},cursor:'never'},audio:{channelCount:{ideal:2},sampleRate:{ideal:48000},echoCancellation:false,noiseSuppression:false,autoGainControl:false},preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'exclude',systemAudio:'exclude'});
const track=stream.getVideoTracks()[0];if(!track||track.getSettings().displaySurface!=='browser'||track.getCaptureHandle?.()?.handle!==token)throw Error('録画専用Player自身のタブを選択してください');if(!stream.getAudioTracks().length)throw Error('タブの音声共有を有効にしてください');if(document.hidden)throw Error('録画タブを表示してください');
track.addEventListener('ended',()=>abort('共有が終了しました'),{once:true});
// Crop letterbox and scale with a native video track when available; avoid a JS canvas loop.
const q=[540,720,1080].includes(data.quality)?data.quality:720;
const [rw,rh]=data.ratio.split(':').map(Number),width=rw>=rh?Math.round(q*rw/rh/2)*2:q,height=rh>=rw?Math.round(q*rh/rw/2)*2:q;
let cropped=false;
if(window.CropTarget&&track.cropTo){try{await track.cropTo(await CropTarget.fromElement(stage));cropped=true;}catch{}}
try{await track.applyConstraints({width:{ideal:width,max:width},height:{ideal:height,max:height},frameRate:{ideal:data.fps,max:data.fps}});}catch{}
const audio=stream.getAudioTracks()[0];try{await audio.applyConstraints({channelCount:{ideal:2},echoCancellation:false,noiseSuppression:false,autoGainControl:false});}catch{}
const chunks=[];let bytes=0;recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:q===540?3000000:q===720?4500000:8000000,audioBitsPerSecond:192000});
recorder.ondataavailable=e=>{if(e.data.size){chunks.push(e.data);bytes+=e.data.size;if(bytes>256*1024*1024)abort('録画容量上限');}};
recorder.onerror=e=>abort(String(e.error||'録画エラー'));
recorder.onstop=()=>{if(failed||!done){cleanup();return;}const blob=new Blob(chunks,{type:recorder.mimeType||mime});if(!blob.size){done=false;abort('録画データが空です');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=data.filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);cleanup();panel.hidden=false;status.textContent='録画完了。保存したWebMを確認してください。';report('録画完了 ｜ '+data.filename+' ｜ '+(blob.size/1048576).toFixed(1)+' MiB');};
status.textContent='3秒後に録画開始。カーソルをブラウザの外へ移動してください。';
await new Promise(r=>setTimeout(r,3000));if(document.hidden||failed)throw Error('録画開始できません');
// Never expose the implicit cover between hiding the panel and entering the first row.
host.style.visibility='hidden';panel.hidden=true;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));if(document.hidden||failed)throw Error('録画開始できません');
let cursor=0;const ends=[];data.rows.reduce((n,r)=>(ends.push(n+r.seconds),n+r.seconds),0);const total=ends.at(-1);active=true;core.unlockAudio(true);recorder.start(1000);enter(data.rows[0],null);host.style.visibility='visible';started=performance.now();report('録画中 ｜ '+total.toFixed(2)+'秒 ｜ '+(cropped?'領域取得':'タブ全体')+' ｜ '+(audio.getSettings().channelCount||'?')+'ch');
function tick(){if(!active||failed)return;try{const elapsed=(performance.now()-started)/1000;if(elapsed>=total){done=true;active=false;recorder.stop();return;}let i=cursor;while(i<data.rows.length-1&&elapsed>=ends[i])i++;if(i!==cursor){const prev=i===cursor+1?data.rows[cursor]:null;cursor=i;enter(data.rows[i],prev);}timer=requestAnimationFrame(tick);}catch(e){abort(String(e));}}timer=requestAnimationFrame(tick);
}catch(e){abort(String(e.message||e));}};
window.opener?.postMessage({type:'ahako-record-ready'},location.origin);
})();
