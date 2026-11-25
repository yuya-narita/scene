// Editable ink uses a 1000 × 600 logical sheet. Times are in milliseconds.
(() => {
  'use strict';
  const W = 1000, H = 600;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const number = (n, fallback, min, max) => Number.isFinite(n) ? clamp(n, min, max) : fallback;
  // Estimate motion over the final 64 ms, including a pause before pen-up.
  function flickLength(marks, releasedAt) {
    const end=marks.at(-1);
    if(!end || end.distance<4 || !['brush','fountain'].includes(end.pen))return 0;
    const release=number(releasedAt,end.time,end.time,300000);
    const startTime=Math.max(marks[0].time,release-64);
    let distance=end.distance;
    for(let i=marks.length-1;i>0;i--){
      const a=marks[i-1], b=marks[i];
      if(b.time<=startTime)break;
      const part=clamp((startTime-a.time)/Math.max(1,b.time-a.time),0,1);
      distance=a.distance+(b.distance-a.distance)*part;
      if(a.time<=startTime)break;
    }
    const speed=(end.distance-distance)/Math.max(8,release-startTime);
    if(speed<=.12)return 0;
    const strength=clamp((speed-.12)/.8,0,1);
    return Math.min(end.distance*.58, (end.pen==='brush'?3:2)*Math.max(6,end.width)*strength);
  }

  // One repeatable sheet-space texture per ink color. Translucent and bare
  // fibers show the underlying Scene, including when it has a dark background.
  const waxTiles=new Map();
  function waxPattern(ctx,color){
    let tile=waxTiles.get(color);
    if(!tile){
      tile=document.createElement('canvas');tile.width=tile.height=128;
      const brush=tile.getContext('2d'),image=brush.createImageData(128,128);
      let seed=73123;
      function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
      const coarse=Float32Array.from({length:32*64},random);
      const rgb=parseInt(color.slice(1),16);
      for(let y=0;y<128;y++)for(let x=0;x<128;x++){
        const i=(y*128+x)*4;
        const fiber=coarse[(y>>1)*32+(((x+(y>>2))&127)>>2)];
        const tooth=.55*fiber+.45*random();
        image.data[i]=rgb>>16;image.data[i+1]=(rgb>>8)&255;image.data[i+2]=rgb&255;
        image.data[i+3]=Math.round(255*clamp((tooth-.25)*1.85,0,.98));
      }
      brush.putImageData(image,0,0);
      if(waxTiles.size>=12)waxTiles.delete(waxTiles.keys().next().value);
      waxTiles.set(color,tile);
    }
    return ctx.createPattern(tile,'repeat');
  }
  function prepare(layer) {
    const strokes = [];
    let count = 0;
    let lastTime = 0;
    for (const stroke of (Array.isArray(layer.strokes) ? layer.strokes : []).slice(0, 1000)) {
      if (!Array.isArray(stroke?.points)) continue;
      const tip = stroke.pen === 'brush' ? (stroke.tip || 'round') : 'round';
      const marks = [];
      let previous, distance = 0;
      const points = stroke.points;
      for (let i = 0; i < points.length && count < 20000; i++) {
        const point = points[i];
        if (!Array.isArray(point) || !point.slice(0,3).every(Number.isFinite) || point.length < 3) continue;
        const time = Math.max(lastTime, clamp(point[2], 0, 300000));
        let x = clamp(point[0], 0, 1) * W, y = clamp(point[1], 0, 1) * H;
        const next = points[i+1], prior = points[i-1];
        if (layer.smooth !== 'off' && Array.isArray(next) && Array.isArray(prior)) {
          const k = layer.smooth === 'strong' ? .34 : .17;
          x += ((number(next[0],point[0],0,1)+number(prior[0],point[0],0,1))*W-2*x)*k;
          y += ((number(next[1],point[1],0,1)+number(prior[1],point[1],0,1))*H-2*y)*k;
        }
        const from = previous || {x,y,time};
        const speed = Math.hypot(x-from.x,y-from.y)/Math.max(1,time-from.time);
        const pressure = number(point[3],1/(1+speed),0,1);
        const width = number(stroke.width,6,1,80);
        const factor = {fountain:.45+pressure, brush:.5+2*pressure,marker:2,crayon:1.4}[stroke.pen] || 1;
        distance += Math.hypot(x-from.x,y-from.y);
        marks.push({x,y,time,width:width*factor,distance,color:/^#[0-9a-f]{6}$/i.test(stroke.color)?stroke.color:'#171717',
          pen:stroke.pen,alpha:number(stroke.opacity,1,0,1)*(stroke.pen==='marker'?.38:1),first:!previous});
        previous = {x,y,time};
        lastTime = time; count++;
      }
      if(marks.length)strokes.push({marks,tip,tail:flickLength(marks,stroke.releasedAt)});
    }
    return {strokes,lastTime};
  }
  // Build a single filled silhouette per pen-down. All subpaths wind clockwise,
  // so intersections inside one stroke receive its ink opacity only once.
  function paintStroke(ctx, stroke, time) {
    const {marks,tip}=stroke;
    const first=marks[0];
    if(time<first.time)return;
    ctx.save();
    const flat=tip==='flat', angle=flat?-Math.PI/4:0;
    const c=Math.cos(angle), s=Math.sin(angle), squash=flat?.23:1;
    ctx.rotate(angle);ctx.scale(1,squash);
    ctx.fillStyle=first.pen==='crayon'?waxPattern(ctx,first.color):first.color;ctx.globalAlpha=first.alpha;
    ctx.beginPath();
    let last;
    function nib(x,y,width,distance){
      const nx=c*x+s*y, ny=(-s*x+c*y)/squash;
      const taper=tip==='pointed'?clamp(.05+distance/Math.max(8,first.width),.05,1):1;
      const remaining=marks.at(-1).distance-distance;
      const exit=stroke.tail ? .045+.955*clamp(remaining/stroke.tail,0,1) : 1;
      const r=width*Math.min(taper,exit)/2;
      if(last){
        const dx=nx-last.x,dy=ny-last.y,len=Math.hypot(dx,dy);
        if(len){
          const ox=-dy/len,oy=dx/len;
          ctx.moveTo(last.x+ox*last.r,last.y+oy*last.r);
          ctx.lineTo(last.x-ox*last.r,last.y-oy*last.r);
          ctx.lineTo(nx-ox*r,ny-oy*r);ctx.lineTo(nx+ox*r,ny+oy*r);ctx.closePath();
        }
      }
      ctx.moveTo(nx+r,ny);ctx.arc(nx,ny,r,0,Math.PI*2);ctx.closePath();
      last={x:nx,y:ny,r};
    }
    nib(first.x,first.y,first.width,0);
    for(let i=1;i<marks.length;i++){
      const a=marks[i-1], b=marks[i];
      if(time<a.time)break;
      const f=time>=b.time?1:(time-a.time)/(b.time-a.time);
      function at(k){nib(a.x+(b.x-a.x)*k,a.y+(b.y-a.y)*k,
        a.width+(b.width-a.width)*k,a.distance+(b.distance-a.distance)*k);}
      // A fast first movement may cross the whole pointed entry in one sample.
      const ramp=Math.max(8,first.width)*.95;
      const entryEnd=tip==='pointed'?ramp:Infinity;
      const exitStart=stroke.tail?marks.at(-1).distance-stroke.tail:Infinity;
      function boundary(d){
        if(d>a.distance && d<b.distance){
          const k=(d-a.distance)/(b.distance-a.distance);if(k<f)at(k);
        }
      }
      boundary(Math.min(entryEnd,exitStart));
      if(entryEnd!==exitStart)boundary(Math.max(entryEnd,exitStart));
      at(f);
      if(f<1)break;

    }
    ctx.fill();ctx.restore();
  }
  function inkPainter(canvas, layer) {
    const ctx = canvas.getContext('2d');
    const {strokes,lastTime} = prepare(layer);
    const duration = layer.display==='still' ? 0 : layer.seconds>0 ?
      number(layer.seconds,5,.1,300)*1000 : lastTime/number(layer.rate,1,.5,3);
    const delay = number(layer.delay,0,0,60)*1000;
    const pixels = Math.min(2, Math.max(.5, (canvas.clientWidth || W) * (window.devicePixelRatio || 1) / W));
    canvas.width = Math.round(W*pixels); canvas.height = Math.round(H*pixels);
    ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
    let cursor=0, underlay=null, partial=false, previousTime=-1;
    function render(elapsed) {
      if (elapsed < delay) return false;
      const t = elapsed === Infinity || !duration ? Infinity : (elapsed-delay)*lastTime/duration;
      if(t===previousTime || cursor===strokes.length)return elapsed>=delay+duration;
      previousTime=t;
      if(partial){
        ctx.save();ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(underlay,0,0);ctx.restore();
      }
      while(cursor<strokes.length){
        const stroke=strokes[cursor], marks=stroke.marks;
        if(t<marks[0].time)break;
        const done=t>=marks[marks.length-1].time;
        if(!done && !partial){
          underlay ||= document.createElement('canvas');
          underlay.width=canvas.width;underlay.height=canvas.height;
          underlay.getContext('2d').drawImage(canvas,0,0);
        }
        paintStroke(ctx,stroke,t);
        partial=!done;
        if(!done)break;
        cursor++;
      }
      if(cursor===strokes.length)underlay=null;
      return elapsed>=delay+duration;
    }
    return {render, duration:delay+duration};
  }
  const scratchImages=new Map();
  function scratchImage(src){
    if(!/^data:image\/(png|webp);base64,[A-Za-z0-9+/=]+$/.test(src||'')||src.length>3000000)return null;
    if(scratchImages.has(src))return scratchImages.get(src);
    const img=new Image();img.src=src;scratchImages.set(src,img);
    if(scratchImages.size>8)scratchImages.delete(scratchImages.keys().next().value);
    return img;
  }
  const readerMode=layer=>!!(layer?.scratchImage&&layer.readerScratch?.enabled);
  const hasInk=layer=>!!(layer?.strokes?.length||readerMode(layer));
  function readerScratch(canvas,layer,onDone){
    const img=scratchImage(layer.scratchImage), cfg=layer.readerScratch||{};
    const mask=document.createElement('canvas'), sample=document.createElement('canvas'), cover=document.createElement('canvas'), overlay=document.createElement('canvas');
    cover.width=overlay.width=W;cover.height=overlay.height=H;
    canvas.width=mask.width=W;canvas.height=mask.height=H;sample.width=250;sample.height=150;
    const ctx=canvas.getContext('2d'),m=mask.getContext('2d'),q=sample.getContext('2d',{willReadFrequently:true});
    let alpha=null,total=0,done=false,dead=false,id=null,last=null,frame=0;
    const oldStyle={pointerEvents:canvas.style.pointerEvents,touchAction:canvas.style.touchAction,cursor:canvas.style.cursor};
    Object.assign(canvas.style,{pointerEvents:'auto',touchAction:'none',cursor:'crosshair'});
    const width=number(layer.brush?.width,40,1,80), threshold=number(cfg.threshold,80,1,100)/100;
    const listeners=[];function listen(type,fn,opts){canvas.addEventListener(type,fn,opts);listeners.push([type,fn,opts]);}
    function makeCover(){
      const c=cover.getContext('2d'), kind=cfg.mask||'dust';if(kind==='none')return;
      let seed=319;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
      const g=c.createLinearGradient(0,0,W,H);const colors={dust:['#b4aa96','#81796b'],sand:['#e0c18b','#a88450'],fog:['#e6eef1','#b6cbd2'],frost:['#e9f6ff','#a6c7dc'],silver:['#a2a5aa','#e1e3e6'],black:['#242424','#111111']};
      const pair=colors[kind]||colors.dust;g.addColorStop(0,pair[0]);g.addColorStop(.55,pair[1]);g.addColorStop(1,pair[0]);c.fillStyle=g;c.fillRect(0,0,W,H);
      if(kind!=='black'){for(let i=0;i<12000;i++){c.fillStyle=i%2?'rgba(255,255,255,.12)':'rgba(40,30,20,.09)';const r=kind==='fog'?2+rnd()*9: .4+rnd()*2.4;c.beginPath();c.arc(rnd()*W,rnd()*H,r,0,Math.PI*2);c.fill();}}
      c.globalCompositeOperation='destination-in';c.globalAlpha=number(cfg.density,90,0,100)/100;c.fillStyle='#000';c.fillRect(0,0,W,H);c.globalAlpha=1;c.globalCompositeOperation='source-over';
    }
    makeCover();
    function composite(){ctx.clearRect(0,0,W,H);if(!img?.complete||!img.naturalWidth)return;
      ctx.save();ctx.drawImage(img,0,0,W,H);if(!done){ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0);}ctx.restore();
      if(!done){if(cfg.guide||['fog','frost'].includes(cfg.mask)){ctx.save();ctx.globalCompositeOperation='destination-over';ctx.globalAlpha=cfg.guide?.18:.35;ctx.drawImage(img,0,0,W,H);ctx.restore();}const o=overlay.getContext('2d');o.clearRect(0,0,W,H);o.drawImage(cover,0,0);o.globalCompositeOperation='destination-out';o.drawImage(mask,0,0);o.globalCompositeOperation='source-over';ctx.drawImage(overlay,0,0);}}
    function finish(notify=true){if(done||dead)return;done=true;composite();if(notify)onDone?.();}
    function ready(){if(dead||!img?.naturalWidth)return;q.clearRect(0,0,250,150);q.drawImage(img,0,0,250,150);alpha=q.getImageData(0,0,250,150).data;total=0;for(let i=3;i<alpha.length;i+=4)total+=alpha[i];if(layer.strokes?.length){const initial=document.createElement('canvas');inkPainter(initial,{...layer,strokes:layer.strokes.map(st=>({...st,pen:'ball',opacity:1,color:'#000000'}))}).render(Infinity);m.drawImage(initial,0,0);}update();if(!total)finish();}
    function update(){frame=0;if(dead||done)return;composite();if(!alpha||!total)return;q.clearRect(0,0,250,150);q.drawImage(mask,0,0,250,150);const a=q.getImageData(0,0,250,150).data;let revealed=0;for(let i=3;i<a.length;i+=4)revealed+=alpha[i]*a[i]/255;if(revealed/total>=threshold-.0001)finish();}
    function point(e){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
      const angle=number(layer.angle,0,-180,180)*Math.PI/180, c=Math.cos(angle),s=Math.sin(angle), sy=number(layer.height,100,10,300)/100;
      const cw=canvas.offsetWidth||r.width,ch=canvas.offsetHeight||r.height;
      const scale=r.width/Math.max(1,Math.abs(c)*cw+Math.abs(s)*ch*sy);
      return [(x*c+y*s)/Math.max(1,cw*scale)*W+W/2,(-x*s+y*c)/Math.max(1,ch*sy*scale)*H+H/2];}
    function mark(e){const p=point(e);m.lineWidth=width;m.lineCap='round';m.lineJoin='round';m.strokeStyle='#000';m.fillStyle='#000';m.beginPath();if(last){m.moveTo(...last);m.lineTo(...p);m.stroke();}else{m.arc(p[0],p[1],width/2,0,Math.PI*2);m.fill();}last=p;if(!frame)frame=requestAnimationFrame(update);}
    function stop(e){if(done&&id===null&&e.type==='click'){canvas.style.pointerEvents='none';}e.stopPropagation();if(e.cancelable)e.preventDefault();}
    listen('pointerdown',e=>{if(done){canvas.style.pointerEvents='none';return;}stop(e);if(dead||id!==null||e.button!==0)return;id=e.pointerId;last=null;canvas.setPointerCapture(id);mark(e);});
    listen('pointermove',e=>{if(id!==e.pointerId)return;stop(e);if(!done)mark(e);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])listen(type,e=>{if(id!==e.pointerId)return;stop(e);id=null;last=null;});
    for(const type of ['click','dblclick','touchstart','touchmove','touchend','touchcancel','mousedown','mouseup','wheel'])listen(type,stop,{passive:false});
    const failed=()=>finish();
    if(!img||(img.complete&&!img.naturalWidth))failed();else if(img.complete)ready();else {img.addEventListener('load',ready,{once:true});img.addEventListener('error',failed,{once:true});}
    return {get done(){return done;},finish,dispose(){dead=true;cancelAnimationFrame(frame);img?.removeEventListener('load',ready);img?.removeEventListener('error',failed);for(const [t,fn,o] of listeners)canvas.removeEventListener(t,fn,o);Object.assign(canvas.style,oldStyle);}};
  }
  window.AhakoReaderScratch=readerScratch;
  function painter(canvas,layer){
    const img=scratchImage(layer.scratchImage);
    if(false&&img&&readerMode(layer)){
      canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');let show=false;
      const draw=()=>{if(show&&img.naturalWidth){ctx.clearRect(0,0,W,H);ctx.drawImage(img,0,0,W,H);}};
      if(!img.complete)img.addEventListener('load',draw,{once:true});
      return {duration:0,render(){show=true;draw();return true;}};
    }
    if(!img)return inkPainter(canvas,layer);
    const mask=document.createElement('canvas');
    const paint=inkPainter(mask,{...layer,strokes:layer.strokes.map(st=>({...st,pen:'ball',opacity:1,color:'#000000'}))});
    canvas.width=mask.width;canvas.height=mask.height;
    const ctx=canvas.getContext('2d');let last=-1;
    function composite(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      if(!img.complete||!img.naturalWidth)return;
      ctx.save();ctx.drawImage(img,0,0,canvas.width,canvas.height);
      ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0,canvas.width,canvas.height);ctx.restore();
    }
    if(!img.complete)img.addEventListener('load',()=>{if(last>=0)composite();},{once:true});
    return {duration:paint.duration,render(elapsed){last=elapsed;const done=paint.render(elapsed);composite();return done;}};
  }
  // Public/Local shells are separate from Core's internal cover and ending.
  function bindShellDrawing(page, getLayer, key){
    if(!page)return;
    let state=null;
    function clear(){if(state){cancelAnimationFrame(state.frame);state.canvas.remove();state=null;}}
    function sync(){
      const layer=getLayer();
      if(page.hidden||page.classList.contains('is-shop-entry')||!hasInk(layer)){clear();return;}
      const signature=JSON.stringify(layer);
      if(state?.signature===signature&&state.canvas.isConnected)return;
      clear();
      const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','手書きレイヤー');
      Object.assign(canvas.style,{position:'absolute',pointerEvents:'none',left:number(layer.x,50,0,100)+'%',top:number(layer.y,50,0,100)+'%',width:number(layer.width,70,1,600)+'%',height:'auto',aspectRatio:'5 / 3',transform:'translate(-50%, -50%) rotate('+number(layer.angle,0,-180,180)+'deg) scaleY('+number(layer.height,100,10,300)/100+')',opacity:String(number(layer.opacity,1,0,1)),zIndex:layer.order==='behind'?'1':'4'});
      const anchor=page.querySelector(key==='cover'?'.public-intro-frame':'.public-ending-inner');
      if(layer.order==='behind'&&anchor){anchor.style.position='relative';anchor.style.zIndex='2';anchor.before(canvas);}else page.append(canvas);
      const paint=painter(canvas,layer),start=performance.now();
      const current=state={canvas,signature,frame:0};
      function frame(now){if(state!==current)return;if(page.hidden){clear();return;}if(!paint.render(now-start))current.frame=requestAnimationFrame(frame);}
      frame(start);
    }
    const observer=new MutationObserver(sync);observer.observe(page,{attributes:true,attributeFilter:['hidden','class']});
    sync();return sync;
  }
  window.AhakoDraw = {painter,bindShellDrawing};
  const P=window.ScenePlayerCore?.prototype;
  if (!P) return;
  // Ink belongs to the Scene article, so its transform, age and exit follow text.
  function attachInk(core,node,layer,active,history=false){
    const wrap=document.createElement('span');wrap.className='sp-ink-sheet';
    const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','手書きレイヤー');
    const width=number(layer.width,70,1,600),height=number(layer.height,100,10,300)/100;
    const stageWidth=core.els.stage.clientWidth||W;
    Object.assign(wrap.style,{display:'block',position:'relative',width:'100%',height:history?'auto':Math.max(1,stageWidth*width/100*.6*height)+'px',aspectRatio:history?'5 / 3':'auto',pointerEvents:'none'});
    Object.assign(canvas.style,{display:'block',position:'absolute',pointerEvents:'none',left:number(layer.x,50,0,100)+'%',top:number(layer.y,50,0,100)+'%',width:history?width+'%':stageWidth*width/100+'px',height:'auto',aspectRatio:'5 / 3',transform:'translate(-50%, -50%) rotate('+number(layer.angle,0,-180,180)+'deg) scaleY('+height+')',opacity:String(number(layer.opacity,1,0,1))});
    wrap.append(canvas);
    if(layer.order==='behind')node.prepend(wrap);else node.append(wrap);
    const entry={canvas,layer,active,paint:null};
    wrap._inkEntry=entry;
    return entry;
  }
  function paintEntry(entry,complete){
    if(!entry.paint)entry.paint=painter(entry.canvas,entry.layer);
    if(complete)entry.paint.render(Infinity);
    return entry;
  }
  const sceneNode=P._sceneNode;
  P._sceneNode=function(scene,active,age){
    const node=sceneNode.apply(this,arguments),layer=scene.presentation?.draw;
    if(hasInk(layer))attachInk(this,node,layer,active&&!this._simultaneousHistoryBuilding);
    return node;
  };
  const measure=P._measureSceneGeometry;
  P._measureSceneGeometry=function(node,stageRect){
    const result=measure.apply(this,arguments),sheet=node.querySelector(':scope > .sp-ink-sheet');
    if(!sheet)return result;
    const rect=this._logicalRect(sheet.getBoundingClientRect()),base=this._logicalRect(node.getBoundingClientRect());
    const canvas=sheet.querySelector('canvas'),ink=this._logicalRect(canvas.getBoundingClientRect());
    result.inkLeft=Math.min(result.inkLeft,ink.left-base.left);result.inkRight=Math.max(result.inkRight,ink.right-base.left);
    result.inkTop=Math.min(result.inkTop,rect.top-base.top,ink.top-base.top);result.inkBottom=Math.max(result.inkBottom,rect.bottom-base.top,ink.bottom-base.top);
    result.inkCenterX=(result.inkLeft+result.inkRight)/2;result.inkCenterY=(result.inkTop+result.inkBottom)/2;
    if(this._simultaneousHistoryBuilding||node.closest('.sp-history-item'))paintEntry(sheet._inkEntry,true);
    return result;
  };
  function clear(core) {
    const state=core._ink;
    if (!state) return;
    cancelAnimationFrame(state.frame);
    core.host.removeEventListener('sceneplayer:advanceintent',state.guard,true);
    for(const item of state.items){item.reader?.dispose();item.paint.render(Infinity);}
    core._ink=null;
  }
  function mount(core) {
    const items=[];
    for(const node of core.els.scenes.querySelectorAll('.sp-scene')){
      const entry=node.querySelector(':scope > .sp-ink-sheet')?._inkEntry;
      if(!entry)continue;
      const active=node.classList.contains('is-active');
      if(!active){paintEntry(entry,true);continue;}
      if(entry.paint)continue;
      items.push(paintEntry(entry,false));
    }
    if(!items.length)return;
    const state=core._ink={items,busy:true,frame:0};
    state.guard=event=>{if(state.busy)event.stopImmediatePropagation();};
    core.host.addEventListener('sceneplayer:advanceintent',state.guard,true);
    const start=performance.now();
    core._clearAutoTimer();
    for(const item of items)if(readerMode(item.layer))item.reader=readerScratch(item.canvas,item.layer,()=>{if(core._ink===state&&state.busy&&!state.frame)state.frame=requestAnimationFrame(frame);});
    function frame(now){
      if(core._ink!==state)return;
      state.frame=0;let done=true,animating=false;
      for(const item of items){if(item.reader){if(!item.reader.done)done=false;}else if(!item.paint.render(now-start)){done=false;animating=true;}}
      if(done)complete(core);
      else if(animating)state.frame=requestAnimationFrame(frame);
    }
    frame(start);
  }
  function complete(core){
    core._ink.busy=false;
    cancelAnimationFrame(core._ink.frame);core._ink.frame=0;
    // Absolute REC cues also need room for this Scene's authored pause.
    const group=core._simultaneousBounds(core.index);
    const nextCue=core.document.scenes[group.end+1]?.cueAt;
    if(core.auto && Number.isFinite(nextCue)){
      const pause=Math.max(...core.document.scenes.slice(group.start,group.end+1)
        .map(s=>number(s.pause,core.options.autoDelay,0,60000)));
      core.playbackTimelineStartedAt=Math.max(core.playbackTimelineStartedAt,performance.now()+pause-nextCue);
    }
    core._scheduleAuto();
  }
  const render=P._render;
  P._render=function(){
    clear(this);
    const cover=this._audioRenderMode==='cover';
    const result=render.apply(this,arguments);
    if(this.document && !cover && !this.ended && !this.historyOpen)mount(this);
    return result;
  };
  const next=P.next;
  P.next=function(){
    if(this._ink?.busy){
      if(this._ink.items.some(item=>item.reader&&!item.reader.done&&!item.layer.readerScratch.allowSkip))return false;
      cancelAnimationFrame(this._ink.frame);
      for(const item of this._ink.items){if(item.reader)item.reader.finish(false);else item.paint.render(Infinity);}
      complete(this);
      return true;
    }
    return next.apply(this,arguments);
  };
  const schedule=P._scheduleAuto;
  P._scheduleAuto=function(){
    if(this._ink?.busy){this._clearAutoTimer();return;}
    return schedule.apply(this,arguments);
  };
  const endingSound=P._playEndingAudio;
  P._playEndingAudio=function(){if(!this._ink?.busy)return endingSound.apply(this,arguments);};
  // Shell drawings have their own lifecycle: never block Scene navigation or AUTO.
  function clearPage(core,key){
    const state=core._pageInk?.[key];if(!state)return;
    cancelAnimationFrame(state.frame);state.canvas.remove();delete core._pageInk[key];
  }
  P.refreshPageDrawing=function(key,replay=false){
    const page=this.els?.[key],layer=this.document?.[key]?.draw;
    if(!page||page.hidden||!hasInk(layer)){clearPage(this,key);return;}
    this._pageInk ||= {};
    const signature=JSON.stringify(layer),old=this._pageInk[key];
    if(!replay&&old?.signature===signature&&old.canvas.isConnected)return;
    clearPage(this,key);
    const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','手書きレイヤー');
    Object.assign(canvas.style,{position:'absolute',pointerEvents:'none',left:number(layer.x,50,0,100)+'%',top:number(layer.y,50,0,100)+'%',width:number(layer.width,70,1,600)+'%',height:'auto',aspectRatio:'5 / 3',transform:'translate(-50%, -50%) rotate('+number(layer.angle,0,-180,180)+'deg) scaleY('+number(layer.height,100,10,300)/100+')',opacity:String(number(layer.opacity,1,0,1)),zIndex:layer.order==='behind'?'1':'4'});
    const anchor=page.querySelector(key==='cover'?'.sp-cover-copy':'.sp-ending-copy');
    if(layer.order==='behind'&&anchor)anchor.before(canvas);else page.append(canvas);
    const paint=painter(canvas,layer),start=performance.now();
    const state=this._pageInk[key]={canvas,signature,frame:0};
    const frame=now=>{if(this._pageInk?.[key]!==state)return;if(page.hidden){clearPage(this,key);return;}if(!paint.render(now-start))state.frame=requestAnimationFrame(frame);};
    frame(start);
  };
  const chrome=P.refreshDocumentChrome;
  P.refreshDocumentChrome=function(){const r=chrome.apply(this,arguments);for(const key of ['cover','ending'])this.refreshPageDrawing(key);return r;};
  for(const name of ['finish','destroy','showCover']){
    const original=P[name];
    P[name]=function(){
      if(name==='finish'&&this.ended)return original.apply(this,arguments);
      clear(this);for(const key of ['cover','ending'])clearPage(this,key);
      const result=original.apply(this,arguments);
      if(name==='showCover'){clear(this);this.refreshPageDrawing('cover',true);}
      if(name==='finish')this.refreshPageDrawing('ending',true);
      return result;
    };
  }
  const begin=P._beginFromCover;
  P._beginFromCover=function(){const r=begin.apply(this,arguments);clearPage(this,'cover');return r;};
  const renderHistory=P._renderHistory;
  P._renderHistory=function(){
    const result=renderHistory.apply(this,arguments);
    for(const item of this.els.historyList.querySelectorAll('.sp-history-item')){
      const layer=this.document.scenes[Number(item.dataset.index)]?.presentation?.draw;
      const body=item.querySelector('.sp-history-body');
      if(!body||!hasInk(layer)||body.querySelector('.sp-ink-sheet'))continue;
      paintEntry(attachInk(this,body,layer,false,true),true);
    }
    return result;
  };
  const history=P.openHistory, close=P.closeHistory;
  P.openHistory=function(){const r=history.apply(this,arguments);if(this.historyOpen)clear(this);return r;};
  P.closeHistory=function(options){const open=this.historyOpen;const r=close.apply(this,arguments);
    if(open&&!this.historyOpen&&!options?.keepVisualState&&!this._ink&&!this.ended)mount(this);return r;};
})();
