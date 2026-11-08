# Corregir usuarios y conservar la sesión al minimizar

## 1. Actualizar GitHub
Sube las carpetas frontend y backend de esta actualización conservando sus rutas. Título: **Corregir creación de usuarios y sesión del administrador**.
Espera a que Actions termine en verde. Recarga el panel con Ctrl+F5.
No hay una migración SQL nueva para esta actualización. No cambies ninguna contraseña en el código ni publiques el Word.

## 2. Publicar manage-users en Supabase (necesario)
La comprobación del 7 de noviembre respondió HTTP 404 para /functions/v1/manage-users. Subir archivos a GitHub no publica esta función.

1. Abre tu proyecto Mega Prime Importaciones en Supabase.
2. Entra en Edge Functions → Deploy a new function → Via Editor (el nombre de la opción puede variar).
3. Nombra la función exactamente **manage-users**.
4. Copia todo backend/supabase/functions/manage-users/index.ts de esta actualización en el editor index.ts, reemplazando el ejemplo.
5. Publica la función. En sus ajustes desactiva **Verify JWT with legacy secret**. El código comprueba por su cuenta la sesión con auth.getUser y exige el rol owner antes de cualquier operación. No elimines esas comprobaciones.
6. Las variables SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY las proporciona Supabase a sus funciones. No copies la service_role a GitHub ni al navegador.
7. El código ya incluye el origen oficial de GitHub Pages. Si tienes secretos SITE_URL y SITE_BASE_URL configurados, comprueba que sean exactamente:
   SITE_URL=https://megaprimeimportaciones-pixel.github.io
   SITE_BASE_URL=https://megaprimeimportaciones-pixel.github.io/mega-prime-importaciones
   SITE_URL no lleva ruta ni barra final; SITE_BASE_URL sí lleva la ruta del repositorio.

Alternativa por CLI, desde backend y después de autenticarte con tu propia cuenta:

```powershell
supabase functions deploy manage-users --project-ref cwjzokilpccpaziaoktv --no-verify-jwt
```

No se desplegó desde esta PC: no había CLI Supabase autenticada disponible. Debes completar el paso anterior en el dashboard.

## 3. Crear y comprobar un integrante
1. Inicia sesión como administrador → Usuarios y sesiones.
2. Escribe nombre, correo, Asignar contraseña y Repetir contraseña. Mínimo 16 caracteres.
3. Define los permisos y pulsa Añadir integrante. Espera la confirmación **Integrante creado** y verifica que aparezca en la lista. Un error no significa que se creó.
4. Abre otra pestaña privada para probar el acceso de usuario editor con ese correo y la contraseña asignada.
5. En la lista del administrador puedes corregir nombre, correo o contraseña, suspender, revocar sesiones y eliminar. La contraseña asignada no caduca por esta aplicación.

## 4. Sesión
Minimizar, cambiar de pestaña, usar otra aplicación y recargar no cierran tu sesión. Cerrar sesión borra el acceso local y revoca su renovación. El acceso se guarda solo en sessionStorage de esa pestaña, nunca la contraseña. Al cerrar normalmente la pestaña se elimina ese almacenamiento. La restauración de pestañas por el navegador puede recuperar sessionStorage: si utilizas un equipo compartido pulsa siempre Cerrar sesión antes de salir.

## 5. Alcance de la administración de contraseñas
El panel no ofrece a los editores cambiar contraseñas o recuperar su clave; deben pedirlo al administrador. La función manage-users solo acepta administradores. También se restringió la recuperación alternativa a la cuenta propietaria; si utilizas esa función publica la nueva versión de backend/supabase/functions/recovery/index.ts conservando sus secretos existentes.
Esto limita las funciones de esta aplicación, pero **Supabase Auth permite a un usuario autenticado actualizar su propia contraseña a través de su API**. Ocultar botones no impide una llamada directa a esa API. Esta entrega no afirma haber bloqueado esa capacidad de Supabase ni modifica internamente auth.users. Una prohibición absoluta requiere una arquitectura de autenticación que la imponga también en el servidor.

## 6. Comprobación después de publicar
- El integrante se crea y puede iniciar sesión en una ventana privada.
- El editor no ve administración de cuentas; el propietario sí.
- Minimizar y volver conserva el panel abierto y los cambios del borrador.
- Cerrar sesión vuelve al acceso con contraseña vacía.
- Una nueva pestaña abierta normalmente después de cerrar la anterior pide acceso; no uses Restaurar sesión del navegador como prueba de cierre seguro.
