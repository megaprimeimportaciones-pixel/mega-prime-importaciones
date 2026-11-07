import { createClient } from 'npm:@supabase/supabase-js@2.49.8';
const url=Deno.env.get('SUPABASE_URL')!, secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const origin=Deno.env.get('SITE_URL')!;
const siteBase=(Deno.env.get('SITE_BASE_URL')||origin).replace(/\/$/,'');
const service=createClient(url,secret,{auth:{persistSession:false}});
Deno.serve(async req=>{
 const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
 if(req.method==='OPTIONS')return new Response(null,{headers});
 try{
  if(req.method!=='POST'||req.headers.get('origin')!==origin)throw Error('Solicitud no permitida');
  const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
  const scoped=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false}});
  const {data:{user},error}=await service.auth.getUser(token);if(error||!user)throw Error('Sesión inválida');
  const {data:role,error:roleError}=await scoped.rpc('staff_role');if(roleError||role!=='owner')throw Error('Solo propietario');
  const b=await req.json();let result:unknown={ok:true};
  const check=(r:any)=>{if(r.error)throw r.error;return r.data};
  if(b.action==='invite'){
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))throw Error('Correo inválido');
   const d=check(await service.auth.admin.inviteUserByEmail(b.email,{redirectTo:siteBase+'/panel.html'}));
   check(await service.from('members').insert({id:d.user.id,email:b.email,role:'editor'}));
  }else if(b.action==='sessions'){
   // Lista de sesiones propia de Auth; se expone mediante RPC exclusivo service_role.
   result=check(await service.rpc('owner_sessions'));
  }else if(b.action==='revoke-session'){
   const rows=check(await service.rpc('owner_sessions'));
   const s=rows.find((x:any)=>x.id===b.id);if(!s)throw Error('Sesión inexistente');
   check(await service.from('blocked_sessions').upsert({id:s.id,user_id:s.user_id}));
  }else{
   if(b.id===user.id)throw Error('No puedes bloquear ni borrar al propietario conectado');
   const target=check(await service.from('members').select('*').eq('id',b.id).single());
   if(target.role==='owner')throw Error('La cuenta propietaria solo se recupera desde el entorno privado');
   if(b.action==='update'){
    const changes:any={};
    if(typeof b.active==='boolean'){changes.active=b.active;changes.revoked_before=new Date().toISOString()}
    if(b.email){check(await service.auth.admin.updateUserById(b.id,{email:b.email}));changes.email=b.email}
    check(await service.from('members').update(changes).eq('id',b.id));
   }else if(b.action==='revoke')check(await service.from('members').update({revoked_before:new Date().toISOString()}).eq('id',b.id));
   else if(b.action==='delete')check(await service.auth.admin.deleteUser(b.id));
   else if(b.action==='reset')check(await service.auth.resetPasswordForEmail(target.email,{redirectTo:siteBase+'/panel.html'}));
   else throw Error('Operación inválida');
  }
  return new Response(JSON.stringify(result),{headers});
 }catch(e){console.error('Operación administrativa rechazada');return new Response(JSON.stringify({error:e instanceof Error?e.message:'Error'}),{status:400,headers})}
});
