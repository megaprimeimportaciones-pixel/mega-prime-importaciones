# Usuarios que no aparecen ni pueden entrar

La comprobación pública de manage-users devolvió {"message":"Hello undefined!"}. Es el ejemplo del editor, no el código de gestión de usuarios. Esa respuesta no crea cuentas. La actualización del panel rechaza ahora ese resultado y no anuncia éxito.

## GitHub
Sube frontend/client.js, frontend/member-permissions.js y frontend/panel.html conservando la carpeta frontend. Título: Corregir confirmación y listado de usuarios. Espera Actions verde y recarga Ctrl+F5.

## Supabase (sin SQL)
1. Edge Functions → manage-users → Code.
2. Selecciona index.ts. Haz clic DENTRO del texto del código, Ctrl+A, y reemplaza TODO con backend/supabase/functions/manage-users/index.ts de este paquete. No crees otra función con nombre aleatorio.
3. Publica/guarda los cambios de la función existente. No basta con cambiar el nombre o guardar Settings.
4. Mantén Verify JWT with legacy secret apagado en Settings.
5. Vuelve a Code y comprueba que la primera línea importe createClient de npm:@supabase/supabase-js@2.49.8 y que el código incluya createUser y staff_role. No debe decir Hello ni withSupabase.
6. Entra como propietario al panel → Usuarios y sesiones → Actualizar lista de usuarios.
7. Si el correo deseado no aparece, créalo con su contraseña repetida. Espera confirmación. Si aparece, usa Corregir contraseña del integrante para asignar la correcta.
8. Prueba el acceso en una ventana privada como usuario editor. No envíes contraseñas por chat.

La lista muestra activos y suspendidos. Cada editor incluye corregir nombre/correo/contraseña, activar/suspender, revocar, permisos y Eliminar usuario. La cuenta propietaria se protege de eliminación desde esta lista.

No se modificaron contraseñas existentes ni el Word. La publicación de la función y la prueba con una cuenta real siguen pendientes de realizar en tu sesión de Supabase.

El panel también identifica la cuenta que está editando (nombre, correo y rol), marca Tu sesión actual y cuenta por separado los editores activos. Los totales indican acceso habilitado, no presencia en línea.
