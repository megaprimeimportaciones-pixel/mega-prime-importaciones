// Galerías de registros guardados; seleccionar no publica ni vuelve a subir archivos.
(()=>{
 const make=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n};
 const safe=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}};
 window.MP_mediaState=(row,isStory,now=Date.now())=>!row.published?'Borrador':isStory&&row.expires_at&&Date.parse(row.expires_at)<=now?'Vencido':isStory?'Estado actual · Publicado':'Video activo · Permanente';
 window.MP_renderMediaGallery=({host,rows,story=false,edit,remove,refresh})=>{
  const tab=document.getElementById(story?'postsTab':'videosTab');if(!tab)return;if(story){const oldHeading=document.getElementById('savedStatesHeading');if(oldHeading)oldHeading.hidden=true;}
  let panel=document.getElementById(story?'savedStoriesGallery':'savedVideosGallery');
  if(!panel){panel=make('div');panel.id=story?'savedStoriesGallery':'savedVideosGallery';panel.className='mp-saved-media-panel';const anchor=tab.querySelector('.mp-media-editor-layout')||(story?tab.querySelector('section'):document.getElementById('videoTitle')?.closest('label'));if(anchor)anchor.before(panel);else tab.prepend(panel)}
  const heading=make('h2',story?'Estados actuales y guardados':'Videos activos y permanentes'),summary=make('p');
  const active=rows.filter(r=>r.published&&(!story||!r.expires_at||Date.parse(r.expires_at)>Date.now())).length;
  summary.textContent=active+' '+(story?'estados actuales':'videos publicados')+' · '+rows.filter(r=>!r.published).length+' borradores'+(story?' · '+rows.filter(r=>r.published&&r.expires_at&&Date.parse(r.expires_at)<=Date.now()).length+' vencidos':'')+(story?'':' en esta página');
  const help=make('p','Pulsa una miniatura o «Abrir y editar» para cargar el archivo, el título y el texto en la vista previa y el editor.');
  const reload=make('button','Actualizar galería');reload.type='button';reload.onclick=refresh;
  panel.replaceChildren(heading,summary,help,reload,host);host.className='mp-saved-media-grid';host.replaceChildren();
  if(!rows.length){host.append(make('p',story?'Todavía no hay estados guardados.':'Todavía no hay videos guardados.'));return}
  for(const row of rows){
   const card=make('article');card.className='mp-saved-media-card';card.dataset.mediaId=row.id;
   const open=make('button');open.type='button';open.className='mp-saved-media-open';open.setAttribute('aria-label','Abrir y editar '+row.title);
   const thumb=make('div');thumb.className='mp-saved-media-thumbnail';const value=safe(story?row.media:row.url),poster=safe(row.poster),video=story?row.kind==='video':true;
   if(poster||value&&row.source!=='external'){const media=make(poster||!video?'img':'video');media.src=poster||value;if(media.tagName==='VIDEO'){media.muted=true;media.playsInline=true;media.preload='metadata';media.tabIndex=-1}else{media.alt='';media.loading='lazy'}media.addEventListener('error',()=>{thumb.replaceChildren(make('span',video?'▶ Video guardado':'Imagen guardada'))});thumb.append(media)}else thumb.append(make('span',row.source==='external'?'↗ Video externo':'Sin archivo multimedia'));
   if(video)thumb.append(make('span','▶'));
   open.append(thumb,make('strong',row.title));
   const state=make('p',MP_mediaState(row,story));state.className='mp-saved-media-state';
   const select=()=>{for(const node of host.children)node.classList.remove('mp-media-selected');card.classList.add('mp-media-selected');edit(row);const editor=tab.querySelector('.mp-media-editor-layout');editor?.scrollIntoView({behavior:'smooth',block:'start'})};
   open.onclick=select;const editButton=make('button','Abrir y editar');editButton.type='button';editButton.onclick=select;
   const deleteButton=make('button',story?'Eliminar estado':'Eliminar video');deleteButton.type='button';deleteButton.onclick=()=>remove(row);
   card.append(open,state,make('p',story?row.body:row.description));if(story&&row.expires_at)card.append(make('p','Vencimiento: '+new Date(row.expires_at).toLocaleString('es-EC')));card.append(editButton,deleteButton);host.append(card);
  }
 };
})();
