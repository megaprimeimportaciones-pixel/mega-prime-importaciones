(()=>{
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(!('IntersectionObserver'in window)||motion.matches)return;
 document.documentElement.classList.add('mp-effects-enabled');
 const observer=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;e.target.classList.add('mp-is-visible');observer.unobserve(e.target)}},{threshold:.08,rootMargin:'0px 0px -18px 0px'});
 const sections=[['#inicio','hero'],['.benefits','benefits'],['#categorias','categories'],['#calculadora','calculator'],['#catalogo','catalog'],['#experiencia','experience'],['#distribuidores','distributors'],['#resenas','reviews'],['#empresa','company'],['#indicadores','indicators'],['#proveedor','supplier'],['#informacion-tecnica','technical'],['#ubicacion','location'],['#contacto','contact'],['#novedades','updates'],['.social-zone','social'],['.corp-footer','footer']];
 function attach(){
  const config=window.MPI_CMS_ACTIVE||window.MPI_CMS_DEFAULTS;
  if(config?.design?.effectsEnabled===false){document.documentElement.classList.remove('mp-effects-enabled');return}
  document.documentElement.classList.add('mp-effects-enabled');
  document.documentElement.style.setProperty('--mp-motion-duration',Math.min(1600,Math.max(200,Number(config?.design?.motionDuration)||850))+'ms');
  for(const [selector,effect]of sections){const node=document.querySelector(selector);if(!node)continue;node.dataset.mpEffect=effect;node.classList.add('mp-effect');if(!node.classList.contains('mp-is-visible'))observer.observe(node)}
 }
 if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
 window.addEventListener('mpi:cms-updated',attach);
 motion.addEventListener('change',()=>{if(motion.matches){observer.disconnect();document.documentElement.classList.remove('mp-effects-enabled')}});
})();
