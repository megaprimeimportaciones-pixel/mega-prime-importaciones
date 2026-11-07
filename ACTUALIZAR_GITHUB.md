# Actualizar el código de Mega Prime Importaciones

1. Extrae Mega_Prime_Importaciones_94_1_CODIGO_GITHUB.zip en una carpeta nueva.
2. Abre tu repositorio en GitHub. Reemplaza los archivos correspondientes conservando la estructura de este paquete. Si tu hosting usa frontend como raíz, conserva esa configuración: la página pública es frontend/index.html y el acceso es frontend/panel.html. No muevas solamente index.html: necesita las carpetas y scripts que lo acompañan.
3. Usa Add file > Upload files para subir las carpetas y archivos extraídos (no el ZIP). Confirma con Commit changes. Si trabajas con Git local, copia el contenido sobre tu checkout, revisa git diff y realiza commit y push hacia tu repositorio.
4. Espera el despliegue de tu hosting y recarga con Ctrl+F5. Publicar el repositorio no publica por sí solo una página web. El dominio depende de tu hosting.
5. En frontend/config.js cambia siteUrl al origen HTTPS real de tu página. Configura ese mismo origen y la redirección /panel.html en Supabase Authentication > URL Configuration. Conserva la URL y clave publishable del proyecto. Desactiva allowInitialPreview en producción.
6. Las nueve migraciones ya se ejecutaron según las capturas de esta conversación. No vuelvas a ejecutar INSTALACION_SUPABASE.sql ni borres las tablas. Solo si utilizas otra base anterior que aún no tiene videoteca y mensajería, revisa y ejecuta migraciones/009_videos_and_chat.sql una vez sobre esa base.
7. Accede a panel.html?entry=owner con megaprimeimportaciones@gmail.com y la contraseña que escribiste al crear el usuario en Supabase. La contraseña no se cambia al copiar archivos. Si no la recuerdas, restablécela mediante Supabase Authentication o el correo de recuperación con SMTP configurado. No publiques el Word.
8. Dentro del panel: Videos permanentes permite subir MP4/WEBM (hasta 50 MB), añadir enlaces compatibles, cambiar título, descripción, portada, orden, publicación, reemplazar o eliminar. La sección pública Videos está debajo del catálogo, separada de los estados.
9. Editar chatbot permite cambiar saludo, respuesta alternativa y preguntas/respuestas. Mensajes del chatbot muestra consultas enviadas y conversaciones autorizadas, estado, notas del equipo y respuesta por WhatsApp. Las notas internas no se envían solas al cliente. Un borrador de nota ya no se pierde durante la actualización automática.
10. Contenido incluye Misión y visión. Redes sociales permite guardar enlaces HTTPS; los iconos aparecen únicamente para los enlaces publicados. Un enlace vacío oculta su icono.

## Servicios pendientes de configurar

El código está preparado, pero copiarlo a GitHub no despliega las funciones del servidor. Sigue PASO_A_PASO_SUPABASE.md y README.md para desplegar manage-users, inquiry y recovery, configurar Turnstile y SMTP/Resend. Sin inquiry y Turnstile las consultas del formulario no se guardarán. Sin manage-users no se enviarán invitaciones ni se realizarán las acciones administrativas de cuentas.

Para avisos automáticos a WhatsApp debes configurar WhatsApp Business oficial, plantilla aprobada y ejecutar backend/chat-notifications.mjs en un servidor. Cada integrante activa su número y consentimiento en la bandeja. Las claves secretas solo van en el servidor. El enlace WhatsApp de la web abre el mensaje para que la persona lo revise y envíe; no equivale a un aviso automático.

## Si no entra el administrador

Recarga con Ctrl+F5. Comprueba correo y contraseña de Supabase (no la contraseña de GitHub ni la de la base PostgreSQL). Si aparece acceso revocado, revisa que la cuenta figure en public.members con role owner y active true. La asignación SQL ya mostró éxito, pero una consulta sin RETURNING no demuestra por sí sola que encontró el correo. Compruébalo con esta consulta de solo lectura en SQL Editor:

```sql
SELECT id, email, role, active
FROM public.members
WHERE lower(email) = 'megaprimeimportaciones@gmail.com';
```

Debe devolver una fila con owner y true. Si el error continúa, conserva el mensaje exacto; no compartas la contraseña ni claves secretas.
