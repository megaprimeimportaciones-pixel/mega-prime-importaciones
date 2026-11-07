// Avisos de consultas: servidor privado con plantilla aprobada de WhatsApp Business.
const e=process.env;
for(const k of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','WHATSAPP_TOKEN','WHATSAPP_PHONE_ID','META_GRAPH_VERSION','WHATSAPP_NOTIFY_TEMPLATE'])if(!e[k])throw Error('Falta '+k);
async function db(path,method='POST',body){const r=await fetch(e.SUPABASE_URL+'/rest/v1/'+path,{method,headers:{apikey:e.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+e.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('No se pudo acceder a la cola');return r.status===204?null:r.json()}
async function tick(){const entry=await db('rpc/claim_chat_notification','POST',{});if(!entry)return;const {job,inquiry}=entry;let result;
 try{
  const allowed=await db('notification_targets?user_id=eq.'+job.user_id+'&enabled=eq.true&phone=eq.'+encodeURIComponent(job.phone),'GET');const members=await db('members?id=eq.'+job.user_id+'&active=eq.true','GET');
  if(!allowed.length||!members.length||(members[0].role!=='owner'&&members[0].permissions?.manage_inbox===false)){await db('chat_notifications?id=eq.'+job.id,'PATCH',{status:'cancelado'});return}
  const conversation=(inquiry.transcript||[]).map(x=>(x.role==='user'?'Cliente: ':'Asistente: ')+x.text).join(' | ');
  const text=('Nueva consulta · '+inquiry.name+' · '+inquiry.contact+' · '+inquiry.question+' · '+conversation).replace(/[\r\n\t]+/g,' ').slice(0,1000);
  const r=await fetch('https://graph.facebook.com/'+e.META_GRAPH_VERSION+'/'+e.WHATSAPP_PHONE_ID+'/messages',{method:'POST',headers:{Authorization:'Bearer '+e.WHATSAPP_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:job.phone.slice(1),type:'template',template:{name:e.WHATSAPP_NOTIFY_TEMPLATE,language:{code:e.WHATSAPP_NOTIFY_LANGUAGE||'es'},components:[{type:'body',parameters:[{type:'text',text}]}]}}),signal:AbortSignal.timeout(25000)});
  const data=await r.json();result=r.ok?{status:'enviado',provider_id:data.messages?.[0]?.id}:{status:'fallido',error:String(data.error?.code||r.status)};
 }catch{result={status:'incierto',error:'Sin confirmación del proveedor; no reenviar sin comprobar'}}
 await db('chat_notifications?id=eq.'+job.id,'PATCH',result);
}
let stop=false;process.on('SIGTERM',()=>stop=true);process.on('SIGINT',()=>stop=true);
while(!stop){try{await tick()}catch{console.error('Revisar el servicio de avisos del chatbot')}await new Promise(r=>setTimeout(r,2000))}
