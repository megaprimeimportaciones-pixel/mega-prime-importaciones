# Actualizar accesos permisos QR y cotizaciones

Esta actualización conserva los usuarios y contraseñas existentes. Incluye cierre visible, contraseña con mostrar y ocultar, QR de contactos y redes, permisos por integrante, controles de visibilidad y solicitudes de cotización en la bandeja.

## Paso 1 Subir archivos a GitHub
Extrae ACTUALIZACION_ACCESOS_QR_PERMISOS.zip. Sube a la raíz del repositorio el contenido extraído, conservando frontend, backend y migraciones. No subas la carpeta exterior ni el ZIP. Usa el título Actualizar accesos permisos QR y cotizaciones. Confirma Commit changes y espera Actions en verde. El directorio frontend es el único que se publica como web; backend requiere despliegue aparte.

## Paso 2 Aplicar la actualización de base
En Supabase SQL Editor, New query, pega TODO ACTUALIZAR_ACCESOS_Y_PERMISOS.sql y pulsa Run. Es incremental, no reinstala ni elimina información. No ejecutes INSTALACION_SUPABASE.sql. Agrega datos de cotizaciones y permisos, y comprueba los permisos en el servidor, no solamente ocultando botones.

## Paso 3 Activar las funciones del servidor
Invitar usuarios, crearlos con contraseña temporal, corregir correo o contraseña y asignar permisos requiere desplegar backend/supabase/functions/manage-users/index.ts actualizado. Recibir cotizaciones o consultas requiere desplegar inquiry actualizado. Subir backend a GitHub no despliega estas funciones.

Desde el CLI de Supabase, situado en backend, vincula el proyecto cwjzokilpccpaziaoktv y despliega:

supabase functions deploy manage-users --no-verify-jwt
supabase functions deploy inquiry --no-verify-jwt

manage-users valida el token de usuario con Supabase Auth y exige rol owner dentro de su código antes de ejecutar cualquier acción. inquiry es público y valida Turnstile, origen y consentimiento. Configura SITE_URL=https://megaprimeimportaciones-pixel.github.io y SITE_BASE_URL=https://megaprimeimportaciones-pixel.github.io/mega-prime-importaciones en los secretos de funciones. Turnstile necesita su clave secreta en Supabase y su clave pública en frontend/config.js. Activa el hostname megaprimeimportaciones-pixel.github.io. SMTP debe estar configurado para invitaciones y recuperación por correo. Nunca pongas claves secretas en GitHub ni en el chat.

Alternativa: desde Edge Functions en el dashboard, abre cada función y usa su editor para reemplazar index.ts por el correspondiente, desplegar y configurar sus secretos. Si no existe la función, créala con el mismo nombre. La verificación JWT de la pasarela debe quedar desactivada para estos despliegues porque su código aplica la verificación adecuada de cada flujo; no elimines las comprobaciones internas del código.

## Paso 4 Probar el ingreso y cierre
Recarga con Ctrl+F5. El encabezado del panel muestra Cerrar sesión para propietario y editores. Cerrar, recargar, salir del panel o cambiar de pestaña bloquea la sesión de esta entrada. Debes volver a ingresar. No se cierran deliberadamente los otros dispositivos. El cierre del servidor al abandonar la página se intenta con keepalive y depende de que el navegador y la conexión permitan terminar la petición; el acceso local se elimina inmediatamente y la siguiente entrada exige autenticación.

El sitio no almacena la contraseña. El formulario se vacía y ofrece Mostrar/Ocultar. Para aceptar una contraseña autocompletada debes activar la opción de usar una contraseña guardada; por defecto se exige una entrada manual en el formulario. El navegador puede ignorar autocomplete off y volver a rellenar credenciales guardadas. La página no puede borrar las contraseñas del gestor de Chrome: elimina la entrada correspondiente desde el gestor si no deseas que las ofrezca. No se garantiza que un navegador o extensión respete la preferencia visual. Fuentes: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete y https://supabase.com/docs/guides/auth/signout . Publica antes de salir: el cierre elimina los borradores locales de esta entrada, no el contenido ya publicado.

