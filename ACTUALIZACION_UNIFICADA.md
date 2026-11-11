# Actualización unificada: catálogo editable y todas las mejoras anteriores

Este ZIP contiene 77 archivos para actualizar el repositorio existente. Incluye el editor de productos, modelos, categorías, colores y fotos, junto con las correcciones anteriores de usuarios, sesiones, visibilidad, videos y estados. No contiene Word ni contraseñas.

## Aplicar esta ampliación
1. Extrae ACTUALIZACION_UNIFICADA_MEGA_PRIME.zip y sube su contenido a la raíz de GitHub conservando las carpetas. No borres otros archivos del repositorio.
2. Título: Acercar guardado y agrupar productos con vistas previas.
3. Espera Actions verde.
4. Esta ampliación de grupos y fotos por modelo no requiere cambios nuevos en Supabase. Solo si todavía no aplicaste ACTUALIZAR_CATALOGO_EDITABLE.sql de la entrega anterior, ejecútalo en SQL Editor. Permite a los editores con permiso de contenido añadir categorías; no les concede activar, ocultar, renombrar o retirar categorías existentes. No borra datos.
5. Si ya instalaste ACTUALIZAR_VISIBILIDAD_SOLO_ADMIN.sql y actualizaste manage-users en la entrega anterior, no los repitas. manage-users no cambia en esta ampliación. Si no lo hiciste, completa esos pasos anteriores antes de probar permisos.
6. Recarga el panel y la web con Ctrl+F5.

## Productos y categorías: administrador y editor autorizado
En la barra del panel pulsa Productos y categorías. También los botones de productos y categorías dentro de Contenido llevan al nuevo editor.
Puedes buscar y filtrar todo el catálogo guardado; las tarjetas identifican registros publicados, cambios en borrador y productos nuevos. Selecciona la foto o Abrir y editar para ver sus datos.
- Añadir producto: crea otra teja española, Roma, trapezoidal u otro artículo en cualquier categoría. El ID se asigna sin repetir.
- Duplicar producto: crea una copia para otro modelo. No sustituye al original.
- Nombre, subtítulo y descripción son editables. El aviso de posible duplicado ayuda a revisar nombres iguales en la misma categoría, sin bloquear modelos legítimos.
- Categoría y tipo/subcategoría: asigna la familia existente o escribe una nueva. Añadir tipo/subcategoría permite poner su nombre visible en los filtros del cliente.
- Modelos/medidas: añade presentaciones con nombre, modelo, formato, espesor, ancho total, ancho útil, largo, rendimiento, unidad, observaciones y colores. No se inventan medidas ni fichas verificadas: introduce datos del producto real.
- Fotos: cambia la principal, revisa y descarga la foto publicada, añade más fotos y crea galerías por color. Los archivos se suben a Storage; guarda el producto para conservar sus enlaces.
- Bandeja de colores: crea un nombre y elige su tono visual. Puedes modificar tonos y seleccionar colores para cada producto; también escribirlos por líneas y asignar colores por presentación. Pulsa Editar las fotos de estos colores para abrir las galerías correspondientes.
- Añadir categoría: administrador y editor autorizado pueden crear nuevas categorías visibles. Las nuevas aparecen automáticamente en Explora las categorías y los filtros. Solo el administrador puede renombrar o retirar categorías existentes; al renombrar se actualizan productos y enlaces correspondientes.
- Orden: Subir/Bajar cambia la secuencia del catálogo y desactiva la prioridad de destacados para respetar el orden manual.
- Publicado/destacado: puedes guardar productos como borrador, publicarlos y marcarlos destacados.

Guardar en el borrador no cambia la web. Guardar y publicar catálogo publica el conjunto de cambios de la página y conserva la protección de revisión: si otra persona publicó antes, debes revisar/cargar la versión nueva en lugar de sobrescribirla a ciegas. No elimina registros al añadir otro. Los permisos siguen comprobándose en PostgreSQL.
La capacidad actual es de 500 productos, 80 categorías, 60 presentaciones por producto y 12 fotos por galería. Los límites se indican en el editor; no se promete capacidad ilimitada.

## Sincronización con catálogo digital
La página principal y el catálogo digital reciben los productos de public_content, la misma publicación de Supabase. Fotos, títulos, descripciones, modelos, medidas y colores se transfieren juntos. El catálogo digital excluye borradores y categorías ocultas y admite los mismos 500 productos y 60 presentaciones.
Al publicar, las otras pestañas del mismo navegador reciben una señal y consultan la versión nueva. El catálogo digital también consulta al abrirse, al volver a enfocarlo y cada 45 segundos mientras está visible. En otro dispositivo, recarga para comprobar de inmediato. Los cambios que todavía son borrador no aparecen al público.

## Permisos y mejoras anteriores
El editor con Editar textos, fotos, productos y colores y Subir y retirar archivos propios puede mantener productos, medidas, modelos, colores y fotos. La creación de categorías nuevas necesita el SQL de esta entrega. No cambian las restricciones anteriores de cuentas/contraseñas, visibilidad de secciones o acceso a la calculadora.
Se conservan la pestaña Activar/desactivar apartados solo del propietario, el guardado con confirmación local, la sincronización de categoría y enlace del menú, las galerías de videos/estados con vista previa, el editor de toda la página y la pestaña separada de Seguridad y recuperación. No vuelven los avisos automáticos de borrador recuperado o nueva versión. El Word y las contraseñas existentes no se modifican.

