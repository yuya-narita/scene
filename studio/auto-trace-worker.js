'use strict';
// Phase 1: dark line art on light background, Zhang-Suen thinning.
self.onmessage=({data:{rgba,w,h,threshold,mode="natural"}})=>{
 try {
 const a=new Uint8Array(w*h), n=a.length;
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x,k=i*4; const alpha=rgba[k+3]/255; a[i]=((.299*rgba[k]+.587*rgba[k+1]+.114*rgba[k+2])*alpha+255*(1-alpha)<threshold)?1:0;}
 const original=a.slice();
 // Chamfer distance to background, in source pixels.
 const dist=new Float32Array(n);for(let i=0;i<n;i++)dist[i]=original[i]?1e6:0;
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;if(original[i])dist[i]=Math.min(dist[i],dist[i-1]+1,dist[i-w]+1,dist[i-w-1]+1.414,dist[i-w+1]+1.414);}
 for(let y=h-2;y>0;y--)for(let x=w-2;x>0;x--){const i=y*w+x;if(original[i])dist[i]=Math.min(dist[i],dist[i+1]+1,dist[i+w]+1,dist[i+w-1]+1.414,dist[i+w+1]+1.414);}
 const offsets=[-w,1-w,1,1+w,w,w-1,-1,-w-1];
 let changed=true, rounds=0;
 while(changed&&rounds++<100){changed=false;for(let pass=0;pass<2;pass++){const del=[];for(let i=w+1;i<n-w-1;i++){if(!a[i])continue;const p=offsets.map(d=>a[i+d]);const sum=p.reduce((s,v)=>s+v,0);if(sum<2||sum>6)continue;let t=0;for(let j=0;j<8;j++)if(!p[j]&&p[(j+1)%8])t++;if(t!==1)continue;if(pass===0?(p[0]*p[2]*p[4]||p[2]*p[4]*p[6]):(p[0]*p[2]*p[6]||p[0]*p[4]*p[6]))continue;del.push(i);}for(const i of del)a[i]=0;if(del.length)changed=true;}}
 const adj=i=>offsets.map((d,j)=>[i+d,j]).filter(([k,j])=>a[k]&&(!(j%2)||(!a[i+offsets[(j+7)%8]]&&!a[i+offsets[(j+1)%8]]))).map(([k])=>k);
 const used=new Uint8Array(n), paths=[]; const mark=(i,j)=>{used[i]|=1<<offsets.indexOf(j-i);used[j]|=1<<offsets.indexOf(i-j);};const seen=(i,j)=>used[i]&(1<<offsets.indexOf(j-i));
 function walk(i,j){const p=[i];while(true){mark(i,j);p.push(j);const ns=adj(j);if(ns.length!==2)break;const k=ns.find(k=>!seen(j,k));if(k===undefined)break;i=j;j=k;}return p;}
 for(let pass=0;pass<2;pass++)for(let i=0;i<n;i++){if(!a[i])continue;const ns=adj(i);if(!pass&&ns.length===2)continue;for(const j of ns)if(!seen(i,j)){const p=walk(i,j);if(p.length>=(mode==="legacy"?3:2))paths.push(p);}}
 if(mode!=="legacy"){
 // Pair incident paths only at the same junction, preferring straight continuation.
 const ends=new Map();
 paths.forEach((p,id)=>{for(let side=0;side<2;side++){const k=side?p[p.length-1]:p[0];if(!ends.has(k))ends.set(k,[]);ends.get(k).push({id,side});}});
 const links=new Map(),key=e=>e.id*2+e.side;
 function tangent(e){const p=paths[e.id],i=e.side?p.length-1:0,j=e.side?Math.max(0,i-5):Math.min(p.length-1,5);const x=p[j]%w-p[i]%w,y=Math.floor(p[j]/w)-Math.floor(p[i]/w),l=Math.hypot(x,y)||1;return [x/l,y/l];}
 for(const es of ends.values()){const candidates=[];for(let i=0;i<es.length;i++)for(let j=i+1;j<es.length;j++){if(es[i].id===es[j].id)continue;const u=tangent(es[i]),v=tangent(es[j]),score=-(u[0]*v[0]+u[1]*v[1]);if(score>.78)candidates.push([score,es[i],es[j]]);}candidates.sort((a,b)=>b[0]-a[0]);for(const [,a,b] of candidates){if(links.has(key(a))||links.has(key(b)))continue;links.set(key(a),b);links.set(key(b),a);}}
 const visited=new Set(),merged=[];
 function chain(e){const out=[];while(e&&!visited.has(e.id)){visited.add(e.id);const p=e.side?paths[e.id].slice().reverse():paths[e.id];out.push(...(out.length?p.slice(1):p));e=links.get(e.id*2+1-e.side);}return out;}
 for(let id=0;id<paths.length;id++)for(let side=0;side<2;side++)if(!visited.has(id)&&!links.has(id*2+side))merged.push(chain({id,side}));
 for(let id=0;id<paths.length;id++)if(!visited.has(id))merged.push(chain({id,side:0}));
 for(let i=0;i<n;i++)if(a[i]&&!adj(i).length)merged.push([i,i]);
 paths.splice(0,paths.length,...merged);
 }
 // Preserve aspect ratio in the existing 1000 x 600 logical canvas.
 const scale=Math.min(960/w,560/h), ox=(1000-w*scale)/2,oy=(600-h*scale)/2;
 paths.sort((a,b)=>a.length-b.length); paths.reverse(); const total=paths.length;let time=0,count=0;const strokes=[], routingStrokes=[];
 for(const p of paths){if(strokes.length>=1000||count>=20000)break;const step=Math.max(1,Math.ceil(2/scale));const q=p.filter((_,i)=>i%step===0||i===p.length-1);if(count+q.length>20000)continue;const radii=p.map(i=>dist[i]).sort((a,b)=>a-b);const width=mode==='legacy'?2.5:Math.max(1,Math.min(12,(2*radii[Math.floor(radii.length/2)]-1)*scale));
 const precise=mode==='precise';
 const widths=q.map((i,j)=>{const a=q[Math.max(0,j-3)],b=q[Math.min(q.length-1,j+3)],dx=b%w-a%w,dy=Math.floor(b/w)-Math.floor(a/w),len=Math.hypot(dx,dy);if(!len)return Math.max(1,(2*dist[i]-1)*scale);const nx=-dy/len,ny=dx/len,x=i%w,y=Math.floor(i/w);function edge(sign){let r=.5;for(;r<Math.min(100,dist[i]*3+8);r+=.5){const xx=Math.round(x+nx*r*sign),yy=Math.round(y+ny*r*sign);if(xx<0||xx>=w||yy<0||yy>=h||!original[yy*w+xx])break;}return r;}return Math.max(1,Math.min((edge(1)+edge(-1)-.5)*scale,(2*dist[i]+2)*scale));});
 let local=widths.map((v,j)=>{const a=widths.slice(Math.max(0,j-3),j+4).sort((a,b)=>a-b);return Math.min(v,a[Math.floor(a.length/2)]*1.35);});
 const centers=q.map(i=>[i%w+.5,Math.floor(i/w)+.5]);
 const corrected=new Uint8Array(q.length);
 // Width at a junction describes the union of ink, not an individual pen.
 // Mask its influence along the original skeleton before downsampling.
 if(precise){
   const arc=[0], bad=new Uint8Array(p.length);
   for(let k=1;k<p.length;k++)arc.push(arc[k-1]+Math.hypot(p[k]%w-p[k-1]%w,Math.floor(p[k]/w)-Math.floor(p[k-1]/w)));
   for(let k=0;k<p.length;k++)if(adj(p[k]).length>=3){
     const radius=Math.max(2,dist[p[k]]*1.7);
     for(let j=k;j>=0&&arc[k]-arc[j]<=radius;j--)bad[j]=1;
     for(let j=k+1;j<p.length&&arc[j]-arc[k]<=radius;j++)bad[j]=1;
   }
   const qi=[];for(let k=0;k<p.length;k++)if(k%step===0||k===p.length-1)qi.push(k);
   const valid=qi.map(k=>!bad[k]);
   const prev=[],next=[];let anchor=-1;
   for(let j=0;j<q.length;j++){if(valid[j])anchor=j;prev[j]=anchor;}
   anchor=-1;for(let j=q.length-1;j>=0;j--){if(valid[j])anchor=j;next[j]=anchor;}
   const measured=local.slice();
   local=local.map((v,j)=>{
     if(valid[j])return v;
     const l=prev[j],r=next[j];if(l<0&&r<0)return v;
     if(l<0)return Math.min(v,measured[r]);if(r<0)return Math.min(v,measured[l]);
     const t=(arc[qi[j]]-arc[qi[l]])/Math.max(.001,arc[qi[r]]-arc[qi[l]]);
     return Math.min(v,measured[l]*(1-t)+measured[r]*t);
   });
   // Reconstruct only bounded junction spans. Keep shared graph endpoints
   // intact so SMART TRACE can still traverse all incident branches.
   for(let j=1;j<q.length-1;j++){
     if(valid[j])continue;
     const l=prev[j],r=next[j];if(l<0||r<0||r-l<2)continue;
     const A=centers[l],B=centers[r],L=arc[qi[r]]-arc[qi[l]];
     const chord=Math.hypot(B[0]-A[0],B[1]-A[1]);if(chord<1||chord/L<.78)continue;
     const u=centers[Math.max(0,l-3)],v=centers[Math.min(q.length-1,r+3)];
     const unit=(x,y)=>{const d=Math.hypot(x,y);return d>0?[x/d,y/d]:[(B[0]-A[0])/chord,(B[1]-A[1])/chord];};
     const d0=unit(A[0]-u[0],A[1]-u[1]),d1=unit(v[0]-B[0],v[1]-B[1]);
     const dx=(B[0]-A[0])/chord,dy=(B[1]-A[1])/chord;
     if(d0[0]*dx+d0[1]*dy<.65||d1[0]*dx+d1[1]*dy<.65)continue;
     const t=(arc[qi[j]]-arc[qi[l]])/L,t2=t*t,t3=t2*t;
     const pos=[0,1].map(k=>(2*t3-3*t2+1)*A[k]+(t3-2*t2+t)*chord*d0[k]+(-2*t3+3*t2)*B[k]+(t3-t2)*chord*d1[k]);
     const old=centers[j],delta=Math.hypot(pos[0]-old[0],pos[1]-old[1]);
     const limit=Math.max(1,Math.min(4,dist[q[j]]*.55));
     if(delta>limit){pos[0]=old[0]+(pos[0]-old[0])*limit/delta;pos[1]=old[1]+(pos[1]-old[1])*limit/delta;}
     const x=Math.floor(pos[0]),y=Math.floor(pos[1]);
     if(x>=0&&x<w&&y>=0&&y<h&&original[y*w+x]){centers[j]=pos;corrected[j]=1;}
   }
 }

 const base=Math.max(1,Math.min(80,Math.max(...local)/2.5));
 const rawPoints=[]; const points=q.map((i,j)=>{let rx=i%w+.5,ry=Math.floor(i/w)+.5;if(mode!=='legacy'&&j>0&&j<q.length-1){const u=q[j-1],v=q[j+1];rx=.7*rx+.15*(u%w+v%w+1);ry=.7*ry+.15*(Math.floor(u/w)+Math.floor(v/w)+1);}rawPoints.push([+((ox+rx*scale)/1000).toFixed(4),+((oy+ry*scale)/600).toFixed(4)]);let [x,y]=centers[j];if(!corrected[j]&&mode!=='legacy'&&j>0&&j<q.length-1){const u=q[j-1],v=q[j+1];x=.7*x+.15*(u%w+v%w+1);y=.7*y+.15*(Math.floor(u/w)+Math.floor(v/w)+1);}return [+((ox+x*scale)/1000).toFixed(4),+((oy+y*scale)/600).toFixed(4),time+=8,precise?+Math.max(0,Math.min(1,(local[j]/base-.5)/2)).toFixed(4):.5];});time+=12;strokes.push({pen:precise?'brush':'ball',tip:'round',color:'#181818',width:+(precise?base:width).toFixed(2),opacity:1,points,releasedAt:time});routingStrokes.push({...strokes.at(-1),points:points.map((pt,j)=>[...rawPoints[j],pt[2],pt[3]])});count+=q.length;}
 self.postMessage({strokes,routingStrokes,total,count});
 }catch(e){self.postMessage({error:String(e.message||e)});}
};
