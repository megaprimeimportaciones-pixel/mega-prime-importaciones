# Portada, estados e imágenes

El archivo principal es `frontend/index.html`. Se puede abrir para revisión local conservando toda la carpeta frontend, sus scripts, estilos e imágenes. No renombrar un servidor local equivale a tener un dominio público: la dirección HTTPS con nombre se configura al publicar el frontend en un hosting y asociar un dominio. Supabase se conecta como servicio de datos, autenticación y archivos; las variables de `frontend/config.js` siguen pendientes.

El aviso superior de entorno de pruebas se retiró. La portada muestra un círculo «Nuestros estados» inmediatamente después del título. Abre un visor de fotos/videos publicados, con navegación y control de cierre. Cuando no hay estados, informa que el equipo aún no ha publicado y ofrece el ingreso para publicar. No se inventaron estados de clientes ni de redes externas.

En el panel, Publicaciones y estados ahora incluye un control directo para subir fotos o videos. Los archivos se guardan en Storage tras configurar Supabase. Completar título, texto, vencimiento y Publicar; los permisos y el vencimiento siguen protegidos en la base. Los títulos del círculo y su visibilidad se editan en `updates.storyLabel`, `updates.storySubtitle` y `updates.showStories`.

Se reemplazaron los dibujos iniciales del catálogo por seis escenas originales generadas con la herramienta integrada de generación de imágenes. Son imágenes de ambientación, no fotografías verificadas de inventario o instalaciones de la empresa. Se conservaron los originales del prototipo y las capturas de referencia. Las imágenes se pueden reemplazar desde el CMS.

Archivos PNG de 1536 × 1024 en `frontend/uploads/media/`, con prefijo `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`:

- `01.png`: casa con teja terracota.
- `02.png`: casa con cubierta metálica gris.
- `03.png`: patio con cubierta translúcida.
- `04.png`: interior con cielo raso, paneles y piso.
- `05.png`: herramientas junto a una casa con tejas.
- `06.png`: almacén de cubiertas y acabados.

Se asignaron según la categoría y el tipo de producto. Los precios demostrativos no confirmados se dejaron en cero, que la interfaz presenta como «Precio a cotizar». El propietario podrá completar precios verificados en el panel.

## Prompts de generación

Método: herramienta integrada ImageGen, generación nueva, sin modificar las fotos de otras empresas.

1. Photorealistic architectural catalog photograph, beautiful contemporary single-story Ecuadorian Andean house with a prominent terracotta Spanish-profile tiled roof, warm white stucco walls, green garden, mountains distant, blue sky, realistic construction, premium warm afternoon light, roof occupies half the composition and clearly visible, clean professional commercial photography, horizontal 3:2 composition. No text, logos, watermarks, people or diagrams. Illustrative architectural scene, not a specific real property.
2. Photorealistic architectural catalog photograph, attractive contemporary Ecuadorian home with a dark graphite corrugated metal gabled roof, white and natural stone walls, landscaped garden and Andean foothills, clear realistic roofing detail, premium natural daylight, roof clearly prominent, horizontal 3:2 composition. No text, logos, watermarks, people or diagrams. Illustrative architectural scene.
3. Photorealistic architectural catalog photograph, modern house patio with a tasteful translucent polycarbonate pergola roof supported by slim dark metal beams, natural wood deck, lush garden, sunlight filtered through the roofing, high-end contemporary architecture, roof material clearly visible, horizontal 3:2 composition. No text, logos, watermarks, people or diagrams. Illustrative architectural scene.
4. Photorealistic interior architectural catalog photograph, elegant contemporary Ecuadorian living room with clean white PVC-style slatted ceiling, warm wood-tone wall panels and attractive light oak SPC-style floor, large windows opening to a garden, tasteful minimal furniture, realistic high-end finish details, horizontal 3:2 composition. No text, logos, watermarks, people or diagrams. Illustrative architectural scene.
5. Photorealistic premium commercial catalog photo of neatly arranged roofing installation hand tools, cordless drill, measuring tape, protective gloves, cutting tools on a clean timber workbench beside a modern house with terracotta tiled roof visible in the softly focused background. No people, no text, logos, brand names or watermarks. Horizontal 3:2, realistic daylight.
6. Photorealistic premium commercial catalog photo inside a clean modern building materials warehouse, neatly stacked corrugated roofing sheets and wood-tone interior finish panels, a compact unbranded forklift parked at the side, no people, no text, logos, brand names or watermarks. Horizontal 3:2, natural industrial daylight, realistic materials.
