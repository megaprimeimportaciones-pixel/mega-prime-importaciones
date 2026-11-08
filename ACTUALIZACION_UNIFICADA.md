# Actualización unificada de Mega Prime Importaciones

Este ZIP actualiza el repositorio existente. Contiene 25 archivos. No contiene Word, contraseñas ni claves privadas.

## 1. GitHub: una sola subida
Extrae ACTUALIZACION_UNIFICADA_MEGA_PRIME.zip. Sube las carpetas frontend, backend, migraciones y los documentos ACTUALIZAR_VISIBILIDAD_SOLO_ADMIN.sql y ACTUALIZACION_UNIFICADA.md a la raíz del repositorio, conservando las rutas. No borres los otros archivos. No subas el ZIP dentro del repositorio.
Título: Mejorar editor completo, galerías y controles del administrador.
Espera Actions verde. Recarga el panel con Ctrl+F5.

## 2. Supabase: visibilidad solo del administrador
SQL Editor → New query. Copia TODO ACTUALIZAR_VISIBILIDAD_SOLO_ADMIN.sql de este paquete y pulsa Run. Este SQL no borra datos. Actualiza la comprobación de permisos existente para impedir que los editores activen u oculten apartados, aunque tuvieran un permiso antiguo. Requiere la instalación anterior con miembros y permisos. No repitas INSTALACION_SUPABASE.sql.

Edge Functions → manage-users → Code → index.ts. Reemplaza TODO con backend/supabase/functions/manage-users/index.ts del paquete y pulsa Deploy updates. Mantén Verify JWT with legacy secret apagado. Esta versión admite use_calculator y rechaza delegar la visibilidad al editor. No crees otra función.

Si utilizas recovery para correo alternativo, publica la versión incluida conservando sus secretos. Necesita Resend y Turnstile: mover el formulario no configura esos servicios. La recuperación normal del propietario sigue utilizando Supabase Auth.

## 3. Editar el contenido
Entra como propietario o editor con permiso Editar textos, fotos, productos y colores → Contenido.
Ahora hay botones claros para:
- Nombre Mega Prime Importaciones y logotipos.
- Menú: Inicio, Cubiertas, Acabados y demás enlaces.
- Portada: Ideas para construir, cubiertas y acabados.
- Fotos que cambian en la portada.
- Explora las categorías; fotos y descripciones de categorías.
- Materiales para tu proyecto y productos, fotos, descripciones y colores.
- Empresa, misión y visión; distribuidores y constructores.
- Opiniones, valoraciones y promedio general; indicadores.
- Asesorías y beneficios; contacto y teléfonos; ubicación y mapa.
- Redes sociales, WhatsApp, cotizaciones y documentos descargables.
- Títulos de videos y estados; encabezado y pie de página.
El selector conserva los demás apartados de configuración editable. Pulsa los nombres para desplegar sus campos. Cambiar textos del menú conserva su destino y la categoría interna para no romper los productos.
Pulsa Aplicar y ver el borrador para revisar. Guarda y publica para que los visitantes vean los cambios.

## 4. Imágenes publicadas, reemplazo y copia
Cada campo de imagen muestra su miniatura y permite abrir o descargar la imagen, o subir y usar una nueva. Cuando el borrador tiene una imagen distinta de la configuración publicada, se muestran ambas con etiquetas. Las imágenes se descargan sin credenciales. Si un proveedor externo bloquea la descarga, usa Abrir imagen y guarda desde el navegador.
En productos puedes añadir y editar galerías y fotos por variante. Las fotos que rotan en la portada pertenecen a los productos destacados: selecciona, ordena, retira o añade hasta 24 fotos. Reemplazar su imagen principal también modifica la foto de ese producto en el catálogo; el editor lo indica.
Redes sociales conserva enlaces y generación de QR para descargar/copiar. Solo las redes con enlace guardado aparecen en la web.

## 5. Videos y estados guardados
Antes del formulario aparece la galería Videos activos y permanentes o Estados actuales y guardados. Las tarjetas muestran miniatura, nombre, texto y estado: publicado, borrador o vencido. La galería de videos muestra hasta 50 registros por página; usa Anterior o Más videos para los demás.
Pulsa una miniatura o Abrir y editar: carga ese mismo registro en el formulario y en la vista previa de la derecha. Guardar modifica ese registro sin duplicarlo. Nuevo video o Nuevo estado inicia otro registro. Puedes Actualizar galería y Eliminar video/estado.
La vista previa permite reproducir/pausar, adelantar/retroceder 5 segundos y usar los controles nativos. El título y texto cambian sin reiniciar el video. Funciona con archivos locales antes de subirlos. En estados también admite foto con audio opcional. En pantallas pequeñas aparece sobre el formulario.
Los enlaces externos requieren pulsar Cargar vista previa del enlace y sus controles dependen de la red social. No se carga un reproductor externo en cada miniatura.

## 6. Solo el administrador: mostrar u ocultar
Pulsa 👁 Activar / desactivar apartados en la barra del panel del administrador.
Se abre una pestaña propia con botones Activo / Desactivar y Oculto / Activar para inicio, categorías, catálogo, distribuidores, misión, visión, contacto, ubicación, videos, estados y otros apartados, además de los enlaces del menú, carrito, buscador y chatbot.
Pulsa Guardar visibilidad y publicar. Un editor puede editar contenido según sus permisos, pero no cambiar esta visibilidad. Esta última restricción también se comprueba en Supabase al instalar el SQL del paso 2.

## 7. Usuarios, sesiones y calculadora
Usuarios y sesiones conserva cuentas activas/suspendidas, crear integrante con contraseña asignada, corregir nombre/correo/contraseña, permisos, revocar y eliminar editores. El propietario se protege de eliminación desde esta lista. La cuenta actual muestra nombre, correo y rol.
Usar calculadora interna es un permiso separado: desactivado por defecto para editores, siempre habilitado para el propietario. Los cambios de permisos se consultan cada 45 segundos; la calculadora abierta verifica el suyo cada 30 segundos. Recarga la sesión del editor para comprobar de inmediato.
Minimizar, cambiar de aplicación o recargar conserva la sesión por pestaña. Cerrar sesión elimina el acceso local. No se guarda la contraseña. Restaurar pestañas desde el navegador puede restaurar sessionStorage; en equipos compartidos utiliza Cerrar sesión.
Seguridad y recuperación tiene su pestaña propia del propietario: no aparece repetida bajo todos los apartados.

## 8. Prueba final
1. Propietario: abre Contenido y edita en borrador marca, título de portada, un enlace del menú y una imagen. Comprueba miniaturas y descarga una copia.
2. Abre Fotos que cambian en la portada; comprueba su secuencia y el producto asociado.
3. Abre Videos permanentes y Estados: selecciona un registro existente de la galería, corrige su texto y comprueba la vista previa. Guarda solo cuando quieras aplicar el cambio.
4. Propietario: prueba el botón Activar / desactivar apartados, publica y verifica la página del público.
5. Editor: verifica que puede editar los apartados autorizados y no tiene controles de visibilidad. Comprueba la calculadora con permiso activado y desactivado.
6. Comprueba minimizar/volver, cerrar sesión y Seguridad y recuperación.

Esta entrega no cambia cuentas, contraseñas ni contenido publicado desde esta PC. La calculadora y el frontend siguen siendo archivos públicos de GitHub Pages: controlar su apertura en la interfaz no convierte sus archivos en secretos. Supabase Auth conserva su API de cambio de contraseña propia: ocultar opciones del panel no bloquea por sí solo las llamadas directas a esa API.
