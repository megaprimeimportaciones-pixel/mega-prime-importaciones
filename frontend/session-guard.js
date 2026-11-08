// La sesión vive en esta pestaña: minimizar o cambiar de aplicación no la cierra.
(()=>{
 if(!document.getElementById('login'))return;
 function clearForm(){const p=document.getElementById('password');if(p){p.value='';p.type='password'}}
 function lock(){const pending=MP.endSession();document.getElementById('workspace').hidden=true;document.getElementById('login').hidden=false;document.getElementById('headerLogout').hidden=true;window.dispatchEvent(new Event('mp:session-locked'));for(const key of ['mp_draft','mp_draft_restore'])sessionStorage.removeItem(key);clearForm();return pending}
 // sessionStorage mantiene el acceso al recargar y se elimina al cerrar la pestaña.
 // No revocar en pagehide: también se dispara al recargar y al navegar.
 clearForm();window.addEventListener('pageshow',clearForm);
 window.MP_lockPanel=lock;
})();
