# Redes y estados · Mega Prime Importaciones

## Perfiles visibles al guardar el enlace

El panel Contenido tiene un apartado específico de redes con campos para YouTube, Facebook, TikTok, X, Instagram, Threads, LinkedIn, Pinterest y Telegram. Se pueden añadir otras redes. Al aplicar los enlaces y publicar, los campos vacíos quedan ocultos y los enlaces HTTPS configurados aparecen en la zona de redes. No se han inventado cuentas ni URLs oficiales.

## Estados creados desde esta web

En Publicaciones y estados, crea título y texto, sube una imagen o video en el panel y utiliza su URL. Puedes publicar, editar, borrar, fijar arriba o desanclar un estado. El vencimiento es opcional; un estado anclado también desaparece al vencer. La etiqueta de procedencia identifica si es material propio de la web, material propio que también compartiste en WhatsApp o una publicación de otra red.

Esto publica en tu web. No publica automáticamente en las cuentas de WhatsApp, TikTok, Facebook o X. Esas operaciones requieren las APIs de publicación, autorización y revisión correspondientes y no se han implementado.

## Mostrar una publicación social

Pega el enlace público en el campo Enlace público de la publicación. TikTok, YouTube y Facebook cuentan con adaptadores de visualización; para otras redes se ofrece abrir el enlace original. Los reproductores externos se cargan cuando el visitante pulsa Mostrar publicación; no se ejecuta HTML arbitrario pegado por un editor. Un contenido eliminado, privado o no habilitado para incrustación puede no reproducirse. Se conserva un botón para abrir la publicación original.

Para TikTok usa el enlace completo `https://www.tiktok.com/@CUENTA/video/ID`; los enlaces cortos siguen funcionando como enlaces pero no se resuelven automáticamente en el servidor. Las historias privadas y los estados de WhatsApp no se convierten en archivos públicos ni se descargan con técnicas de extracción. Para reflejar un estado propio de WhatsApp, sube el mismo archivo original como estado de la web con la duración que elijas.

## TikTok: importar nuevas publicaciones autorizadas

Incluido `backend/social-sync.mjs`, un proceso de servidor que consulta TikTok Display API cada dos minutos, importa hasta los 20 videos recientes y deduplica por ID. Las publicaciones ya importadas conservan los cambios locales, el estado de publicación y su anclaje. No copia el archivo del video; guarda el enlace oficial para mostrarlo con el reproductor de TikTok.

Requiere una app aprobada en TikTok con Login Kit y Display API, scopes `user.info.basic` y `video.list`, y autorización OAuth de la cuenta propietaria. Obtener los tokens desde el flujo OAuth oficial; nunca pegarlos en el frontend. Configurar las variables de `backend/.env.example`. Para renovación automática indicar `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REFRESH_TOKEN` y `SOCIAL_TOKEN_FILE` con ruta privada FUERA del repositorio. Proteger ese archivo con permisos del servidor. `SOCIAL_AUTO_PUBLISH=false` importa como borradores para revisión; `true` permite publicarlos automáticamente.

Ejecutar `node backend/social-sync.mjs --once` para una prueba y luego `node backend/social-sync.mjs` bajo un supervisor. No se ha conectado una cuenta TikTok ni se han probado llamadas reales. El retraso depende de la API, red y proceso de servidor; no se ha medido sincronización entre dispositivos.

La sincronización automática de historias/estados de Facebook o WhatsApp no está implementada. Facebook admite el enlace público manual y su adaptador de visualización; validar cada publicación real. No hay una promesa de reflejar estados privados automáticamente por poner el teléfono o la URL del perfil.

Referencias oficiales: [TikTok Display API](https://developers.tiktok.com/doc/display-api-get-started), [objeto de video](https://developers.tiktok.com/docs/en/tiktok-api-v2-video-object), [reproductor incrustado](https://developers.tiktok.com/docs/en/embed-player), [privacidad de estados WhatsApp](https://blog.whatsapp.com/new-ways-to-enjoy-whatsapp-status).
