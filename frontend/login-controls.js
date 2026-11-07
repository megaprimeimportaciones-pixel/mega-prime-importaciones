// Contraseña vacía por defecto; solo se acepta escritura manual o autocompletado autorizado.
(()=>{
 const pass=document.getElementById('password');if(!pass)return;
 const form=document.getElementById('loginForm');let accepted='',pendingInput=false,manual=false;
 const wrap=document.createElement('div');wrap.className='mp-password-control';pass.before(wrap);wrap.append(pass);
 const eye=document.createElement('button');eye.type='button';eye.textContent='◉ Mostrar';eye.setAttribute('aria-label','Mostrar contraseña');eye.setAttribute('aria-pressed','false');eye.onclick=()=>{const visible=pass.type==='password';pass.type=visible?'text':'password';eye.textContent=visible?'◉ Ocultar':'◉ Mostrar';eye.setAttribute('aria-label',visible?'Ocultar contraseña':'Mostrar contraseña');eye.setAttribute('aria-pressed',String(visible));};wrap.append(eye);
 const preference=document.createElement('label'),allow=document.createElement('input');allow.type='checkbox';allow.id='allowBrowserAutofill';preference.append(allow,document.createTextNode(' Usar una contraseña guardada en el navegador solo para esta entrada (opcional)'));form.insertBefore(preference,form.lastElementChild);
 function appearance(){pass.classList.toggle('mp-password-manual',allow.checked||accepted.length>0)}
 function reset(){accepted='';pendingInput=false;manual=false;pass.value='';pass.defaultValue='';pass.removeAttribute('value');pass.type='password';pass.readOnly=true;pass.autocomplete='off';pass.setAttribute('data-lpignore','true');pass.setAttribute('data-1p-ignore','true');allow.checked=false;appearance();eye.textContent='◉ Mostrar';eye.setAttribute('aria-label','Mostrar contraseña');eye.setAttribute('aria-pressed','false')}
 function enforce(){if(!allow.checked&&pass.value!==accepted)pass.value=accepted;appearance()}
 function unlock(e){if(!e.isTrusted||allow.checked)return;enforce();pass.readOnly=false}
 pass.addEventListener('pointerdown',unlock);pass.addEventListener('keydown',unlock);pass.addEventListener('paste',e=>{if(e.isTrusted){unlock(e);pendingInput=true}});pass.addEventListener('compositionstart',unlock);
 pass.addEventListener('beforeinput',e=>{if(allow.checked)return;if(e.isTrusted&&e.inputType&&e.inputType!=='insertReplacementText'){enforce();pendingInput=true}else pendingInput=false});
 pass.addEventListener('input',e=>{if(allow.checked){appearance();return}if(e.isTrusted&&pendingInput){accepted=pass.value;manual=accepted.length>0}pendingInput=false;enforce()});
 pass.addEventListener('change',enforce);pass.addEventListener('blur',()=>{pendingInput=false;enforce()});
 allow.onchange=()=>{if(allow.checked){pass.readOnly=false;pass.autocomplete='current-password';pass.removeAttribute('data-lpignore');pass.removeAttribute('data-1p-ignore');document.getElementById('email').autocomplete='username';appearance()}else{reset();document.getElementById('email').autocomplete='off'}};
 form.addEventListener('submit',e=>{if(!allow.checked&&(!manual||!accepted||pass.value!==accepted)){e.preventDefault();e.stopImmediatePropagation();reset();document.getElementById('message').textContent='Escribe tu contraseña para esta sesión. No se aceptó una contraseña rellenada automáticamente.';pass.focus();return}queueMicrotask(reset)},true);
 reset();setInterval(enforce,100);window.addEventListener('pageshow',reset);window.addEventListener('mp:session-locked',reset);
 document.getElementById('headerLogout').onclick=()=>MP.logout();window.addEventListener('mp:draft-changed',()=>document.getElementById('headerLogout').hidden=document.getElementById('workspace').hidden);
})();
