// Vista previa local: no sube archivos ni altera la publicación.
(()=>{
 const get=id=>document.getElementById(id);
 if(!get('workspace'))return;
 window.MP_LIVE_PREVIEW=true;
 const make=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e};
 function mount(options){
  const tab=get(options.tab);if(!tab)return;
  const layout=make('div'),form=make('div'),aside=make('aside');layout.className='mp-media-editor-layout';form.className='mp-media-editor-fields';aside.className='mp-media-editor-preview';aside.setAttribute('aria-label',options.label);
  const first=options.tab==='videosTab'?get('videoTitle').closest('label'):tab.querySelector('section');
  const last=options.tab==='videosTab'?get('videoPreviewArea'):get('cancelPost');
  if(!first||!last)return;
  first.before(layout);let cursor=first;
  while(cursor){const next=cursor.nextSibling;form.append(cursor);if(cursor===last)break;cursor=next}
  layout.append(form,aside);
  const heading=make('h2',options.label),hint=make('p','Vista previa del borrador. Seleccionar un archivo no lo publica.'),card=make('article'),stage=make('div'),title=make('h3'),description=make('p'),state=make('p'),controls=make('div'),note=make('p');
  card.className='mp-media-preview-card';stage.className='mp-media-preview-stage';description.className='mp-media-preview-description';note.setAttribute('role','status');card.append(stage,title,description,state);aside.append(heading,hint,card,controls,note);
  let key='',player=null,audio=null,objectURL=null,audioObjectURL=null,hidden=false;
  const file=()=>get(options.file)?.files?.[0];
  const release=()=>{if(objectURL)URL.revokeObjectURL(objectURL);if(audioObjectURL)URL.revokeObjectURL(audioObjectURL);objectURL=audioObjectURL=null};
  const pause=()=>{player?.pause?.();audio?.pause?.()};
  const button=(text,action)=>{const b=make('button',text);b.type='button';b.onclick=action;controls.append(b);return b};
  const back=button('−5 segundos',()=>seek(-5)),play=button('Reproducir',()=>toggle()),forward=button('+5 segundos',()=>seek(5));
  function seek(delta){if(!player||!Number.isFinite(player.duration))return;player.currentTime=Math.min(player.duration,Math.max(0,player.currentTime+delta))}
  async function toggle(){if(!player)return;try{if(player.paused)await player.play();else player.pause()}catch{note.textContent='El navegador no pudo reproducir este archivo. Comprueba el formato.'}}
  const safe=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}};
  const format=seconds=>Number.isFinite(seconds)?Math.floor(seconds/60)+':'+String(Math.floor(seconds%60)).padStart(2,'0'):'0:00';
  const loadExternal=()=>{const link=safe(get(options.url)?.value);if(!link)return;pause();stage.replaceChildren();window.MP_SOCIAL?.renderEmbed(stage,link)};
  function update(force=false){
   title.textContent=get(options.title)?.value.trim()||'Título de tu publicación';description.textContent=get(options.description)?.value||'';
   const published=!!get(options.published)?.checked;state.textContent=published?'Listo para publicar al guardar':'Borrador: no visible para los visitantes';
   const f=file(),source=get(options.source)?.value,kind=options.kind?get(options.kind)?.value:'video',external=source==='external';
   const value=external?safe(get(options.url)?.value):f?'local:'+f.name+':'+f.size+':'+f.lastModified:safe(get(options.url)?.value);
   const af=options.audioFile?get(options.audioFile)?.files?.[0]:null,av=af?'local:'+af.name+':'+af.size+':'+af.lastModified:safe(get(options.audioURL)?.value);
   const next=JSON.stringify([value,kind,external,av,get(options.poster)?.value]);if(!force&&next===key)return;key=next;pause();release();player=null;audio=null;stage.replaceChildren();note.textContent='';
   back.disabled=play.disabled=forward.disabled=true;
   if(!value){stage.append(make('p','Selecciona una foto o un video, o escribe su enlace, para verlo aquí.'));return}
   if(external){const link=make('a','Abrir video original ↗');link.href=value;link.target='_blank';link.rel='noopener noreferrer';const load=make('button','Cargar vista previa del enlace');load.type='button';load.onclick=loadExternal;stage.append(link,load);return}
   if(f){if(!['video/mp4','video/webm','image/jpeg','image/png','image/webp'].includes(f.type)){stage.append(make('p','Selecciona una imagen JPG, PNG, WEBP o un video MP4/WEBM.'));return}objectURL=URL.createObjectURL(f)}
   const isVideo=f?f.type.startsWith('video/'):kind==='video',m=make(isVideo?'video':'img');m.src=objectURL||value;
   if(isVideo){player=m;m.controls=true;m.playsInline=true;m.preload='metadata';const poster=safe(get(options.poster)?.value);if(poster)m.poster=poster;back.disabled=play.disabled=forward.disabled=false;m.addEventListener('timeupdate',()=>{note.textContent=format(m.currentTime)+' / '+format(m.duration)});m.addEventListener('play',()=>play.textContent='Pausar');m.addEventListener('pause',()=>play.textContent='Reproducir');m.addEventListener('error',()=>note.textContent='No se pudo reproducir el video. Comprueba el enlace y el formato MP4/WEBM.')}else{m.alt=title.textContent;if(av){audio=make('audio');if(af)audioObjectURL=URL.createObjectURL(af);audio.src=audioObjectURL||av;audio.controls=true;audio.preload='metadata'}}
   stage.append(m);if(audio)stage.append(audio);
  }
  for(const id of [options.file,options.title,options.description,options.url,options.source,options.kind,options.poster,options.published,options.audioFile,options.audioURL].filter(Boolean)){get(id)?.addEventListener('input',()=>update());get(id)?.addEventListener('change',()=>update())}
  window.addEventListener(options.event,()=>update(true));window.addEventListener('mp:session-locked',()=>{pause();release();stage.replaceChildren();key=''});window.addEventListener('pagehide',()=>{pause();release();key=''});window.addEventListener('pageshow',()=>update());
  new MutationObserver(()=>{if(tab.hidden){pause();hidden=true}else if(hidden){hidden=false;update()}}).observe(tab,{attributes:true,attributeFilter:['hidden']});
  // Compatibilidad con cambios programáticos de los formularios existentes.
  const timer=setInterval(()=>{if(!tab.hidden&&!get('workspace').hidden)update()},700);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
  update();
 }
 mount({tab:'videosTab',label:'Vista previa del video',file:'videoFile',title:'videoTitle',description:'videoDescription',url:'videoURL',source:'videoSource',poster:'videoPoster',published:'videoPublished',event:'mp:video-preview'});
 mount({tab:'postsTab',label:'Vista previa del estado',file:'statePreviewFile',title:'postTitle',description:'postBody',url:'postMedia',kind:'postKind',published:'postPublished',audioFile:'statePreviewAudioFile',audioURL:'statePreviewAudioURL',event:'mp:state-preview'});
})();
