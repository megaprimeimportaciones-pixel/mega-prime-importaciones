/* Cliente REST: credenciales de sesión en sessionStorage, nunca en el repositorio. */
window.MP = (()=>{
 const cfg=window.MP_CONFIG, key='mp_session_v1';
 let closing=false;let session=null;try{session=JSON.parse(sessionStorage.getItem(key)||'null')}catch{sessionStorage.removeItem(key)}
 async function request(path,{method='GET',body,auth=true,headers={}}={}){
  if(!cfg.url||!cfg.anonKey)throw Error('Configura frontend/config.js con URL y clave pública de Supabase.');
  const authorization=auth&&session?{Authorization:'Bearer '+session.access_token}:cfg.anonKey.startsWith('eyJ')?{Authorization:'Bearer '+cfg.anonKey}:{};
  const r=await fetch(cfg.url+path,{method,cache:'no-store',headers:{apikey:cfg.anonKey,...authorization,...(body instanceof Blob?{}:{'Content-Type':'application/json'}),...headers},body:body===undefined?undefined:body instanceof Blob?body:JSON.stringify(body)});
  const data=await r.text(); let v;try{v=JSON.parse(data)}catch{v=data}
  if(!r.ok){const detail=v?.message||v?.error_description||v?.error||'Error '+r.status;
   if(path.startsWith('/auth/v1/token')&&v?.error_code==='invalid_credentials')throw Error('Usuario o contraseña incorrectos');
   throw Error(detail);
  }
  return v;
 }
 function store(s){if(closing&&s)return;session=s; s?sessionStorage.setItem(key,JSON.stringify(s)):sessionStorage.removeItem(key)}
 function endSession(){const previous=session;closing=true;store(null);if(!previous)return Promise.resolve();return fetch(cfg.url+'/auth/v1/logout?scope=local',{method:'POST',keepalive:true,headers:{apikey:cfg.anonKey,Authorization:'Bearer '+previous.access_token}}).then(()=>undefined).catch(()=>undefined)}
 return {request,endSession,acceptRecovery(s){closing=false;store(s)},get session(){return session},store,
  async login(email,password){closing=false;const s=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:email.trim().toLowerCase(),password},auth:false});store(s);return s},
  async refresh(){if(!session||closing)return;const previous=session;const s=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:previous.refresh_token},auth:false});if(session===previous&&!closing)store(s)},
  async logout(){const pending=endSession();location.reload();await pending},
  async recovery(email){return request('/auth/v1/recover?redirect_to='+encodeURIComponent(cfg.siteUrl+'/panel.html'),{method:'POST',body:{email},auth:false})},
  async table(name,query=''){return request('/rest/v1/'+name+query)},
  async insert(name,body){return request('/rest/v1/'+name,{method:'POST',body,headers:{Prefer:'return=representation'}})},
  async update(name,id,body){return request('/rest/v1/'+name+'?id=eq.'+encodeURIComponent(id),{method:'PATCH',body})},
  async remove(name,id){return request('/rest/v1/'+name+'?id=eq.'+encodeURIComponent(id),{method:'DELETE'})},
  async manage(body){return request('/functions/v1/manage-users',{method:'POST',body})},
  async upload(file){if(!['image/jpeg','image/png','image/webp','video/mp4','video/webm','audio/mpeg','audio/mp4','audio/ogg','audio/wav'].includes(file.type)||file.size>52428800)throw Error('Admite JPG, PNG, WEBP, MP4, WEBM o audio MP3, M4A, OGG, WAV hasta 50 MB.');const path=session.user.id+'/'+crypto.randomUUID()+'.'+({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm','audio/mpeg':'mp3','audio/mp4':'m4a','audio/ogg':'ogg','audio/wav':'wav'}[file.type]);await request('/storage/v1/object/media/'+path,{method:'POST',body:file,headers:{'Content-Type':file.type}});return cfg.url+'/storage/v1/object/public/media/'+path}
 };
})();
