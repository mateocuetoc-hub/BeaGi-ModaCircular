# Revisión del rediseño público de BeaGi

Rama de entrega: `main`, por indicación del usuario después de aprobar el rediseño.

## Implementación

- `index.html`: marca tipográfica, portada con fotografía real, accesos a categorías, controles de disponibilidad y ordenamiento, semántica y navegación inferior móvil.
- `css/style-v2.css`: hoja independiente con paleta vino/crema, títulos serif con fallbacks locales, tarjetas 4:5, diseño de todas las secciones y estados públicos; cuatro, tres y dos columnas según espacio.
- `js/script.js`: conserva los contratos de productos, filtros, galerías y favoritos. Registra Categorías en ambas configuraciones; repara historial móvil y separación entre chips de Abrigos y Confecciones; añade foco de diálogos, estados accesibles, fotografías de favoritos, carga diferida y respeto al movimiento reducido.
- `revision-ui/`: capturas e informe de comprobación. No es necesario para ejecutar el sitio.

`css/style.css`, `admin.html`, `css/admin.css`, datos de productos y confecciones, configuración, precios, stock, dirección, teléfono y enlaces sociales están intactos. Solo se carga `style-v2.css`. Ningún ID original fue eliminado y no hay IDs duplicados.

La referencia gráfica mencionada no estaba adjunta; se siguieron la descripción y la paleta del pedido. Las imágenes editoriales proceden exclusivamente de `assets/img/confecciones/punos/`. La fotografía de portada puede sustituirse en `.hero-editorial` de `index.html`. El acceso a Abrigos usa una composición tipográfica neutra porque no hay fotos locales de abrigos.

## Verificación

Pruebas de interacción con Chromium y revisión visual de capturas:

| Resolución | Columnas de productos | Desbordamiento horizontal | Interacción |
|---|---:|---|---|
| 1440 × 900 | 4 | No | Correcta |
| 1024 × 768 | 3 | No | Correcta |
| 390 × 844 | 2 | No | Correcta |
| 360 × 800 | 2 | No | Correcta |

Se comprobó:

- Portada, ambos botones, menú de escritorio/móvil y navegación interna.
- Inicio/Lives/Preguntas, vistas independientes, Atrás/Adelante y cambio de tamaño entre móvil/escritorio.
- Buscador, tallas, todos los rangos de precio, disponibilidad, ordenamiento, chips y limpieza.
- Confecciones, categoría vacía y conservación de su chip al filtrar Abrigos.
- Modal, miniaturas, cierre, Escape y ciclo de foco con Tab/Shift+Tab.
- Añadir/quitar favoritos de ambos catálogos, panel con fotografía y persistencia al recargar.
- FAQ, dinámica del live y cuenta regresiva con una fecha temporal solo en el navegador de prueba; la fecha publicada sigue por definir.
- Enlaces WhatsApp y mensajes codificados: número original conservado. No se enviaron mensajes ni se efectuaron compras.
- API real: HTTP 200, siete productos renderizados durante la prueba. También se comprobó el fallback local original de 35 abrigos y nueve confecciones sin modificar sus datos.
- Google Maps: mapa real cargado. TikTok: perfil incrustado cargado y revisado visualmente tras reintentos.
- Sin excepciones JavaScript. En una pasada hubo una respuesta externa HTTP 403 intermitente; el control posterior de TikTok no registró respuestas HTTP de error. No se garantiza la disponibilidad futura de servicios externos.
- `node --check js/script.js` y `git diff --check`: correctos.

Las capturas de Inicio, Confecciones, modal y favoritos se generaron con el catálogo local original como respaldo controlado. Las capturas del mapa y del perfil TikTok corresponden a servicios reales.

Resultados detallados: `resultados.json`, `visual.json`, `extra.json`.

## Revisión local

```bash
cd ~/Documentos/BeaGi-ModaCircular
python3 -m http.server 5500
```

Abrir http://localhost:5500 y recargar sin caché. Si el servidor sigue activo en ese puerto, basta con abrir la dirección.

```bash
node --check js/script.js
git diff --check
git status -sb
git diff --stat
git diff -- index.html js/script.js
```

Para revisar el rediseño después del commit, usar `git show --stat HEAD` y `git show HEAD -- index.html js/script.js css/style-v2.css`.

Para probar el CSS anterior, cambiar únicamente el enlace de stylesheet en `index.html` a `css/style.css`. No cargar ambas hojas a la vez.
