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
  function painter(canvas, layer) {
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
  // Public/Local shells are separate from Core's internal cover and ending.
  function bindShellDrawing(page, getLayer, key){
    if(!page)return;
    let state=null;
    function clear(){if(state){cancelAnimationFrame(state.frame);state.canvas.remove();state=null;}}
    function sync(){
      const layer=getLayer();
      if(page.hidden||page.classList.contains('is-shop-entry')||!layer?.strokes?.length){clear();return;}
      const signature=JSON.stringify(layer);
      if(state?.signature===signature&&state.canvas.isConnected)return;
      clear();
      const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','手書きレイヤー');
      Object.assign(canvas.style,{position:'absolute',pointerEvents:'none',left:number(layer.x,50,0,100)+'%',top:number(layer.y,50,0,100)+'%',width:number(layer.width,70,1,200)+'%',height:'auto',aspectRatio:'5 / 3',transform:'translate(-50%, -50%) rotate('+number(layer.angle,0,-180,180)+'deg) scaleY('+number(layer.height,100,10,300)/100+')',opacity:String(number(layer.opacity,1,0,1)),zIndex:layer.order==='behind'?'1':'4'});
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
  function clear(core) {
    const state=core._ink;
    if (!state) return;
    cancelAnimationFrame(state.frame);
    core.host.removeEventListener('sceneplayer:advanceintent',state.guard,true);
    for(const item of state.items)item.canvas.remove();
    core._ink=null;
  }
  function mount(core) {
    const group=core._simultaneousBounds?.(core.index) || {start:core.index,end:core.index};
    const items=[];
    for(let i=group.start;i<=group.end;i++){
      const layer=core.document.scenes[i]?.presentation?.draw;
      if (!layer?.strokes?.length) continue;
      const canvas=document.createElement('canvas');
      canvas.setAttribute('aria-label','手書きレイヤー');
      const width=number(layer.width,70,1,200);
      Object.assign(canvas.style,{position:'absolute',pointerEvents:'none',left:number(layer.x,50,0,100)+'%',
        top:number(layer.y,50,0,100)+'%',width:width+'%',height:'auto',aspectRatio:'5 / 3',
        transform:'translate(-50%, -50%) rotate('+number(layer.angle,0,-180,180)+'deg) scaleY('+number(layer.height,100,10,300)/100+')',
        opacity:String(number(layer.opacity,1,0,1))});
      const scenes=core.els.scenes;
      if(layer.order==='behind') scenes.before(canvas); else scenes.after(canvas);
      items.push({canvas,paint:painter(canvas,layer)});
    }
    if(!items.length)return;
    const state=core._ink={items,busy:true,frame:0};
    state.guard=event=>{if(state.busy)event.stopImmediatePropagation();};
    core.host.addEventListener('sceneplayer:advanceintent',state.guard,true);
    const start=performance.now();
    core._clearAutoTimer();
    function frame(now){
      if(core._ink!==state)return;
      let done=true;
      for(const item of items)if(!item.paint.render(now-start))done=false;
      if(done)complete(core);
      else state.frame=requestAnimationFrame(frame);
    }
    frame(start);
  }
  function complete(core){
    core._ink.busy=false;
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
      cancelAnimationFrame(this._ink.frame);
      for(const item of this._ink.items)item.paint.render(Infinity);
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
    if(!page||page.hidden||!layer?.strokes?.length){clearPage(this,key);return;}
    this._pageInk ||= {};
    const signature=JSON.stringify(layer),old=this._pageInk[key];
    if(!replay&&old?.signature===signature&&old.canvas.isConnected)return;
    clearPage(this,key);
    const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','手書きレイヤー');
    Object.assign(canvas.style,{position:'absolute',pointerEvents:'none',left:number(layer.x,50,0,100)+'%',top:number(layer.y,50,0,100)+'%',width:number(layer.width,70,1,200)+'%',height:'auto',aspectRatio:'5 / 3',transform:'translate(-50%, -50%) rotate('+number(layer.angle,0,-180,180)+'deg) scaleY('+number(layer.height,100,10,300)/100+')',opacity:String(number(layer.opacity,1,0,1)),zIndex:layer.order==='behind'?'1':'4'});
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
  const history=P.openHistory, close=P.closeHistory;
  P.openHistory=function(){const r=history.apply(this,arguments);if(this.historyOpen)clear(this);return r;};
  P.closeHistory=function(options){const open=this.historyOpen;const r=close.apply(this,arguments);
    if(open&&!this.historyOpen&&!options?.keepVisualState&&!this._ink&&!this.ended)mount(this);return r;};
})();
