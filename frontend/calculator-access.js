// Herramienta interna: verifica cuenta y permiso activo antes de abrir la interfaz.
(()=>{
 if(new URLSearchParams(location.search).get('tool')!=='calculator')return;
 const status=document.createElement('section');status.id='mp-tool-status';status.setAttribute('role','status');status.textContent='Verificando acceso a la calculadora…';document.body.append(status);
 const deny=text=>{window.MP_CALC_ALLOWED=false;document.documentElement.classList.remove('mp-tool-authorized');document.getElementById('calcModal')?.classList.remove('open');status.hidden=false;status.textContent=text;const a=document.createElement('a');a.href='panel.html';a.textContent=' Volver al administrador';status.append(a)};
 let checking=false;
 async function authorize(first=false){if(checking)return;checking=true;try{try{const saved=JSON.parse(sessionStorage.getItem('mp_session_v1')||'null');if(saved)MP.store(saved)}catch{}if(!MP.session)throw Error('Inicia sesión en el panel para usar la calculadora.');await MP.request('/auth/v1/user');const role=await MP.request('/rest/v1/rpc/staff_role',{method:'POST',body:{}});if(!['owner','editor'].includes(role))throw Error('Tu cuenta no tiene permiso activo para esta herramienta.');const wasAllowed=window.MP_CALC_ALLOWED===true;window.MP_CALC_ALLOWED=true;document.documentElement.classList.add('mp-tool-authorized');status.hidden=true;if(first||!wasAllowed)openCalculator();}catch(e){deny(e.message)}finally{checking=false}}
 const close=document.querySelector('#calcModal button[onclick*="closeModal"]');if(close)close.onclick=()=>{window.MP_CALC_ALLOWED=false;document.documentElement.classList.remove('mp-tool-authorized');document.getElementById('calcModal').classList.remove('open');if(window.parent!==window)window.parent.postMessage({type:'mp:close-calculator'},location.origin);else location.href='panel.html'};
 authorize(true);setInterval(()=>authorize(false),30000);
})();
