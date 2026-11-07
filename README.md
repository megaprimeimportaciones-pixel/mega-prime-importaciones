# Mega Prime Importaciones · edición Supabase 94.1

Actualización: URL y clave pública de Supabase configuradas; comprobación de Auth HTTP 200. La instalación de tablas, creación del propietario y despliegue de funciones todavía requieren los pasos de `PASO_A_PASO_SUPABASE.md`. El nuevo `INSTALACION_SUPABASE.sql` reúne las nueve migraciones para un proyecto NUEVO; no se debe repetir encima de tablas ya instaladas. `ACTIVAR_ADMIN.sql` asigna el propietario después de crear su usuario en Authentication.

Se añadieron una videoteca permanente independiente de los estados, bandeja del chatbot con conversación y notas del equipo, editor directo de respuestas FAQ, aviso de consultas por WhatsApp mediante cola y plantilla oficial, misión y visión destacadas y redes con iconos visibles solo cuando se publica su enlace. Los servicios de WhatsApp, SMTP, Resend y Turnstile requieren configuración externa.

Esta edición se basa en las funcionalidades solicitadas y las 28 imágenes de referencia. Conserva el diseño oscuro y dorado, catálogo, calculadoras y cotizaciones del original, sin reutilizar su autenticación PHP/MySQL. El original permanece intacto fuera de esta carpeta.

Cada apartado incorpora efectos de entrada y respuesta al cursor: portada, beneficios, categorías, catálogo, calculadora, empresa, indicadores, proveedor, información técnica, ubicación, contacto, redes y pie. Se desactivan con la preferencia de movimiento reducido del dispositivo. También se pueden controlar desde `design.effectsEnabled` y `design.motionDuration` en el editor.

El chatbot incluye un personaje vectorial original con auriculares, saludo con la mano, flotación y parpadeo; globo de bienvenida y botón de WhatsApp integrado. En `chatbot` se editan nombre, imagen alternativa, color, animación, saludo, `bubbleTitle`, `bubbleText`, `bubbleHint`, `whatsappLabel`, preguntas y respuestas. Respeta movimiento reducido y se adapta a móvil. El personaje abre el asistente FAQ existente; no se presenta como IA generativa.

La portada ya no muestra el aviso superior de pruebas. Se añadió el círculo de estados junto al título, su visor, y un control directo de subida en Publicaciones y estados. El catálogo y los bloques usan seis escenas de ambientación generadas: casas con tejas, cubierta metálica, patio, interiores, herramientas y almacén. Los precios iniciales no confirmados se muestran para cotizar. Ver `FOTOGRAFIA_Y_PUBLICACION.md` para archivos, prompts y la diferencia entre abrir `index.html` y publicar un dominio HTTPS.

## Carpetas

- `frontend/`: web estática y panel de gestión. Es la única carpeta publicable como sitio.
- `backend/`: funciones Supabase y worker Node de WhatsApp. Código versionable, secretos exclusivamente en el entorno del servidor.
- `migraciones/`: ejecutar en orden en un proyecto Supabase NUEVO.
- `scripts/`: preparación, recuperación privada y empaquetado.
- `tests/`: comprobaciones locales y guía de validación con servicios reales.

El Word con la contraseña está en `../02_word_privado`, fuera del repositorio. No subas la carpeta `entrega` completa a GitHub. `01_codigo_github` es la raíz del repositorio que se debe subir. No se ha conectado ni publicado un repositorio remoto.

## Instalación

