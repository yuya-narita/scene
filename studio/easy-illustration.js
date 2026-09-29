(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const body=$('bodyInput'),title=$('titleInput'),generate=$('easyIllustrationGenerate'),status=$('easyIllustrationStatus'),result=$('easyIllustrationResult'),preview=$('easyIllustrationPreview'),paper=$('easyIllustrationPaper'),byline=$('easyIllustrationByline'),gallery=$('easyIllustrationGallery'),count=$('easyIllustrationCount'),resultLabel=$('easyIllustrationResultLabel');
  if(!body||!generate||!result||!preview||!gallery)return;
  const names={cage:'CAGE',coral:'珊瑚色の子',blue:'青い子'};
  let illustrator='cage',selected=null,items=[];
  const urls=new Map();
  const urlFor=item=>{if(!urls.has(item.id))urls.set(item.id,URL.createObjectURL(item.blob));return urls.get(item.id);};
  const database=new Promise((resolve,reject)=>{
    if(!window.indexedDB){reject(new Error('No IndexedDB'));return;}
    const request=indexedDB.open('ahako-easy-illustrations-v1',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('images',{keyPath:'id'});
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  }).catch(()=>null);
  const storage=(mode,operation)=>database.then(db=>new Promise((resolve,reject)=>{
    if(!db){reject(new Error('No storage'));return;}
    const req=operation(db.transaction('images',mode).objectStore('images'));
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  }));
  const render=()=>{
    if(count)count.textContent=items.length?`履歴 ${items.length}枚`:'';
    gallery.replaceChildren();
    for(const item of items){
      const button=document.createElement('button');button.type='button';
      button.setAttribute('aria-pressed',String(item.id===selected?.id));
      button.title=`${names[item.illustrator]||'生成画像'} ${new Date(item.createdAt).toLocaleString()}`;
      const img=document.createElement('img');img.src=urlFor(item);img.alt='';
      const label=document.createElement('span');label.textContent=names[item.illustrator]||'生成画像';
      button.append(img,label);button.addEventListener('click',()=>{select(item);result.showModal();});gallery.append(button);
    }
  };
  const select=(item,reveal=false)=>{
    selected=item;
    if(!item){preview.removeAttribute('src');paper?.classList.remove('is-revealing');}
    else{
      paper.dataset.illustrator=item.illustrator;
      byline.textContent=`${names[item.illustrator]||'この子'}が思い浮かべた景色`;
      if(resultLabel)resultLabel.textContent=`${names[item.illustrator]||'この子'}が描いた一枚`;
      preview.alt=`${names[item.illustrator]||'この子'}が思い浮かべた作品のイメージ`;
      paper.classList.remove('is-revealing');
      preview.onload=reveal?()=>{void paper.offsetWidth;paper.classList.add('is-revealing');}:null;
      preview.src=urlFor(item);
    }
    render();
  };
  storage('readonly',store=>store.getAll()).then(saved=>{
    const known=new Set(items.map(item=>item.id));
    items=[...items,...saved.filter(item=>!known.has(item.id))].sort((a,b)=>b.createdAt-a.createdAt);
    if(!selected&&items.length)select(items[0]);else render();
  }).catch(()=>{});
  for(const reader of document.querySelectorAll('.easy-illustration-reader'))reader.addEventListener('click',()=>{
    if(generate.disabled)return;
    const next=reader.dataset.illustrator;if(!names[next]||next===illustrator)return;
    illustrator=next;
    for(const item of document.querySelectorAll('.easy-illustration-reader')){
      const chosen=item===reader;item.classList.toggle('is-selected',chosen);item.setAttribute('aria-pressed',String(chosen));
    }
    status.textContent=`${names[next]}を選びました。前の絵は履歴から選べます。`;
  });
  const excerpt=text=>{
    const value=text.trim();if(value.length<=3300)return value;
    const middle=Math.floor(value.length/2);
    return [value.slice(0,1050),value.slice(middle-525,middle+525),value.slice(-1050)].join('\n［中略］\n');
  };
  const addCageSeal=async blob=>{
    const source=URL.createObjectURL(blob);
    try{
      const img=new Image();
      await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=source;});
      const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
      ctx.drawImage(img,0,0);
      const size=Math.round(Math.min(canvas.width,canvas.height)*.072);
      const margin=Math.round(size*.36);
      const x=canvas.width-size-margin,y=canvas.height-size-margin;
      ctx.fillStyle='rgba(249,243,225,.91)';ctx.fillRect(x-4,y-4,size+8,size+8);
      ctx.strokeStyle='#a7352b';ctx.lineWidth=Math.max(2,size*.045);ctx.strokeRect(x+3,y+3,size-6,size-6);
      ctx.fillStyle='#a7352b';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.font=`bold ${Math.round(size*.71)}px "Yu Mincho","Hiragino Mincho ProN",serif`;
      ctx.fillText('影',x+size/2,y+size/2+2);
      const output=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.95));
      if(!output)throw new Error('Image export unavailable');
      return output;
    }finally{URL.revokeObjectURL(source);}
  };
  generate.addEventListener('click',async()=>{
    const text=body.value.trim();
    if(text.length<20){status.textContent='先に本文を20文字以上貼ってください。';body.focus();return;}
    let token='';try{token=String(JSON.parse(localStorage.getItem('ahako-author-session-v1')||'null')?.token||'');}catch(_){}
    if(!token){status.textContent='画像を描くには作者ログインが必要です。';return;}
    const requestedIllustrator=illustrator;
    generate.disabled=true;status.textContent='本文から場面を選んで、一枚描いています…';
    try{
      const response=await fetch('https://scene-studio-api.a-hako.workers.dev/cage/illustrate',{
        method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({title:title?.value||'',excerpt:excerpt(text),illustrator:requestedIllustrator})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.ok||typeof data.image!=='string')throw new Error(data.error||'画像を描けませんでした。');
      const binary=atob(data.image),bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
      const type=data.mimeType==='image/png'?'image/png':'image/jpeg';
      let blob=new Blob([bytes],{type}),sealApplied=false;
      if(requestedIllustrator==='cage'){
        try{blob=await addCageSeal(blob);sealApplied=true;}catch(_){/* retain the original image */}
      }
      const item={id:crypto.randomUUID(),illustrator:requestedIllustrator,createdAt:Date.now(),blob};
      items.unshift(item);select(item);
      try{await storage('readwrite',store=>store.put(item));status.textContent=sealApplied||requestedIllustrator!=='cage'?'一枚描けました。サムネイルを押して確認できます。':'一枚描けました。印を入れられなかったので画像を確認してください。';}
      catch(_){status.textContent='一枚描けました。端末の履歴に保存できなかったので、サムネイルから画像を保存してください。';}
    }catch(error){status.textContent=error.message||'画像を描けませんでした。';}
    finally{generate.disabled=false;}
  });
  const apply=destination=>{
    if(!selected)return;
    const type=selected.blob.type==='image/png'?'png':'jpg';
    const file=new File([selected.blob],`${selected.illustrator}-illustration.${type}`,{type:selected.blob.type});
    window.dispatchEvent(new CustomEvent('scene-studio:apply-illustration',{detail:{file,destination}}));
    status.textContent=destination==='cover'?'表紙に設定しました。絵は履歴にも残っています。':'CINEMAの背景に設定しました。絵は履歴にも残っています。';
    result.close();
  };
  $('easyIllustrationCover')?.addEventListener('click',()=>apply('cover'));
  $('easyIllustrationBackground')?.addEventListener('click',()=>apply('background'));
  $('easyIllustrationDownload')?.addEventListener('click',()=>{
    if(!selected)return;
    const a=document.createElement('a');a.href=urlFor(selected);
    a.download=`ahako-${selected.illustrator}-${new Date(selected.createdAt).toISOString().slice(0,10)}.${selected.blob.type==='image/png'?'png':'jpg'}`;
    document.body.append(a);a.click();a.remove();status.textContent='画像の保存を開始しました。';
  });
  $('easyIllustrationDiscard')?.addEventListener('click',async()=>{
    if(!selected||!confirm('この画像を端末の履歴から削除しますか？'))return;
    const removed=selected;result.close();items=items.filter(item=>item.id!==removed.id);select(items[0]||null);
    try{await storage('readwrite',store=>store.delete(removed.id));}catch(_){}
    const oldUrl=urls.get(removed.id);if(oldUrl){URL.revokeObjectURL(oldUrl);urls.delete(removed.id);}
    status.textContent='画像を履歴から削除しました。';
  });
  $('easyIllustrationClose')?.addEventListener('click',()=>result.close());
  result.addEventListener('click',event=>{
    if(event.target!==result)return;
    const rect=result.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)result.close();
  });
  window.addEventListener('pagehide',()=>{for(const url of urls.values())URL.revokeObjectURL(url);urls.clear();});
})();
