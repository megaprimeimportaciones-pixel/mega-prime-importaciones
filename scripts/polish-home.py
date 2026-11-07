"""Actualiza la presentación inicial conservando los archivos del prototipo original."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]/'frontend'
photos={name:'uploads/media/'+('a'*30)+f'{i:02x}'+'.png' for i,name in enumerate(['teja','metal','pergola','interior','tools','warehouse'],1)}
def picture(p):
 name=(p.get('name','')+' '+p.get('category','')).lower()
 if 'policarbonato' in name:return photos['pergola']
 if any(x in name for x in ['metálic','duratecho','trapezoidal','cresta']):return photos['metal']
 if any(x in name for x in ['acabados','cielo raso','spc','wall panel','piso','revestim']):return photos['interior']
 if any(x in name for x in ['herramient','accesorio']):return photos['tools']
 if any(x in name for x in ['maquin','vehícul','materiales']):return photos['warehouse']
 return photos['teja']
for name in ['cms_shared.js','index.html']:
 p=root/name;s=p.read_text(encoding='utf8');match=re.search(r'window\.MPI_CMS_DEFAULTS\s*=\s*',s);start=match.end();config,length=json.JSONDecoder().raw_decode(s[start:])
 config['header'].update(topVisible=False,topLeft='',topRight='')
 config['hero'].update(eyebrow='Mega Prime Importaciones',first='IDEAS PARA',accent='CONSTRUIR.',last='CUBIERTAS Y ACABADOS.',description='Descubre tejas, cubiertas y acabados para transformar tu proyecto. Explora los materiales y prepara tu cotización con nuestro equipo.',note='Consulta medidas, colores y disponibilidad antes de elegir tus materiales.')
 config['catalog'].update(title='MATERIALES',accent='PARA TU PROYECTO',note='Consulta precios y disponibilidad. Imágenes de ambientación.')
 config['seo'].update(title='Mega Prime Importaciones | Cubiertas y acabados',description='Tejas, cubiertas y acabados para tu proyecto. Explora el catálogo de Mega Prime Importaciones y solicita tu cotización.')
 config['branding']['tagline']='CUBIERTAS · ACABADOS · HERRAMIENTAS'
 config['benefits']=[{'title':'Explora los materiales','text':'Cubiertas y acabados para tu proyecto'},{'title':'Prepara tu cotización','text':'Revisa opciones con nuestro equipo'},{'title':'Consulta medidas','text':'Verifica las fichas de cada material'},{'title':'Conoce las novedades','text':'Fotos, videos y estados en nuestra web'}]
 for category in config['categories']:
  category['image']=picture(category);category['description']={'Cubiertas':'Tejas y soluciones para techos','Acabados':'Pisos, cielos rasos y revestimientos','Herramientas':'Equipos para instalación','Maquinarias':'Equipos y materiales para obra','Accesorios':'Complementos para tu instalación'}.get(category['name'],'Soluciones para tu proyecto')
 for product in config['products']:
  product.update(image=picture(product),gallery=[],imageSets={},price=0,description='Consulta medidas, colores, ficha técnica y disponibilidad con nuestro equipo.')
 config['customBlocks']=[b for b in config.get('customBlocks',[]) if 'prueba' not in b.get('title','').lower()]
 config['footer'].update(description='Cubiertas, acabados y materiales para transformar tu proyecto.',company='Mega Prime Importaciones',tag='CUBIERTAS · ACABADOS · SOLUCIONES PARA TU PROYECTO',disclaimer='Confirma medidas, características y disponibilidad antes de comprar.',locationTitle='UBICACIÓN',locationName='Mega Prime Importaciones',location='Ubicación por confirmar',address='',coverage='Consulta cobertura y condiciones de entrega con nuestro equipo.',consult='Solicita información y confirma los detalles de tu cotización.',warning='Consulta las fichas técnicas antes de instalar.',legalLeft='© 2026 Mega Prime Importaciones',legalRight='Asesoría y cotizaciones',legalNote='Imágenes de ambientación. Verifica especificaciones y disponibilidad con nuestro equipo.',hours='Horario por confirmar')
 s=s[:start]+json.dumps(config,ensure_ascii=False,separators=(',',':'))+s[start+length:]
 for old in ['ENTORNO DE PRUEBAS · DATOS FICTICIOS · NO REALIZAR COMPRAS','SIMULACIÓN COMERCIAL · VALORES NO VIGENTES']:s=s.replace(old,'')
 p.write_text(s,encoding='utf8')
print('Presentación inicial y fotos actualizadas; precios no confirmados sustituidos por consulta de cotización.')
