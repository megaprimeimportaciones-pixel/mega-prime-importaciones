// Adaptación del catálogo existente a la fuente compartida Supabase.
(()=>{
 const native=window.fetch.bind(window);
 window.fetch=async(input,options)=>{
  if(typeof input==='string'&&/^(\.\/)?api\/site\.php(?:\?|$)/.test(input)){
   try{const data=await MP.request('/rest/v1/rpc/public_content',{method:'POST',body:{},auth:false});if(!data)throw Error('Publicación inicial pendiente');return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}})}catch(e){if(window.MP_CONFIG.allowInitialPreview&&['localhost','127.0.0.1'].includes(location.hostname)&&window.MPI_CMS_DEFAULTS)return new Response(JSON.stringify({config:MPI_CMS_DEFAULTS,revision:0}),{status:200,headers:{'Content-Type':'application/json'}});return new Response(JSON.stringify({error:e.message}),{status:503})}
  }
  return native(input,options);
 };
 if(location.pathname.endsWith('catalogo-digital.html'))window.addEventListener('DOMContentLoaded',()=>{
  let revision=-1,busy=false;
  async function synchronize(){if(busy)return;busy=true;try{const data=await MP.request('/rest/v1/rpc/public_content',{method:'POST',body:{},auth:false});if(!data?.config||data.revision===revision)return;const c=data.config,categories=(c.categories||[]).filter(v=>v.visible!==false),allowed=new Set(categories.map(v=>v.name));const products=(c.products||[]).filter(p=>p.published!==false&&allowed.has(p.category)).map(p=>{const v=p.presets?.[0]||{};return {...p,img:p.image,desc:[p.subtitle,p.description].filter(Boolean).join(' — '),line1:[v.format,v.width&&'Ancho: '+v.width,v.length&&'Largo: '+v.length,v.thickness&&'Espesor: '+v.thickness].filter(Boolean).join(' · '),line2:[v.label,v.model,v.unit].filter(Boolean).join(' · ')}});window.MP_PUBLIC_CATALOG=c;window.dispatchEvent(new MessageEvent('message',{data:{type:'MPI_CATALOG_SYNC',products,categories,printConfig:c.catalogPrint||{},branding:c.branding||{},colorPalette:c.catalogColors||{}}}));revision=data.revision}catch{}finally{busy=false}}
  synchronize();setInterval(()=>{if(document.visibilityState!=='hidden')synchronize()},45000);window.addEventListener('focus',synchronize);window.addEventListener('storage',e=>{if(['mp_catalog_published','mp_visibility_published'].includes(e.key))synchronize()});
 });
})();
