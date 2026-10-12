/* Scene Studio automatic ruby planning. No DOM, network or document mutation. */
(function(root){
 'use strict';
 const kanji=/[\p{Script=Han}々〆ヵヶ]/u;
 const hira=s=>String(s||'').normalize('NFC').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
 const overlaps=(a,b)=>a.start<b.end&&b.start<a.end;
 const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 function align(surface,reading,start){
  const parts=[...surface.matchAll(/[\p{Script=Han}々〆ヵヶ]+|[^\p{Script=Han}々〆ヵヶ]+/gu)];
  const pattern=parts.map(p=>kanji.test(p[0])?'(.+?)':escape(hira(p[0]))).join('');
  const match=hira(reading).match(new RegExp('^'+pattern+'$','u'));if(!match)return [];
  let group=0;return parts.filter(p=>kanji.test(p[0])).map(p=>({start:start+p.index,end:start+p.index+p[0].length,reading:match[++group],word:p[0]}));
 }
 function candidates(text,tokenizer,dictionary,difficult={}){
  const custom=[];
  Object.entries(dictionary||{}).filter(([word,reading])=>word&&String(reading).trim()).sort((a,b)=>b[0].length-a[0].length).forEach(([word,reading])=>{
   let at=text.indexOf(word);while(at>=0){const r={start:at,end:at+word.length,reading:hira(reading),word,author:true};if(!custom.some(x=>overlaps(x,r)))custom.push(r);at=text.indexOf(word,at+word.length);}
  });
  // Match curated multi-token terms as a phrase, e.g. 特異 + 点.
  for(const word of Object.keys(difficult).sort((a,b)=>b.length-a.length)){
   if(!text.includes(word))continue;
   const tokens=tokenizer.tokenize(word);if(!tokens.length||tokens.some(t=>!t.reading||t.reading==='*'))continue;
   const reading=tokens.map(t=>t.reading).join('');let at=text.indexOf(word);
   while(at>=0){const span={start:at,end:at+word.length};if(!custom.some(r=>overlaps(r,span)))custom.push(...align(word,reading,at).map(r=>({...r,tokenWord:word})));at=text.indexOf(word,at+word.length);}
  }
  const out=custom.slice();let cursor=0,unknown=0;
  for(const token of tokenizer.tokenize(text)){
   const word=token.surface_form||'';if(!word)continue;const start=text.indexOf(word,cursor);if(start<0)continue;cursor=start+word.length;
   if(!kanji.test(word)||custom.some(r=>overlaps(r,{start,end:cursor})))continue;
   if(!token.reading||token.reading==='*'){unknown++;continue;}
   const parts=align(word,token.reading,start);if(!parts.length){unknown++;continue;}
   out.push(...parts.map(r=>({...r,tokenWord:word})));
  }
  return {items:out.sort((a,b)=>a.start-b.start),unknown};
 }
 function plan(scenes,settings,dictionary,tokenizer,grades,difficult,onProgress){
  const gradeMap=new Map(Object.entries(grades).flatMap(([g,chars])=>chars.map(c=>[c,Number(g)])));
  const target=new Set(settings.indices);const seen=new Set();const plans=[];let unknown=0;
  const targets=[...target].filter(i=>Number.isInteger(i)&&i>=0&&scenes[i]).sort((a,b)=>a-b);
  const needed=settings.repeat==='work'&&targets.length?Array.from({length:targets.at(-1)+1},(_,i)=>i).filter(i=>scenes[i]):targets;
  let processed=0;
  for(const i of needed){
   const scene=scenes[i],text=String(scene.text||'');const old=scene.richText?.ranges||[];
   const kept=old.filter(r=>r.kind!=='ruby'||r.source!=='auto');
   const blockers=kept.filter(r=>r.kind==='ruby'||r.kind==='table');
   const excluded=(scene.richText?.autoRubyExcluded||[]).filter(r=>text.slice(r.start,r.end)===r.text);
   const found=candidates(text,tokenizer,dictionary,difficult);if(target.has(i))unknown+=found.unknown;
   const local=new Set();const added=[];
   for(const r of found.items){
    const key=r.word+'|'+r.reading;
    const repeat=settings.repeat==='work'?seen.has(key):settings.repeat==='scene'?local.has(key):false;
    const applicable=r.author||settings.mode==='all'||(settings.mode==='grade'?Array.from(r.word).some((c,i,chars)=>{const base=c==='々'?chars[i-1]:c;return kanji.test(c)&&(!gradeMap.has(base)||gradeMap.get(base)>Number(settings.grade));}):Object.hasOwn(difficult,r.tokenWord||r.word));
    if(applicable){local.add(key);seen.add(key);}
    if(!applicable||repeat||blockers.some(x=>overlaps(x,r))||excluded.some(x=>overlaps(x,r)))continue;
    added.push({start:r.start,end:r.end,kind:'ruby',reading:r.reading,source:'auto',word:r.word});
   }
   if(target.has(i))plans.push({index:i,ranges:[...kept,...added].sort((a,b)=>a.start-b.start||a.end-b.end),added:added.length,removed:old.filter(r=>r.kind==='ruby'&&r.source==='auto').length});
   onProgress?.(++processed,needed.length);
  }
  return {plans,unknown,total:plans.reduce((n,p)=>n+p.added,0)};
 }
 root.SceneAutoRuby={hira,align,candidates,plan};
 if(typeof module==='object'&&module.exports)module.exports=root.SceneAutoRuby;
})(typeof self==='object'?self:globalThis);
