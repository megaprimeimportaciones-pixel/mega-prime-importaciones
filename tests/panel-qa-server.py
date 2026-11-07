"""Servidor simulado SOLO de pruebas, sin claves ni cuentas reales. No desplegar."""
import importlib.util,json,uuid,urllib.parse
from http.server import ThreadingHTTPServer
from pathlib import Path
spec=importlib.util.spec_from_file_location('preview',Path(__file__).with_name('preview-server.py'))
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
state={'config':base.load_config(),'revision':1,'posts':[],'videos':[]}
session={'access_token':'qa-synthetic-not-valid-in-supabase','refresh_token':'qa-only','user':{'id':'10000000-0000-4000-8000-000000000001','email':'qa-owner@example.test'}}
class Handler(base.Handler):
 def reply(self,data,code=200):
  self.send_response(code);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(json.dumps(data).encode())
 def do_GET(self):
  if self.path.split('?')[0]=='/config.js':
   self.send_response(200);self.send_header('Content-Type','application/javascript');self.end_headers();self.wfile.write(b'window.MP_CONFIG={url:location.origin,anonKey:"qa-public",siteUrl:location.origin};');return
  if self.path.split('?')[0]=='/panel-qa.html':
   html=(base.root/'frontend/panel.html').read_text(encoding='utf8')
   injection='<script>sessionStorage.setItem("mp_session_v1",'+json.dumps(json.dumps(session))+');sessionStorage.removeItem("mp_draft");sessionStorage.removeItem("mp_draft_restore");</script>'
   html=html.replace('<script src="client.js">',injection+'<script src="client.js">').replace('<header>','<p style="padding:12px;background:#634b00">PRUEBA LOCAL: servicios simulados, sin cuentas reales</p><header>')
   self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.end_headers();self.wfile.write(html.encode());return
  if self.path.startswith('/rest/v1/members'):self.reply([{'id':session['user']['id'],'email':session['user']['email'],'role':'owner','active':True}]);return
  if self.path.startswith('/rest/v1/content'):self.reply([{'id':1,'config':state['config'],'revision':state['revision']}]);return
  if self.path.startswith('/rest/v1/posts'):self.reply(state['posts']);return
  if self.path.startswith('/rest/v1/videos'):self.reply(state['videos']);return
  if self.path.startswith('/rest/v1/'):self.reply([]);return
  super().do_GET()
 def do_POST(self):
  try:body=json.loads(self.rfile.read(int(self.headers.get('Content-Length',0))) or b'{}')
  except ValueError:self.reply({'message':'JSON inválido'},400);return
  if self.path=='/rest/v1/rpc/staff_role':self.reply('owner');return
  if self.path=='/rest/v1/rpc/public_content':self.reply({k:state[k] for k in ['config','revision']});return
  if self.path=='/rest/v1/rpc/publish_content':
   if body.get('expected_revision')!=state['revision']:self.reply({'message':'CONFLICT de prueba'},409);return
   state['config']=body['payload'];state['revision']+=1;self.reply(state['revision']);return
  if self.path.startswith('/auth/v1/token'):self.reply(session);return
  if self.path in ['/rest/v1/posts','/rest/v1/videos']:
   table=self.path.rsplit('/',1)[1];row={**body,'id':str(uuid.uuid4()),'created_at':'2026-11-07T01:00:00Z'};state[table].append(row);self.reply([row]);return
  self.reply({'message':'Operación no incluida en simulación'},403)
 def do_PATCH(self):
  body=json.loads(self.rfile.read(int(self.headers.get('Content-Length',0))))
  if self.path.startswith('/rest/v1/posts?') or self.path.startswith('/rest/v1/videos?'):
   table=self.path.split('?')[0].rsplit('/',1)[1]
   id=urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)['id'][0].removeprefix('eq.')
   for p in state[table]:
    if p['id']==id:p.update(body)
   self.reply(None);return
  self.reply({'message':'Solo datos simulados'},403)
 def do_DELETE(self):
  table=self.path.split('?')[0].rsplit('/',1)[1]
  if table in ['posts','videos']:
   id=urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)['id'][0].removeprefix('eq.');state[table]=[x for x in state[table] if x['id']!=id];self.reply(None);return
  self.reply({'message':'Solo datos simulados'},403)
print('QA de panel: http://127.0.0.1:8770/panel-qa.html (SOLO SIMULACIÓN)',flush=True)
ThreadingHTTPServer(('127.0.0.1',8770),Handler).serve_forever()
