/* Reuse the Bookshelf / Studio account session and existing Worker endpoints. */
(()=>{
 'use strict';
 const SESSION_KEY='ahako-author-session-v1',PENDING_KEY='ahako:bookstore-login-pending:v1';
 const root=document.querySelector('#storeAccountDialog');if(!root)return;
 const header=document.querySelector('.store-account-button'),headerName=document.querySelector('#storeAccountName');
 const profile=root.querySelector('.store-profile'),profileName=profile.querySelector('strong'),profileState=profile.querySelector('div>span');
 const avatars=[header.querySelector('.store-avatar'),profile.querySelector('.store-avatar')];
 const guestIcon=avatars[0].innerHTML;
 profile.insertAdjacentHTML('afterend',`<div class="store-auth" id="storeAuth">
 <p id="storeAuthStatus" class="store-auth-status" role="status" aria-live="polite"></p>
 <div id="storeAuthMember" hidden><p class="store-auth-note">本棚・Studioと共通のあ箱アカウントです。</p><div class="store-auth-buttons"><button type="button" id="storeAuthRefresh">ログイン状態を確認</button><button type="button" id="storeAuthLogout">ログアウト</button></div></div>
 <div id="storeAuthGuest" hidden><p class="store-auth-note">本棚・Studioで使っているメールアドレスでログインできます。</p>
 <form id="storeAuthEmailForm"><label>メールアドレス<input id="storeAuthEmail" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label><label>表示名 <span>初めて登録する方</span><input id="storeAuthName" autocomplete="nickname" maxlength="80" placeholder="本棚・Studioで使う名前"></label><button class="store-auth-primary" type="submit">認証コードを送る</button><p class="store-auth-note">初回は共通アカウントを登録します。<a href="../terms/" target="_blank" rel="noopener">利用規約</a>・<a href="../privacy/" target="_blank" rel="noopener">プライバシーポリシー</a></p></form>
 <form id="storeAuthCodeForm" hidden><p class="store-auth-note" id="storeAuthEmailHint"></p><label>6桁の認証コード<input id="storeAuthCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required placeholder="000000"></label><label id="storeAuthNewNameLabel" hidden>初回登録の表示名<input id="storeAuthNewName" maxlength="80" autocomplete="nickname"></label><button class="store-auth-primary" type="submit">ログインする</button><div class="store-auth-buttons"><button id="storeAuthResend" type="button">コードを再送</button><button id="storeAuthChangeEmail" type="button">メールを変更</button></div></form>
 </div></div>`);
 const $=id=>document.querySelector('#'+id);
 let token='',author=null,state='checking',busy=false,revision=0,pending=null,lastCheck=0;
 function readSession(){try{const row=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');return row&&typeof row.token==='string'&&row.token&&row.author?.authorId?row:null;}catch(_){return null;}}
 function currentToken(){return readSession()?.token||'';}
 function saveSession(value){try{const raw=value?JSON.stringify(value):null;if(raw===null)localStorage.removeItem(SESSION_KEY);else if(localStorage.getItem(SESSION_KEY)!==raw)localStorage.setItem(SESSION_KEY,raw);return true;}catch(_){return false;}}
 function status(message='',error=false){$('storeAuthStatus').textContent=message;$('storeAuthStatus').classList.toggle('is-error',error);}
 function initial(name){try{return [...new Intl.Segmenter('ja',{granularity:'grapheme'}).segment(name)][0]?.segment||'あ';}catch(_){return Array.from(name)[0]||'あ';}}
 function paint(){
   const name=String(author?.displayName||'ゲスト').trim()||'ゲスト';
   headerName.textContent=state==='checking'&&!author?'確認中':name;
   profileName.textContent=name;header.setAttribute('aria-label',`${name}のアカウント`);
   avatars.forEach(el=>{if(author){el.textContent=initial(name);el.classList.add('has-initial');}else{el.innerHTML=guestIcon;el.classList.remove('has-initial');}});
   profileState.textContent=state==='checking'?'ログイン状態を確認中…':state==='verified'?'ログイン中':state==='offline'?'ログイン状態を確認できません':'ログインしていません';
   $('storeAuthMember').hidden=!token;$('storeAuthGuest').hidden=!!token||state==='checking';
   $('storeAuthEmailForm').hidden=!!pending;$('storeAuthCodeForm').hidden=!pending;
   if(pending)$('storeAuthEmailHint').textContent=`${pending.email} に届いたコードを入力してください。`;
   root.querySelectorAll('.store-auth button').forEach(b=>{b.disabled=busy||state==='checking';});
   root.querySelectorAll('.store-auth input').forEach(i=>{i.disabled=busy;});
 }
 async function request(path,{method='GET',body,authToken}={}){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
   try{
     const headers={Accept:'application/json'};if(body)headers['Content-Type']='application/json';if(authToken)headers.Authorization=`Bearer ${authToken}`;
     const r=await fetch(`${API}${path}`,{method,headers,body:body?JSON.stringify(body):undefined,cache:'no-store',signal:controller.signal});
     const data=await r.json().catch(()=>null);
     if(!r.ok||!data?.ok){const e=new Error(data?.error||'通信できませんでした。時間をおいてお試しください。');e.status=r.status;e.code=data?.code;throw e;}
     return data;
   }catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw new Error('通信できませんでした。接続を確認してもう一度お試しください。');throw e;}
   finally{clearTimeout(timer);}
 }
 async function restoreSession(){
   const id=++revision,row=readSession();lastCheck=Date.now();
   token=row?.token||'';author=row?.author||null;state=token?'checking':'guest';status();paint();
   if(!token)return;
   const checkedToken=token;
   try{
     const data=await request('/author-auth/me',{authToken:checkedToken});
     if(id!==revision||currentToken()!==checkedToken)return;
     if(!data.author?.authorId)throw new Error('アカウント情報を確認できませんでした。');
     author=data.author;state='verified';saveSession({token:checkedToken,author});
   }catch(e){
     if(id!==revision||currentToken()!==checkedToken)return;
     if(e.status===401||e.status===403){saveSession(null);token='';author=null;state='guest';status('ログインの有効期限が切れました。もう一度ログインしてください。');}
     else{state='offline';status(e.message,true);}
   }
   paint();
 }
 function savePending(value){pending=value;if(!value){$('storeAuthNewNameLabel').hidden=true;$('storeAuthNewName').required=false;$('storeAuthNewName').value='';}try{if(value)sessionStorage.setItem(PENDING_KEY,JSON.stringify(value));else sessionStorage.removeItem(PENDING_KEY);}catch(_){}paint();}
 async function sendCode(){
   if(busy)return;
   const email=(pending?.email||$('storeAuthEmail').value).trim();
   const displayName=(pending?.displayName||$('storeAuthName').value).trim();
   busy=true;status('認証コードを送信しています…');paint();
   try{const data=await request('/author-auth/request-code',{method:'POST',body:{email}});savePending({email,displayName,expiresAt:Date.now()+Number(data.expiresIn||600)*1000});status('メールに届いた6桁のコードを入力してください。');$('storeAuthCode').value='';}
   catch(e){status(e.message,true);}
   finally{busy=false;paint();if(pending&&root.open)$('storeAuthCode').focus();}
 }
 async function verifyCode(){
   if(busy||!pending)return;
   const code=$('storeAuthCode').value.trim();if(!/^\d{6}$/.test(code)){status('6桁の数字を入力してください。',true);return;}
   const displayName=$('storeAuthNewName').value.trim()||pending.displayName;
   const id=++revision;busy=true;status('認証コードを確認しています…');paint();
   try{
     const data=await request('/author-auth/verify-code',{method:'POST',body:{email:pending.email,displayName,code}});
     if(id!==revision)return;
     if(!data.token||!data.author?.authorId)throw new Error('ログイン情報を確認できませんでした。');
     token=data.token;author=data.author;state='verified';
     const saved=saveSession({token,author});savePending(null);$('storeAuthCode').value='';
     status(saved?'ログインしました。本棚・Studioでも同じアカウントを使えます。':'ログインしましたが、このブラウザに状態を保存できませんでした。',!saved);
   }catch(e){
     if(id!==revision)return;
     if(e.code==='DISPLAY_NAME_REQUIRED'){$('storeAuthNewNameLabel').hidden=false;$('storeAuthNewName').required=true;}
     status(e.code==='DISPLAY_NAME_REQUIRED'?'初めての登録です。表示名を入力して、もう一度ログインを押してください。':e.message,true);
   }finally{busy=false;paint();}
 }
 async function logout(){
   if(busy)return;
   const oldToken=token,id=++revision;busy=true;status('ログアウトしています…');paint();
   let serverError=false;
   try{if(oldToken)await request('/author-auth/logout',{method:'POST',authToken:oldToken});}catch(_){serverError=true;}
   if(id===revision){if(!currentToken()||currentToken()===oldToken)saveSession(null);token='';author=null;state='guest';savePending(null);status(serverError?'この端末からログアウトしました。通信できなかったため、サーバー側のセッション終了は未確認です。':'ログアウトしました。');}
   busy=false;paint();
 }
 $('storeAuthEmailForm').addEventListener('submit',e=>{e.preventDefault();sendCode();});
 $('storeAuthCodeForm').addEventListener('submit',e=>{e.preventDefault();verifyCode();});
 $('storeAuthResend').onclick=sendCode;
 $('storeAuthChangeEmail').onclick=()=>{if(busy)return;const email=pending?.email||'';savePending(null);$('storeAuthEmail').value=email;$('storeAuthCode').value='';status();$('storeAuthEmail').focus();};
 $('storeAuthRefresh').onclick=restoreSession;$('storeAuthLogout').onclick=logout;
 window.addEventListener('storage',e=>{if(e.key===SESSION_KEY||e.key===null)restoreSession();});
 window.addEventListener('focus',()=>{if(!busy&&Date.now()-lastCheck>60000)restoreSession();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!busy&&Date.now()-lastCheck>60000)restoreSession();});
 try{const row=JSON.parse(sessionStorage.getItem(PENDING_KEY)||'null');if(row?.email&&row.expiresAt>Date.now()){pending=row;$('storeAuthEmail').value=row.email;$('storeAuthName').value=row.displayName||'';}else sessionStorage.removeItem(PENDING_KEY);}catch(_){}
 restoreSession();
})();
