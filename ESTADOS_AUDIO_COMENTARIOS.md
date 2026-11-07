# Estados con texto, duración, audio y comentarios

1. Extraer este ZIP y subir su contenido a la raíz del repositorio conservando frontend y migraciones como carpetas. Título del commit: Mejorar estados con duración, audio y comentarios. Esperar Actions en verde y recargar el administrador con Ctrl+F5.
2. En Supabase SQL Editor ejecutar una vez SOLO ACTUALIZAR_ESTADOS_COMPLETOS.sql. Esta actualización activa las funciones de reacciones que faltan y agrega audio y comentarios sin borrar estados o contraseñas y sin reinstalar la base. No volver a ejecutar INSTALACION_SUPABASE.sql. Las migraciones anteriores conservan sus propias instrucciones.
3. Entrar en Publicaciones y estados. El formulario tiene cuatro pasos: foto o video; título y texto; audio opcional para la foto; duración y publicación. Guardar estado sube los archivos seleccionados y guarda todo; no se necesita copiar una URL. El audio admite MP3, M4A, OGG y WAV, hasta 50 MB; las fotos y videos conservan su límite de 50 MB.
4. El texto bajo Título y texto del estado se verá debajo de la foto o video en el visor público. El audio de una foto es un reproductor separado. Se intenta iniciar al abrir el estado; si el navegador bloquea el sonido, el visitante debe activarlo. No se exporta como un video ni se reproduce de forma automática. Los videos conservan su propio sonido.
5. Duración: 1, 2, 3, 4, 5, 6, 7, 8 o 15 días, sin vencimiento o una fecha personalizada. Se cuenta desde el momento de guardar. Al editar, se conserva el vencimiento previo hasta que elijas cambiarlo. El estado vencido deja de mostrarse al público pero sigue disponible para el equipo. No es una eliminación del archivo.
6. Los visitantes pueden escribir su nombre y un comentario al abrir un estado. Solo se publican los comentarios aprobados. En Comentarios de estados, propietario y editores pueden revisar, aprobar, ocultar o eliminar. El visitante ve el aviso de revisión y publicación de su nombre.
7. Límites de comentarios: diez por navegador en un día y cien pendientes por estado. El identificador de navegador permanece privado, no es una cuenta autenticada y puede regenerarse al borrar datos. La moderación protege la publicación; los límites por navegador no sustituyen un control robusto de abuso para tráfico masivo.
8. No se requieren nuevas funciones externas para estas opciones: usan Auth, Storage y las funciones SQL con permisos definidos. WhatsApp y el chatbot conservan sus requisitos de conexión separados, descritos en el paquete anterior.

El código se verificó localmente con pruebas de duración y permisos. Debes probar el guardado y reproducción en la web tras instalarlo. No se ha modificado la base remota ni enviado mensajes mediante esta actualización.

## Reproducción continua
Al abrir los estados se intenta reproducir el video. Si el navegador bloquea el sonido, se intenta reproducir silenciado y se ofrece Activar sonido. Los videos avanzan al terminar; las fotos sin audio duran siete segundos y las fotos con audio avanzan al terminar la pista. Los enlaces externos tienen doce segundos: su reproducción depende de las restricciones de la red externa y del permiso para cargarla. Se puede pausar, volver o avanzar. Al finalizar el último estado se cierra el visor y vuelve al inicio. Escribir un comentario pausa la secuencia; usa Continuar estados para seguir. Cambiar de pestaña pausa la reproducción.

La consulta pública del proyecto remoto mostró PGRST202 / 404 para story_reaction_counts: faltaba la actualización SQL de reacciones. Ejecutar el archivo incremental incluido y recargar habilita esas funciones; subir archivos a GitHub por sí solo no instala funciones SQL.

## Menú y título del círculo
Misión y Visión aparecen en el menú y enlazan a sus tarjetas. Sus títulos y visibilidad se editan en Contenido, Empresa, misión y visión. El círculo muestra solamente Nuestros estados; el subtítulo permanece oculto salvo que el equipo lo habilite explícitamente desde Contenido.

## Paquete acumulado
Se incluyen los formularios y la edición de contenido del paquete anterior, además de todas las funciones nuevas de estados. La descripción de la videoteca puede quedar vacía. Solo se publica la carpeta frontend; backend se conserva como código para desplegar en Supabase. Los cambios de nombre e invitaciones siguen necesitando desplegar manage-users, y el chatbot/WhatsApp conserva las conexiones externas pendientes. No se modificaron contraseñas ni el Word privado.

## Calculadora dentro del administrador
La calculadora ya no aparece en la navegación pública, la portada, el bloque de cálculo ni los botones de productos. Se abre desde Calculadora interna dentro del panel, para propietario y editores con sesión activa. La vista interna comprueba Auth y staff_role y revisa el permiso periódicamente. El código de cálculo sigue siendo JavaScript del cliente; esta separación controla su acceso en la interfaz y no convierte los archivos estáticos en código secreto.

El bloque de conexión solo aparece cuando falta configurar el proyecto. Ya no pide reinstalar la base en un proyecto conectado. No cambies la API key ni crees de nuevo tu usuario para aplicar esta actualización. No se cambian contraseñas.

Pasos completos
1. Extraer ACTUALIZACION_ADMIN_CALCULADORA_ESTADOS.zip.
2. En GitHub Add file, Upload files: arrastrar las cinco entradas de la carpeta extraída conservando frontend, backend y migraciones. No subir la carpeta exterior. Título: Actualizar estados y dejar calculadora dentro del administrador. Confirmar Commit changes y esperar Actions en verde.
3. Abrir ACTUALIZAR_ESTADOS_COMPLETOS.sql con un editor de texto, seleccionar todo y copiar. En Supabase SQL Editor, New query, pegar y pulsar Run. Este archivo es incremental y tolera volver a ejecutarse; no borra estados ni usuarios. No usar INSTALACION_SUPABASE.sql.
4. Comprobar Success. No rows returned. Si hay error, conservarlo y no cambiar permisos indiscriminadamente.
5. Recargar la web y el panel con Ctrl+F5. Entrar con la cuenta existente y abrir Calculadora interna. La calculadora no requiere otra migración.
6. Probar un estado con texto, duración y archivo. Las reacciones requieren las funciones del archivo incremental, no solo subir JavaScript a GitHub.
7. Las invitaciones y cambios de nombres/correos requieren desplegar manage-users en Supabase; el chatbot y WhatsApp conservan sus conexiones externas descritas en los paquetes anteriores. No se activan por subir backend a GitHub.