1. Crear un proyecto propio en Supabase. Activar MFA en la cuenta propietaria de Supabase y conservar sus códigos de recuperación fuera de este repositorio.
2. Ejecutar `migraciones/001_supabase.sql`, `002_sessions.sql`, `003_public_projection.sql`, `004_messaging.sql`, `005_recovery.sql`, `006_grants.sql`, `007_contact_validation.sql` y `008_social_posts.sql` en ese orden. No ejecutar el esquema MySQL del proyecto original.
3. En Auth desactivar el registro libre; configurar Site URL y redirect permitido `https://TU-DOMINIO/panel.html`. Exigir contraseñas de al menos 16 caracteres en la configuración de Auth. Usar HTTPS, SMTP propio y vencimiento corto de enlaces (recomendado 15 minutos). Activar las notificaciones de seguridad de cambios de contraseña y correo. Los enlaces de invitación/recuperación principal son emitidos y verificados por Supabase Auth; la recuperación alternativa usa su función independiente y tokens de un solo uso.
4. En `frontend/config.js` completar `url`, `anonKey` (publishable/anon pública), `siteUrl` y `turnstileSiteKey`. La clave pública se comparte por diseño; las políticas controlan el acceso. NUNCA colocar `service_role`, un secreto de servidor o la contraseña del Word en este archivo.
5. Desplegar las funciones con Supabase CLI desde `backend/`: `supabase functions deploy manage-users` y `supabase functions deploy inquiry --no-verify-jwt` y `supabase functions deploy recovery --no-verify-jwt`. La función pública inquiry verifica Turnstile, hostname y origen, y no permite leer consultas. Configurar secretos `SITE_URL`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` y `RECOVERY_FROM` (dominio verificado en Resend); Supabase aporta sus variables reservadas. Configurar en Turnstile los hostnames permitidos.
6. Crear el propietario desde una terminal PRIVADA: cargar `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OWNER_EMAIL` y `OWNER_PASSWORD` como variables del proceso; usar la contraseña del Word y `megaprimeimportaciones@gmail.com`. Ejecutar `node scripts/owner.mjs create`. No guardar estas variables en Git, historial compartido ni comandos con valores literales. El correo está confirmado; la cuenta aún no se ha creado en un servicio remoto.
7. Iniciar sesión en `/panel.html`, revisar textos e información comercial y pulsar Guardar y publicar para crear la primera versión compartida. El catálogo original contiene información DEMOSTRATIVA: no se convirtió en inventario real.
8. Configurar ubicación, WhatsApp, redes y datos reales; los campos nuevos están bajo `company`, `indicators`, `supplier`, `technicalBenefits`, `location`, `chatbot`. La selección de campos incluye todo el JSON. Los objetos y listas se añaden/eliminan en el editor estructurado con previsualización.

   Contacto ya preparado: megaprimeimportaciones@gmail.com y +593963796222. El apartado de contacto permite añadir tres o más números (hasta 50), reemplazar, desactivar y elegir el principal; rechaza duplicados y sincroniza botones generales con el principal. Los enlaces individuales conservan su propio número. La ubicación sigue pendiente. El apartado de redes muestra automáticamente los enlaces completados y oculta los vacíos. Ver `REDES_Y_ESTADOS.md` para enlaces, estados anclados, contenido externo e importación autorizada de TikTok.
9. Publicar únicamente `frontend/` en GitHub Pages o un hosting estático. Las Edge Functions se ejecutan en Supabase; el worker de WhatsApp requiere un servidor Node 22+ independiente. GitHub Pages no ejecuta estos procesos.

## Seguridad y límites

Hay dos roles: `owner` (administrador principal) y `editor`. El editor administra contenido, archivos propios, publicaciones y consultas; no puede cambiar miembros, restaurar versiones ni administrar campañas. Las políticas RLS y las funciones de servidor verifican el permiso en cada operación. No existe contraseña universal, endpoint público de recuperación del propietario ni asignación de rol desde el registro del navegador.

`staff_role()` comprueba la cuenta activa, la sesión existente en Auth, su fecha de creación y la lista de sesiones bloqueadas. La suspensión o revocación impide acceso a datos protegidos aunque un JWT no haya vencido. La interfaz consulta permisos cada 45 segundos. Los archivos publicados en el bucket público y el catálogo ya publicados siguen siendo públicos: revocar a un editor no retira lo que ya se publicó. Si toda la web debe ser privada, proteger el hosting con un servicio de acceso y convertir el almacenamiento a privado con URLs firmadas; esta entrega ofrece catálogo público y administración privada.

El navegador guarda la sesión en sessionStorage para no conservarla al cerrar la pestaña. Proteger el sitio contra XSS sigue siendo necesario. Las cabeceras están en `.htaccess` y `_headers`; GitHub Pages no permite cabeceras HTTP personalizadas: para aplicarlas, usar un proxy/hosting que las soporte. Se conservan scripts y estilos inline del diseño original; no se afirma tener una CSP estricta ni inmunidad a ataques.

Supabase utiliza un correo principal de Auth. La función recovery implementa adicionalmente un correo alternativo con verificación por enlace, tokens de 15 minutos almacenados como hash, consumo atómico de un solo uso, control antispam y notificación al correo principal. Requiere Resend con dominio verificado; sin ese proveedor no se habilita la recuperación alternativa. El propietario conserva una vía de recuperación privada por terminal. No hay SMS. La notificación de cambios depende de configurar las notificaciones de seguridad de Supabase y SMTP. Cambiar correo desde administración requiere que el dueño compruebe la identidad del editor.

## Archivos y publicaciones

Subida al bucket compartido `media`, máximo 50 MB; JPG, PNG, WEBP, MP4 y WEBM, validación en cliente y restricciones del bucket. Nombre aleatorio por usuario. El propietario elimina cualquier archivo; el editor elimina sus archivos. Usa la URL subida para reemplazar imágenes del contenido o adjuntarla a una publicación. Las publicaciones permiten editar, previsualizar multimedia, publicar, borrar y fijar vencimiento. El vencimiento se comprueba en RLS y al refrescar la vista pública. No se implementaron reacciones.

Los cambios del catálogo y las novedades se consultan cada 45 segundos; el intervalo es una configuración de diseño, no una medición demostrada entre dispositivos. El guardado usa revisión esperada y rechaza conflictos, conserva el borrador en la pestaña y ofrece cargar la versión nueva. Las versiones anteriores quedan en historial; restaurar conserva antes el estado actual. La copia descargada de contenido no reemplaza un backup de base y archivos.

## Contactos y WhatsApp Business

DOCX, XLS/XLSX, PDF con texto, CSV y TXT se procesan localmente sin subir el documento. Máximo 10 MB y 100 páginas PDF. Para PDF escaneado se informa que hace falta OCR; OCR no está incluido. Los números se revisan y corrigen con código de país, se deduplican y se exportan como CSV o XLSX. Una coincidencia numérica extraída podría ser una medida o precio: la revisión humana es obligatoria. Las bibliotecas están fijadas y vendorizadas, con hashes en `frontend/vendor/manifest.json`; conservar sus licencias y mantenerlas actualizadas.

El enlace `wa.me` solo abre WhatsApp con un mensaje; no hace envíos automáticos. Sin número válido se ocultan los enlaces. El worker usa la API oficial de Meta y plantillas aprobadas con un parámetro de texto, con cabecera de imagen opcional. Configurar en servidor `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `META_GRAPH_VERSION` (una versión soportada por tu cuenta), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Ejecutar `node backend/message-worker.mjs` bajo un supervisor con reinicio automático. Respetar consentimiento, restricciones, plantillas, límites y cobros del proveedor.

