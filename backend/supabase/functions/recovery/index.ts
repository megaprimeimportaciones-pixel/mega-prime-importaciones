import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
const service=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const hash=async(t:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))).map(n=>n.toString(16).padStart(2,'0')).join('');
async function mail(email:string,subject:string,text:string){const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+Deno.env.get('RESEND_API_KEY'),'Content-Type':'application/json'},body:JSON.stringify({from:Deno.env.get('RECOVERY_FROM'),to:email,subject,text})});if(!r.ok)throw Error('Correo no disponible');}
Deno.serve(async req=>{
 const origin=Deno.env.get('SITE_URL')!,headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
 if(req.method==='OPTIONS')return new Response(null,{headers});
 const check=(r:any)=>{if(r.error)throw r.error;return r.data};
 try{
  if(req.method!=='POST'||req.headers.get('origin')!==origin)throw Error('Solicitud no permitida');
  const b=await req.json();
  if(b.action==='set'){
   const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
   const {data:{user},error}=await service.auth.getUser(token);if(error||!user)throw Error('Inicia sesión');
   const scoped=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:'Bearer '+token}}});if(check(await scoped.rpc('staff_role'))!=='owner')throw Error('Solo el administrador puede gestionar su recuperación');
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)||b.email.length>190||b.email===user.email)throw Error('Correo alternativo inválido');
   const {count}=await service.from('recovery_challenges').select('id',{head:true,count:'exact'}).eq('user_id',user.id).gt('created_at',new Date(Date.now()-3600000).toISOString());if((count||0)>=3)throw Error('Espera una hora antes de solicitar otro enlace');
   const raw=crypto.randomUUID()+crypto.randomUUID();check(await service.from('recovery_contacts').upsert({user_id:user.id,email:b.email,verified:false}));
   check(await service.from('recovery_challenges').insert({user_id:user.id,email:b.email,token_hash:await hash(raw),purpose:'verify',expires_at:new Date(Date.now()+900000).toISOString()}));
   await mail(b.email,'Confirma tu correo alternativo · Mega Prime Importaciones',(Deno.env.get('SITE_BASE_URL')||origin).replace(/\/$/,'')+'/panel.html#recovery_token='+encodeURIComponent(raw)+'&purpose=verify');
   await mail(user.email!,'Configuración de recuperación · Mega Prime Importaciones','Se solicitó añadir un correo alternativo. Si no reconoces esta acción, cambia tu contraseña y avisa al propietario.');
  }else if(b.action==='request'){
   const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:Deno.env.get('TURNSTILE_SECRET_KEY')!,response:String(b.captcha||'')})}).then(r=>r.json());if(!verification.success||verification.hostname!==new URL(origin).hostname)throw Error('Verificación antispam inválida');
   const {data:m}=await service.from('members').select('id').eq('email',String(b.email).trim().toLowerCase()).eq('active',true).eq('role','owner').maybeSingle();
   if(m){const {data:contact}=await service.from('recovery_contacts').select('*').eq('user_id',m.id).eq('verified',true).maybeSingle();if(contact){const {count}=await service.from('recovery_challenges').select('id',{head:true,count:'exact'}).eq('user_id',m.id).gt('created_at',new Date(Date.now()-3600000).toISOString());if((count||0)<3){const raw=crypto.randomUUID()+crypto.randomUUID();check(await service.from('recovery_challenges').insert({user_id:m.id,email:contact.email,purpose:'reset',token_hash:await hash(raw),expires_at:new Date(Date.now()+900000).toISOString()}));await mail(contact.email,'Recupera tu acceso · Mega Prime Importaciones',(Deno.env.get('SITE_BASE_URL')||origin).replace(/\/$/,'')+'/panel.html#recovery_token='+encodeURIComponent(raw)+'&purpose=reset')}}}
  }else if(b.action==='verify'||b.action==='reset'){
   if(typeof b.token!=='string'||b.token.length>100)throw Error('Token inválido');
   if(b.action==='reset'&&(typeof b.password!=='string'||b.password.length<16||b.password.length>128))throw Error('Contraseña de 16 a 128 caracteres');
   // Verificar finalidad antes de consumir, después consumir de forma atómica.
   const h=await hash(b.token),pending=check(await service.from('recovery_challenges').select('purpose').eq('token_hash',h).single());
   if((b.action==='verify'?'verify':'reset')!==pending.purpose)throw Error('Finalidad inválida');
   const challenge=check(await service.rpc('consume_recovery',{hash:h}));
   if(b.action==='verify'){
    check(await service.from('recovery_contacts').update({verified:true}).eq('user_id',challenge.user_id).eq('email',challenge.email));
   }else{
    const contact=check(await service.from('recovery_contacts').select('*').eq('user_id',challenge.user_id).eq('email',challenge.email).eq('verified',true).single());
    const member=check(await service.from('members').select('active,role').eq('id',challenge.user_id).single());if(!member.active||member.role!=='owner')throw Error('Solicita al administrador que cambie tu contraseña');
    check(await service.auth.admin.updateUserById(challenge.user_id,{password:b.password}));
    check(await service.from('members').update({revoked_before:new Date().toISOString()}).eq('id',challenge.user_id));
    const user=check(await service.auth.admin.getUserById(challenge.user_id)).user;
    for(const email of new Set([user.email,contact.email]))await mail(email,'Contraseña actualizada · Mega Prime Importaciones','Tu contraseña fue actualizada mediante recuperación. Se bloquearon las sesiones anteriores. Si no reconoces el cambio, contacta al propietario.');
   }
  }else throw Error('Operación inválida');
  return new Response(JSON.stringify({ok:true,message:'Si corresponde, se enviará un enlace temporal al correo registrado.'}),{headers});
 }catch(e){return new Response(JSON.stringify({error:e instanceof Error?e.message:'No se pudo completar'}),{status:400,headers})}
});
