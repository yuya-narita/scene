(() => {
  'use strict';
  if(globalThis.AhakoDialog)return;
  let queue=Promise.resolve();
  function ensure(){
    let dialog=document.getElementById('ahakoCommonDialog');
    if(dialog)return dialog;
    const style=document.createElement('style');
    style.textContent=`
      .ahako-common-dialog{width:min(92vw,460px);padding:0;border:0;background:transparent;color:#1b1c1f;overflow:visible}
      .ahako-common-dialog::backdrop{background:rgba(15,16,18,.4);backdrop-filter:blur(5px)}
      .ahako-common-dialog__card{display:grid;gap:13px;padding:25px 22px 18px;border:1px solid #e2e3e6;border-radius:22px;background:#fff;box-shadow:0 28px 80px rgba(0,0,0,.22);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
      .ahako-common-dialog__kicker{color:#8f9299;font:850 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.18em}
      .ahako-common-dialog[data-kind="confirm"] .ahako-common-dialog__kicker,.ahako-common-dialog[data-kind="prompt"] .ahako-common-dialog__kicker{color:#795d31}
      .ahako-common-dialog[data-danger="true"] .ahako-common-dialog__kicker{color:#ad3e3e}
      .ahako-common-dialog h2{margin:0;font-size:21px;line-height:1.4}.ahako-common-dialog p{margin:0;color:#6f737b;font-size:12px;line-height:1.75;white-space:pre-line;overflow-wrap:anywhere}
      .ahako-common-dialog__input{display:grid;gap:7px}.ahako-common-dialog__input[hidden]{display:none!important}.ahako-common-dialog__input span{color:#555a62;font-size:10px;font-weight:800}
      .ahako-common-dialog__input input{box-sizing:border-box;width:100%;min-height:49px;padding:0 14px;border:1px solid #d6d9df;border-radius:13px;background:#fff;color:#18191b;font:700 14px/1.2 inherit;outline:none}
      .ahako-common-dialog__input input:focus{border-color:#6962ef;box-shadow:0 0 0 3px rgba(105,98,239,.12)}
      .ahako-common-dialog__actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px}.ahako-common-dialog__actions button{min-height:47px;border-radius:13px;font-size:12px;font-weight:850}
      .ahako-common-dialog__cancel{border:1px solid #dfe1e5;background:#fff;color:#34363a}.ahako-common-dialog__confirm{border:1px solid #191a1c;background:#191a1c;color:#fff}
      .ahako-common-dialog[data-kind="alert"] .ahako-common-dialog__actions{grid-template-columns:1fr}.ahako-common-dialog[data-kind="alert"] .ahako-common-dialog__cancel{display:none}.ahako-common-dialog[data-danger="true"] .ahako-common-dialog__confirm{border-color:#a33;background:#a33}
      @media(max-width:560px){.ahako-common-dialog{width:calc(100vw - 28px)}.ahako-common-dialog__card{padding:23px 18px 16px;border-radius:20px}.ahako-common-dialog__actions{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
    dialog=document.createElement('dialog');
    dialog.id='ahakoCommonDialog';dialog.className='ahako-common-dialog';
    dialog.innerHTML=`<div class="ahako-common-dialog__card"><span class="ahako-common-dialog__kicker"></span><h2></h2><p></p><label class="ahako-common-dialog__input" hidden><span></span><input type="text" autocomplete="off"></label><div class="ahako-common-dialog__actions"><button class="ahako-common-dialog__cancel" type="button"></button><button class="ahako-common-dialog__confirm" type="button"></button></div></div>`;
    document.body.appendChild(dialog);
    return dialog;
  }
  function open({kind='alert',message='',title='',kicker='',confirmLabel='',cancelLabel='',initialValue='',inputLabel='',danger=false}={}){
    const dialog=ensure(),english=document.documentElement.lang?.toLowerCase().startsWith('en');
    const copy={alert:{title:english?'Notice':'お知らせ',kicker:'NOTICE',confirm:english?'OK':'閉じる'},confirm:{title:english?'Please confirm':'確認してください',kicker:'CONFIRM',confirm:english?'Continue':'続ける'},prompt:{title:english?'Enter a value':'入力してください',kicker:'INPUT',confirm:english?'Save':'決定'}}[kind];
    dialog.dataset.kind=kind;dialog.dataset.danger=danger?'true':'false';
    dialog.querySelector('h2').textContent=title||copy.title;dialog.querySelector('.ahako-common-dialog__kicker').textContent=kicker||copy.kicker;dialog.querySelector('p').textContent=String(message||'');
    const wrap=dialog.querySelector('.ahako-common-dialog__input'),input=wrap.querySelector('input'),cancel=dialog.querySelector('.ahako-common-dialog__cancel'),confirm=dialog.querySelector('.ahako-common-dialog__confirm');
    wrap.hidden=kind!=='prompt';wrap.querySelector('span').textContent=inputLabel||(english?'Name':'入力');input.value=String(initialValue||'');cancel.textContent=cancelLabel||(english?'Cancel':'キャンセル');confirm.textContent=confirmLabel||copy.confirm;
    return new Promise(resolve=>{
      let done=false;
      const finish=value=>{if(done)return;done=true;confirm.removeEventListener('click',yes);cancel.removeEventListener('click',no);dialog.removeEventListener('cancel',block);dialog.removeEventListener('click',backdrop);if(dialog.open)dialog.close();resolve(value);};
      const yes=()=>finish(kind==='prompt'?input.value:true),no=()=>finish(kind==='prompt'?null:false),block=e=>e.preventDefault(),backdrop=e=>{if(e.target===dialog)e.preventDefault();};
      confirm.addEventListener('click',yes);cancel.addEventListener('click',no);dialog.addEventListener('cancel',block);dialog.addEventListener('click',backdrop);input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();yes();}};
      dialog.showModal();requestAnimationFrame(()=>kind==='prompt'?input.focus():confirm.focus());
    });
  }
  const run=options=>{const result=queue.then(()=>open(options));queue=result.catch(()=>{});return result;};
  globalThis.AhakoDialog={
    alert:(message,options={})=>run({...options,kind:'alert',message}),
    confirm:(message,options={})=>run({...options,kind:'confirm',message}),
    prompt:(message,initialValue='',options={})=>run({...options,kind:'prompt',message,initialValue})
  };
})();
