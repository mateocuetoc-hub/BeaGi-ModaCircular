# BeaGi ModaCircular

Página web tipo catálogo para **BeaGi ModaCircular**, una tienda enfocada en abrigos de mujer, moda circular y venta de prendas seleccionadas.

## Ver página online

https://mateocuetoc-hub.github.io/BeaGi-ModaCircular/

## Repositorio

https://github.com/mateocuetoc-hub/BeaGi-ModaCircular

## Descripción

**BeaGi ModaCircular** es una página web desarrollada como catálogo online para mostrar abrigos de mujer y facilitar la consulta directa por WhatsApp.

El proyecto está pensado para una pyme/emprendimiento, con una interfaz moderna, femenina, responsive y orientada a la venta.

Actualmente el catálogo funciona con productos de prueba, preparados para ser reemplazados cuando lleguen los abrigos reales.

## Funcionalidades principales

- Página de inicio con presentación de marca.
- Diseño visual en tonos rosados, crema y vino.
- Catálogo con 35 espacios para abrigos.
- Productos separados en archivo `productos.js`.
- Estructura optimizada con carpetas `css/`, `js/` e `img/`.
- Galería preparada para varias fotos por producto.
- Buscador de productos.
- Filtro por talla.
- Filtro por precio.
- Ordenamiento de productos.
- Contador de productos visibles.
- Resumen de disponibilidad.
- Estados por producto: disponible, reservado o vendido.
- Tarjetas de producto con botón de detalle.
- Modal interactivo para ver información del abrigo.
- Sistema de favoritos guardado en el navegador.
- Panel lateral de favoritos.
- Consulta por WhatsApp de un producto.
- Consulta por WhatsApp de varios favoritos.
- Botón flotante de WhatsApp.
- Botón para volver arriba.
- Menú hamburguesa para celular.
- Sección de lives de TikTok.
- Sección de cómo comprar.
- Preguntas frecuentes interactivas.
- Sección de ubicación con Google Maps.
- Diseño responsive optimizado para celular.
- Página publicada con GitHub Pages.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Visual Studio Code
- Git
- GitHub
- GitHub Pages

## Estructura del proyecto

BeaGi-ModaCircular/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── productos.js
│   └── script.js
└── img/

## Archivos principales

### index.html

Contiene la estructura principal de la página:

- Header y navegación.
- Sección de inicio.
- Sección de lives de TikTok.
- Catálogo.
- Modal de productos.
- Panel de favoritos.
- Sección cómo comprar.
- Preguntas frecuentes.
- Ubicación.
- Contacto.
- Footer.

### css/style.css

Contiene todos los estilos visuales de la página:

- Colores de marca.
- Diseño responsive.
- Tarjetas de productos.
- Modal.
- Panel de favoritos.
- Menú hamburguesa.
- Secciones informativas.
- Mejoras para celular.

### js/productos.js

Contiene la información de los productos del catálogo.

Cada producto puede tener datos como:

{
    id: 1,
    nombre: "Abrigo Beige Clásico",
    tipo: "Abrigo de Paño",
    talla: "M",
    estado: "Excelente estado",
    precio: 25000,
    disponibilidad: "Disponible",
    imagen: "",
    imagenes: [],
    descripcion: "Abrigo elegante y versátil, ideal para outfits de invierno.",
    destacado: true
}

Este archivo está pensado para actualizar fácilmente los productos reales sin modificar toda la lógica de la página.

### js/script.js

Contiene la lógica interactiva del sitio:

- Renderizado del catálogo.
- Filtros.
- Buscador.
- Ordenamiento.
- Modal de detalle.
- Favoritos.
- Panel de favoritos.
- WhatsApp.
- Menú hamburguesa.
- Acordeón de preguntas frecuentes.
- Cuenta regresiva para lives.
- Botón para subir arriba.

## Cómo ejecutar el proyecto localmente

Entrar a la carpeta del proyecto:

cd ~/Code/BeaGi-ModaCircular

Abrir en Visual Studio Code:

code .

Abrir la página en Firefox:

firefox index.html

También se puede usar la extensión Live Server de Visual Studio Code y abrir el proyecto con Go Live.

## Cómo subir cambios a GitHub

Después de modificar archivos:

git status
git add .
git commit -m "Descripcion del cambio realizado"
git push

Luego de hacer push, GitHub Pages actualiza la página online automáticamente en unos minutos.

## Próximas mejoras

- Agregar logo real de BeaGi ModaCircular.
- Agregar fotos reales de los abrigos.
- Reemplazar productos de prueba por productos reales.
- Cambiar número de WhatsApp por el oficial.
- Agregar Instagram oficial.
- Agregar TikTok oficial.
- Definir fecha y hora real de los lives.
- Agregar dirección o zona exacta de entrega/retiro.
- Mejorar mensajes automáticos de WhatsApp.
- Agregar sección de novedades / últimos ingresos.
- Agregar SEO y vista previa bonita al compartir el link.
- Optimizar imágenes para mejorar velocidad de carga.

## Estado del proyecto

Proyecto en desarrollo.

Actualmente la página cuenta con una base funcional para catálogo online, favoritos, consultas por WhatsApp, lives, ubicación, preguntas frecuentes y estructura optimizada.

## Autor

Desarrollado por Mateo como proyecto web para pyme/emprendimiento.
