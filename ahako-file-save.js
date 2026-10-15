/* Shared local export flow. Only a committed native write is called complete. */
(function(global){
  'use strict';
  let busy=false,dialog=null,phase='idle',pending=null;
  const $=key=>dialog.querySelector(`[data-${key}]`);
  function ensureDialog(){
    if(dialog)return;
    dialog=document.createElement('dialog');
    dialog.className='ahako-file-save-dialog';
    dialog.style.cssText='width:min(440px,calc(100vw - 32px));max-height:calc(100dvh - 32px);overflow:auto;box-sizing:border-box;border:1px solid #ddd9cf;border-radius:24px;padding:28px;background:#fbfaf5;color:#26221e;box-shadow:0 20px 70px #0003';
    dialog.innerHTML='<small data-kind style="letter-spacing:.15em"></small><h2 data-title style="margin:12px 0">作品を保存しています</h2><p data-name style="overflow-wrap:anywhere"></p><progress data-progress max="100" value="0" style="width:100%;height:16px;accent-color:#26221e" aria-label="書き出しの進捗"></progress><p data-phase role="status" aria-live="polite"></p><p data-note style="font-size:13px;line-height:1.7"></p><button data-share type="button" hidden>共有・ファイルへ保存</button><button data-download type="button" hidden>ダウンロード</button><button data-close type="button" hidden>閉じる</button>';
    ['share','download','close'].forEach(key=>$(key).style.cssText='width:100%;min-height:48px;margin-top:8px;border:0;border-radius:14px;background:#26221e;color:white;font:inherit;cursor:pointer');
    $('close').onclick=()=>{if(phase==='working')return;pending=null;busy=false;phase='idle';dialog.close();};
    dialog.addEventListener('cancel',e=>{if(phase==='working'){e.preventDefault();return;}pending=null;busy=false;phase='idle';});
    $('share').onclick=async()=>{
      if(!pending||phase!=='ready')return;
      const item=pending;phase='working';$('share').disabled=true;$('download').hidden=true;$('close').hidden=true;
      try{
        await navigator.share({files:[item.file],title:item.name});
        pending=null;busy=false;phase='done';
        finish('共有先へファイルを渡しました','ファイルアプリなど、選んだ共有先で保存を確認してください。','共有先へ渡しました');
      }catch(error){
        phase='ready';$('download').hidden=false;$('close').hidden=false;
        $('note').textContent=error?.name==='AbortError'?'保存先を選び直せます。':'共有メニューを開けませんでした。ダウンロードを選べます。';
      }finally{$('share').disabled=false;}
    };
    $('download').onclick=()=>{if(!pending||phase!=='ready')return;const item=pending;pending=null;download(item.blob,item.name);busy=false;phase='done';finishDownload();};
    document.body.appendChild(dialog);
  }
  function progress(value,label){$('progress').value=Math.max(0,Math.min(100,Number(value)||0));$('phase').textContent=label||'';}
  function finish(title,note,label){$('title').textContent=title;$('note').textContent=note;$('phase').textContent=label;$('share').hidden=true;$('download').hidden=true;$('close').hidden=false;$('close').textContent='閉じる';}
  function download(blob,name){
    const data=/\.scene$/i.test(name)?new Blob([blob],{type:'application/octet-stream'}):blob;
    const url=URL.createObjectURL(data),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),120000);
  }
  function finishDownload(){finish('ダウンロードを開始しました','ダウンロード履歴やファイルアプリで保存完了を確認してからタブを閉じてください。この方式では保存完了をあ箱から確認できません。','ブラウザーにファイルを渡しました');}
  async function writeFile(handle,blob){
    const writable=await handle.createWritable();
    try{
      for(let offset=0;offset<blob.size;offset+=1024*1024){
        const end=Math.min(blob.size,offset+1024*1024);await writable.write(blob.slice(offset,end));
        progress(75+Math.floor(24*end/Math.max(1,blob.size)),`保存先へ書き込んでいます ${(end/1048576).toFixed(1)} / ${(blob.size/1048576).toFixed(1)} MB`);
      }
      progress(99,'保存を確定しています…');await writable.close();
    }catch(error){try{await writable.abort();}catch(_){}throw error;}
  }
  async function save({name,kind='SCENE',build}){
    if(busy)return {status:'busy'};
    busy=true;phase='working';pending=null;
    ensureDialog();$('kind').textContent=kind;$('name').textContent=name;$('title').textContent='作品を保存しています';
    $('note').textContent='保存完了と表示されるまで、このタブを閉じないでください。';
    ['share','download','close'].forEach(key=>$(key).hidden=true);progress(0,'保存先を選んでいます…');
    // Invoke before any await/build so the native picker retains user activation.
    let picker=null;
    if(typeof global.showSaveFilePicker==='function'){
      try{picker=global.showSaveFilePicker({suggestedName:name,types:[{description:'あ箱 Scene package',accept:{'application/octet-stream':['.scene']}}]});}
      catch(error){if(error?.name==='AbortError'){busy=false;phase='idle';if(dialog.open)dialog.close();return {status:'cancelled'};}}
    }
    if(!dialog.open)dialog.showModal();
    try{
      const handle=picker?await picker:null;
      progress(2,'作品データを準備しています…');
      await new Promise(resolve=>setTimeout(resolve,0));
      const result=await build((value,label)=>progress(Math.min(75,value),label));
      const blob=result instanceof Blob?result:result?.blob;
      if(!(blob instanceof Blob))throw new Error('保存するファイルを生成できませんでした。');
      if(handle){
        await writeFile(handle,blob);busy=false;phase='done';progress(100,'保存完了');
        finish('保存完了','このタブを閉じても大丈夫です。選んだ保存先への書き込みが完了しました。','保存完了');return {status:'saved',result};
      }
      const file=typeof File==='function'?new File([blob],name,{type:'application/octet-stream'}):null;
      if(file&&/iPhone|iPad|iPod/i.test(navigator.userAgent)&&navigator.canShare?.({files:[file]})&&typeof navigator.share==='function'){
        pending={blob,file,name};phase='ready';progress(75,'ファイルの準備ができました');
        $('title').textContent='保存先を選んでください';$('note').textContent='「共有・ファイルへ保存」から保存先を選んでください。まだ保存は完了していません。';
        ['share','download','close'].forEach(key=>$(key).hidden=false);$('close').textContent='キャンセル';
        return {status:'ready',result};
      }
      download(blob,name);busy=false;phase='done';finishDownload();return {status:'download',result};
    }catch(error){
      busy=false;phase='done';
      if(error?.name==='AbortError'){dialog.close();phase='idle';return {status:'cancelled'};}
      finish('保存できませんでした','保存は完了していません。もう一度書き出してください。',String(error?.message||error));throw error;
    }
  }
  global.addEventListener('beforeunload',event=>{if(!busy)return;event.preventDefault();event.returnValue='';});
  global.AhakoFileSave={save,get busy(){return busy;}};
})(window);