## Paso 5 Usuarios y permisos
Usuarios y sesiones permite invitar por correo o crear una cuenta de editor con contraseña temporal y repetición. Puedes corregir nombre, correo y contraseña; suspender, revocar sesiones o eliminar. La gestión de cuentas sigue reservada al propietario, aun cuando conceda permisos especiales.

Los permisos por integrante son editar contenido, subir archivos, gestionar estados, gestionar videos, editar chatbot, revisar mensajes y cotizaciones y gestionar visibilidad. Los seis primeros están activos por defecto y visibilidad está desactivado. El propietario puede cambiar cada uno. El servidor rechaza cambios no autorizados aunque alguien manipule los controles del navegador. La revocación de visibilidad protege también la estructura del menú y de las categorías: los editores comunes pueden corregir textos e imágenes, pero no reorganizar ni ocultar esos apartados.

## Paso 6 Visibilidad pública
En Contenido abre Visibilidad de la página. El propietario y los integrantes con permiso especial pueden activar u ocultar Inicio, categorías, Misión, Visión, carrito, buscador, catálogo digital, chatbot, videos y demás apartados. Pulsa Guardar visibilidad y publicar. Las redes vacías no aparecen. No confundir ocultar contenido comercial con convertirlo en información secreta: el código del sitio estático es público y los datos privados requieren Auth y RLS.

## Paso 7 QR y WhatsApp
Cada número del editor de contactos y cada enlace de Redes sociales muestra su QR con Descargar QR en PNG y Copiar imagen del QR. Si el navegador rechaza el portapapeles, descarga el PNG. Los QR se calculan en el navegador usando la biblioteca de Project Nayuki con licencia MIT conservada, sin enviar el enlace a un generador externo. En el contacto público el QR abre WhatsApp del número mostrado. El botón del chatbot tiene icono de bocadillo y teléfono. Las redes se muestran solo después de aplicar enlaces y Guardar y publicar.

## Paso 8 Cotizaciones y chatbot
El carrito conserva imprimir/guardar PDF y su selección A4/A5. Añade nombre, contacto y consentimiento para registrar una solicitud en la plataforma. Cuando está activado inquiry y Turnstile, se guarda el detalle y aparece como No revisado en Mensajes y cotizaciones. Si falla el guardado se informa expresamente: no se presenta como recibida. El enlace WhatsApp permite abrir el resumen y confirmar el envío manual. Un aviso automático necesita WhatsApp Business oficial, plantilla aprobada y backend/chat-notifications.mjs funcionando en un servidor con sus secretos; GitHub Pages no ejecuta ese trabajador. Sin esa configuración no se afirma entrega automática.

Editar chatbot permite añadir preguntas, frases de consulta y respuestas. El buscador de respuestas normaliza tildes y usa coincidencias de palabras; no genera respuestas mediante IA. Las conversaciones solo se registran al enviarse con nombre, contacto, consentimiento y verificación válida.

## Paso 9 Calculadora
Sigue dentro del administrador. Se probaron ocho familias generales, rectángulos, triángulos, trapecios, cuatro aguas y 28 variantes de acabados, además del rechazo de entradas inválidas. Los perfiles que no tienen medidas comerciales confirmadas requieren completar esos datos: no se inventan largos ni traslapes. Las pruebas no validan estructuralmente una obra ni las fichas físicas de un fabricante.

## Verificación realizada
Pruebas locales de sintaxis, permisos reales en PostgreSQL embebido, roles, reacciones y comentarios; validación de cotizaciones y administración de cuentas simulando los servicios externos; cierre y renovación tardía; motores de cálculo; lectura del contenido de las matrices QR. Falta la comprobación en el proyecto publicado tras subir el paquete, ejecutar SQL y desplegar las funciones. No se han enviado correos ni mensajes reales de WhatsApp en estas pruebas.
