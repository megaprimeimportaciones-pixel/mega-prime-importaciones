(()=>{
 const robot=`<svg viewBox="0 0 180 180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
 <defs><linearGradient id="mpRobotShell" x2=".8" y2="1"><stop stop-color="#fff9e9"/><stop offset="1" stop-color="#c6d4d9"/></linearGradient><linearGradient id="mpRobotGold" x2="1" y2="1"><stop stop-color="#ffe7a1"/><stop offset="1" stop-color="#c68c22"/></linearGradient></defs>
 <ellipse cx="88" cy="165" rx="45" ry="7" fill="#10222e" opacity=".18"/>
 <g class="mp-robot-body"><path d="M66 139l-5 17q7 6 16 0l4-17M99 139l5 17q9 6 16 0l-8-19" fill="url(#mpRobotGold)" stroke="#263d4a" stroke-width="3"/>
 <path d="M58 114q30-15 60 0l-7 29q-26 12-50-1z" fill="url(#mpRobotShell)" stroke="#263d4a" stroke-width="3"/>
 <rect x="65" y="119" width="44" height="18" rx="8" fill="#203643"/><text x="87" y="132" text-anchor="middle" fill="#f6d47c" font-size="12" font-family="Segoe UI,Arial" font-weight="800">MPI</text>
 <path d="M57 115q-20 3-22 18q3 8 12 4l16-14" fill="url(#mpRobotShell)" stroke="#263d4a" stroke-width="3"/>
 <path d="M43 68q-3-37 43-40q45-2 49 39" fill="none" stroke="#263d4a" stroke-width="9"/><path d="M44 65q0-32 42-34q40-2 47 31" fill="none" stroke="#e8b94e" stroke-width="3"/>
 <rect x="39" y="50" width="99" height="64" rx="28" fill="url(#mpRobotShell)" stroke="#263d4a" stroke-width="3"/>
 <rect x="49" y="61" width="78" height="40" rx="17" fill="#173d4c"/>
 <g class="mp-robot-eyes" fill="none" stroke="#f6d47c" stroke-width="4" stroke-linecap="round"><path d="M62 78q7-12 14 0M96 78q7-12 14 0"/></g>
 <path d="M79 87q9 9 19-1" fill="none" stroke="#d2f5f5" stroke-width="3" stroke-linecap="round"/>
 <rect x="31" y="68" width="15" height="28" rx="7" fill="url(#mpRobotGold)" stroke="#263d4a" stroke-width="3"/><rect x="132" y="68" width="15" height="28" rx="7" fill="url(#mpRobotGold)" stroke="#263d4a" stroke-width="3"/>
 <path d="M138 94q0 13-19 14" fill="none" stroke="#263d4a" stroke-width="4"/><rect x="109" y="104" width="15" height="7" rx="3" fill="#e8b94e"/>
 <g class="mp-robot-hand">
  <path d="M116 120 Q124 111 136 104 L148 110 Q139 125 126 132 Q117 134 116 120Z" fill="url(#mpRobotShell)" stroke="#527788" stroke-width="2"/>
  <path d="M137 111 C129 109 127 104 124 98 L120 91 Q118 87 121 85 Q124 83 127 87 L132 92 L129 70 Q128 65 132 64 Q136 63 137 68 L139 82 L138 62 Q138 57 142 57 Q146 57 146 62 L147 81 L149 64 Q150 59 154 61 Q157 62 156 67 L155 84 L159 72 Q160 68 164 70 Q167 71 165 76 L160 99 Q158 111 148 114 Q142 116 137 111Z" fill="#eff8fb" stroke="#789eaf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M133 94 Q137 97 139 103 M140 86 L140 92 M148 85 L148 92 M155 87 L154 94" fill="none" stroke="#bdd4df" stroke-width="1.5" stroke-linecap="round"/>
 </g></g></svg>`;
 function enhance(){
  const c=window.MPI_CMS_ACTIVE||window.MPI_CMS_DEFAULTS,a=c?.chatbot,b=document.getElementById('mp-chat-toggle'),box=document.getElementById('mp-chat');
  document.getElementById('mp-assistant-dock')?.remove();
  if(!a?.visible||!b||!box){document.documentElement.classList.remove('mp-assistant-active');return}
  const dock=document.createElement('div');dock.id='mp-assistant-dock';dock.dataset.animation=a.animation||'bounce';
  if(/^#[0-9a-f]{6}$/i.test(a.color))dock.style.setProperty('--mp-assistant-accent',a.color);
  const greeting=document.createElement('button');greeting.className='mp-assistant-greeting';greeting.type='button';
  const title=document.createElement('strong');title.textContent=a.bubbleTitle||'¡Hola! Soy '+a.name+'.';const text=document.createElement('span');text.textContent=a.bubbleText||'¿En qué puedo ayudarte?';const hint=document.createElement('small');hint.textContent=a.bubbleHint||'Haz clic para conversar conmigo.';greeting.append(title,text,hint);greeting.onclick=()=>b.click();
  const oldImage=b.querySelector('img');b.replaceChildren();b.classList.remove('bounce','pulse');b.classList.add('mp-avatar-button');b.setAttribute('aria-label','Abrir conversación con '+a.name);b.setAttribute('aria-controls','mp-chat');
  if(oldImage){oldImage.alt='Asistente '+a.name;b.append(oldImage)}else b.innerHTML=robot;
  dock.append(greeting,b);
  const number=String(c.whatsapp?.number||'').replace(/\D/g,'');
  if(/^[1-9]\d{7,14}$/.test(number)){const wa=document.createElement('a');wa.className='mp-assistant-whatsapp';wa.href='https://wa.me/'+number+'?text='+encodeURIComponent(c.whatsapp?.welcome||'Hola');wa.target='_blank';wa.rel='noopener noreferrer';wa.textContent=a.whatsappLabel||'WhatsApp ↗';wa.setAttribute('aria-label','Contactar a Mega Prime Importaciones por WhatsApp');dock.append(wa)}
  const close=document.createElement('button');close.className='mp-chat-close';close.type='button';close.textContent='×';close.setAttribute('aria-label','Cerrar conversación');close.onclick=()=>{if(!box.hidden)b.click()};box.querySelector('.mp-chat-close')?.remove();box.prepend(close);
  b.addEventListener('click',()=>{dock.classList.toggle('mp-conversation-open',!box.hidden);if(!box.hidden)box.querySelector('input')?.focus()});
  document.body.append(dock);document.documentElement.classList.add('mp-assistant-active');
 }
 if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',enhance);else enhance();
 window.addEventListener('mpi:cms-updated',enhance);
})();
