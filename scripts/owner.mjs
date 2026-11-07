// Solo terminal privada. No acepta claves ni contraseñas como argumentos.
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,email=process.env.OWNER_EMAIL,password=process.env.OWNER_PASSWORD;
if(!url||!key||!email||!password||password.length<20)throw Error('Configura SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OWNER_EMAIL y OWNER_PASSWORD (20 caracteres o más) en un entorno privado.');
async function api(path,method,body){const r=await fetch(url+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>null);if(!r.ok)throw Error('Operación fallida: '+r.status);return d}
if(process.argv[2]==='create'){
 const u=await api('/auth/v1/admin/users','POST',{email,password,email_confirm:true});
 await api('/rest/v1/members','POST',{id:u.id,email,role:'owner',active:true});
 console.log('Propietario creado. Inicia sesión y publica el contenido inicial.');
}else if(process.argv[2]==='recover'){
 const users=await api('/auth/v1/admin/users?page=1&per_page=1000','GET');
 const u=users.users.find(u=>u.email?.toLowerCase()===email.toLowerCase());if(!u)throw Error('No se encontró la cuenta.');
 await api('/auth/v1/admin/users/'+u.id,'PUT',{password});
 await api('/rest/v1/members?id=eq.'+u.id,'PATCH',{role:'owner',active:true,revoked_before:new Date().toISOString()});
 console.log('Propietario recuperado; sesiones anteriores bloqueadas para datos y archivos.');
}else throw Error('Usa node scripts/owner.mjs create o recover. Verifica la identidad del dueño y el acceso MFA a Supabase antes de recuperar.');
