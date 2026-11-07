# Estado verificable

Ejecutado localmente: `node tests/core.mjs` (sintaxis de JavaScript y scripts inline, parseo de funciones TypeScript tras eliminar anotaciones, configuración ampliada, simulación REST de sesión, rechazo de formatos y tamaños, petición de subida, importación XLS/XLSX real con deduplicación y carga de scripts del panel). Las respuestas REST son simuladas; estas pruebas no demuestran funcionamiento de RLS, Storage, correo o Meta. DOCX/PDF requieren prueba en navegador.

La primera revisión se interrumpió por la herramienta de control de Windows. Tras reiniciar el servidor local se pudo usar el navegador integrado: se verificaron portada con el nombre oficial, correo, enlace WhatsApp, nuevos bloques, apertura y respuesta FAQ del chatbot, entrada de administrador y sección de empresa con efectos visuales. En un servidor de simulación aislado (`tests/panel-qa-server.py`) se probó aplicar un enlace de YouTube, guardar, crear un estado publicado y anclado y comprobar ambos desde otra pestaña de la página pública. No se conectaron cuentas sociales reales ni se enviaron mensajes. La revisión visual móvil completa y las pruebas reales desde otro dispositivo siguen pendientes.

Ejecutado además: `node tests/permissions.mjs` con PostgreSQL embebido PGlite 0.3.14 y tablas Auth/Storage simuladas. Pasaron las ocho migraciones, rechazo de contactos duplicados, permisos RLS por rol, filtrado de datos no publicados, conflictos, restauración con copia previa, vencimiento de estados, restricciones de rutas y eliminación de Storage, suspensión, revocación pese a renovar un JWT, bloqueo individual, consumo único de tokens, deduplicación y cancelación de cola y tratamiento de trabajos interrumpidos. Es un motor PostgreSQL real; no reproduce todo el servicio Auth ni Storage de Supabase. Para repetir, instalar `@electric-sql/pglite@0.3.14` en una carpeta de pruebas y definir `PGLITE_MODULE` con la ruta a su `dist/index.js`.

El Word privado se comprobó como ZIP/OOXML válido. El renderizador de documentos no está disponible en este entorno; su revisión visual queda pendiente.

Chatbot animado: revisado en la vista móvil local con personaje vectorial, globo y enlace de WhatsApp al número confirmado. Se comprobó que al tocar el personaje se abre el panel FAQ y se muestra el control de cierre. La respuesta FAQ ya se verificó en la revisión anterior; no se envió una consulta real.

Portada actualizada: verificados ausencia del aviso superior, título nuevo, rutas locales de imágenes, círculo de estados, apertura del visor vacío y enlace al apartado de publicación. Las seis imágenes generadas se inspeccionaron visualmente. No se probó una subida real a Storage en esta revisión.

## Antes de publicar: entorno Supabase de ensayo

1. Crear propietario y dos editores por invitación. Abrir ventanas/perfiles independientes. Un anónimo no debe leer miembros, consultas, contactos, historial ni cola. Un editor no debe modificar miembros mediante REST ni invocar restauración o administración de cuentas.
2. Editar un texto, previsualizar, guardar, recargar y verlo desde un teléfono y otro PC. Medir desde guardar hasta mostrar el nuevo texto: debe ser inferior a 180 segundos con red normal. Confirmar actualización también en catálogo digital.
3. Abrir dos editores en la misma revisión. Publicar en uno; en el otro el guardado debe fallar por conflicto y conservar el borrador.
4. Subir imagen y video, verificar reproducción y acceso desde otro dispositivo. Reemplazar URL, borrar archivo propio y comprobar que un editor no borra archivos ajenos. Enviar tipos no permitidos y más de 50 MB directamente a Storage: debe rechazarlos.
5. Publicar estado con vencimiento a dos minutos; confirmar que desaparece y que un anónimo no lo puede recuperar con REST al vencer.
6. Suspender editor con sesión abierta e intentar guardar por REST inmediatamente: debe denegarse. Probar revocación global, sesión individual y cierre de sesión. Esperar renovación de token y volver a intentar: también debe rechazarse.
7. Configurar Resend, verificar correo alternativo, rechazar token usado/vencido y comprobar notificaciones a ambos correos. Probar recuperación por correo principal, caducidad y segundo uso del mismo enlace; verificar notificación de cambio con SMTP real. Probar invitaciones. Nunca compartir las contraseñas de editores con el administrador.
8. Guardar versión, restaurar y comprobar que se conservó la versión anterior. Exportar backup de datos y medios, verificar hashes y restaurar en un proyecto de prueba aislado siguiendo el procedimiento del proveedor.
9. Configurar Turnstile con dominio de ensayo, registrar consulta con consentimiento y token válido; rechazar token faltante/reutilizado y origen distinto. Gestionar estado como editor.
10. Importar documentos propios con teléfonos conocidos: Word, XLS, XLSX, PDF con texto, PDF escaneado; comprobar normalización, duplicados, revisión de falsos positivos y exportación. El escaneado debe informar que necesita OCR.
11. Configurar cuenta de pruebas Meta, plantilla y destinatario autorizado. Encolar envío, comprobar resultado y cancelación. Detener el worker tras reclamar un trabajo: al reiniciarlo no debe reenviar el trabajo y debe marcarlo incierto al vencer el plazo. Confirmar que los tokens no salen en respuestas, logs ni archivos públicos.
12. Comprobar móvil, accesibilidad, mapa real, redes, enlaces de WhatsApp, impresión, calculadoras y cotizaciones. Revisar datos demostrativos, márgenes, textos e imágenes antes de aprobar diseño.

## Funciones aún no incluidas

OCR integrado; webhook de confirmación de entrega/lectura de Meta; reacciones; asistente con IA generativa. El chatbot incluido es FAQ. Los enlaces temporales y notificaciones se delegan a Supabase y requieren configuración externa. No se ha hecho una auditoría de penetración ni se garantiza ausencia de vulnerabilidades.
