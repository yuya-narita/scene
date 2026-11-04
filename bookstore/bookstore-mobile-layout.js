(()=>{
 const root=document.querySelector('#store'),focus=document.querySelector('#focusPanel');
 if(!root||!focus)return;
 let frame=0;
 const visible=el=>!!el&&!el.hidden&&getComputedStyle(el).display!=='none';
 function layout(){
  frame=0;if(!matchMedia('(max-width:680px)').matches)return;
  const rect=root.getBoundingClientRect(),h=rect.height;
  let guideTop=h-20;
  for(const id of ['introHint','hint']){const el=document.getElementById(id);if(visible(el))guideTop=Math.min(guideTop,el.getBoundingClientRect().top-rect.top);}
  const status=document.querySelector('#bookPath .path-status');
  if(visible(document.getElementById('bookPath'))&&status)guideTop=Math.min(guideTop,status.getBoundingClientRect().top-rect.top);
  const bottom=Math.max(20,h-guideTop+14);
  root.style.setProperty('--mobile-info-bottom',`${bottom}px`);
  const infoTop=h-bottom-focus.getBoundingClientRect().height;
  const sign=root.querySelector(':scope > .sign');
  const header=document.querySelector('header');
  const headerBottom=header?header.getBoundingClientRect().bottom-rect.top:68;
  const top=Math.max(headerBottom+14,visible(sign)?sign.getBoundingClientRect().bottom-rect.top+18:0);
  const available=Math.max(40,infoTop-top-20);
  root.style.setProperty('--mobile-ring-top',`${top}px`);
  root.style.setProperty('--mobile-ring-height',`${available}px`);
  // Front cover is enlarged by the existing ring transform; leave projection room.
  root.style.setProperty('--mobile-ring-width',`${Math.max(16,available/(1.5*1.55))}px`);
  const pathTop=Math.max(headerBottom+90,150),pathHeight=Math.max(40,infoTop-pathTop-20);
  root.style.setProperty('--mobile-path-top',`${pathTop}px`);
  root.style.setProperty('--mobile-path-bottom',`${Math.max(0,h-infoTop+20)}px`);
  root.style.setProperty('--mobile-path-width',`${Math.max(16,pathHeight/(1.5*1.7))}px`);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(layout);}
 const resize=new ResizeObserver(schedule);resize.observe(root);resize.observe(focus);
 new MutationObserver(schedule).observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class']});
 window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);
 document.fonts?.ready.then(schedule);schedule();
})();
