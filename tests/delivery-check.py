from pathlib import Path
import zipfile,json,hashlib,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'MANIFEST.json').read_text(encoding='utf8'))
for name,expected in manifest['files'].items():
 assert hashlib.sha256((root/name).read_bytes()).hexdigest()==expected,name
archive=root.parent/'Mega_Prime_Importaciones_94_1_CODIGO_GITHUB.zip'
private=root.parent/'02_word_privado/Acceso_privado_Mega_Prime_Importaciones.docx'
with zipfile.ZipFile(private) as z:
 xml=ET.fromstring(z.read('word/document.xml'))
 ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
 texts=[''.join(x.text or '' for x in p.findall('.//w:t',ns)) for p in xml.findall('.//w:body/w:p',ns)]
 password=texts[texts.index('Contraseña inicial propuesta:')+1]
 assert len(password)==28
with zipfile.ZipFile(archive) as z:
 for name in z.namelist():
  assert not name.endswith('.docx') and '/.git/' not in name and '02_word_privado' not in name
  assert password.encode() not in z.read(name),'Secreto incluido en ZIP'
print('PASS entrega: hashes, ZIP de código, Word válido y contraseña privada excluida del paquete.')
