(() => {
  let params;
  try { params = new URLSearchParams(location.search); } catch (_) { return; }
  if (params.get('diag') !== '1' && params.get('loadDiag') !== '1') return;

  const d = {frames:0,last:performance.now(),fps:0,long:0,max:0,raf:0,node:null};
  const node=document.createElement('div');
  node.id='ahako-load-diag';
  node.setAttribute('aria-hidden','true');
  Object.assign(node.style,{
    position:'fixed',
    left:'max(6px, env(safe-area-inset-left))',
    top:'max(6px, env(safe-area-inset-top))',
    zIndex:'2147483647',
    padding:'6px 8px',
    borderRadius:'8px',
    background:'rgba(0,0,0,.74)',
    color:'#fff',
    font:'11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace',
    whiteSpace:'pre',
    pointerEvents:'none'
  });
  const mount=()=>{ if(!node.isConnected && document.body) document.body.appendChild(node); };
  if(document.body) mount(); else document.addEventListener('DOMContentLoaded',mount,{once:true});

  const tick=(now)=>{
    const dt=now-d.last; d.frames++;
    if(dt>34){d.long++;d.max=Math.max(d.max,dt);}
    if(dt>=1000){d.fps=Math.round(d.frames*1000/dt);d.frames=0;d.last=now;}
    const spatial=document.querySelector('.sp-bg-360-active,.sp-bg-panorama-active');
    const mode=spatial?.classList.contains('sp-bg-360-active')?'360':
      spatial?.classList.contains('sp-bg-panorama-active')?'PANO':'FLAT';
    const mem=performance.memory?.usedJSHeapSize
      ? `  MEM ${(performance.memory.usedJSHeapSize/1048576).toFixed(0)}MB` : '';
    node.textContent=`AHAKO LOAD DIAG  ${mode}\nFPS ${String(d.fps).padStart(2)}  LONG ${d.long}  MAX ${d.max.toFixed(0)}ms${mem}`;
    d.raf=requestAnimationFrame(tick);
  };
  d.raf=requestAnimationFrame(tick);
})();