La cola es persistente, deduplica por campaña y teléfono y usa bloqueo al reclamar trabajos. Los estados de respuesta perdida pasan a `incierto` y no se reenvían automáticamente. Confirmar manualmente en Meta antes de iniciar otra campaña. `enviado` indica aceptación por la API, no lectura ni entrega al teléfono; no se ha implementado webhook de estados de entrega. Cancelar detiene pendientes, no un envío ya en curso.

## SEO

Ejecutar `node scripts/seo.mjs https://TU-DOMINIO` cuando el dominio y los datos sean definitivos; activar también seo.indexable en el panel. Genera sitemap, canonical y metadatos; excluye el panel. Verificar el dominio en Google Search Console por DNS y enviar `/sitemap.xml`. No se promete indexación inmediata ni posición. Mientras sea una demostración, mantener noindex.

## Copias y recuperación

Antes de cada despliegue conservar una versión de código y backup. Activar backups/PITR según el plan de Supabase y practicar una restauración en un proyecto separado. El backup administrado de base no equivale a copia de archivos Storage: ejecutar `node scripts/backup.mjs` con `BACKUP_DIR` apuntando fuera del repositorio y entorno de servicio privado. El script exporta tablas de aplicación (excluye tokens y contactos alternativos de recuperación) y archivos, no contraseñas ni toda la estructura de Auth. Para restauración completa usar el procedimiento de Supabase con Auth, esquema y roles; no ejecutar un dump de un proyecto en producción sin ensayo previo. `node scripts/backup.mjs verify RUTA` verifica hashes de archivos y JSON localmente. No se ha realizado una restauración real aquí.

Para recuperar al propietario: comprobar identidad y control de la cuenta de hosting/Supabase con MFA; desde terminal privada configurar las mismas variables que en el alta, con contraseña NUEVA, y ejecutar `node scripts/owner.mjs recover`. Esto actualiza el hash en Auth, reactiva al propietario y bloquea sesiones anteriores en las políticas de aplicación. Rotar secretos si hubo compromiso. No exponer estos scripts como endpoints web.

## Actualizaciones y pruebas

Editar siempre esta carpeta, manteniendo el original como respaldo. Ejecutar `node tests/core.mjs`, las pruebas PostgreSQL de `tests/permissions.mjs` cuando cambien políticas, y luego `node scripts/package.mjs` para actualizar manifiesto y ZIP de código. El ZIP se genera desde una lista de carpetas, excluye Word, secretos, backups y el prototipo original. El repositorio Git local está inicializado; no hay sincronización automática fuera de este trabajo ni push remoto configurado. Ver `tests/VALIDACION.md` para la evidencia local, las pruebas externas pendientes y sus criterios de aceptación.

Referencias técnicas: [RLS Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [Auth Admin](https://supabase.com/docs/reference/javascript/auth-admin-createuser), [sesiones](https://supabase.com/docs/guides/auth/signout), [SheetJS](https://docs.sheetjs.com/docs/getting-started/installation/standalone/).
