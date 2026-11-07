// Cada entrada nueva al panel requiere autenticación explícita.
(()=>{
 if(!document.getElementById('login'))return;
 function clearForm(){const p=document.getElementById('password');if(p){p.value='';p.type='password'}const email=document.getElementById('email');if(email)email.value=''}
 function lock(){const pending=MP.endSession();document.getElementById('workspace').hidden=true;document.getElementById('login').hidden=false;document.getElementById('headerLogout').hidden=true;window.dispatchEvent(new Event('mp:session-locked'));for(const key of ['mp_draft','mp_draft_restore'])sessionStorage.removeItem(key);clearForm();return pending}
 // Se ejecuta antes del arranque del panel. Los enlaces de recuperación se procesan después.
 lock();window.addEventListener('pagehide',lock);window.addEventListener('pageshow',e=>{if(e.persisted)lock();else clearForm()});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&MP.session)lock()});
 window.MP_lockPanel=lock;
})();
