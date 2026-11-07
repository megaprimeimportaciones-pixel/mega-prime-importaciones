(()=>{
 window.MP_validateConnection=(url,key)=>{
  const u=new URL(url.trim());if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co')||u.username||u.password||u.pathname!=='/')throw Error('Usa la Project URL de Supabase: https://PROYECTO.supabase.co');
  key=key.trim();let valid=/^sb_publishable_[A-Za-z0-9_-]+$/.test(key);
  if(key.startsWith('eyJ')){try{valid=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role==='anon'}catch{}}
  if(!valid)throw Error('Solo se permite la clave pública Publishable o anon. Nunca una clave secret/service_role.');return {url:u.origin,anonKey:key};
 };
 try{const saved=JSON.parse(localStorage.getItem('mp_public_connection')||'null');if(saved&&(!MP_CONFIG.url||MP_CONFIG.previewOnly)&&['localhost','127.0.0.1'].includes(location.hostname)){Object.assign(MP_CONFIG,MP_validateConnection(saved.url,saved.anonKey),{previewOnly:false,siteUrl:location.origin})}}catch{}
})();
