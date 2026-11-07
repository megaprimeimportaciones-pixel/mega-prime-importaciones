"""Solo QA local: catálogo inicial sin cuentas ni datos reales. No desplegar."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import subprocess,json,os
root=Path(__file__).resolve().parents[1]
js="const fs=require('fs'),vm=require('vm');global.window=global;vm.runInThisContext(fs.readFileSync('frontend/cms_shared.js','utf8'));vm.runInThisContext(fs.readFileSync('frontend/integrations-defaults.js','utf8'));console.log(JSON.stringify(MPI_CMS_DEFAULTS));"
config={};signature=None
def load_config():
 global config,signature
 current=tuple((root/'frontend'/n).stat().st_mtime_ns for n in ['cms_shared.js','integrations-defaults.js'])
 if current!=signature:
  config=json.loads(subprocess.check_output(['node','-e',js],cwd=root,encoding='utf8'));signature=current
 return config
load_config()
os.chdir(root/'frontend')
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  if self.path.split('?')[0]=='/config.js':
   source=(root/'frontend/config.js').read_text(encoding='utf8')
   import re
   configured=bool(re.search(r"url\s*:\s*['\"]https://",source))
   self.send_response(200);self.send_header('Content-Type','application/javascript');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(source.encode() if configured else b'window.MP_CONFIG={url:location.origin,anonKey:"qa-public",siteUrl:location.origin,previewOnly:true};');return
  if self.path.startswith('/rest/v1/posts'):
   self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(b'[]');return
  super().do_GET()
 def do_POST(self):
  if self.path=='/rest/v1/rpc/public_content':
   self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(json.dumps({'config':load_config(),'revision':int((root/'frontend/integrations-defaults.js').stat().st_mtime)}).encode());return
  self.send_error(403,'No authentication or mutations in visual QA')
if __name__=='__main__':
 print('QA local: http://127.0.0.1:8765 (solo datos de demostración)',flush=True)
 ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
