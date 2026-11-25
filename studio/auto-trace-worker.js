'use strict';
// Phase 1: dark line art on light background, Zhang-Suen thinning.
self.onmessage=({data:{rgba,w,h,threshold}})=>{
 try {
 const a=new Uint8Array(w*h), n=a.length;
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x,k=i*4; const alpha=rgba[k+3]/255; a[i]=((.299*rgba[k]+.587*rgba[k+1]+.114*rgba[k+2])*alpha+255*(1-alpha)<threshold)?1:0;}
 const offsets=[-w,1-w,1,1+w,w,w-1,-1,-w-1];
 let changed=true, rounds=0;
 while(changed&&rounds++<100){changed=false;for(let pass=0;pass<2;pass++){const del=[];for(let i=w+1;i<n-w-1;i++){if(!a[i])continue;const p=offsets.map(d=>a[i+d]);const sum=p.reduce((s,v)=>s+v,0);if(sum<2||sum>6)continue;let t=0;for(let j=0;j<8;j++)if(!p[j]&&p[(j+1)%8])t++;if(t!==1)continue;if(pass===0?(p[0]*p[2]*p[4]||p[2]*p[4]*p[6]):(p[0]*p[2]*p[6]||p[0]*p[4]*p[6]))continue;del.push(i);}for(const i of del)a[i]=0;if(del.length)changed=true;}}
 const adj=i=>offsets.map((d,j)=>[i+d,j]).filter(([k,j])=>a[k]&&(!(j%2)||(!a[i+offsets[(j+7)%8]]&&!a[i+offsets[(j+1)%8]]))).map(([k])=>k);
 const used=new Uint8Array(n), paths=[]; const mark=(i,j)=>{used[i]|=1<<offsets.indexOf(j-i);used[j]|=1<<offsets.indexOf(i-j);};const seen=(i,j)=>used[i]&(1<<offsets.indexOf(j-i));
 function walk(i,j){const p=[i];while(true){mark(i,j);p.push(j);const ns=adj(j);if(ns.length!==2)break;const k=ns.find(k=>!seen(j,k));if(k===undefined)break;i=j;j=k;}return p;}
 for(let pass=0;pass<2;pass++)for(let i=0;i<n;i++){if(!a[i])continue;const ns=adj(i);if(!pass&&ns.length===2)continue;for(const j of ns)if(!seen(i,j)){const p=walk(i,j);if(p.length>=3)paths.push(p);}}
 // Preserve aspect ratio in the existing 1000 x 600 logical canvas.
 const scale=Math.min(960/w,560/h), ox=(1000-w*scale)/2,oy=(600-h*scale)/2;
 paths.sort((a,b)=>a.length-b.length); paths.reverse(); const total=paths.length;let time=0,count=0;const strokes=[];
 for(const p of paths){if(strokes.length>=1000||count>=20000)break;const step=Math.max(1,Math.ceil(2/scale));const q=p.filter((_,i)=>i%step===0||i===p.length-1);if(count+q.length>20000)continue;const points=q.map(i=>[+((ox+(i%w+.5)*scale)/1000).toFixed(4),+((oy+(Math.floor(i/w)+.5)*scale)/600).toFixed(4),time+=8,.5]);time+=12;strokes.push({pen:'ball',tip:'round',color:'#181818',width:2.5,opacity:1,points,releasedAt:time});count+=q.length;}
 self.postMessage({strokes,total,count});
 }catch(e){self.postMessage({error:String(e.message||e)});}
};
