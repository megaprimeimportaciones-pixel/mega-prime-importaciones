import {createClient} from 'npm:@supabase/supabase-js@2.49.8';
Deno.serve(async req=>{
 const origin=Deno.env.get('SITE_URL')!;
 const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json'};
 if(req.method==='OPTIONS')return new Response(null,{headers});
 try{
  if(req.method!=='POST'||req.headers.get('origin')!==origin)throw Error('Origen no permitido');
  const b=await req.json();if(!b.consent||![b.name,b.contact,b.question].every(x=>typeof x==='string'&&x.trim())||b.name.length>190||b.contact.length>190||b.question.length>2000)throw Error('Datos inválidos');
  const transcript=b.transcript??[];if(!Array.isArray(transcript)||transcript.length>40||JSON.stringify(transcript).length>32000||transcript.some(x=>!x||!['user','assistant'].includes(x.role)||typeof x.text!=='string'||x.text.length>2000))throw Error('Conversación inválida');
  const kind=b.kind==='cotizacion'?'cotizacion':'chat';let quote=null;
  if(kind==='cotizacion'){
   const q=b.quote;if(!q||!Array.isArray(q.items)||q.items.length<1||q.items.length>100)throw Error('Cotización inválida');
   if(q.items.some((i:any)=>!i||typeof i.name!=='string'||!i.name.trim()||i.name.length>200||!Number.isFinite(i.quantity)||i.quantity<=0||i.quantity>1000000))throw Error('Revisa los productos y cantidades');
   quote={project:String(q.project||'').slice(0,190),client:String(q.client||'').slice(0,190),paper:['A4','A5','A3','LETTER','LEGAL'].includes(q.paper)?q.paper:'A4',items:q.items.map((i:any)=>({name:i.name,quantity:i.quantity,unit:String(i.unit||'').slice(0,20),details:String(i.details||'').slice(0,1000)}))};if(JSON.stringify(quote).length>50000)throw Error('La cotización es demasiado extensa');
  }
  const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:Deno.env.get('TURNSTILE_SECRET_KEY')!,response:String(b.token||'')})}).then(r=>r.json());
  if(!verification.success||verification.hostname!==new URL(origin).hostname)throw Error('Verificación antispam inválida');
  const service=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const {error}=await service.from('inquiries').insert({name:b.name.trim(),contact:b.contact.trim(),question:b.question.trim(),consent:true,transcript,kind,quote});if(error)throw Error('No se pudo registrar');
  return new Response(JSON.stringify({ok:true}),{headers});
 }catch(e){return new Response(JSON.stringify({error:e instanceof Error?e.message:'Error'}),{status:400,headers})}
});