## Prueba
1. Como editor, añade un producto y dos presentaciones con medidas. Crea un color y asigna sus fotos. Guarda y publica.
2. Comprueba el registro en la web principal y el catálogo digital; cambia otra medida y publica sin duplicarlo.
3. Añade un producto más en la misma categoría y luego una categoría nueva; comprueba ambos en Explora y en los filtros.
4. Comprueba como editor que no puedes ocultar categorías existentes ni administrar cuentas. Como propietario conserva esos controles.
5. Comprueba que los videos, estados, sesiones y visibilidad anteriores siguen funcionando.


## Grupos y productos como las referencias
En Productos y categorías selecciona Grupos: tornillos, perfiles, tejas y accesorios. Crea o edita cada grupo con nombre, descripción e imagen. Por ejemplo, un grupo Tornillos y capuchones dentro de Accesorios.

Selecciona Productos para añadir artículos al grupo existente. Puedes crear productos independientes o añadir varias presentaciones dentro de un producto. Cada modelo admite su propia foto, descripción, características, galería, medidas y colores. El administrador y el editor con los permisos de contenido y archivos tienen estas opciones. Las tarjetas del panel permiten revisar los modelos y sus imágenes guardadas.

Pulsa Guardar y publicar para reflejarlo en la página principal y el catálogo digital. La navegación pública permite abrir categoría, grupo y tarjetas de los modelos publicados, y después la ficha del modelo elegido. Las fotografías de referencia no se cargan como inventario: sube las imágenes reales de tus artículos.

Para el tornillo que faltaba: abre el producto correcto (el encabezado indica cuál estás editando), asigna la foto al producto o a su modelo y guarda y publica. Seleccionar o subir un archivo sin guardar el registro no publica esa imagen. Los datos publicados consultados todavía conservaban la imagen general de herramientas en Tornillos y fijaciones.

## Vista previa inmediata y productos publicados (actualización 117)
- Al seleccionar una foto JPG, PNG o WEBP aparece de inmediato en el campo y en la vista previa de la derecha, antes de subirla. Puedes cambiar título, descripción, medidas y colores viendo el resultado. Guardar en el borrador o Guardar y publicar sube automáticamente las imágenes seleccionadas. Una subida fallida impide confirmar el guardado; no se publica un enlace local del navegador.
- Encima del formulario aparece Publicado en [categoría], con TODOS los productos/modelos publicados de esa categoría, fotos, medidas y colores, incluso mientras creas otro producto. La galería tiene desplazamiento y cada tarjeta permite Editar este producto. Se distingue de la vista previa de tus cambios todavía sin publicar.
- Si solo asignas foto a un modelo y el producto aún no tiene principal, se usa esa primera foto como portada al guardar.
- Cargar 4 ejemplos ficticios añade cuatro borradores de guía en la categoría seleccionada. Incluye nombres, medidas ficticias, colores e ilustraciones. Se puede repetir en cada categoría. No duplica ejemplos iguales ni altera los artículos existentes. Sustituye los datos antes de publicarlos. El administrador y los editores con permiso de contenido tienen las mismas opciones; subir archivos sigue requiriendo su permiso correspondiente.
- Esta corrección se sube a GitHub; no requiere SQL nuevo ni reemplazar manage-users en Supabase. Conserva los pasos anteriores solo para quien no los haya completado.

## Guardado accesible y grupos (actualización 118)
1. En Productos y categorías elige la categoría y después el grupo, por ejemplo Accesorios → Tornillos y fijaciones. Las tarjetas quedan agrupadas por tipo; no se modifica su orden comercial.
2. Abre un producto o pulsa Añadir producto. El nuevo producto hereda el grupo seleccionado. Arriba encontrarás Guardar en el borrador y Guardar y publicar en una barra fija, y los mismos controles justo después de título y descripción.
3. La zona Publicado en [grupo] reúne sus artículos y modelos publicados con medidas y colores. Ver todos los productos de esta categoría vuelve a la lista completa. Los ejemplos aparecen después y se identifican como borradores ficticios.
4. Cargar 4 ejemplos ficticios utiliza el grupo: en tornillos crea cuatro tornillos diferentes; en perfiles, cuatro perfiles; en canaletas, cuatro canales. Incluye ilustraciones diferentes, descripciones y medidas ficticias. Si tienes campos sin guardar, guarda el borrador primero. No se publican automáticamente ni se mezclan con el inventario real.
5. Al guardar aparece Procesando, Subiendo imágenes o Guardando y publicando en Supabase junto al botón. Los botones se desactivan mientras se procesa. El resultado muestra Publicado correctamente y su versión, o el error en ese mismo lugar. Ante conflicto, conserva el borrador y pide revisar la versión nueva; no sobrescribe otros cambios automáticamente.
6. Se valida el nombre antes de subir archivos. Un fallo de conexión o permisos no se presenta como éxito; los campos siguen disponibles para corregir o reintentar. La confirmación del servidor se conserva aunque falle la actualización de la previsualización del panel.

Esta entrega requiere subir el contenido de la ZIP a GitHub, esperar Actions en verde y recargar el panel con Ctrl+F5. No hay SQL nuevo ni cambios nuevos en manage-users. Las pruebas cubren administrador/editor, foto local antes de subir, publicación con confirmación, error de validación, conflicto de revisión, botones durante la petición y ejemplos por grupo. La publicación con tus credenciales reales se comprueba después del despliegue; no se han usado contraseñas de tu cuenta para estas pruebas.
