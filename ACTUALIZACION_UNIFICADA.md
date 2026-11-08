# Una sola actualización: permisos, usuarios, sesiones y vistas previas

## 1. GitHub
Extrae ACTUALIZACION_UNIFICADA_MEGA_PRIME.zip. Sube frontend, backend y este documento a la raíz del repositorio existente conservando las rutas. No subas el ZIP como archivo dentro del repositorio. No borres los otros archivos del repositorio.
Título sugerido: Unificar permisos, usuarios y vistas previas multimedia.
Espera a que Actions termine en verde y recarga el administrador con Ctrl+F5.

## 2. Supabase: una actualización de manage-users
En tu función existente manage-users → Code → index.ts, reemplaza TODO con backend/supabase/functions/manage-users/index.ts de este paquete. Pulsa Deploy updates. Mantén Verify JWT with legacy secret apagado. Esta versión acepta el nuevo permiso use_calculator. No crees otra función con un nombre automático.
No se necesita SQL nuevo si ya instalaste la actualización de accesos y permisos anterior (migración 014).
Si utilizas la función recovery para correo alternativo, publica también la versión incluida conservando sus secretos. Esa función requiere Resend y Turnstile configurados; mover el formulario no configura esos servicios. La recuperación normal del propietario sigue utilizando Supabase Auth.

## 3. Lo que cambia
- Usuarios y sesiones conserva la lista de cuentas activas y suspendidas y sus opciones de modificación y eliminación. El panel identifica nombre, correo y rol de quien edita.
- Usar calculadora interna aparece como permiso separado, desactivado por defecto para editores existentes y nuevos. El propietario siempre conserva acceso. Activa o desactiva en Usuarios y sesiones → integrante → Modificar permisos → Guardar permisos. Actualización de permisos en otras sesiones hasta 45 segundos; calculadora abierta vuelve a comprobar su permiso cada 30 segundos.
- Visibilidad pública tiene su botón propio. Controla lo que ven los visitantes: secciones, categorías, menú, buscador, carrito, catálogo y chatbot. Publica los cambios. Un editor solo puede usarlo con el permiso especial de visibilidad.
- Minimizar, cambiar de aplicación o recargar conserva la sesión por pestaña. Cerrar sesión elimina el acceso local. La contraseña no se almacena en el código ni se rellena por defecto. Restaurar pestañas desde el navegador puede restaurar sessionStorage: en equipos compartidos utiliza Cerrar sesión.
- Seguridad y recuperación es una pestaña independiente del propietario; el correo alternativo ya no aparece debajo de todos los apartados.
- Videos permanentes y estados tienen una vista previa lateral: archivo local antes de subirlo, título y descripción en vivo, reproducir/pausar, controles nativos, avance y retroceso de 5 segundos. En estados admite imagen y su audio opcional. En pantallas pequeñas la vista previa aparece arriba de los campos.
- Cambiar título o descripción no reinicia el video que estás previsualizando. Cambiar el archivo o salir del apartado pausa el reproductor. Cargar la vista previa no publica: debes Guardar video o Guardar estado.
- Para enlaces externos se ofrece un botón para cargar su reproductor; la disponibilidad y los controles dependen de la red social de origen.
- Administrador y editores con permisos de videos/estados utilizan las mismas vistas previas.

## 4. Prueba después de publicar
1. Entra como propietario y comprueba que el correo alternativo solo aparezca al pulsar Seguridad y recuperación.
2. En Videos permanentes selecciona un MP4/WEBM local. Comprueba la vista previa antes de subirlo; cambia título/texto, reproduce y usa los botones ±5 segundos. Guarda para publicarlo.
3. En Publicaciones y estados prueba una foto, un video, el texto y el audio opcional de la foto. La vista previa es del borrador, no de una publicación ya guardada.
4. Desactiva Usar calculadora interna a Peralta, guarda y recarga su sesión de editor. No debe mostrar Calculadora interna. Activa el permiso y repite: debe aparecer.
5. Usa Visibilidad pública como propietario, oculta un apartado, publica y comprueba la página del cliente. Vuelve a activarlo si lo deseas.
6. Comprueba minimizar/volver y Cerrar sesión.

El ZIP no incluye el Word, contraseñas ni claves privadas. No cambia cuentas reales ni contraseñas al subirlo. La calculadora y el resto del frontend siguen siendo archivos estáticos de GitHub Pages: estos permisos controlan el acceso de la aplicación; los archivos públicos no se convierten en secretos. Supabase Auth conserva su API de cambio de contraseña propia; no se afirma bloquearla solo ocultando opciones del panel.
