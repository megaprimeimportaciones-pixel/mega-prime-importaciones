(()=>{
 const workspace=document.getElementById('workspace');if(!workspace)return;
 const tab=document.createElement('section');tab.className='tab';tab.id='calculatorTab';tab.hidden=true;const title=document.createElement('h1');title.textContent='Calculadora interna de materiales';const info=document.createElement('p');info.textContent='Herramienta para el equipo autorizado. Confirma las medidas y fichas técnicas antes de usar los resultados.';tab.append(title,info);workspace.append(tab);let frame;
 const content=()=>{document.querySelectorAll('#workspace .tab').forEach(t=>t.hidden=t.id!=='contentTab')};
 const buttonNode=button('▦ Calculadora interna',()=>{if(!window.MP_can?.('use_calculator')){say('No tienes permiso para usar la calculadora interna.');return}document.querySelectorAll('#workspace .tab').forEach(t=>t.hidden=t!==tab);if(!frame){frame=document.createElement('iframe');frame.title='Calculadora interna de materiales';frame.src='index.html?tool=calculator';frame.style.height='85vh';tab.append(frame)}});buttonNode.dataset.permission='use_calculator';buttonNode.hidden=!window.MP_can?.('use_calculator');document.querySelector('#workspace nav').append(buttonNode);const syncAccess=()=>{const allowed=!!window.MP_can?.('use_calculator');buttonNode.hidden=!allowed;if(!allowed){const wasOpen=!!frame||!tab.hidden;if(frame){frame.remove();frame=null}tab.hidden=true;if(wasOpen)content()}};window.addEventListener('mp:permissions',syncAccess);window.addEventListener('mp:draft-changed',syncAccess);syncAccess();
 const settingsTab=document.createElement('section');
 settingsTab.className='tab';settingsTab.id='calculatorSettingsTab';settingsTab.hidden=true;
 workspace.append(settingsTab);
 let settingsFrame;
 window.mpiCalculadoraSesion=async()=>{
  if(!MP_can('manage_visibility')||!MP.session)return null;
  const role=await MP.request('/rest/v1/rpc/staff_role',{method:'POST',body:{}});
  return role==='owner'?MP.session?.access_token||null:null;
 };
 const settingsButton=button('Administrar calculadora',()=>{
  if(!MP_can('manage_visibility'))return;
  document.querySelectorAll('#workspace .tab').forEach(section=>section.hidden=section!==settingsTab);
  if(!settingsFrame){
   settingsFrame=document.createElement('iframe');
   settingsFrame.title='Administrar calculadora de materiales';
   settingsFrame.src='calculadora-mpi/Calculadora_Mega_Prime_Unificada.html?web&admin&v=2';
   settingsFrame.style.cssText='width:100%;height:85vh';
   settingsTab.append(settingsFrame);
  }
 });
 settingsButton.dataset.permission='manage_visibility';
 document.querySelector('#workspace nav').append(settingsButton);
 const syncSettings=()=>{
  const allowed=!!MP_can('manage_visibility');
  settingsButton.hidden=!allowed;
  if(!allowed&&settingsFrame){settingsFrame.remove();settingsFrame=null;if(!settingsTab.hidden)content()}
 };
 syncSettings();
 window.addEventListener('mp:permissions',syncSettings);
 window.addEventListener('mp:draft-changed',syncSettings);
 window.addEventListener('mp:session-locked',()=>{settingsFrame?.remove();settingsFrame=null;settingsTab.hidden=true});
 window.addEventListener('mp:session-locked',()=>{if(frame){frame.remove();frame=null}});
 window.addEventListener('message',e=>{if(e.origin===location.origin&&frame&&e.source===frame.contentWindow&&e.data?.type==='mp:close-calculator'){content();frame.remove();frame=null}});
})();

