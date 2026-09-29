(()=>{
  'use strict';
  const body=document.getElementById('bodyInput');
  const title=document.getElementById('titleInput');
  const generate=document.getElementById('easyIllustrationGenerate');
  const status=document.getElementById('easyIllustrationStatus');
  const result=document.getElementById('easyIllustrationResult');
  const preview=document.getElementById('easyIllustrationPreview');
  const paper=document.getElementById('easyIllustrationPaper');
  const byline=document.getElementById('easyIllustrationByline');
  const readers=[...document.querySelectorAll('.easy-illustration-reader')];
  if(!body||!generate||!result||!preview)return;
  const cover=document.getElementById('easyIllustrationCover');
  const background=document.getElementById('easyIllustrationBackground');
  const discard=document.getElementById('easyIllustrationDiscard');
  const names={cage:'CAGE',coral:'珊瑚色の子',blue:'青い子'};
  let file=null,source='',objectUrl='',illustrator='cage';
  const clear=()=>{
    if(objectUrl)URL.revokeObjectURL(objectUrl);
    file=null;source='';objectUrl='';preview.removeAttribute('src');result.hidden=true;paper?.classList.remove('is-revealing');
  };
  for(const reader of readers)reader.addEventListener('click',()=>{
    if(generate.disabled)return;
    const next=reader.dataset.illustrator;
    if(!names[next]||next===illustrator)return;
    illustrator=next;clear();
    for(const item of readers){const chosen=item===reader;item.classList.toggle('is-selected',chosen);item.setAttribute('aria-pressed',String(chosen));}
    status.textContent=`${names[next]}に絵を思い浮かべてもらいます。`;
  });
  const excerpt=text=>{
    const value=text.trim();
    if(value.length<=3300)return value;
    const middle=Math.floor(value.length/2);
    return [value.slice(0,1050),value.slice(middle-525,middle+525),value.slice(-1050)].join('\n［中略］\n');
  };
  body.addEventListener('input',()=>{if(file){clear();status.textContent='本文が変わったので、生成画像の候補を閉じました。';}});
  generate.addEventListener('click',async()=>{
    const text=body.value.trim();
    if(text.length<20){status.textContent='先に本文を20文字以上貼ってください。';body.focus();return;}
    let token='';
    try{token=String(JSON.parse(localStorage.getItem('ahako-author-session-v1')||'null')?.token||'');}catch(_){/* no session */}
    if(!token){status.textContent='画像を描くには作者ログインが必要です。';return;}
    clear();generate.disabled=true;status.textContent='本文から場面を選んで、一枚描いています…';
    try{
      const response=await fetch('https://scene-studio-api.a-hako.workers.dev/cage/illustrate',{
        method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({title:title?.value||'',excerpt:excerpt(text),illustrator})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.ok||typeof data.image!=='string')throw new Error(data.error||'画像を描けませんでした。');
      if(body.value.trim()!==text){status.textContent='生成中に本文が変わったので、この絵は適用しませんでした。';return;}
      const binary=atob(data.image);
      const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
      file=new File([bytes],`${illustrator}-illustration.jpg`,{type:'image/jpeg'});
      source=text;
      objectUrl=URL.createObjectURL(file);
      if(paper)paper.dataset.illustrator=illustrator;
      if(byline)byline.textContent=`${names[illustrator]}が思い浮かべた景色`;
      preview.alt=`${names[illustrator]}が思い浮かべた作品のイメージ`;
      preview.onload=()=>{paper?.classList.remove('is-revealing');void paper?.offsetWidth;paper?.classList.add('is-revealing');};
      preview.src=objectUrl;
      result.hidden=false;
      status.textContent='気に入ったら使い道を選んでください。';
    }catch(error){status.textContent=error.message||'画像を描けませんでした。';}
    finally{generate.disabled=false;}
  });
  const apply=destination=>{
    if(!file||body.value.trim()!==source){clear();status.textContent='本文が変わりました。もう一度描いてください。';return;}
    window.dispatchEvent(new CustomEvent('scene-studio:apply-illustration',{detail:{file,destination}}));
    status.textContent=destination==='cover'?'表紙に設定しました。':'CINEMAの背景に設定しました。';
    clear();
  };
  cover?.addEventListener('click',()=>apply('cover'));
  background?.addEventListener('click',()=>apply('background'));
  discard?.addEventListener('click',()=>{clear();status.textContent='この絵は使いません。';});
})();
