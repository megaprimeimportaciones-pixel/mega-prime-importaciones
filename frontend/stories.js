(()=>{
 let items=[],index=0,dialog,body,status;
 const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e};
 async function load(){try{items=(await MP.table('posts','?published=eq.true&order=pinned.desc,created_at.desc&limit=40')).filter(p=>!p.expires_at||Date.parse(p.expires_at)>Date.now())}catch{items=[]}const badge=document.querySelector('.mp-story-count');if(badge)badge.textContent=items.length?String(items.length):'+';document.querySelector('.mp-story-circle')?.classList.toggle('has-stories',items.length>0)}
 function show(){
  body.replaceChildren();status.textContent=items.length?(index+1)+' / '+items.length:'';
  if(!items.length){body.append(make('h2','Estados de Mega Prime Importaciones'),make('p','Aquí aparecerán las fotos, videos y novedades que publique nuestro equipo.'));const a=make('a','Ingresar para publicar un estado','btn');a.href='panel.html?entry=editor&section=posts';body.append(a);return}
  const p=items[index];body.append(make('h2',p.title));
  if(p.media&&/^https:\/\//.test(p.media)){const media=make(p.kind==='video'?'video':'img',undefined,'mp-story-media');media.src=p.media;if(p.kind==='video'){media.controls=true;media.playsInline=true;media.preload='metadata'}else media.alt=p.title;body.append(media)}
  if(p.external_url&&/^https:\/\//.test(p.external_url)){const external=make('div');MP_SOCIAL?.renderEmbed(external,p.external_url);const a=make('a','Ver publicación original ↗','btn');a.href=p.external_url;a.target='_blank';a.rel='noopener noreferrer';body.append(external,a)}
  body.append(make('p',p.body));
 }
 function createDialog(){if(dialog)return;dialog=make('dialog',undefined,'mp-stories-dialog');dialog.setAttribute('aria-label','Visor de estados');const top=make('div',undefined,'mp-stories-top');status=make('span');const close=make('button','×');close.setAttribute('aria-label','Cerrar estados');close.onclick=()=>dialog.close();top.append(status,close);body=make('div',undefined,'mp-stories-body');const nav=make('div',undefined,'mp-stories-nav');for(const [text,step]of [['← Anterior',-1],['Siguiente →',1]]){const b=make('button',text);b.onclick=()=>{if(items.length){index=(index+step+items.length)%items.length;show()}};nav.append(b)}dialog.append(top,body,nav);dialog.addEventListener('close',()=>{for(const v of dialog.querySelectorAll('video'))v.pause()});document.body.append(dialog)}
 function mount(){
  document.getElementById('mp-home-stories')?.remove();const c=window.MPI_CMS_ACTIVE||MPI_CMS_DEFAULTS;if(c.updates?.showStories===false)return;
  const target=document.querySelector('#inicio .hero-copy')||document.querySelector('#inicio');if(!target)return;
  const row=make('div',undefined,'mp-home-stories');row.id='mp-home-stories';const button=make('button',undefined,'mp-story-circle');button.setAttribute('aria-label','Ver estados, fotos y videos');
  const logo=make('img');logo.src='mpi_emblema_leon_cubierta.webp';logo.alt='';const badge=make('span','+','mp-story-count');button.append(logo,badge);button.onclick=async()=>{createDialog();await load();index=0;show();dialog.showModal()};
  const text=make('div');text.append(make('strong',c.updates?.storyLabel||'Nuestros estados'),make('small',c.updates?.storySubtitle||'Fotos, videos y novedades'));row.append(button,text);const heading=target.querySelector('h1');heading?heading.before(row):target.prepend(row);load();
 }
 if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',mount);else mount();window.addEventListener('mpi:cms-updated',mount);setInterval(load,45000);
 if(document.getElementById('postsTab')){
  const panel=make('section');panel.append(make('h2','Subir foto o video para un estado'),make('p','Selecciona el archivo, súbelo y completa el título, la duración y la opción Publicar.'));
  const input=make('input');input.type='file';input.accept='image/jpeg,image/png,image/webp,video/mp4,video/webm';input.setAttribute('aria-label','Archivo para el estado');const preview=make('div');const upload=make('button','Subir foto o video');upload.type='button';upload.onclick=run(async()=>{const file=input.files[0];if(!file)throw Error('Selecciona una foto o un video');upload.disabled=true;try{const url=await MP.upload(file);$('postMedia').value=url;$('postKind').value=file.type.startsWith('video/')?'video':'image';const media=make(file.type.startsWith('video/')?'video':'img');media.src=url;if(media.tagName==='VIDEO')media.controls=true;preview.replaceChildren(media);say('Archivo subido. Completa el estado y pulsa Guardar publicación.')}finally{upload.disabled=false}});panel.append(input,upload,preview);$('postsTab').insertBefore(panel,$('postTitle'));
  let opened=false;window.addEventListener('mp:draft-changed',()=>{if(!opened&&new URLSearchParams(location.search).get('section')==='posts'&&!$('workspace').hidden){opened=true;document.querySelector('[data-tab="postsTab"]').click()}});
 }
})();
