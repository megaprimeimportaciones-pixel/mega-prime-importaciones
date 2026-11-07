from pathlib import Path
root=Path(__file__).resolve().parents[1]
for p in root.rglob('*'):
 if not p.is_file() or p.suffix.lower() not in {'.html','.js','.mjs','.md','.txt','.py','.ts'} or 'vendor' in p.parts or p.name in {'finalize.py','package.py'}:continue
 s=p.read_text(encoding='utf-8-sig')
 s=s.replace('Mega Prime Import ·','Mega Prime Importaciones ·').replace('Mega Prime Import |','Mega Prime Importaciones |')
 import re
 s=re.sub(r'Mega Prime Import(?!aciones)', 'Mega Prime Importaciones',s)
 s=re.sub(r'MEGA PRIME IMPORT(?!ACIONES)', 'Mega Prime Importaciones',s)
 s=s.replace('MEGA <b>PRIME IMPORT</b>','Mega Prime <b>Importaciones</b>')
 p.write_text(s,encoding='utf8')
p=root/'README.md';s=p.read_text(encoding='utf8')
s=s.replace('`004_messaging.sql` en ese orden','`004_messaging.sql`, `005_recovery.sql` y `006_grants.sql` en ese orden')
s=s.replace('`supabase functions deploy inquiry --no-verify-jwt`.','`supabase functions deploy inquiry --no-verify-jwt` y `supabase functions deploy recovery --no-verify-jwt`.')
s=s.replace('Configurar secretos `SITE_URL` y `TURNSTILE_SECRET_KEY`','Configurar secretos `SITE_URL`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` y `RECOVERY_FROM` (dominio verificado en Resend)')
s=s.replace('Supabase admite un correo principal de Auth. El correo alternativo de recuperación verificado no está implementado en esta edición: no se usa un campo no verificado para recuperar cuentas. El propietario conserva una vía de recuperación privada por terminal.','Supabase utiliza un correo principal de Auth. La función recovery implementa adicionalmente un correo alternativo con verificación por enlace, tokens de 15 minutos almacenados como hash, consumo atómico de un solo uso, control antispam y notificación al correo principal. Requiere Resend con dominio verificado; sin ese proveedor no se habilita la recuperación alternativa. El propietario conserva una vía de recuperación privada por terminal.')
s=s.replace('El script exporta tablas de aplicación y archivos','El script exporta tablas de aplicación (excluye tokens y contactos alternativos de recuperación) y archivos')
s=s.replace('y los datos sean definitivos. Genera sitemap','y los datos sean definitivos; activar también seo.indexable en el panel. Genera sitemap')
p.write_text(s,encoding='utf8')
p=root/'tests/VALIDACION.md';s=p.read_text(encoding='utf8').replace('Recuperación mediante un correo alternativo verificado; OCR integrado;','OCR integrado;').replace('7. Probar recuperación por correo,','7. Configurar Resend, verificar correo alternativo, rechazar token usado/vencido y comprobar notificaciones a ambos correos. Probar recuperación por correo principal,');p.write_text(s,encoding='utf8')
for path in ['backend/supabase/functions/recovery/index.ts','frontend/recovery.js']:
 p=root/path;s=p.read_text(encoding='utf8').replace('panel.html?recovery_token=','panel.html#recovery_token=').replace('new URLSearchParams(location.search)','new URLSearchParams(location.hash.slice(1))');p.write_text(s,encoding='utf8')
