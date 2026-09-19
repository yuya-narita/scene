(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.AhakoSceneEditCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const rangesOf=s=>Array.isArray(s?.richText?.ranges)?s.richText.ranges:[];
  const hasTable=s=>Array.isArray(s?.content)&&s.content.some(c=>c?.type==='table');
  function splitRanges(scene,pos,leftText,rightText,originalText){
    const text=String(originalText??scene?.text??'');
    const leftEnd=String(leftText??text.slice(0,pos).trimEnd()).length;
    const rightRaw=text.slice(pos); const lead=(rightRaw.match(/^\s*/)||[''])[0].length; const rightStart=pos+lead;
    const left=[],right=[];
    for(const r0 of rangesOf(scene)){
      if(r0?.kind==='table')continue;
      const r=clone(r0),a=Math.max(0,Number(r.start)||0),b=Math.max(a,Number(r.end)||0);
      const la=Math.max(0,Math.min(leftEnd,a)),lb=Math.max(0,Math.min(leftEnd,b));
      if(lb>la)left.push({...r,start:la,end:lb});
      const ra=Math.max(rightStart,a),rb=Math.min(text.length,b);
      if(rb>ra)right.push({...r,start:ra-rightStart,end:rb-rightStart});
    }
    return {left,right};
  }
  function mergeRanges(prev,cur){
    const offset=String(prev?.text||'').length;
    return [...rangesOf(prev).filter(r=>r?.kind!=='table').map(clone),...rangesOf(cur).filter(r=>r?.kind!=='table').map(r=>({...clone(r),start:(Number(r.start)||0)+offset,end:(Number(r.end)||0)+offset}))];
  }
  function validateDocument(doc){
    const errors=[],ids=new Set();
    (doc?.scenes||[]).forEach((s,i)=>{
      if(!s?.id)errors.push(`scene ${i}: missing id`); else if(ids.has(s.id))errors.push(`scene ${i}: duplicate id ${s.id}`); else ids.add(s.id);
      const text=String(s?.text||''); const tables=(s?.content||[]).filter(c=>c?.type==='table');
      if(tables.length>1)errors.push(`scene ${i}: more than one table`);
      if(tables.length===1){
        const trs=rangesOf(s).filter(r=>r?.kind==='table');
        if(trs.length!==1)errors.push(`scene ${i}: table Scene must have exactly one table range`);
        if(rangesOf(s).some(r=>r?.kind!=='table'))errors.push(`scene ${i}: table Scene contains prose rich ranges`);
      }
      for(const r of rangesOf(s)){
        const a=Number(r?.start),b=Number(r?.end);
        if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b<=a||b>text.length)errors.push(`scene ${i}: invalid rich range ${a}-${b}/${text.length}`);
      }
    });
    return errors;
  }
  return {hasTable,splitRanges,mergeRanges,validateDocument};
});
