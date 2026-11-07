// Adaptación del catálogo existente a la fuente compartida Supabase.
(()=>{
 const native=window.fetch.bind(window);
 window.fetch=async(input,options)=>{
  if(typeof input==='string'&&/^(\.\/)?api\/site\.php(?:\?|$)/.test(input)){
   try{const data=await MP.request('/rest/v1/rpc/public_content',{method:'POST',body:{},auth:false});if(!data)throw Error('Publicación inicial pendiente');return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}})}catch(e){if(window.MP_CONFIG.allowInitialPreview&&['localhost','127.0.0.1'].includes(location.hostname)&&window.MPI_CMS_DEFAULTS)return new Response(JSON.stringify({config:MPI_CMS_DEFAULTS,revision:0}),{status:200,headers:{'Content-Type':'application/json'}});return new Response(JSON.stringify({error:e.message}),{status:503})}
  }
  return native(input,options);
 };
 if(location.pathname.endsWith('catalogo-digital.html'))window.addEventListener('DOMContentLoaded',()=>{let revision=-1;setInterval(async()=>{try{const data=await MP.request('/rest/v1/rpc/public_content',{method:'POST',body:{},auth:false});if(!data||data.revision===revision)return;revision=data.revision;const c=data.config,categories=(c.categories||[]).filter(v=>v.visible!==false),allowed=new Set(categories.map(v=>v.name));const products=(c.products||[]).filter(p=>p.published!==false&&allowed.has(p.category)).map(p=>({...p,img:p.image,desc:p.description}));window.dispatchEvent(new MessageEvent('message',{data:{type:'MPI_CATALOG_SYNC',products,categories,printConfig:c.catalogPrint||{}}}))}catch{}},45000)});
})();
