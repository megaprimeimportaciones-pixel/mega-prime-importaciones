from pathlib import Path
root=Path(__file__).resolve().parents[1]/'frontend'
p=root/'public-integrations.js';s=p.read_text(encoding='utf8')
s=s.replace("const response=el('p');","const response=el('p');response.id='mp-chat-answer';")
s=s.replace("consent:consent.checked,token},auth:false","consent:consent.checked,token,transcript:(window.MP_CHAT_LOG||[]).slice(-40)},auth:false")
s=s.replace("el('p',a.body),el('h3','Misión'),el('p',a.mission),el('h3','Visión'),el('p',a.vision)","el('p',a.body)")
p.write_text(s,encoding='utf8')
p=root/'panel.js';s=p.read_text(encoding='utf8')
s=s.replace("async function inquiries(){const rows=", "async function inquiries(){if(window.MP_renderInbox)return MP_renderInbox();const rows=")
p.write_text(s,encoding='utf8')
for name in ['index.html','cms_shared.js']:
 p=root/name;s=p.read_text(encoding='utf8');s=s.replace("'contactSection','updates'].includes(k)","'contactSection','updates','videoLibrary'].includes(k)");p.write_text(s,encoding='utf8')
for name in ['index.html','panel.html']:
 p=root/name;s=p.read_text(encoding='utf8')
 if 'video-library.js' not in s:
  scripts='<link rel="stylesheet" href="workspace-features.css?v=95"><script src="video-library.js?v=95"></script><script src="chat-workspace.js?v=95"></script>'
  if name=='index.html':
   before,after=s.rsplit('</body>',1);s=before+scripts+'</body>'+after
  else:s=s.replace('</html>',scripts+'</html>')
 p.write_text(s,encoding='utf8')
