/* Lazy dedicated worker. Terminate on dialog close to release the tokenizer. */
importScripts('./vendor/kuromoji/kuromoji.js','./auto-ruby-engine.js?v=2');
let ready;
function load(){
 if(!ready)ready=Promise.all([
  new Promise((resolve,reject)=>kuromoji.builder({dicPath:'./vendor/kuromoji/dict/'}).build((err,t)=>err?reject(err):resolve(t))),
  fetch('./vendor/kanji-grades.json').then(r=>{if(!r.ok)throw Error('学年別漢字表を読み込めません');return r.json();}),
  fetch('./vendor/difficult-words.json').then(r=>{if(!r.ok)throw Error('難読語辞書を読み込めません');return r.json();})
 ]).catch(e=>{ready=null;throw e});return ready;
}
self.onmessage=async({data})=>{
 const {id}=data;
 try{
  self.postMessage({id,type:'progress',label:'辞書を読み込んでいます（初回は時間がかかります）…'});
  const [tokenizer,grades,difficult]=await load();
  const result=SceneAutoRuby.plan(data.scenes,data.settings,data.dictionary,tokenizer,grades,difficult,(done,total)=>self.postMessage({id,type:'progress',label:`本文を解析しています ${done}/${total}`}));
  self.postMessage({id,type:'result',result});
 }catch(e){self.postMessage({id,type:'error',message:String(e?.message||e)});}
};
