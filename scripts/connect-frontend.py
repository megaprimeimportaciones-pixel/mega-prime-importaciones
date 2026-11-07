"""Preparación reproducible de recursos sin sobrescribir contenido original."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'frontend'
for name in ['index.html','catalogo-digital.html']:
 p=root/name
 s=p.read_text(encoding='utf-8-sig')
 if 'connection.js' not in s:s=s.replace('<script src="client.js?v=94.1">','<script src="connection.js?v=95"></script><script src="client.js?v=94.1">')
 if 'public-bridge.js' not in s:
  s=s.replace('<head>','<head><script src="config.js?v=94.1"></script><script src="client.js?v=94.1"></script><script src="public-bridge.js?v=94.1"></script>',1)
  if '<head>' not in s and 'public-bridge.js' not in s:
   s=s.replace('<meta charset=', '<script src="config.js?v=94.1"></script><script src="client.js?v=94.1"></script><script src="public-bridge.js?v=94.1"></script><meta charset=',1)
 if name=='index.html' and 'public-integrations.js' not in s:
  before,after=s.rsplit('</body>',1)
  s=before+'<script src="integrations-defaults.js?v=94.1"></script><link rel="stylesheet" href="public-integrations.css?v=94.1"><script src="public-integrations.js?v=94.1"></script></body>'+after
 p.write_text(s,encoding='utf-8')
p=root/'index.html';s=p.read_text(encoding='utf8')
if 'interaction-refinements.css' not in s:s=s.replace('<script src="public-integrations.js?v=94.1">','<link rel="stylesheet" href="interaction-refinements.css?v=94.1"><script src="public-integrations.js?v=94.1">')
if 'contact-settings.js' not in s:s=s.replace('<script src="public-integrations.js?v=94.1">','<script src="contact-settings.js?v=94.1"></script><script src="public-integrations.js?v=94.1">')
if 'social-settings.js' not in s:s=s.replace('<script src="public-integrations.js?v=94.1">','<script src="social-settings.js?v=94.1"></script><script src="public-integrations.js?v=94.1">')
if 'effects.js' not in s:s=s.replace('<script src="public-integrations.js?v=94.1"></script>','<script src="public-integrations.js?v=94.1"></script><link rel="stylesheet" href="effects.css?v=94.1"><script src="effects.js?v=94.1"></script>')
if 'animated-chatbot.js' not in s:
 before,after=s.rsplit('</body>',1)
 s=before+'<link rel="stylesheet" href="animated-chatbot.css?v=94.2"><script src="animated-chatbot.js?v=94.2"></script></body>'+after
if 'stories.js' not in s:
 before,after=s.rsplit('</body>',1);s=before+'<link rel="stylesheet" href="stories.css?v=94.3"><script src="stories.js?v=94.3"></script></body>'+after
p.write_text(s,encoding='utf8')
p=root/'panel.html';s=p.read_text(encoding='utf-8')
if 'connection.js' not in s:s=s.replace('<script src="client.js">','<script src="connection.js?v=95"></script><script src="client.js">')
if 'calc-rules.js' not in s:s=s.replace('<script src="cms_shared.js">','<script src="calc-rules.js"></script><script src="cms_shared.js">')
if 'integrations-defaults.js' not in s:s=s.replace('<script src="panel.js">','<script src="integrations-defaults.js"></script><script src="panel.js">')
if 'contact-import.js' not in s:s=s.replace('</html>','<script src="contact-import.js"></script><script src="campaigns.js"></script></html>')
if 'recovery.js' not in s:s=s.replace('</html>','<script src="recovery.js"></script></html>')
if 'contact-settings.js' not in s:s=s.replace('</html>','<script src="contact-settings.js"></script></html>')
if 'social-settings.js' not in s:s=s.replace('</html>','<script src="social-settings.js"></script></html>')
if 'stories.js' not in s:s=s.replace('</html>','<script src="stories.js"></script></html>')
if 'connection-panel.js' not in s:s=s.replace('</html>','<script src="connection-panel.js"></script></html>')
s=s.replace('Importación de DOCX, XLS/XLSX y PDF y envío automático: pendientes de implementación; no se envían mensajes desde este panel.','Importa DOCX, XLS/XLSX o PDF con texto; los PDF escaneados requieren OCR. El envío usa una cola y una plantilla aprobada de WhatsApp Business.')
p.write_text(s,encoding='utf-8')
