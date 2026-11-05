/* The menu uses the visible room space, independently of the tall book shelves. */
(()=>{
 'use strict';
 const store=document.getElementById('store'),shelf=document.getElementById('roomShelf');
 if(!store||!shelf)return;
 const viewport=document.createElement('div');viewport.id='readingRoomMenuViewport';viewport.hidden=true;store.append(viewport);
 let sourceFace=null,frame=0,press=null,suppressUntil=0,entryRect=null,entryToken=0;
 viewport.addEventListener('pointerdown',event=>{press={id:event.pointerId,x:event.clientX,y:event.clientY};},{passive:true});
 viewport.addEventListener('pointercancel',()=>{press=null;});
 viewport.addEventListener('pointerup',event=>{
  if(!press||press.id!==event.pointerId)return;
  const dx=event.clientX-press.x,dy=event.clientY-press.y;press=null;
  if(Math.abs(dx)<42||Math.abs(dx)<Math.abs(dy)*1.2)return;
  suppressUntil=Date.now()+500;event.preventDefault();event.stopPropagation();
  window.navigateReadingRoomFace?.(dx<0?3:1);
 },{capture:true});
 viewport.addEventListener('click',event=>{if(Date.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
 function sync(){
  frame=0;
  const active=store.classList.contains('private-reading-room')&&!shelf.hidden&&shelf.dataset.shelfFace==='2';
  const fresh=shelf.querySelector('.reading-menu-face .reading-room-menu');
  let menu=viewport.querySelector('.reading-room-menu');
  if(active&&fresh&&!menu){const r=fresh.getBoundingClientRect();entryRect={left:r.left,top:r.top,width:r.width,height:r.height};sourceFace=fresh.parentElement;viewport.replaceChildren(fresh);menu=fresh;}
  if(!active||!menu){
   entryToken++;entryRect=null;
   if(menu){menu.style.removeProperty('transition');menu.style.removeProperty('transform');menu.style.removeProperty('transform-origin');}
   if(menu&&sourceFace?.isConnected)sourceFace.append(menu);
   else if(menu)menu.remove();
   viewport.hidden=true;if(store.classList.contains('reading-menu-visible'))store.classList.remove('reading-menu-visible');return;
  }
  viewport.hidden=false;if(!store.classList.contains('reading-menu-visible'))store.classList.add('reading-menu-visible');
  const room=store.getBoundingClientRect(),visual=window.visualViewport;
  const visibleTop=visual?.offsetTop||0,visibleBottom=visibleTop+(visual?.height||innerHeight);
  let top=Math.max(room.top,visibleTop),bottom=Math.min(room.bottom,visibleBottom);
  for(const selector of ['.shop-head','#store>.sign','#roomExitNav','#roomMotion']){
   const el=document.querySelector(selector);if(!el||el.hidden||!el.getClientRects().length)continue;
   const style=getComputedStyle(el),rect=el.getBoundingClientRect();
   if(style.display!=='none'&&style.visibility!=='hidden'&&rect.bottom>top&&rect.top<bottom)top=Math.max(top,rect.bottom);
  }
  const hint=shelf.querySelector('.room-shelf-hint');
  if(hint&&getComputedStyle(hint).display!=='none'){
   const rect=hint.getBoundingClientRect();if(rect.top>top&&rect.top<bottom)bottom=rect.top;
  }
  const available=Math.max(0,bottom-top-24);
  viewport.style.top=Math.round(top-room.top+12)+'px';
  viewport.style.height=Math.floor(available)+'px';
  viewport.classList.toggle('is-compact',available<310);
  if(entryRect){
   const from=entryRect,to=menu.getBoundingClientRect();entryRect=null;
   if(from.width>0&&from.height>0&&to.width>0&&to.height>0){
    const token=++entryToken;
    menu.style.transition='none';menu.style.transformOrigin='top left';
    menu.style.transform=`translate3d(${Math.round(from.left-to.left)}px,${Math.round(from.top-to.top)}px,0) scale(${from.width/to.width},${from.height/to.height})`;
    void menu.offsetWidth;
    requestAnimationFrame(()=>{
     if(token!==entryToken||!menu.isConnected)return;
     menu.style.transition='transform 380ms cubic-bezier(.2,.78,.24,1)';menu.style.transform='translate3d(0,0,0) scale(1,1)';
     const cleanup=event=>{if(event.propertyName!=='transform')return;menu.style.removeProperty('transition');menu.style.removeProperty('transform');menu.style.removeProperty('transform-origin');menu.removeEventListener('transitionend',cleanup);};
     menu.addEventListener('transitionend',cleanup);
    });
   }
  }
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(sync);}
 new MutationObserver(schedule).observe(store,{attributes:true,attributeFilter:['class']});
 new MutationObserver(schedule).observe(shelf,{attributes:true,attributeFilter:['hidden','data-shelf-face'],childList:true,subtree:true});
 window.addEventListener('resize',schedule);window.addEventListener('orientationchange',schedule);
 window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
 window.addEventListener('scroll',schedule,{passive:true});
 document.fonts?.ready.then(schedule);schedule();
})();
