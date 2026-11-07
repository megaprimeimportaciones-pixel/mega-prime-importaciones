(()=>{
 if(!document.getElementById('login'))return;
 if(MP_CONFIG.url&&MP_CONFIG.anonKey&&!MP_CONFIG.previewOnly)return;
 const info=document.createElement('section');info.id='supabaseConnection';
 info.innerHTML='<h2>Conectar el administrador a Supabase</h2><p id="connectionStatus"></p><details><summary>Configurar URL y clave pública</summary><p>Obtén estos dos datos en Connect, dentro de tu proyecto Supabase. No pegues contraseñas ni claves secretas.</p><label>Project URL<input id="connectionURL" type="url" placeholder="https://PROYECTO.supabase.co"></label><label>Clave pública Publishable o anon<input id="connectionKey" autocomplete="off" spellcheck="false"></label><button type="button" id="saveConnection">Guardar conexión en esta PC</button><button type="button" id="exportConnection">Descargar config.js para el proyecto</button></details><p>Este formulario se utiliza solo para configurar una conexión que aún falta. Si el proyecto ya está instalado, no repitas la instalación de la base ni la creación de cuentas.</p>';
 $('login').before(info);$('connectionStatus').textContent=MP_CONFIG.previewOnly||!MP_CONFIG.url?'El administrador todavía no está conectado. El servidor de vista previa no acepta inicios de sesión.':'Conexión configurada: '+new URL(MP_CONFIG.url).hostname;
 $('connectionURL').value=MP_CONFIG.previewOnly?'':MP_CONFIG.url;$('connectionKey').value=MP_CONFIG.previewOnly?'':MP_CONFIG.anonKey;
 const read=()=>MP_validateConnection($('connectionURL').value,$('connectionKey').value);
 $('saveConnection').onclick=run(()=>{localStorage.setItem('mp_public_connection',JSON.stringify(read()));MP.store(null);location.reload()});
 $('exportConnection').onclick=run(()=>{const c=read();download('config.js','window.MP_CONFIG = '+JSON.stringify({...MP_CONFIG,...c,previewOnly:false,siteUrl:new URL('.',location.href).href.replace(/\/$/,'')},null,2)+';\n','application/javascript')});
 if(MP_CONFIG.previewOnly){for(const b of $('loginForm').querySelectorAll('button'))b.disabled=true;$('password').disabled=true;say('Primero conecta Supabase. La contraseña no se ha enviado ni comprobado en una cuenta real.')}
 window.addEventListener('mp:draft-changed',()=>{info.hidden=!$('workspace').hidden});
})();
