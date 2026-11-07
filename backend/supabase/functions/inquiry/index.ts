import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
Deno.serve(async req=>{
 const origin=Deno.env.get('SITE_URL')!;
 const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json'};
 if(req.method==='OPTIONS')return new Response(null,{headers});
 try{
  if(req.method!=='POST'||req.headers.get('origin')!==origin)throw Error('Origen no permitido');
  const b=await req.json();if(!b.consent||![b.name,b.contact,b.question].every(x=>typeof x==='string'&&x.trim())||b.name.length>190||b.contact.length>190||b.question.length>2000)throw Error('Datos inválidos');
  const transcript=b.transcript??[];if(!Array.isArray(transcript)||transcript.length>40||JSON.stringify(transcript).length>32000||transcript.some(x=>!x||!['user','assistant'].includes(x.role)||typeof x.text!=='string'||x.text.length>2000))throw Error('Conversación inválida');
  const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:Deno.env.get('TURNSTILE_SECRET_KEY')!,response:String(b.token||'')})}).then(r=>r.json());
  if(!verification.success||verification.hostname!==new URL(origin).hostname)throw Error('Verificación antispam inválida');
  const service=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const {error}=await service.from('inquiries').insert({name:b.name.trim(),contact:b.contact.trim(),question:b.question.trim(),consent:true,transcript});if(error)throw Error('No se pudo registrar');
  return new Response(JSON.stringify({ok:true}),{headers});
 }catch(e){return new Response(JSON.stringify({error:e instanceof Error?e.message:'Error'}),{status:400,headers})}
});
