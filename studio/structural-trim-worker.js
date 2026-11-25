// Phase 3.2.5e2: isolated encoder, one job per worker.
let trimRequest=null, trimResult=null;
let slowUntil=0, seq=0; const pending=new Map();
const u=(ja,en)=>en;
function rpc(kind,blob){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});postMessage({type:'rpc',kind,id,blob});});}
const deliveryVideoMetadata=blob=>rpc('metadata',blob);
async function decodePCM(blob){const p=await rpc('pcm',blob);return {...p,getChannelData:c=>p.channels[c]};}
self.onmessage=async ({data:m})=>{
 if(m.type==='slow'){slowUntil=Date.now()+m.ms;return;}
 if(m.type==='rpcResult'){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(m.error)):p.resolve(m.value);}return;}
 if(m.type!=='start')return;
 trimRequest=m.trim||null;
 try{let candidate;const blob=await optimizeDeliveryVideo(m.master,m.mode,n=>postMessage({type:'progress',n}),{aborted:false},c=>{candidate=c;postMessage({type:'diagnostic',candidate:c});},(i,total,factor)=>postMessage({type:'stage',i,total,factor}),m.economical);postMessage({type:'done',blob,trim:trimResult});}catch(e){postMessage({type:'error',error:String(e)});}
};
  async function encodeDeliveryVideo(blob,factor,progress,signal,diagnostic,report,strict=false){
    if(!self.VideoDecoder||!self.VideoEncoder)throw new Error('WebCodecs requires current desktop Chrome/Edge (HTTPS).');
    const check=()=>{if(signal.aborted)throw new Error('Cancelled');};
    const meta=await deliveryVideoMetadata(blob);check();
    if(blob.size>150*1024*1024)throw new Error('Trial encoder limit: 150 MiB');
    const a=new Uint8Array(await blob.arrayBuffer()), d=new DataView(a.buffer);
    const U=p=>d.getUint32(p), S=p=>d.getInt32(p), H=p=>d.getUint16(p), str=p=>String.fromCharCode(...a.subarray(p,p+4));
    function boxes(s,e){const out=[];while(s+8<=e){let n=U(s),h=8;if(n===1){n=Number(d.getBigUint64(s+8));h=16;}if(!n)n=e-s;if(n<h||s+n>e)throw Error('Invalid MP4 box');out.push({t:str(s+4),p:s+h,e:s+n});s+=n;}return out;}
    const children=b=>boxes(b.p,b.e), get=(b,t)=>{const x=children(b).find(x=>x.t===t);if(!x)throw Error('Missing MP4 '+t);return x;};
    const root={p:0,e:a.length}, moov=get(root,'moov');if(children(root).some(b=>b.t==='moof'))throw Error('Fragmented MP4 not supported');
    const tracks=children(moov).filter(b=>b.t==='trak');
    const kind=t=>str(get(get(t,'mdia'),'hdlr').p+8);
    const audioTracks=tracks.filter(t=>kind(t)==='soun');if(audioTracks.length>1)throw Error('Multiple audio tracks unsupported; master retained');
    const tr=tracks.find(t=>kind(t)==='vide');if(!tr)throw Error('No video track');
    const md=get(tr,'mdia'), mh=get(md,'mdhd'), scale=U(mh.p+(a[mh.p]===1?20:12)), st=get(get(md,'minf'),'stbl');
    const sd=get(st,'stsd'), entry=boxes(sd.p+8,sd.e)[0];if(!entry||!['avc1','avc3'].includes(entry.t))throw Error('Only AVC/H.264 MP4 supported in this trial');
    const avc=get({p:entry.p+78,e:entry.e},'avcC'), desc=a.slice(avc.p,avc.e), codec='avc1.'+Array.from(desc.slice(1,4),x=>x.toString(16).padStart(2,'0')).join('');
    const sz=get(st,'stsz'), fixed=U(sz.p+4), count=U(sz.p+8);if(!count||count>18000||!scale)throw Error('Unsupported sample count');
    const sizes=Array.from({length:count},(_,i)=>fixed||U(sz.p+12+i*4));
    function runs(t,signed=false){const b=children(st).find(b=>b.t===t);if(!b)return null;const r=[];for(let i=0;i<U(b.p+4);i++){const p=b.p+8+i*8,n=U(p),v=signed&&a[b.p]===1?S(p+4):U(p+4);if(r.length+n>count)throw Error('Invalid timing table');for(let j=0;j<n;j++)r.push(v);}if(r.length!==count)throw Error('Incomplete timing table');return r;}
    const durations=runs('stts'), offsets=runs('ctts',true)||Array(count).fill(0), sc=get(st,'stsc'), co=children(st).find(b=>['stco','co64'].includes(b.t));if(!co)throw Error('Missing chunk offsets');
    const map=Array.from({length:U(sc.p+4)},(_,i)=>[U(sc.p+8+i*12),U(sc.p+12+i*12),U(sc.p+16+i*12)]), pos=[];let mi=0;
    for(let i=0;i<U(co.p+4);i++){while(mi+1<map.length&&map[mi+1][0]<=i+1)mi++;if(map[mi][2]!==1)throw Error('Multiple sample descriptions unsupported');let p=co.t==='co64'?Number(d.getBigUint64(co.p+8+i*8)):U(co.p+8+i*4);for(let j=0;j<map[mi][1];j++){pos.push(p);p+=sizes[pos.length-1];if(p>a.length)throw Error('Invalid sample offset');}}
    if(pos.length!==count)throw Error('Sample count mismatch');
    const ss=children(st).find(b=>b.t==='stss'), keys=ss?new Set(Array.from({length:U(ss.p+4)},(_,i)=>U(ss.p+8+i*4))):null;
    let clock=0;const pts=durations.map((n,i)=>{const t=clock+offsets[i];clock+=n;return t;});const origin=Math.min(...pts), times=pts.map(t=>Math.round((t-origin)*1e6/scale)), lens=durations.map(t=>Math.round(t*1e6/scale));
    const videoEnd=Math.max(...times.map((t,i)=>t+lens[i]));
    // Validate simple rate-1 edits against the actual presentation timeline.
    const mv=get(moov,'mvhd'), movieScale=U(mv.p+(a[mv.p]===1?20:12));
    function simpleEdit(track,trackScale,first,span){
      const ed=children(track).find(b=>b.t==='edts');if(!ed)return;
      const list=get(ed,'elst'), v=a[list.p], p=list.p+8;
      if(!movieScale||!trackScale||v>1||U(list.p+4)!==1)throw Error('Complex MP4 edit unsupported; master retained');
      const dur=v?Number(d.getBigUint64(p)):U(p), start=v?Number(d.getBigInt64(p+8)):S(p+4), rate=p+(v?16:8);
      if(H(rate)!==1||H(rate+2)!==0||Math.abs((start-first)/trackScale)>.002||Math.abs(dur/movieScale-span)>.003)throw Error('MP4 edit requires trimming or offset; master retained');
    }
    simpleEdit(tr,scale,origin,videoEnd/1e6);
    let end=videoEnd;
    if(audioTracks.length){
      const am=get(get(audioTracks[0],'mdia'),'mdhd'), v=a[am.p], as=U(am.p+(v===1?20:12)), ad=v===1?Number(d.getBigUint64(am.p+24)):U(am.p+16);
      if(!as||!ad)throw Error('Invalid audio timeline');
      const audioSpan=ad/as;
      simpleEdit(audioTracks[0],as,0,audioSpan);
      if(Math.abs(Math.max(videoEnd/1e6,audioSpan)-meta.duration)>.06||Math.abs(audioSpan-videoEnd/1e6)>.5)throw Error('MP4 track timing unsupported; master retained');
      end=Math.max(videoEnd,Math.round(audioSpan*1e6));
    }else if(Math.abs(videoEnd/1e6-meta.duration)>.06)throw Error('MP4 edit/timing unsupported; master retained');
    let selected=times.map((t,i)=>({t,d:lens[i]})).sort((a,b)=>a.t-b.t), offset=0;
    if(trimRequest){
      if(audioTracks.length)throw Error('Structural trim: audio not supported');
      const lo=Math.max(0,Math.round((trimRequest.start-.25)*1e6)), hi=Math.min(videoEnd,Math.round((trimRequest.end+.25)*1e6));
      selected=selected.filter(p=>p.t+p.d>lo&&p.t<hi);
      if(!selected.length)throw Error('Empty trim');
      offset=selected[0].t;end=Math.max(...selected.map(p=>p.t+p.d))-offset;
      if(offset>trimRequest.start*1e6||offset+end<trimRequest.end*1e6||end>=videoEnd-.1e6)throw Error('No safe trim');
      trimResult={offset:offset/1e6,duration:end/1e6};
    }
    const selectedTimes=new Set(selected.map(p=>p.t)), expected=selected.map(p=>p.t-offset), targetCount=selected.length;
    const dc={codec,description:desc}, ec={codec:'vp09.00.10.08',width:meta.width,height:meta.height,bitrate:Math.max(100000,Math.min(12000000,Math.round(blob.size*8/meta.duration*factor))),framerate:count/(videoEnd/1e6),latencyMode:'quality'};
    if(!(await VideoDecoder.isConfigSupported(dc)).supported||!(await VideoEncoder.isConfigSupported(ec)).supported)throw Error('AVC decoder or VP9 encoder unavailable');
    // Bounded sampled luma quality check, aligned by original presentation timestamp.
    const sampleTimes=new Set(expected.filter((_,i)=>i%Math.max(1,Math.floor(targetCount/(strict?24:12)))===0||i===targetCount-1));
    const samples=new Map(), scores=[];
    const canvas=new OffscreenCanvas(1,1);canvas.width=strict?Math.min(640,meta.width):320;canvas.height=Math.max(8,Math.round(canvas.width*meta.height/meta.width));
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    const detailCanvas=new OffscreenCanvas(1,1);detailCanvas.width=96;detailCanvas.height=96;
    const detailCtx=detailCanvas.getContext('2d',{willReadFrequently:true});
    const nativeCanvas=new OffscreenCanvas(1,1);
    const nativeCtx=nativeCanvas.getContext('2d',{willReadFrequently:true});
    function native(f){nativeCanvas.width=meta.width;nativeCanvas.height=meta.height;nativeCtx.drawImage(f,0,0);return nativeCtx.getImageData(0,0,meta.width,meta.height).data;}
    function nativeScore(a,b){const w=meta.width,h=meta.height;let sum=0,n=0,worst=0,edge=0,edgeN=0,cover=0,coverN=0;const cw=Math.min(w,h*9/16),left=(w-cw)/2;for(let y=0;y<h;y+=64)for(let x=0;x<w;x+=64){let e=0,k=0;for(let j=y;j<Math.min(y+64,h);j++)for(let i=x;i<Math.min(x+64,w);i++){const p=(j*w+i)*4;let v=0;for(let c=0;c<3;c++)v+=(a[p+c]-b[p+c])**2;e+=v;k+=3;if(i>=left&&i<left+cw){cover+=v;coverN+=3;}if(i>0){const q=p-4;const da=.2126*(a[p]-a[q])+.7152*(a[p+1]-a[q+1])+.0722*(a[p+2]-a[q+2]);const db=.2126*(b[p]-b[q])+.7152*(b[p+1]-b[q+1])+.0722*(b[p+2]-b[q+2]);edge+=(da-db)**2;edgeN++;}}sum+=e;n+=k;worst=Math.max(worst,e/k);}return {nativeMse:sum/n,tileMse:worst,coverMse:cover/coverN,edgeMse:edge/Math.max(1,edgeN)};}
    if(strict&&sampleTimes.size*meta.width*meta.height*4>128*1024*1024)throw Error('Strict quality sample memory limit (128 MiB); master retained');
    function detail(f){const w=Math.min(96,meta.width),h=Math.min(96,meta.height),parts=[];for(const [x,y] of [[.25,.25],[.75,.25],[.5,.5],[.25,.75],[.75,.75]]){detailCtx.drawImage(f,Math.round((meta.width-w)*x),Math.round((meta.height-h)*y),w,h,0,0,w,h);parts.push(detailCtx.getImageData(0,0,w,h).data);}return parts;}
    function detailError(a,b){let sum=0,n=0,worst=0;for(let k=0;k<a.length;k++){let e=0,m=0;for(let i=0;i<a[k].length;i+=4)for(let c=0;c<3;c++){e+=(a[k][i+c]-b[k][i+c])**2;m++;}sum+=e;n+=m;worst=Math.max(worst,e/m);}return {rgbMse:sum/n,worstRgbMse:worst};}
    function luma(f){ctx.drawImage(f,0,0,canvas.width,canvas.height);const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;const y=new Float32Array(rgba.length/4);for(let i=0;i<y.length;i++)y[i]=.2126*rgba[i*4]+.7152*rgba[i*4+1]+.0722*rgba[i*4+2];return y;}
    function score(a,b){let err=0,sum=0,n=0;const w=canvas.width,h=canvas.height;for(let y=0;y<h;y+=8)for(let x=0;x<w;x+=8){let A=0,B=0,AA=0,BB=0,AB=0,k=0;for(let j=y;j<Math.min(y+8,h);j++)for(let i=x;i<Math.min(x+8,w);i++){const p=j*w+i,v=a[p],z=b[p];A+=v;B+=z;AA+=v*v;BB+=z*z;AB+=v*z;err+=(v-z)**2;k++;}A/=k;B/=k;sum+=((2*A*B+6.5025)*(2*(AB/k-A*B)+58.5225))/((A*A+B*B+6.5025)*(AA/k-A*A+BB/k-B*B+58.5225));n++;}return {ssim:sum/n,mse:err/a.length};}
    const frames=[], packets=[];let failure, decoded=0;const decoder=new VideoDecoder({output:f=>frames.push(f),error:e=>failure=e}), encoder=new VideoEncoder({output:c=>{const b=new Uint8Array(c.byteLength);c.copyTo(b);packets.push({t:c.timestamp,d:c.duration,key:c.type==='key',b});},error:e=>failure=e});
    const tick=()=>new Promise(r=>setTimeout(r,Date.now()<slowUntil?35:5));const guard=()=>{check();if(failure)throw failure;};
    async function drain(){while(frames.length){guard();while(encoder.encodeQueueSize>3){await tick();guard();}const f=frames.shift();try{if(!selectedTimes.has(f.timestamp))continue;const t=f.timestamp-offset;if(report&&sampleTimes.has(t))samples.set(t,{luma:luma(f),detail:detail(f),native:strict?native(f):null});const shifted=trimRequest?new VideoFrame(f,{timestamp:t,duration:f.duration??selected.find(p=>p.t===f.timestamp).d}):f;try{encoder.encode(shifted,{keyFrame:decoded===0||decoded%Math.max(1,Math.round(ec.framerate*2))===0});decoded++;}finally{if(shifted!==f)shifted.close();}}finally{f.close();}}}
    try{decoder.configure(dc);encoder.configure(ec);for(let i=0;i<count;i++){guard();while(decoder.decodeQueueSize>3){await drain();await tick();guard();}decoder.decode(new EncodedVideoChunk({type:!keys||keys.has(i+1)?'key':'delta',timestamp:times[i],duration:lens[i],data:a.subarray(pos[i],pos[i]+sizes[i])}));await drain();if(i%4===0){progress(Math.floor(i/count*90));await tick();}}await decoder.flush();await drain();await encoder.flush();guard();}finally{decoder.close();encoder.close();frames.forEach(f=>f.close());}
    if(decoded!==targetCount||packets.length!==targetCount)throw Error('Frame count mismatch: '+decoded+'/'+packets.length+'/'+count);
    if(packets.some((p,i)=>p.t!==expected[i]))throw Error('Output timestamps differ');
    if(report){let err, outputCount=0;const vd=new VideoDecoder({output:f=>{try{outputCount++;if(samples.has(f.timestamp))scores.push({...score(samples.get(f.timestamp).luma,luma(f)),...detailError(samples.get(f.timestamp).detail,detail(f)),...(strict?nativeScore(samples.get(f.timestamp).native,native(f)):{})});}catch(e){err=e;}finally{f.close();}},error:e=>err=e});try{vd.configure({codec:ec.codec,codedWidth:meta.width,codedHeight:meta.height});for(const p of packets){guard();if(err)throw err;while(vd.decodeQueueSize>3){await tick();guard();if(err)throw err;}vd.decode(new EncodedVideoChunk({type:p.key?'key':'delta',timestamp:p.t,duration:p.d??0,data:p.b}));}await vd.flush();if(err)throw err;guard();}finally{if(vd.state!=='closed')vd.close();}samples.clear();if(outputCount!==targetCount||scores.length!==sampleTimes.size)throw Error('Quality verification frame mismatch');const mse=scores.reduce((n,v)=>n+v.mse,0)/scores.length;const db=v=>10*Math.log10(65025/v);const avg=k=>scores.reduce((n,v)=>n+v[k],0)/scores.length;const max=k=>Math.max(...scores.map(v=>v[k]));report({strict,evalWidth:canvas.width,...(strict?{nativePsnr:db(avg("nativeMse")),tileWorst:db(max("tileMse")),coverPsnr:db(avg("coverMse")),coverWorst:db(max("coverMse")),edgePsnr:db(avg("edgeMse"))}:{}),frames:targetCount,samples:scores.length,ssim:scores.reduce((n,v)=>n+v.ssim,0)/scores.length,worst:Math.min(...scores.map(v=>v.ssim)),psnr:mse===0?Infinity:10*Math.log10(65025/mse),detailPsnr:10*Math.log10(65025/(scores.reduce((n,v)=>n+v.rgbMse,0)/scores.length)),detailWorst:10*Math.log10(65025/Math.max(...scores.map(v=>v.worstRgbMse)))});}
    // Decode the complete audio timeline, then encode Opus offline in bounded blocks.
    let audio=null;
    if(audioTracks.length){
      if(!self.AudioEncoder||!self.AudioData)throw Error('Audio WebCodecs unavailable; master retained');
      const pcm=await decodePCM(blob);check();
      const channels=pcm.numberOfChannels, rate=48000, length=pcm.length;
      if(channels<1||channels>2||pcm.sampleRate!==rate||length*channels*4>64*1024*1024||Math.abs(length/rate-end/1e6)>.06)throw Error('Unsupported audio layout or duration; master retained');
      const config={codec:'opus',sampleRate:rate,numberOfChannels:channels,bitrate:channels===1?64000:96000,opus:{frameDuration:20000}};
      if(!(await AudioEncoder.isConfigSupported(config)).supported)throw Error('Opus encoder unavailable');
      let head,err;const ap=[];const ae=new AudioEncoder({output:(c,m)=>{if(m?.decoderConfig?.description){const v=m.decoderConfig.description;head=new Uint8Array(v.buffer||v,v.byteOffset||0,v.byteLength).slice();}const b=new Uint8Array(c.byteLength);c.copyTo(b);ap.push({t:c.timestamp,d:c.duration,b,key:true,audio:true});},error:e=>err=e});
      try{ae.configure(config);for(let i=0;i<length;i+=960){check();if(err)throw err;while(ae.encodeQueueSize>4){await tick();check();if(err)throw err;}const n=Math.min(960,length-i), data=new Float32Array(n*channels);for(let c=0;c<channels;c++)data.set(pcm.getChannelData(c).subarray(i,i+n),c*n);const f=new AudioData({format:'f32-planar',sampleRate:rate,numberOfFrames:n,numberOfChannels:channels,timestamp:Math.round(i*1e6/rate),data});try{ae.encode(f);}finally{f.close();}}await ae.flush();if(err)throw err;}finally{ae.close();}
      if(!head||head.length<19||String.fromCharCode(...head.slice(0,8))!=='OpusHead'||!ap.length)throw Error('Opus metadata unavailable');
      const skip=new DataView(head.buffer,head.byteOffset,head.byteLength).getUint16(10,true), delay=Math.round(skip*1e9/rate);
      // WebCodecs Opus packets use 20 ms frames; normalize packet clock, preserve codec delay.
      const padding=ap.length*960-skip-length;if(padding<0||padding>=960)throw Error('Opus padding mismatch; master retained');
      for(let i=0;i<ap.length;i++){ap[i].t=i*20000;ap[i].padding=i===ap.length-1?Math.round(padding*1e9/rate):0;}
      audio={head,delay,channels,packets:ap,length,pcm};
    }
    // Finite WebM with millisecond timecodes, duration and keyframe cues.
    const bytes=(...v)=>new Uint8Array(v), cat=(...parts)=>{const r=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let k=0;for(const p of parts){r.set(p,k);k+=p.length;}return r;};
    function num(n){let x=BigInt(n),r=[];do{r.unshift(Number(x&255n));x>>=8n;}while(x);return bytes(...r);}
    function vint(n){for(let k=1;k<=8;k++){if(BigInt(n)<(1n<<BigInt(7*k))-1n){let x=BigInt(n)|(1n<<BigInt(7*k)),r=new Uint8Array(k);for(let i=k-1;i>=0;i--){r[i]=Number(x&255n);x>>=8n;}return r;}}throw Error('EBML overflow');}
    const el=(id,...p)=>{const b=cat(...p);return cat(num(id),vint(b.length),b);}, ui=(id,n)=>el(id,num(n)), txt=(id,s)=>el(id,new TextEncoder().encode(s));
    const fl=new Uint8Array(8);new DataView(fl.buffer).setFloat64(0,end/1000);
    const header=el(0x1a45dfa3,ui(0x4286,1),ui(0x42f7,1),ui(0x42f2,4),ui(0x42f3,8),txt(0x4282,'webm'),ui(0x4287,4),ui(0x4285,2));
    const info=el(0x1549a966,ui(0x2ad7b1,1000000),el(0x4489,fl),txt(0x4d80,'Ahako'),txt(0x5741,'Ahako'));
    const hz=new Uint8Array(8);new DataView(hz.buffer).setFloat64(0,48000);
    const track=el(0x1654ae6b,el(0xae,ui(0xd7,1),ui(0x73c5,1),ui(0x83,1),txt(0x86,'V_VP9'),el(0xe0,ui(0xb0,meta.width),ui(0xba,meta.height))),...(audio?[el(0xae,ui(0xd7,2),ui(0x73c5,2),ui(0x83,2),txt(0x86,'A_OPUS'),el(0x63a2,audio.head),ui(0x56aa,audio.delay),ui(0x56bb,80000000),el(0xe1,el(0xb5,hz),ui(0x9f,audio.channels)))]:[]));
    const clusters=[], cues=[];let base=0, blocks=[], muxOffset=info.length+track.length;
    function finish(){if(!blocks.length)return;const c=el(0x1f43b675,ui(0xe7,base),...blocks);clusters.push(c);muxOffset+=c.length;blocks=[];}
    const lastVideoTime=Math.max(...expected);
    const muxPackets=audio?[...packets,...audio.packets].sort((a,b)=>a.t-b.t||Number(!!a.audio)-Number(!!b.audio)):packets;
    for(const p of muxPackets){const t=Math.round(p.t/1000);if(!blocks.length||(!p.audio&&p.key)||t-base>30000){finish();base=t;if(!p.audio&&p.key)cues.push(el(0xbb,ui(0xb3,t),el(0xb7,ui(0xf7,1),ui(0xf1,muxOffset))));}const rel=t-base;const block=bytes(p.audio?0x82:0x81,(rel>>8)&255,rel&255,p.key?128:0);if(!p.audio&&p.t===lastVideoTime&&end>videoEnd){block[3]=0;blocks.push(el(0xa0,el(0xa1,block,p.b),ui(0x9b,Math.round((end-p.t)/1000)),...(p.key?[]:[el(0xfb,bytes(0xff))])));}else if(p.padding){const pad=new Uint8Array(8);new DataView(pad.buffer).setBigInt64(0,BigInt(p.padding));block[3]=0;blocks.push(el(0xa0,el(0xa1,block,p.b),el(0x75a2,pad)));}else blocks.push(el(0xa3,block,p.b));}finish();
    const parts=[info,track,...clusters,el(0x1c53bb6b,...cues)];const result=new Blob([header,num(0x18538067),vint(parts.reduce((n,p)=>n+p.length,0)),...parts],{type:'video/webm'});
    const outputMime=audio?'video/webm;codecs=vp9,opus':'video/webm;codecs=vp9';
    diagnostic?.(result,outputMime,meta);
    if(audio){
      const decodedAudio=await decodePCM(result);check();
      const rate=48000, delta=decodedAudio.length-audio.length;
      if(decodedAudio.numberOfChannels!==audio.channels)throw Error('Audio channels: '+audio.channels+' -> '+decodedAudio.numberOfChannels);
      if(decodedAudio.sampleRate!==rate)throw Error('Audio sample rate: '+decodedAudio.sampleRate);
      const xs=Array.from({length:audio.channels},(_,c)=>audio.pcm.getChannelData(c));
      const ys=Array.from({length:audio.channels},(_,c)=>decodedAudio.getChannelData(c));
      const limit=Math.min(audio.length,decodedAudio.length), stride=Math.max(8,Math.ceil(limit/12000));
      function correlation(lag,step,from=0,to=limit){let xx=0,yy=0,xy=0;for(let c=0;c<xs.length;c++)for(let i=Math.max(from,0,-lag);i<Math.min(to,xs[c].length,ys[c].length-lag);i+=step){const x=xs[c][i],y=ys[c][i+lag];xx+=x*x;yy+=y*y;xy+=x*y;}return xx*yy>1e-18?xy/Math.sqrt(xx*yy):0;}
      let lag=0,best=correlation(0,stride);for(let k=-2400;k<=2400;k+=24){const r=correlation(k,stride);if(r>best){best=r;lag=k;}}const coarse=lag;for(let k=coarse-23;k<=coarse+23;k++){if(Math.abs(k)>2400)continue;const r=correlation(k,stride);if(r>best){best=r;lag=k;}}check();
      let power=0,outPower=0,error=0,missing=0,extra=0,n=0;
      for(let c=0;c<xs.length;c++){const x=xs[c],y=ys[c];for(let i=0;i<x.length;i++){const j=i+lag;power+=x[i]*x[i];if(j<0||j>=y.length){missing+=x[i]*x[i];continue;}error+=(x[i]-y[j])**2;n++;}for(let j=0;j<y.length;j++){outPower+=y[j]*y[j];if(j-lag<0||j-lag>=x.length)extra+=y[j]*y[j];}}
      const silent=power/(audio.length*audio.channels)<1e-10;
      const ratio=error/Math.max(power,1e-12), gain=10*Math.log10(Math.max(outPower,1e-12)/Math.max(power,1e-12)), lost=missing/Math.max(power,1e-12), added=extra/Math.max(power,1e-12);
      const corr=correlation(lag,1), zero=correlation(0,1);const sections=[];for(let i=0;i<4;i++)sections.push(correlation(lag,4,Math.floor(limit*i/4),Math.floor(limit*(i+1)/4)));
      const fmt=v=>Number(v).toFixed(3);const summary='Audio | duration '+fmt(audio.length/rate)+' -> '+fmt(decodedAudio.length/rate)+' s | delta '+fmt(delta/rate*1000)+' ms | lag '+fmt(lag/rate*1000)+' ms | correlation '+fmt(zero)+' -> '+fmt(corr)+' | error '+fmt(ratio)+' | gain '+fmt(gain)+' dB | missing '+fmt(lost)+' | extra '+fmt(added)+' | sections '+sections.map(fmt).join('/');
      const failures=[];if(Math.abs(delta)>960)failures.push('duration');if(!silent){if(Math.abs(lag)>480)failures.push('alignment');if(corr<.80||ratio>.35)failures.push('waveform');if(Math.abs(gain)>2)failures.push('gain');if(lost>.001||added>.001)failures.push('boundary energy');}else if(outPower/(decodedAudio.length*audio.channels)>1e-8)failures.push('silence');
      diagnostic?.(result,outputMime,meta,summary);
      if(failures.length)throw Error('Audio FAIL ['+failures.join(', ')+']; '+summary+'; master retained');
    }
    progress(99);check();
    const out=await deliveryVideoMetadata(result);check();if(!Number.isFinite(out.duration)||Math.abs(out.duration-(trimRequest?end/1e6:meta.duration))>.06||out.width!==meta.width||out.height!==meta.height)throw Error('Output metadata mismatch');if(result.size>=blob.size)throw Error('No size reduction; master retained');return result;
  }
  async function optimizeDeliveryVideo(master,mode,progress,signal,diagnostic,stage=()=>{},economical=false){
    const header=new Uint8Array(await master.blob.slice(0,12).arrayBuffer());
    if(header[0]===0x1a&&header[1]===0x45&&header[2]===0xdf&&header[3]===0xa3){
      throw Error(u('WebM素材は再圧縮せず保持します。MP4原本がある場合は差し替えてください。','WebM source retained without recompression. Replace with original MP4 if available.'));
    }
    const strict=mode==='ahako',deep=mode==='deep'||strict, auto=deep||mode==='auto';
    const factors=strict?[.30,.35,.40,.45,.55,.75]:deep?[.22,.18,.15,.12,.10,.07,.05,.45,.75]:auto?[.22,.45,.75]:[Number(mode)];
    let best=null,last=null;const history=[], choices=[];let choiceBytes=0;
    for(let i=0;i<factors.length;i++){
      if(signal.aborted)throw Error('Cancelled');
      const factor=factors[i];let metrics,candidate;
      stage(i+1,factors.length,factor);
      try{
        const blob=await encodeDeliveryVideo(master.blob,factor,n=>progress(Math.floor((i+n/100)*100/factors.length)),signal,(blob,mime,meta,audioSummary)=>{candidate={blob,mime,audioSummary,name:master.name.replace(/\.[^.]+$/,'')+'.webm'};},m=>metrics=m,strict);
        candidate.metrics=metrics;candidate.factor=factor;
        const pass=strict?(metrics.ssim>=.985&&metrics.worst>=.965&&metrics.psnr>=40&&metrics.nativePsnr>=36&&metrics.tileWorst>=26&&metrics.coverPsnr>=37&&metrics.coverWorst>=34&&metrics.edgePsnr>=36):!auto||(metrics.ssim>=.96&&metrics.worst>=.92&&metrics.psnr>=32&&(!deep||(metrics.detailPsnr>=30&&metrics.detailWorst>=24)));
        history.push({factor,size:blob.size,pass,metrics});
        if(strict && !economical && choiceBytes+blob.size<=32*1024*1024){choices.push({...candidate,pass});choiceBytes+=blob.size;}
        candidate.pass=pass;if(!pass){candidate.error='Sampled quality below threshold';last=candidate;continue;}
        if(!best||blob.size<best.blob.size)best=candidate;
        if(economical||(!strict&&(!deep||factor>=.45)))break;
        // Higher bitrate fallback is unnecessary once a low-rate candidate passes.
        if(i===6&&best)break;
      }catch(e){if(signal.aborted)throw e;history.push({factor,pass:false,error:String(e)});if(candidate){candidate.pass=false;candidate.metrics=metrics;candidate.error=String(e);last=candidate;}else if(!last)last={error:String(e)};if(!auto){if(candidate)diagnostic(candidate);throw e;}}
      if(deep&&i===6&&best)break;
    }
    if(signal.aborted)throw Error('Cancelled');
    if(!best){if(last?.blob){last.history=history;diagnostic(last);}throw Error(last?.error||'No candidate passed');}
    best.history=history;if(strict){for(const c of choices)c.history=history;best.choices=choices;}diagnostic(best);return best.blob;
  }
