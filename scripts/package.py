from pathlib import Path
import hashlib,json,zipfile,datetime
root=Path(__file__).resolve().parents[1]
allowed={'frontend','backend','migraciones','scripts','tests'}
def eligible(p):
 rel=p.relative_to(root)
 return (rel.parts[0] in allowed or len(rel.parts)==1) and not any(v in {'.git','node_modules','backups','secrets','__pycache__'} for v in rel.parts) and not p.name.startswith('.env') and p.suffix.lower() not in {'.docx','.zip','.bak','.log','.pyc'} and 'config.local' not in p.name and p.name!='MANIFEST.json'
files=sorted(p for p in root.rglob('*') if p.is_file() and eligible(p))
example=root/'backend/.env.example'
if example not in files:files.append(example)
for p in files:
 if 'vendor' not in p.relative_to(root).parts and (p.suffix.lower() in {'.js','.mjs','.py','.ts','.sql','.html','.css','.md','.txt','.json','.example'} or p.name in {'.gitignore','.gitattributes','.htaccess','_headers'}):
  original=p.read_bytes();normalized=original.replace(b'\r\n',b'\n')
  if original!=normalized:p.write_bytes(normalized)
manifest={'version':'94.1','generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':{str(p.relative_to(root)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}}
(root/'MANIFEST.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
out=root.parent/'Mega_Prime_Importaciones_94_1_CODIGO_GITHUB.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for p in files+[root/'MANIFEST.json']:z.write(p,str(p.relative_to(root)))
print('Código empaquetado; Word y credenciales excluidos. Archivos:',len(files))
