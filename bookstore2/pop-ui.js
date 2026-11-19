/* Shared, text-only POP formatting. SVG paths are fixed artwork, never user HTML. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function marksFor(text,design={}){const rows=Array.isArray(design.marks)?design.marks:design.accent&&design.accent!=='none'?[{start:0,end:text.length,type:design.accent}]:[];return rows.filter(m=>m&&Number.isInteger(m.start)&&Number.isInteger(m.end)&&m.start>=0&&m.end>m.start&&m.start<text.length&&['marker','underline'].includes(m.type)).slice(0,48).map(m=>({start:m.start,end:Math.min(m.end,text.length),type:m.type}));}
function html(text,design={},limit=0){text=String(text||'');const visible=limit?[...text].slice(0,limit).join(''):text,n=visible.length,marks=marksFor(text,design).filter(m=>m.start<n),edges=[...new Set([0,n,...marks.flatMap(m=>[m.start,Math.min(n,m.end)])])].sort((a,b)=>a-b);let out='';for(let i=0;i<edges.length-1;i++){const a=edges[i],b=edges[i+1],types=[...new Set(marks.filter(m=>m.start<=a&&m.end>=b).map(m=>m.type))];const part=esc(visible.slice(a,b));out+=types.length?`<span class="${types.map(t=>'pop-mark-'+t).join(' ')}">${part}</span>`:part;}return '<span class="pop-words">'+out+(n<text.length?'…':'')+'</span>';}
function adjust(before,after,marks){if(before===after)return marks;const a=[...before],b=[...after];let p=0,s=0;while(p<a.length&&p<b.length&&a[p]===b[p])p++;while(s<a.length-p&&s<b.length-p&&a[a.length-1-s]===b[b.length-1-s])s++;const start=a.slice(0,p).join('').length,oldEnd=before.length-a.slice(a.length-s).join('').length,newEnd=after.length-b.slice(b.length-s).join('').length,delta=after.length-before.length,result=[];for(const m of marks){if(m.end<=start)result.push(m);else if(m.start>=oldEnd)result.push({...m,start:m.start+delta,end:m.end+delta});else if(start===oldEnd)result.push({...m,end:m.end+delta});else{if(m.start<start)result.push({...m,end:start});if(m.end>oldEnd)result.push({...m,start:newEnd,end:m.end+delta});}}return result.filter(m=>m.end>m.start).slice(0,48);}
const art={
 stars:'<path d="M28 7Q29 26 46 29Q29 31 27 49Q25 31 8 29Q26 26 28 7ZM67 32Q68 43 80 46Q68 48 66 61Q64 49 52 46Q65 44 67 32Z"/><path d="m64 10 1 9m-5-4 10 1"/>',
 burst:'<path d="m30 12 3 31m0 11 .2 2m25-41-2 29m-1 10 .1 2M12 4 7 15m71-8 9 9M15 65l-9 3m71-7 12 5"/>',
 smile:'<path d="M49 8C19 6 6 27 15 49S66 72 79 46S76 7 49 8Z"/><path d="M32 28v5m27-5v5M29 43q18 23 36-2"/>',
 paws:'<path d="M24 51c-15 10-7 20 4 14 8 8 22 0 9-12-5-7-8-8-13-2ZM65 20c-13 10-8 22 3 15 10 7 21-3 8-14-5-6-8-6-11-1Z"/><ellipse cx="13" cy="43" rx="4" ry="6" transform="rotate(-25 13 43)"/><ellipse cx="26" cy="35" rx="4" ry="6"/><ellipse cx="40" cy="40" rx="4" ry="6" transform="rotate(20 40 40)"/><ellipse cx="54" cy="14" rx="4" ry="6"/><ellipse cx="66" cy="7" rx="4" ry="5"/><ellipse cx="81" cy="12" rx="4" ry="6"/>',
 heart:'<path d="M48 61C39 51 7 35 15 18 22 2 41 8 48 22 55 5 76 5 82 20 88 38 58 55 48 61Z"/><path d="m10 47-6 5m77-44 7-5"/>',
 arrow:'<path d="M9 54C13 18 49 8 57 29S32 63 34 40 66 34 84 18M67 18l18-3-1 19"/>',
 flower:'<path d="M46 31C19 1 58-6 55 24 81-5 96 31 66 36 98 54 67 76 55 50 52 83 20 67 38 45 2 56 3 18 35 31Z"/><path d="M45 30c-14 5-3 21 7 14s2-18-7-14Z"/>',
 book:'<path d="M47 23Q28 9 9 16l3 41q19-7 36 6 17-14 37-8l3-40Q67 9 47 23v40M20 27l17 6m-16 6 15 5m21-12 18-6m-17 18 16-6"/>',
 cat:'<path d="m19 27-2-20 21 13q12-5 23 0L81 6l-2 25q12 29-28 32C8 65 6 41 19 27Z"/><path d="m32 35 1 2m28-2 1 2m-18 7 7 1-4 4-3-5m3 5q-5 8-10 1m10-1q7 8 12-1M23 43 5 39m18 10L6 53m65-10 20-4M71 50l20 5"/>',
 rays:'<path d="m45 36-7-26m19 27 8-27M30 43 10 28m54 18 22-17M25 55 5 54m63 4 23 3"/>',
 circle:'<path d="M77 17C48-3 12 13 11 39s48 34 68 11S71 4 43 12M20 54Q7 66 22 65"/>',
 sparkle:'<path d="m12 44 13 5 7-14 6 17 15-7 5 14 22-6M14 13l5 8m-10 1 11-3m54-8 1 13m-6-7 12 2"/>'
};
function svg(kind){const content=Object.prototype.hasOwnProperty.call(art,kind)?art[kind]:null;return content?`<svg viewBox="0 0 96 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`:'';}
window.AhakoPopUI=Object.freeze({html,marksFor,adjust,svg,doodles:Object.keys(art)});
})();
