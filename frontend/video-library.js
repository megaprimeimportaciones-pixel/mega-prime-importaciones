(()=>{
 const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e};
 const url=value=>{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw Error('Usa un enlace HTTPS válido');return u.href};
 function media(container,v){
  if(v.source==='external'){const embedded=make('div');window.MP_SOCIAL?.renderEmbed(embedded,v.url);const a=make('a','Abrir video original ↗','btn');a.href=url(v.url);a.target='_blank';a.rel='noopener noreferrer';container.append(embedded,a)}
  else{const player=make('video');player.src=url(v.url);player.controls=true;player.playsInline=true;player.preload='metadata';if(v.poster)player.poster=url(v.poster);player.setAttribute('aria-label',v.title);container.append(player)}
 }
 let host,grid,more,visibleCount=6,signature='';
 async function refresh(){
  if(!host)return;
  try{const rows=await MP.table('videos','?published=eq.true&order=sort_order.asc,created_at.desc&limit='+(visibleCount+1));const current=JSON.stringify(rows.slice(0,visibleCount));more.hidden=rows.length<=visibleCount;if(current===signature)return;signature=current;grid.replaceChildren();
   if(!rows.length){grid.append(make('p','Aquí encontrarás videos de estructuras, materiales, cargas y novedades de Mega Prime Importaciones.','mp-video-empty'));return}
   for(const v of rows.slice(0,visibleCount)){const card=make('article',undefined,'mp-video-card');media(card,v);card.append(make('h3',v.title),make('p',v.description));grid.append(card)}
  }catch{grid.replaceChildren(make('p','Los videos se mostrarán al conectar la biblioteca compartida.','mp-video-empty'));more.hidden=true}
 }
 function mount(){
  if(!document.getElementById('catalogo'))return;
  const c=window.MPI_CMS_ACTIVE||MPI_CMS_DEFAULTS,a=c.videoLibrary||MPI_CMS_DEFAULTS.videoLibrary;
  host?.remove();host=null;if(a?.visible===false)return;signature='';host=make('section',undefined,'mp-section mp-video-library');host.id='videos';host.append(make('span',a?.eyebrow??'CONOCE NUESTRO TRABAJO','mp-eyebrow'),make('h2',a?.title??'Videos de cargas, estructuras y materiales'),make('p',a?.description??'Explora nuestras novedades en video.'));
  grid=make('div',undefined,'mp-video-grid');more=make('button','Ver más videos','btn');more.onclick=()=>{visibleCount+=6;refresh()};host.append(grid,more);document.getElementById('catalogo').after(host);refresh();
 }
 if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',mount);else mount();window.addEventListener('mpi:cms-updated',mount);setInterval(refresh,45000);
 if(!document.getElementById('workspace'))return;
 const nav=document.querySelector('#workspace nav'),tab=make('section');tab.id='videosTab';tab.className='tab';tab.hidden=true;
 tab.innerHTML='<h1>▶ Videoteca permanente</h1><p>Estos videos aparecen debajo del catálogo y son independientes de los estados temporales. Puedes añadir más, reemplazar, editar y eliminar.</p><p id="videoStatus" role="status" aria-live="polite" style="white-space:pre-wrap"></p><p>Selecciona el archivo y pulsa Guardar video. Máximo 50 MB en MP4 o WEBM. Marca Publicado en la página para hacerlo visible.</p><label>Nombre del video<input id="videoTitle" maxlength="199"></label><label>Descripción<textarea id="videoDescription"></textarea></label><label>Origen<select id="videoSource"><option value="upload">Video MP4/WEBM</option><option value="external">Enlace público de YouTube, TikTok u otra red</option></select></label><label>Archivo de video<input id="videoFile" type="file" accept="video/mp4,video/webm"></label><button type="button" id="videoUpload">Subir / reemplazar archivo</button><label>URL del video<input id="videoURL" type="url"></label><label>Portada HTTPS (opcional)<input id="videoPoster" type="url"></label><label>Orden<input id="videoOrder" type="number" value="0"></label><label><input id="videoPublished" type="checkbox">Publicado en la página</label><button id="videoPreview">Previsualizar</button><button id="videoSave">Guardar video</button><button id="videoNew">Nuevo video</button><div id="videoPreviewArea"></div><div id="videoRows"></div><button id="videosPrevious">← Anterior</button><button id="videosNext">Más videos →</button>';
 $('workspace').append(tab);const entry=button('▶ Videos permanentes',async()=>{document.querySelectorAll('#workspace .tab').forEach(t=>t.hidden=t!==tab);await list()});nav.insertBefore(entry,nav.children[2]);
 let id=null,offset=0,uploadedFile=null;
 const status=(text,error=false)=>{const box=$('videoStatus');box.textContent=text;box.style.color=error?'#ffb4ab':'#f4dba3';say(text)};
 const describe=e=>{const message=e.message||String(e);if(/row.level|policy|permission|unauthorized|jwt|session/i.test(message))return 'Supabase rechazó el acceso. Vuelve a iniciar sesión. Si continúa, revisa el rol activo y las políticas del bucket media. Detalle: '+message;if(/bucket.*not.*found/i.test(message))return 'No se encuentra el bucket media en Supabase Storage. Detalle: '+message;return message};
 const action=fn=>async()=>{if(tab.getAttribute('aria-busy')==='true')return;tab.setAttribute('aria-busy','true');for(const key of ['videoUpload','videoSave','videoPreview','videoNew'])$(key).disabled=true;try{await fn()}catch(e){status(describe(e),true)}finally{tab.setAttribute('aria-busy','false');for(const key of ['videoUpload','videoSave','videoPreview','videoNew'])$(key).disabled=false}};
 async function uploadSelected(){const file=$('videoFile').files[0];if(!file)throw Error('Selecciona primero un archivo MP4 o WEBM.');if(!['video/mp4','video/webm'].includes(file.type))throw Error('El archivo debe ser un video MP4 o WEBM.');if(file.size>52428800)throw Error('El video pesa '+(file.size/1048576).toFixed(1)+' MB. El máximo es 50 MB. Reduce el tamaño antes de subirlo.');if(file===uploadedFile&&$('videoURL').value)return;status('Subiendo '+file.name+' ('+(file.size/1048576).toFixed(1)+' MB). Espera y no cierres esta pestaña…');$('videoURL').value=await MP.upload(file);uploadedFile=file;$('videoSource').value='upload';status('Archivo subido. Pulsa Guardar video para conservar los datos y la publicación.');}
 $('videoFile').onchange=()=>{uploadedFile=null;const f=$('videoFile').files[0];if(f)status('Archivo seleccionado: '+f.name+'. Pulsa Guardar video para subirlo y guardarlo.');};
 const data=()=>{const title=$('videoTitle').value.trim();if(!title)throw Error('Escribe el nombre del video');if(!$('videoURL').value.trim())throw Error('Falta el video: selecciona un archivo o introduce un enlace HTTPS.');return {title,description:$('videoDescription').value,url:url($('videoURL').value),poster:$('videoPoster').value?url($('videoPoster').value):null,source:$('videoSource').value,published:$('videoPublished').checked,sort_order:Number($('videoOrder').value)||0}};
 function clear(){id=null;for(const name of ['videoTitle','videoDescription','videoURL','videoPoster'])$(name).value='';$('videoPublished').checked=true;$('videoFile').value='';uploadedFile=null;$('videoPreviewArea').replaceChildren();window.dispatchEvent(new Event('mp:video-preview'))}
 async function list(){const rows=await MP.table('videos','?order=sort_order.asc,created_at.desc&limit=50&offset='+offset);$('videoRows').replaceChildren();$('videosPrevious').disabled=offset===0;$('videosNext').disabled=rows.length<50;for(const v of rows){const a=card('videoRows',v.title,(v.published?'Publicado':'Borrador')+' · '+v.description);a.append(button('Editar / reemplazar',()=>{id=v.id;$('videoFile').value='';uploadedFile=null;$('videoTitle').value=v.title;$('videoDescription').value=v.description;$('videoURL').value=v.url;$('videoPoster').value=v.poster||'';$('videoSource').value=v.source;$('videoOrder').value=v.sort_order;$('videoPublished').checked=v.published;$('videoPreviewArea').replaceChildren();media($('videoPreviewArea'),v);window.dispatchEvent(new Event('mp:video-preview'))}),button('Eliminar video',async()=>{if(confirm('¿Retirar este video de la biblioteca?')){await MP.remove('videos',v.id);await list()}}))}}
 $('videoUpload').onclick=action(uploadSelected);
 $('videoSave').onclick=action(async()=>{
  if(!$('videoTitle').value.trim())throw Error('Escribe el nombre del video.');
  if($('videoFile').files[0]&&$('videoSource').value==='upload')await uploadSelected();
  const v=data();status('Guardando video en Supabase…');
  if(id)await MP.update('videos',id,v);else{const rows=await MP.insert('videos',v);if(rows?.[0]?.id)id=rows[0].id;}
  status(v.published?'Video guardado y publicado. Aparecerá en la web al recargar o en hasta 45 segundos.':'Video guardado como borrador. Marca Publicado en la página y guarda para mostrarlo.');
  try{await list()}catch(e){status('Video guardado; no se pudo actualizar la lista: '+e.message,true)}
 });
 $('videoPreview').onclick=action(async()=>{if(window.MP_LIVE_PREVIEW){window.dispatchEvent(new Event('mp:video-preview'));status('Vista previa local. Guarda el video para publicarlo.');return}if($('videoFile').files[0]&&$('videoSource').value==='upload')await uploadSelected();$('videoPreviewArea').replaceChildren();media($('videoPreviewArea'),data());status('Vista previa lista. Guarda el video para conservarlo en la biblioteca.');});$('videoNew').onclick=()=>{clear();status('Nuevo video. Completa los datos y selecciona el archivo.');};
 $('videoPublished').checked=true;
 $('videosPrevious').onclick=run(async()=>{offset=Math.max(0,offset-50);await list()});$('videosNext').onclick=run(async()=>{offset+=50;await list()});
})();
