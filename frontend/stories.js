(()=>{
 let items=[],index=0,dialog,body,status,player,pauseButton,soundButton,progress,progressTimer;
 const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e};
 async function load(){try{items=(await MP.table('posts','?published=eq.true&order=pinned.desc,created_at.desc&limit=40')).filter(p=>!p.expires_at||Date.parse(p.expires_at)>Date.now())}catch{items=[]}const badge=document.querySelector('.mp-story-count');if(badge)badge.textContent=items.length?String(items.length):'+';document.querySelector('.mp-story-circle')?.classList.toggle('has-stories',items.length>0)}
 function controls(){if(!player)return;pauseButton.textContent=player.paused?'▶ Continuar estados':'Ⅱ Pausar estados';soundButton.hidden=!player.media;soundButton.textContent=player.media?.muted?'🔊 Activar sonido':'Sonido activado'}
 function finish(){dialog.close();document.getElementById('inicio')?.scrollIntoView({behavior:'smooth',block:'start'})}
 function next(){if(index+1>=items.length){finish();return}index++;show()}
 function show(){
  player.stop();body.replaceChildren();status.textContent=items.length?(index+1)+' / '+items.length:'';progress.value=0;
  if(!items.length){body.append(make('h2','Estados de Mega Prime Importaciones'),make('p','Aquí aparecerán las fotos, videos y novedades que publique nuestro equipo.'));pauseButton.hidden=soundButton.hidden=true;return}
  pauseButton.hidden=false;const p=items[index];body.append(make('h2',p.title));let playback=null;
  if(p.media&&p.media.startsWith('https://')){const media=make(p.kind==='video'?'video':'img',undefined,'mp-story-media');media.src=p.media;if(p.kind==='video'){media.controls=true;media.playsInline=true;media.preload='auto';playback=media}else media.alt=p.title;body.append(media)}
  if(p.external_url&&p.external_url.startsWith('https://')){const external=make('div');window.MP_SOCIAL?.renderEmbed(external,p.external_url);const a=make('a','Ver publicación original ↗','btn');a.href=p.external_url;a.target='_blank';a.rel='noopener noreferrer';body.append(external,a)}
  if(p.kind==='image'&&p.audio_url&&p.audio_url.startsWith('https://')){const audio=make('audio');audio.controls=true;audio.preload='auto';audio.src=p.audio_url;audio.setAttribute('aria-label','Audio de este estado');body.append(audio);playback=audio}
  body.append(make('p',p.body));window.MP_storyReactions?.(body,p.id);window.MP_storyComments?.(body,p.id);
  body.onfocusin=e=>{if(['INPUT','TEXTAREA'].includes(e.target.tagName))player.pause()};
  player.start(playback,p.external_url?12000:7000);if(document.hidden)player.pause();
 }
 function createDialog(){if(dialog)return;dialog=make('dialog',undefined,'mp-stories-dialog');dialog.setAttribute('aria-label','Visor de estados');const top=make('div',undefined,'mp-stories-top');status=make('span');const close=make('button','×');close.setAttribute('aria-label','Cerrar estados');close.onclick=()=>dialog.close();top.append(status,close);body=make('div',undefined,'mp-stories-body');progress=make('progress');progress.max=1;progress.setAttribute('aria-label','Avance del estado');const nav=make('div',undefined,'mp-stories-nav');pauseButton=make('button','Ⅱ Pausar estados');soundButton=make('button','Activar sonido');player=new MPStoryPlayback(next,controls);pauseButton.onclick=()=>player.paused?player.resume():player.pause();soundButton.onclick=()=>player.sound();nav.append(pauseButton,soundButton);for(const [text,step]of [['← Anterior',-1],['Siguiente →',1]]){const b=make('button',text);b.onclick=()=>{if(!items.length)return;if(step===1)next();else{index=Math.max(0,index-1);show()}};nav.append(b)}dialog.append(top,progress,body,nav);dialog.addEventListener('close',()=>{player.stop();clearInterval(progressTimer)});document.body.append(dialog)}
 function mount(){
  document.getElementById('mp-home-stories')?.remove();const c=window.MPI_CMS_ACTIVE||MPI_CMS_DEFAULTS;if(c.updates?.showStories===false)return;const target=document.querySelector('#inicio .hero-copy')||document.querySelector('#inicio');if(!target)return;
  const row=make('div',undefined,'mp-home-stories');row.id='mp-home-stories';const button=make('button',undefined,'mp-story-circle');button.setAttribute('aria-label','Ver estados, fotos y videos');const logo=make('img');logo.src=c.branding?.logoEmblem||'mpi_emblema_leon_cubierta.webp';logo.alt='';const badge=make('span','+','mp-story-count');button.append(logo,badge);button.onclick=async()=>{createDialog();await load();index=0;dialog.showModal();show();clearInterval(progressTimer);progressTimer=setInterval(()=>progress.value=player.progress,200)};
  const text=make('div');text.append(make('strong',c.updates?.storyLabel??'Nuestros estados'));if(c.updates?.showStorySubtitle===true&&c.updates?.storySubtitle)text.append(make('small',c.updates.storySubtitle));row.append(button,text);const heading=target.querySelector('h1');heading?heading.before(row):target.prepend(row);load();
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&dialog?.open)player.pause()});
 if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',mount);else mount();window.addEventListener('mpi:cms-updated',mount);setInterval(()=>{if(!dialog?.open)load()},45000);
 if(document.getElementById('postsTab')){
  let opened=false;window.addEventListener('mp:draft-changed',()=>{if(!opened&&new URLSearchParams(location.search).get('section')==='posts'&&!$('workspace').hidden){opened=true;document.querySelector('[data-tab="postsTab"]').click()}});
 }
})();
