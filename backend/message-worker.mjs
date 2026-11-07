// Ejecutar en un servidor Node 22+. Nunca en GitHub Pages ni en el navegador.
const env=process.env;
for(const k of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','WHATSAPP_TOKEN','WHATSAPP_PHONE_ID','META_GRAPH_VERSION'])if(!env[k])throw Error('Falta '+k);
async function api(path,method='POST',body){const r=await fetch(env.SUPABASE_URL+path,{method,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Supabase '+r.status);return r.status===204?null:r.json()}
async function tick(){const entry=await api('/rest/v1/rpc/claim_message','POST',{});if(!entry)return false;const {job,campaign}=entry;let result;
try{
 const state=await api('/rest/v1/campaigns?id=eq.'+campaign.id+'&select=cancelled','GET');if(state[0]?.cancelled){await api('/rest/v1/message_queue?id=eq.'+job.id,'PATCH',{status:'cancelado'});return true}
 const components=[];
 if(campaign.image)components.push({type:'header',parameters:[{type:'image',image:{link:campaign.image}}]});
 // La plantilla aprobada debe tener un parámetro de texto {{1}} en el cuerpo.
 components.push({type:'body',parameters:[{type:'text',text:campaign.message}]});
 const r=await fetch('https://graph.facebook.com/'+env.META_GRAPH_VERSION+'/'+env.WHATSAPP_PHONE_ID+'/messages',{method:'POST',headers:{Authorization:'Bearer '+env.WHATSAPP_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:job.phone.replace('+',''),type:'template',template:{name:campaign.template,language:{code:campaign.language},components}}),signal:AbortSignal.timeout(30000)});
 const data=await r.json();result=r.ok?{status:'enviado',provider_id:data.messages?.[0]?.id}:{status:'fallido',error:String(data.error?.code||r.status)};
}catch{result={status:'incierto',error:'Sin confirmación del proveedor. No reintentar sin comprobar entrega.'}}
// Si falla esta actualización, permanece procesando y pasa a incierto; jamás se reenvía solo.
await api('/rest/v1/message_queue?id=eq.'+job.id,'PATCH',result);return true}
let stopping=false;process.on('SIGTERM',()=>{stopping=true});process.on('SIGINT',()=>{stopping=true});
while(!stopping){try{await tick()}catch{console.error('Error del worker; revisar conexión sin exponer tokens.')}await new Promise(r=>setTimeout(r,2000))}
