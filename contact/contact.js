(()=>{
'use strict';
const API='https://scene-studio-api.a-hako.workers.dev';
const form=document.getElementById('contactForm'),submit=document.getElementById('contactSubmit'),status=document.getElementById('contactStatus');
function setStatus(text,type=''){status.textContent=text;status.className=`contact-status${type?` is-${type}`:''}`;}
form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  submit.disabled=true;submit.textContent='送信しています…';setStatus('');
  const payload={name:document.getElementById('contactName').value.trim(),email:document.getElementById('contactEmail').value.trim(),category:document.getElementById('contactCategory').value,subject:document.getElementById('contactSubject').value.trim(),message:document.getElementById('contactMessage').value.trim(),website:document.getElementById('contactWebsite').value,pageUrl:document.referrer&&/^https?:/i.test(document.referrer)?document.referrer:location.href};
  try{
    const response=await fetch(`${API}/contact`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.ok)throw new Error(data.error||`HTTP ${response.status}`);
    form.reset();setStatus('送信しました。内容を確認後、返信先メールアドレスへご連絡します。','success');
  }catch(error){setStatus('送信できませんでした。通信環境を確認して、もう一度お試しください。','error');}
  finally{submit.disabled=false;submit.textContent='送信する';}
});
})();
