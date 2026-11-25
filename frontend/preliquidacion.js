(()=>{
 const $=id=>document.getElementById(id);
 const fromPanel=new URLSearchParams(location.search).get('desde')==='panel';
 const opener=fromPanel?window.opener:null;
 if(fromPanel)sessionStorage.removeItem('mp_session_v1');
 let panelSession,frame,documentUrl,recoveryToken,loading=false,resetting=false,generation=0;
 const status=$('status');
 const directAccess='/rest/v1/rpc/preliquidation_account_access';
 const ownerAccess='/rest/v1/rpc/preliquidation_owner_access';
 const privateFile='/storage/v1/object/authenticated/preliquidacion-privada/calculadora-preliquidacion.html';
 const account=()=>panelSession||MP.session;
 const say=text=>{status.textContent=text;status.hidden=!text};
 const check=path=>MP.request(path,{
  method:'POST',body:{},...(panelSession?{auth:false,headers:{Authorization:'Bearer '+panelSession.access_token}}:{})
 });
 function showForm(name,message=''){
  $('access').hidden=false;
  for(const id of ['login','recovery','reset'])$(id).hidden=id!==name;
  $('retry').hidden=true;
  say(message);
 }
 function clear(){
  ++generation;
  frame?.remove();
  if(documentUrl)URL.revokeObjectURL(documentUrl);
  frame=documentUrl=null;
  panelSession=null;
 }
 async function end(message=''){
  clear();
  resetting=false;
  recoveryToken=null;
  const done=MP.session?MP.endSession():null;
  showForm('login',message);
  await done;
 }
 function askPanel(){
  if(!opener||opener.closed)return Promise.resolve(null);
  return new Promise(resolve=>{
   const {port1,port2}=new MessageChannel();
   const timer=setTimeout(()=>finish(null),2500);
   function finish(session){clearTimeout(timer);port1.close();resolve(session)}
   port1.onmessage=event=>finish(event.data);
   opener.postMessage({type:'mp:preliq-panel-session'},location.origin,[port2]);
  });
 }
 async function activate(){
  if(frame||loading||resetting)return;
  loading=true;
  const request=++generation;
  $('retry').hidden=true;
  say('Abriendo calculadora…');
  try{
   const shared=await askPanel();
   if(request!==generation)return;
   panelSession=shared;
   if(!account()?.user?.id){
    showForm('login',fromPanel?'Ingresa con la cuenta de la calculadora o vuelve a abrirla desde el panel.':'');
    return;
   }
   if(await check(panelSession?ownerAccess:directAccess)!==true){
    if(request===generation)await end('Esta cuenta no tiene acceso a la calculadora.');
    return;
   }
   if(request!==generation)return;
   const user=account().user;
   const html=await MP.request(privateFile,panelSession?{auth:false,headers:{Authorization:'Bearer '+panelSession.access_token}}:{});
   if(request!==generation||account()?.user?.id!==user.id)return;
   if(typeof html!=='string'||!/^<!doctype html>/i.test(html.trimStart())||!/<head\b[^>]*>/i.test(html))throw Error('El archivo de la calculadora no está disponible.');
   const host=JSON.stringify({
    origin:location.origin,url:MP_CONFIG.url,publicKey:MP_CONFIG.anonKey,user:{id:user.id,email:user.email}
   }).replace(/</g,'\\u003c');
   const bootstrap=`<script>
const host=${host};
window.MP_PRELIQ_HOST={
 url:host.url,publishableKey:host.publicKey,user:host.user,
 getAccessToken(){
  return new Promise(resolve=>{
   const {port1,port2}=new MessageChannel();
   const timer=setTimeout(()=>finish(null),6000);
   function finish(token){clearTimeout(timer);port1.close();resolve(token)}
   port1.onmessage=e=>finish(e.data);
   parent.postMessage({type:'mp:preliquidation-token'},host.origin,[port2]);
  });
 },
 signOut(){parent.postMessage({type:'mp:preliquidation-logout'},host.origin)}
};
document.addEventListener('click',e=>{
 const link=e.target.closest?.('a[href^="#"]');
 if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||!link)return;
 const target=document.getElementById(link.getAttribute('href').slice(1));
 if(!target)return;
 e.preventDefault();
 target.scrollIntoView();
});
</script>`;
   frame=document.createElement('iframe');
   frame.title='Calculadora preliquidación';
   frame.setAttribute('sandbox','allow-scripts allow-downloads allow-modals allow-popups allow-popups-to-escape-sandbox');
   frame.referrerPolicy='no-referrer';
   documentUrl=URL.createObjectURL(new Blob([html.replace(/<head\b[^>]*>/i,head=>head+bootstrap)],{type:'text/html'}));
   frame.src=documentUrl;
   $('calculator').append(frame);
   $('access').hidden=true;
   say('');
  }catch(error){
   if(request!==generation)return;
   say(error.message||'No se pudo abrir la calculadora.');
   $('retry').hidden=false;
  }finally{loading=false}
 }
 async function tokenForFrame(){
  if(!panelSession)return MP.session?.access_token||null;
  const shared=await askPanel();
  if(!shared||shared.user?.id!==panelSession?.user.id){
   if(panelSession)void end('La sesión del panel terminó. Vuelve a abrir la calculadora desde el panel.');
   return null;
  }
  panelSession=shared;
  return shared.access_token;
 }
 window.addEventListener('message',async event=>{
  if(opener&&event.source===opener&&event.origin===location.origin&&event.data?.type==='mp:preliq-panel-ended'){
   if(panelSession||loading)void end('Se cerró la sesión del panel.');
   return;
  }
  if(!frame||event.source!==frame.contentWindow||event.origin!=='null')return;
  if(event.data?.type==='mp:preliquidation-token'&&event.ports[0]){
   event.ports[0].postMessage(await tokenForFrame());
  }
  if(event.data?.type==='mp:preliquidation-logout')void end();
 });
 $('retry').onclick=activate;
 $('forgot').onclick=()=>{$('recoveryEmail').value=$('email').value;showForm('recovery')};
 document.querySelector('[data-login]').onclick=()=>showForm('login');
 function submit(form,handler){
  $(form).onsubmit=async event=>{
   event.preventDefault();
   const button=event.currentTarget.querySelector('button[type=submit]');
   button.disabled=true;
   try{await handler()}catch(error){say(error.message||'No se pudo completar la operación.')}
   finally{button.disabled=false}
  };
 }
 submit('login',async()=>{
  const password=$('password').value;
  $('password').value='';
  await MP.login($('email').value,password);
  await activate();
 });
 submit('recovery',async()=>{
  await MP.request('/functions/v1/preliquidacion-access',{
   method:'POST',auth:false,body:{action:'recover',email:$('recoveryEmail').value.trim().toLowerCase()}
  });
  say('Si el correo corresponde a la cuenta de la calculadora, recibirás un enlace de recuperación.');
 });
 submit('reset',async()=>{
  const password=$('newPassword').value,confirmation=$('confirmPassword').value;
  if(password!==confirmation)throw Error('Las contraseñas deben coincidir.');
  if(password.length<16)throw Error('Usa al menos 16 caracteres.');
  $('newPassword').value=$('confirmPassword').value='';
  if(recoveryToken){
   const session=await MP.request('/auth/v1/verify',{
    method:'POST',auth:false,body:{type:'recovery',token_hash:recoveryToken}
   });
   recoveryToken=null;
   if(!session?.user?.id||!session.access_token)throw Error('El enlace ya no está disponible. Solicita otro.');
   MP.acceptRecovery(session);
  }
  if(!resetting||await check(directAccess)!==true)throw Error('El enlace ya no está disponible. Solicita otro.');
  await MP.request('/auth/v1/user',{method:'PUT',body:{password}});
  await MP.request('/auth/v1/logout?scope=global',{method:'POST'}).catch(()=>{});
  await end('Contraseña actualizada. Ya puedes iniciar sesión.');
 });
 async function start(){
  const recovery=new URLSearchParams(location.hash.slice(1));
  if(recovery.has('recovery_token')){
   history.replaceState(null,'',location.pathname+location.search);
   const token=recovery.get('recovery_token');
   if(token&&/^[\w-]{12,180}$/.test(token)){
    recoveryToken=token;
    resetting=true;
    showForm('reset');
   }else showForm('login','Ese enlace no permite recuperar la cuenta. Solicita otro.');
   return;
  }
  if(recovery.has('access_token')||recovery.has('error')){
   history.replaceState(null,'',location.pathname+location.search);
   try{
    if(recovery.get('type')!=='recovery'||!recovery.get('access_token')||!recovery.get('refresh_token'))throw Error();
    const session={access_token:recovery.get('access_token'),refresh_token:recovery.get('refresh_token')};
    MP.acceptRecovery(session);
    session.user=await MP.request('/auth/v1/user');
    MP.store(session);
    if(await check(directAccess)!==true)throw Error();
    resetting=true;
    showForm('reset');
   }catch{await end('Ese enlace no permite recuperar la cuenta de la calculadora. Solicita otro.')}
   return;
  }
  if(MP.session){
   try{await MP.refresh()}catch{await end('La sesión expiró. Vuelve a ingresar.');return}
  }
  await activate();
 }
 window.setInterval(async()=>{
  if(!frame)return;
  try{
   if(panelSession&&!await tokenForFrame())return;
   if(!panelSession)await MP.refresh();
   if(frame&&await check(panelSession?ownerAccess:directAccess)!==true)await end('Tu acceso a la calculadora terminó.');
  }catch(error){
   if(/token|JWT|sesión|refresh|session/i.test(error.message))await end('La sesión expiró. Vuelve a ingresar.');
  }
 },45000);
 void start();
})();
