/* PaperTree — dependency-free, deterministic Canvas 2D illustration.
   The tree is an aggregate visualization. It does not depict RELAY topology. */
(function(global){
'use strict';
const PALETTES={fantasy:['#d9b932','#edca43','#87a63d','#c2cc59','#477b45'],romance:['#cf4d7b','#e76b93','#ed9eb5','#b83768','#f2b9c8'],horror:['#553c70','#755377','#9a5c79','#363d65','#b28ba2'],sf:['#1a739d','#3098b8','#65bcc4','#28558b','#8acdd0'],daily:['#ed8e33','#efa54d','#f4c663','#d77730','#f5d393'],essay:['#cfad66','#e6cf91','#bea673','#e9dcb9','#d5ba7e'],mystery:['#435c94','#6c7dad','#8a9ac5','#374c74','#b1bbd1'],other:['#c9a39e','#a3b1a6','#d8c5ae','#b7b4c5','#d8d5c5']};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash(s){let n=2166136261;for(const c of String(s))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0}
function curve(p,t){const q=1-t;return{x:q*q*q*p[0]+3*q*q*t*p[2]+3*q*t*t*p[4]+t*t*t*p[6],y:q*q*q*p[1]+3*q*q*t*p[3]+3*q*t*t*p[5]+t*t*t*p[7]}}
function lerp(a,b,t){return a+(b-a)*t} function clamp(n,a,b){return Math.min(b,Math.max(a,n))}
// Per-genre floor preserves color; per-work floor preserves smaller stories.
function visualShares(works){
 const active=works.filter(w=>Number.isFinite(Number(w.readingStarts))&&Number(w.readingStarts)>0),groups=new Map();
 for(const w of active){const genre=PALETTES[w.genre]?w.genre:'other';if(!groups.has(genre))groups.set(genre,[]);groups.get(genre).push(w)}
 const totalGenreWeight=Array.from(groups.values()).reduce((sum,items)=>sum+Math.sqrt(items.reduce((n,w)=>n+Number(w.readingStarts),0)),0);
 const result=[];
 for(const [genre,items] of groups){const genreStarts=items.reduce((n,w)=>n+Number(w.readingStarts),0),genreShare=.4/groups.size+.6*Math.sqrt(genreStarts)/totalGenreWeight;const totalWorkWeight=items.reduce((n,w)=>n+Math.sqrt(Number(w.readingStarts)),0);
 for(const w of items)result.push({id:w.id,genre,share:genreShare*(.25/items.length+.75*Math.sqrt(Number(w.readingStarts))/totalWorkWeight),genreShare});}
 return result;
}
function allocate(total,weights){
 if(!weights.length)return[];const sum=weights.reduce((a,b)=>a+b,0);if(!sum)return weights.map(()=>0);
 const minimum=total>=weights.length?1:0,remaining=total-minimum*weights.length;
 const exact=weights.map(w=>remaining*w/sum),out=exact.map(n=>Math.floor(n)+minimum);let rest=total-out.reduce((a,b)=>a+b,0);
 const order=exact.map((n,i)=>({i,f:n-Math.floor(n)})).sort((a,b)=>b.f-a.f||a.i-b.i);
 for(let i=0;i<rest;i++)out[order[i].i]++;return out;
}
class PaperTree{
constructor(canvas,options={}){
 this.canvas=canvas;this.ctx=canvas.getContext('2d');this.options=options;this.seed=options.seed||'ahako-author';this.progress=1;this.selected=null;this.genre=null;this.zoom=1;this.pan={x:0,y:0};this.listeners=[];this.branches=[];this.papers=[];this.hits=[];this.cacheDirty=true;this.layers=null;this.cacheBuilds=0;this.frames=0;this.vectorPapers=0;this.lastBuildMs=0;this.lastFrameMs=0;
 this.buildWood();this.setData({works:[]});this.resizeObs=new ResizeObserver(()=>this.resize());this.resizeObs.observe(canvas);
 this.listen(canvas,'pointerdown',e=>this.down(e));this.listen(canvas,'pointermove',e=>this.move(e));this.listen(canvas,'pointerup',e=>this.up(e));this.listen(canvas,'pointercancel',()=>this.drag=null);
 this.listen(canvas,'keydown',e=>{if(e.key==='Escape'){this.selectWork(null);this.options.onSelect?.(null)}});
}
listen(target,name,fn){target.addEventListener(name,fn);this.listeners.push([target,name,fn])}
buildWood(){const r=rng(hash(this.seed));this.branches=[];this.clouds=[];const add=(p,w,end,birth=0)=>this.branches.push({p,w,end,birth});add([503,838,478,760,541,689,494,574],35,19,0);add([494,574,481,516,505,447,473,350],20,7,.07);add([473,350,458,276,504,205,489,142],8,1.1,.18);
const anchors=[{x:193,y:493,bx:498,by:656},{x:159,y:348,bx:493,by:566},{x:233,y:225,bx:484,by:455},{x:359,y:176,bx:480,by:355},{x:490,y:142,bx:478,by:298},{x:632,y:174,bx:484,by:389},{x:766,y:250,bx:491,by:474},{x:840,y:372,bx:499,by:554},{x:773,y:498,bx:505,by:643}];
const trunk=this.branches.slice(0,3);const trunkX=y=>{const b=trunk.find(b=>y<=b.p[1]&&y>=b.p[7])||trunk[0];let lo=0,hi=1;for(let j=0;j<25;j++){const t=(lo+hi)/2;if(curve(b.p,t).y>y)lo=t;else hi=t}return curve(b.p,(lo+hi)/2).x};anchors.forEach((a,i)=>{a.bx=trunkX(a.by);const dx=a.x-a.bx,dy=a.y-a.by;add([a.bx,a.by,a.bx+dx*.53,a.by-15,a.x-dx*.18,a.y+45,a.x,a.y],13-i%3*1.3,1.4,.08+i%3*.025);for(let j=0;j<4;j++){const theta=-Math.PI*.9+r()*Math.PI*.8+(i>4?Math.PI*.5:0);const ex=a.x+Math.cos(theta)*(30+r()*62),ey=a.y+Math.sin(theta)*(40+r()*46);add([a.x,a.y,a.x+(ex-a.x)*.28,a.y-18,ex,ey+24,ex,ey],3.3,0.65,.26+r()*.1);this.clouds.push({x:ex,y:ey,rx:35+r()*27,ry:31+r()*26,side:i/8})}});
// Three tapered buttress roots connect into the trunk, not hairline spokes.
add([503,834,490,848,471,849,452,854],14,.7,0);
add([504,834,520,847,540,847,560,854],12,.7,0);
add([503,838,503,848,492,851,484,857],8,.5,0);
}
setData(data){this.data=data||{};this.works=(data.works||[]).map(w=>({...w,genre:PALETTES[w.genre]?w.genre:'other',readingStarts:Number.isFinite(Number(w.readingStarts))?Math.max(0,Number(w.readingStarts)):0,fullCompletions:Number.isFinite(Number(w.fullCompletions))?Math.max(0,Number(w.fullCompletions)):0}));const total=this.works.reduce((s,w)=>s+w.readingStarts,0);this.progress=total?clamp(Math.log1p(total)/Math.log1p(1800),.18,1):.08;this.makePapers();this.invalidate();this.draw();return this}
makePapers(){this.papers=[];const active=this.works.filter(w=>w.readingStarts>0);if(!active.length)return;const total=active.reduce((s,w)=>s+w.readingStarts,0);const count=Math.min(2800,Math.round(150+Math.log1p(total)*295));const shares=visualShares(active),genres=Array.from(new Set(shares.map(s=>s.genre)));const genreCounts=allocate(count,genres.map(g=>shares.find(s=>s.genre===g).genreShare)),counts=new Map();genres.forEach((g,i)=>{const items=shares.filter(s=>s.genre===g);allocate(genreCounts[i],items.map(s=>s.share)).forEach((n,j)=>counts.set(items[j].id,n))});const zones={fantasy:[430,230,180,138],romance:[260,438,135,150],daily:[265,290,150,140],sf:[697,324,150,160],horror:[680,476,150,125],essay:[472,360,155,150],mystery:[722,443,145,150],other:[500,340,225,170]};let serial=0;for(const w of active){const r=rng(hash(this.seed+'paper:'+w.id));const n=counts.get(w.id)||0;const wr=rng(hash(w.id));const preferred=wr();for(let i=0;i<n;i++){const palette=PALETTES[w.genre],z=zones[w.genre];let x,y;for(let attempt=0;attempt<25;attempt++){const angle=r()*Math.PI*2,rad=Math.sqrt(r());if(active.length===1||r()<.12+Math.pow(shares.find(s=>s.id===w.id).share,3)*.75){x=500+Math.cos(angle)*rad*340;y=350+Math.sin(angle)*rad*245}else{x=z[0]+Math.cos(angle)*rad*z[2];y=z[1]+Math.sin(angle)*rad*z[3]}if(((x-500)/352)**2+((y-340)/264)**2<1.03)break}const scatter=r()<.055;if(scatter){x+=(r()-.5)*110;y+=(r()-.5)*110}const side=clamp((x-140)/720,0,1),color=palette[Math.floor((side*.3+r()*.7)*palette.length)%palette.length];this.papers.push({id:serial++,workId:w.id,genre:w.genre,x,y,angle:(r()-.5)*2.9,w:8+r()*13,h:11+r()*17,color,fold:2+r()*4,phase:r()*6.28,order:r(),text:r()>.6,foreground:r()>.25,brightness:r(),pick:preferred})}}this.papers.sort((a,b)=>a.y-b.y);}

resize(){const box=this.canvas.getBoundingClientRect();if(!box.width||!box.height)return;const dpr=Math.min(devicePixelRatio||1,1.25);this.canvas.width=Math.round(box.width*dpr);this.canvas.height=Math.round(box.height*dpr);this.dpr=dpr;this.draw()}
setProgress(v){this.progress=clamp(Number(v)||0,0,1);this.invalidate();this.draw();return this}
selectWork(id){this.selected=id;this.genre=null;this.invalidate();this.draw();return this}
selectGenre(id){this.genre=id;this.selected=null;this.invalidate();this.draw();return this}
setZoom(v){this.zoom=clamp(v,.8,1.8);this.draw();return this}
resetView(){this.zoom=1;this.pan={x:0,y:0};this.draw()}

toWorld(e){const box=this.canvas.getBoundingClientRect();const x=(e.clientX-box.left)*this.dpr,y=(e.clientY-box.top)*this.dpr;return{x:(x-this.tx)/this.scale,y:(y-this.ty)/this.scale}}
down(e){this.drag={x:e.clientX,y:e.clientY,px:this.pan.x,py:this.pan.y,moved:false};this.canvas.setPointerCapture(e.pointerId)}
move(e){if(this.drag){const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;if(Math.abs(dx)+Math.abs(dy)>7)this.drag.moved=true;if(this.zoom>1.01&&this.drag.moved){this.pan={x:this.drag.px+dx*this.dpr,y:this.drag.py+dy*this.dpr};this.draw()}}else{const p=this.toWorld(e);this.canvas.style.cursor=this.find(p)?'pointer':this.zoom>1?'grab':'default'}}
find(p){for(let i=this.hits.length-1;i>=0;i--){const h=this.hits[i];if(Math.abs(h.x-p.x)<h.radius&&Math.abs(h.y-p.y)<h.radius)return h}return null}
up(e){if(!this.drag)return;const moved=this.drag.moved;this.drag=null;if(!moved){const p=this.toWorld(e),hit=this.find(p);if(hit){this.selectWork(hit.workId);this.options.onSelect?.(hit.workId)}}}
wood(b){const c=this.ctx;const t=1;let pts=[];for(let i=0;i<=26;i++){const k=i/26*t,p=curve(b.p,k),q=1-k,dx=3*q*q*(b.p[2]-b.p[0])+6*q*k*(b.p[4]-b.p[2])+3*k*k*(b.p[6]-b.p[4]),dy=3*q*q*(b.p[3]-b.p[1])+6*q*k*(b.p[5]-b.p[3])+3*k*k*(b.p[7]-b.p[5]),len=Math.hypot(dx,dy)||1;const width=lerp(b.w,b.end,k)*(.8+.2*this.progress);pts.push({x:p.x,y:p.y,nx:-dy/len*width/2,ny:dx/len*width/2})}c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x+p.nx,p.y+p.ny):c.moveTo(p.x+p.nx,p.y+p.ny));pts.reverse().forEach(p=>c.lineTo(p.x-p.nx,p.y-p.ny));c.closePath();const grad=c.createLinearGradient(b.p[0]-20,b.p[1],b.p[0]+20,b.p[1]);grad.addColorStop(0,'#1e2528');grad.addColorStop(.45,'#363e40');grad.addColorStop(.7,'#525558');grad.addColorStop(1,'#242b2d');c.fillStyle=grad;c.fill();for(const [point,width] of [[pts[pts.length-1],b.w],[pts[0],b.end]]){c.beginPath();c.arc(point.x,point.y,width*(.8+.2*this.progress)/2,0,Math.PI*2);c.fill()}if(b.w>10){c.beginPath();pts.reverse().forEach((p,i)=>i?c.lineTo(p.x-p.nx*.3,p.y-p.ny*.3):c.moveTo(p.x,p.y));c.strokeStyle='#b0b4a942';c.lineWidth=.8;c.stroke()}}
paper(p,highlight){this.vectorPapers++;const c=this.ctx;const sway=0;const x=p.x+sway,y=p.y+0;c.save();c.translate(x,y);c.rotate(p.angle);const w=p.w,h=p.h;c.globalAlpha=highlight?1:.11;c.beginPath();c.moveTo(-w*.48,-h*.48);c.quadraticCurveTo(0,-h*.58,w*.46,-h*.4);c.lineTo(w*.49,h*.35);c.quadraticCurveTo(0,h*.62,-w*.46,h*.43);c.closePath();c.fillStyle=p.color;c.fill();c.shadowColor='transparent';const g=c.createLinearGradient(-w/2,0,w/2,0);g.addColorStop(0,'#ffffff48');g.addColorStop(.3,'#ffffff05');g.addColorStop(.78,'#00000009');g.addColorStop(1,'#ffffff50');c.fillStyle=g;c.fill();c.strokeStyle='#ffffff50';c.lineWidth=.6;c.stroke();c.beginPath();c.moveTo(w*.46,-h*.4);c.lineTo(w*.46-p.fold,-h*.4+p.fold);c.lineTo(w*.46-p.fold,-h*.4);c.closePath();c.fillStyle='#fff9';c.fill();if(p.text){c.strokeStyle='#ffffff66';c.lineWidth=.6;for(let j=0;j<3;j++){c.beginPath();c.moveTo(-w*.28,-h*.17+j*2.8);c.lineTo(w*.23,-h*.17+j*2.8);c.stroke()}}c.restore();if(highlight)this.hits.push({x,y,radius:Math.max(w,h)*.7+3,workId:p.workId})}
invalidate(){this.cacheDirty=true}
buildCache(){
 const started=performance.now();const realCtx=this.ctx;
 if(!this.layers){this.layers=Array.from({length:3},()=>{const layer=document.createElement('canvas');layer.width=1000;layer.height=945;return layer})}
 this.hits=[];const visible=this.papers.filter(p=>p.order<Math.pow(clamp((this.progress-.12)/.88,0,1),1.08));
 const match=p=>(!this.selected||p.workId===this.selected)&&(!this.genre||p.genre===this.genre);
 this.layers.forEach(layer=>layer.getContext('2d').clearRect(0,0,1000,945));
 this.ctx=this.layers[0].getContext('2d');visible.filter(p=>!p.foreground).forEach(p=>this.paper(p,match(p)));
 this.ctx=this.layers[1].getContext('2d');const c=this.ctx;
 const ground=c.createRadialGradient(503,855,2,503,855,150);ground.addColorStop(0,'#9eaa9225');ground.addColorStop(1,'#ffffff00');c.fillStyle=ground;c.beginPath();c.ellipse(503,855,150,12,0,0,Math.PI*2);c.fill();
 this.branches.slice(-3).forEach(b=>this.wood(b));this.branches.slice(0,-3).forEach(b=>this.wood(b));
 this.ctx=this.layers[2].getContext('2d');visible.filter(p=>p.foreground).forEach(p=>this.paper(p,match(p)));
 this.ctx=realCtx;this.cacheDirty=false;this.cacheBuilds++;this.lastBuildMs=performance.now()-started;
}
draw(){
 const c=this.ctx;if(!c||!this.canvas.width)return;
 if(this.cacheDirty||!this.layers)this.buildCache();const started=performance.now();const W=this.canvas.width,H=this.canvas.height;c.clearRect(0,0,W,H);
 const s=Math.min(W/1000,H/945)*this.zoom,grow=.12+.88*this.progress;this.scale=s*grow;this.tx=(W-1000*s)/2+this.pan.x+500*s*(1-grow);this.ty=(H-945*s)/2+this.pan.y+855*s*(1-grow);
 c.save();c.translate(this.tx,this.ty);c.scale(this.scale,this.scale);
 // Static cached layers: no background animation or idle rendering loop.
 for(const layer of this.layers)c.drawImage(layer,0,0);c.restore();this.frames++;this.lastFrameMs=performance.now()-started;if(this.options.diagnostics)this.canvas.dataset.renderStats=JSON.stringify(this.getState());
}

getState(){return{works:this.works.length,paperCount:this.papers.length,progress:this.progress,selected:this.selected,genre:this.genre,cacheBuilds:this.cacheBuilds,frames:this.frames,vectorPapers:this.vectorPapers,lastBuildMs:Math.round(this.lastBuildMs*100)/100,lastFrameMs:Math.round(this.lastFrameMs*100)/100}}
destroy(){this.resizeObs.disconnect();this.listeners.forEach(([t,n,f])=>t.removeEventListener(n,f));this.layers?.forEach(layer=>{layer.width=1;layer.height=1});this.layers=null}
}
PaperTree.palettes=PALETTES;PaperTree.visualShares=visualShares;global.PaperTree=PaperTree;
})(window);
