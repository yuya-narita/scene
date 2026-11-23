// Editable ink uses a 1000 × 600 logical sheet. Times are in milliseconds.
(() => {
  'use strict';
  const W = 1000, H = 600;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const number = (n, fallback, min, max) => Number.isFinite(n) ? clamp(n, min, max) : fallback;
  function prepare(layer) {
    const marks = [];
    let lastTime = 0;
    for (const stroke of (Array.isArray(layer.strokes) ? layer.strokes : []).slice(0, 100)) {
      if (!Array.isArray(stroke?.points)) continue;
      let previous;
      const points = stroke.points;
      for (let i = 0; i < points.length && marks.length < 5000; i++) {
        const point = points[i];
        if (!Array.isArray(point) || !point.slice(0,3).every(Number.isFinite) || point.length < 3) continue;
        const time = Math.max(lastTime, clamp(point[2], 0, 30000));
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
        marks.push({from,x,y,time,width:width*factor,color:/^#[0-9a-f]{6}$/i.test(stroke.color)?stroke.color:'#171717',
          pen:stroke.pen,alpha:number(stroke.opacity,1,0,1)*(stroke.pen==='marker'?.38:1),first:!previous});
        previous = {x,y,time};
        lastTime = time;
      }
    }
    return {marks,lastTime};
  }
  function painter(canvas, layer) {
    const ctx = canvas.getContext('2d');
    const {marks,lastTime} = prepare(layer);
    const duration = layer.display==='still' ? 0 : layer.seconds>0 ?
      number(layer.seconds,5,.1,300)*1000 : lastTime/number(layer.rate,1,.5,3);
    const delay = number(layer.delay,0,0,60)*1000;
    const pixels = Math.min(2, Math.max(.5, (canvas.clientWidth || W) * (window.devicePixelRatio || 1) / W));
    canvas.width = Math.round(W*pixels); canvas.height = Math.round(H*pixels);
    ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
    let cursor = 0, fraction = 0;
    function render(elapsed) {
      if (elapsed < delay) return false;
      const t = elapsed === Infinity ? Infinity : duration ? (elapsed-delay)*lastTime/duration : Infinity;
      while (cursor < marks.length) {
        const m = marks[cursor];
        if(t<m.from.time)break;
        const end = t>=m.time ? 1 : (t-m.from.time)/(m.time-m.from.time);
        if(end<=fraction)break;
        const dx=m.x-m.from.x, dy=m.y-m.from.y;
        const x=m.from.x+dx*end, y=m.from.y+dy*end;
        ctx.strokeStyle = ctx.fillStyle = m.color;
        ctx.lineWidth = m.width; ctx.lineCap = 'round'; ctx.globalAlpha = m.alpha;
        if (m.first) {
          ctx.beginPath(); ctx.arc(m.x,m.y,m.width/2,0,2*Math.PI); ctx.fill();
        } else {
          ctx.beginPath(); ctx.moveTo(m.from.x+dx*fraction,m.from.y+dy*fraction); ctx.lineTo(x,y); ctx.stroke();
        }
        if (m.pen==='crayon' && end===1) {
          for(let j=1;j<=6;j++){
            const a=cursor*31+j*17, r=m.width*(.25+.09*j);
            ctx.fillRect(m.x+Math.cos(a)*r,m.y+Math.sin(a)*r,1.2,1.2);
          }
        }
        if(end<1){fraction=end;break;}
        cursor++;fraction=0;
      }
      return elapsed>=delay+duration;
    }
    return {render, duration:delay+duration};
  }
  window.AhakoDraw = {painter};
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
  for(const name of ['finish','destroy','showCover']){
    const original=P[name];
    P[name]=function(){clear(this);const result=original.apply(this,arguments);if(name==='showCover')clear(this);return result;};
  }
  const history=P.openHistory, close=P.closeHistory;
  P.openHistory=function(){const r=history.apply(this,arguments);if(this.historyOpen)clear(this);return r;};
  P.closeHistory=function(options){const open=this.historyOpen;const r=close.apply(this,arguments);
    if(open&&!this.historyOpen&&!options?.keepVisualState&&!this._ink&&!this.ended)mount(this);return r;};
})();