(()=>{
 const nav=document.querySelector('#workspace nav');
 if(!nav)return;
 const tabs=new Set();
 let authorizedAccount=null,pendingAccount=null;
 const candidate=()=>window.MP_can?.('manage_visibility')?MP.session?.user?.id:null;
 const isAdmin=()=>!!authorizedAccount&&authorizedAccount===candidate();
 const control=button('calculadora preliquidación',()=>{
  if(!isAdmin())return;
  const tab=window.open('preliquidacion.html?desde=panel','_blank');
  if(!tab){say('Permite las ventanas emergentes para abrir la calculadora.');return}
  for(const previous of tabs)if(previous.closed)tabs.delete(previous);
  tabs.add(tab);
 });
 control.hidden=true;
 nav.append(control);

 const settings=document.createElement('section');
 settings.id='preliquidationAccessTab';
 settings.className='tab';
 settings.hidden=true;
 settings.innerHTML=`
  <h1>Acceso a la calculadora</h1>
  <p><a href="preliquidacion.html" target="_blank" rel="noopener">Abrir el ingreso directo ↗</a></p>
  <form hidden style="max-width:30rem">
   <label>Correo de ingreso<input name="email" type="email" maxlength="190" autocomplete="username" required></label>
   <label>Contraseña de la calculadora<input name="password" type="password" minlength="16" maxlength="128" autocomplete="new-password" required></label>
   <label>Confirmar contraseña<input name="confirmation" type="password" minlength="16" maxlength="128" autocomplete="new-password" required></label>
   <small>Usa al menos 16 caracteres. La recuperación llegará al correo de ingreso.</small><br>
   <button type="submit">Guardar acceso</button>
  </form>
  <p data-access-status role="status" aria-live="polite"></p>`;
 document.getElementById('workspace').append(settings);
 const form=settings.querySelector('form');
 const note=settings.querySelector('[data-access-status]');
 const email=form.elements.namedItem('email');
 const password=form.elements.namedItem('password');
 const confirmation=form.elements.namedItem('confirmation');
 const save=form.querySelector('button');
 const endpoint='/functions/v1/preliquidacion-access';
 let accountEmail=null;
 const settingsButton=button('Crear contraseña calculadora',async()=>{
  if(!isAdmin())return;
  document.querySelectorAll('#workspace .tab').forEach(section=>section.hidden=section!==settings);
  password.value=confirmation.value='';
  form.hidden=true;
  note.textContent='Cargando acceso…';
  try{
   const data=await manage({action:'status'});
   if(isAdmin())showAccount(data.email);
  }catch(error){note.textContent=error.message}
 });
 settingsButton.hidden=true;
 nav.append(settingsButton);
 nav.addEventListener('click',event=>{
  const clicked=event.target.closest('button');
  if(clicked&&clicked!==settingsButton)password.value=confirmation.value='';
 });
 function manage(body){return MP.request(endpoint,{method:'POST',body})}
 function showAccount(address,message=''){
  accountEmail=address||null;
  email.readOnly=!!accountEmail;
  email.value=MP.preliquidationDisplayEmail(accountEmail||MP.session?.user?.email||'');
  save.textContent=accountEmail?'Guardar nueva contraseña':'Guardar acceso';
  note.textContent=message||(accountEmail?'Acceso activo. Usa el correo mostrado para ingresar.':'');
  form.hidden=false;
 }
 form.onsubmit=async event=>{
  event.preventDefault();
  if(!isAdmin()||save.disabled)return;
  if(password.value!==confirmation.value){note.textContent='Las contraseñas deben coincidir.';return}
  const address=accountEmail||MP.preliquidationAuthEmail(email.value);
  const action=accountEmail?'password':'create';
  const body={action,email:address,password:password.value,confirmation:confirmation.value};
  save.disabled=true;
  note.textContent=action==='create'?'Guardando acceso…':'Guardando contraseña…';
  try{
   const data=await manage(body);
   if(data?.ok!==true||data.email!==address)throw Error('No se pudo confirmar que se guardó.');
   if(isAdmin()){
    password.value=confirmation.value='';
    showAccount(data.email,action==='create'?'Acceso guardado. Ya puedes ingresar desde cualquier navegador.':'Contraseña guardada. Ya puedes ingresar con la nueva clave.');
   }
  }catch(error){
   if(!isAdmin())return;
   if(action==='create'){
    const saved=await manage({action:'status'}).catch(()=>null);
    if(isAdmin()&&saved?.email===address){
     showAccount(saved.email,'El acceso ya existe. Pulsa Guardar nueva contraseña para confirmar la clave.');
     return;
    }
   }
   if(isAdmin())note.textContent=error.message||'No se pudo guardar el acceso.';
  }
  finally{save.disabled=false}
 };

 function stop(){
  authorizedAccount=pendingAccount=null;
  control.hidden=settingsButton.hidden=true;
  if(!settings.hidden){
   settings.hidden=true;
   document.getElementById('contentTab').hidden=false;
  }
  form.reset();
  form.hidden=true;
  for(const tab of tabs)if(!tab.closed)tab.postMessage({type:'mp:preliq-panel-ended'},location.origin);
  tabs.clear();
 }
 async function sync(){
  const account=candidate();
  if(!account){stop();return}
  if(pendingAccount===account)return;
  if(authorizedAccount&&authorizedAccount!==account)stop();
  pendingAccount=account;
  try{
   const allowed=await MP.request('/rest/v1/rpc/preliquidation_owner_access',{method:'POST',body:{}});
   if(account!==candidate()||pendingAccount!==account)return;
   if(allowed!==true){stop();return}
   authorizedAccount=account;
   control.hidden=settingsButton.hidden=false;
  }catch{}finally{if(pendingAccount===account)pendingAccount=null}
 }
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||!tabs.has(event.source)||event.data?.type!=='mp:preliq-panel-session'||!event.ports[0])return;
  const session=isAdmin()?MP.session:null;
  event.ports[0].postMessage(session?{
   access_token:session.access_token,user:{id:session.user.id,email:session.user.email}
  }:null);
 });
 window.addEventListener('mp:permissions',sync);
 window.addEventListener('mp:draft-changed',sync);
 window.addEventListener('mp:session-locked',stop);
 sync();
})();

