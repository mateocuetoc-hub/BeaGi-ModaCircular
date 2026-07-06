const numeroWhatsApp = "569XXXXXXXX";

const abrigos = [
    {
        id: 1,
        nombre: "Abrigo Beige Clásico",
        tipo: "Abrigo de paño",
        talla: "M",
        estado: "Excelente estado",
        precio: 25000,
        imagen: "",
        descripcion: "Abrigo elegante y versátil, ideal para outfits de invierno.",
        destacado: true,
    },
    {
        id: 2,
        nombre: "Abrigo Negro Elegante",
        tipo: "Abrigo largo",
        talla: "L",
        estado: "Muy buen estado",
        precio: 28000,
        imagen: "",
        descripcion: "Abrigo negro formal, perfecto para uso diario o eventos.",
        destacado: true,
    },
    {
        id: 3,
        nombre: "Abrigo Café Casual",
        tipo: "Abrigo urbano",
        talla: "S",
        estado: "Buen estado",
        precio: 22000,
        imagen: "",
        descripcion: "Abrigo cómodo, combinable y con estilo casual.",
        destacado: false,
    },
];

const tiposAbrigos = [
    "Abrigo de Lana",
    "Trench Coat",
    "Abrigo Teddy",
    "Parka Larga",
    "Abrigo Oversize",
    "Gabardina",
    "Chaquetón",
    "Abrigo de Paño",
    "Blazer Largo",
    "Abrigo Peludo",
];

const tallas = ["S", "M", "L", "XL"];
const estados = ["Excelente estado", "Muy buen estado", "Buen estado", "Por revisar"];

for (let i = 4; i <= 35; i++) {
    const tipo = tiposAbrigos[(i - 4) % tiposAbrigos.length];

    abrigos.push({
        id: i,
        nombre: `${tipo} ${i}`,
        tipo: tipo,
        talla: tallas[i % tallas.length],
        estado: estados[i % estados.length],
        precio: i % 5 === 0 ? null : 18000 + i * 1000,
        imagen: "",
        descripcion: `Espacio reservado para ${tipo.toLowerCase()}. Aquí luego agregaremos foto real, color, medidas y detalles.`,
        destacado: false,
    });
}

const contenedorProductos = document.getElementById("contenedor-productos");
const buscador = document.getElementById("buscador");
const filtroTalla = document.getElementById("filtro-talla");
const filtroPrecio = document.getElementById("filtro-precio");
const btnLimpiar = document.getElementById("btn-limpiar");
const contadorProductos = document.getElementById("contador-productos");

const modal = document.getElementById("modal-producto");
const cerrarModal = document.getElementById("cerrar-modal");
const modalImagen = document.getElementById("modal-imagen");
const modalNombre = document.getElementById("modal-nombre");
const modalDescripcion = document.getElementById("modal-descripcion");
const modalTalla = document.getElementById("modal-talla");
const modalEstado = document.getElementById("modal-estado");
const modalPrecio = document.getElementById("modal-precio");
const modalWhatsapp = document.getElementById("modal-whatsapp");

function formatearPrecio(precio) {
    if (precio === null) {
        return "Consultar";
    }

    return precio.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
    });
}

function crearMensajeWhatsApp(abrigo) {
    const precioTexto = formatearPrecio(abrigo.precio);

    const mensaje = `Hola, me interesa este abrigo de BeaGi ModaCircular:
Producto: ${abrigo.nombre}
Tipo: ${abrigo.tipo}
Talla: ${abrigo.talla}
Estado: ${abrigo.estado}
Precio: ${precioTexto}`;

    return encodeURIComponent(mensaje);
}

function renderizarAbrigos(listaAbrigos) {
    contenedorProductos.innerHTML = "";

    contadorProductos.textContent = `Mostrando ${listaAbrigos.length} de ${abrigos.length} abrigos`;

    if (listaAbrigos.length === 0) {
        contenedorProductos.innerHTML = `
            <div class="sin-resultados">
                <h3>No encontramos abrigos con esos filtros</h3>
                <p>Prueba cambiando la talla, el precio o el texto de búsqueda.</p>
            </div>
        `;
        return;
    }

    listaAbrigos.forEach((abrigo) => {
        const producto = document.createElement("div");
        producto.classList.add("producto");

        const precioTexto = formatearPrecio(abrigo.precio);
        const mensajeWhatsApp = crearMensajeWhatsApp(abrigo);

        producto.innerHTML = `
            <div class="producto-imagen">
                ${
                    abrigo.imagen
                        ? `<img src="${abrigo.imagen}" alt="${abrigo.nombre}">`
                        : `<div class="imagen-placeholder">Foto pendiente</div>`
                }

                ${
                    abrigo.destacado
                        ? `<span class="badge-destacado">Destacado</span>`
                        : ""
                }
            </div>

            <h3>${abrigo.nombre}</h3>
            <p class="tipo-producto">${abrigo.tipo}</p>
            <p>Talla: ${abrigo.talla}</p>
            <p>Estado: ${abrigo.estado}</p>
            <p class="precio">${precioTexto}</p>

            <div class="producto-actions">
                <button class="btn-detalle" data-id="${abrigo.id}">
                    Ver detalle
                </button>

                <a 
                    class="btn-wsp" 
                    href="https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}" 
                    target="_blank"
                >
                    WhatsApp
                </a>
            </div>
        `;

        contenedorProductos.appendChild(producto);
    });
}

function aplicarFiltros() {
    const texto = buscador.value.toLowerCase();
    const tallaSeleccionada = filtroTalla.value;
    const precioSeleccionado = filtroPrecio.value;

    const resultado = abrigos.filter((abrigo) => {
        const coincideTexto =
            abrigo.nombre.toLowerCase().includes(texto) ||
            abrigo.tipo.toLowerCase().includes(texto) ||
            abrigo.estado.toLowerCase().includes(texto);

        const coincideTalla =
            tallaSeleccionada === "todos" || abrigo.talla === tallaSeleccionada;

        let coincidePrecio = true;

        if (precioSeleccionado === "menos-20000") {
            coincidePrecio = abrigo.precio !== null && abrigo.precio < 20000;
        }

        if (precioSeleccionado === "20000-30000") {
            coincidePrecio =
                abrigo.precio !== null &&
                abrigo.precio >= 20000 &&
                abrigo.precio <= 30000;
        }

        if (precioSeleccionado === "mas-30000") {
            coincidePrecio = abrigo.precio !== null && abrigo.precio > 30000;
        }

        if (precioSeleccionado === "consultar") {
            coincidePrecio = abrigo.precio === null;
        }

        return coincideTexto && coincideTalla && coincidePrecio;
    });

    renderizarAbrigos(resultado);
}

function abrirDetalle(id) {
    const abrigo = abrigos.find((item) => item.id === id);

    if (!abrigo) {
        return;
    }

    modalImagen.innerHTML = abrigo.imagen
        ? `<img src="${abrigo.imagen}" alt="${abrigo.nombre}">`
        : `<div class="imagen-placeholder modal-placeholder">Foto pendiente</div>`;

    modalNombre.textContent = abrigo.nombre;
    modalDescripcion.textContent = abrigo.descripcion;
    modalTalla.textContent = abrigo.talla;
    modalEstado.textContent = abrigo.estado;
    modalPrecio.textContent = formatearPrecio(abrigo.precio);

    modalWhatsapp.href = `https://wa.me/${numeroWhatsApp}?text=${crearMensajeWhatsApp(abrigo)}`;

    modal.classList.add("activo");
}

buscador.addEventListener("input", aplicarFiltros);
filtroTalla.addEventListener("change", aplicarFiltros);
filtroPrecio.addEventListener("change", aplicarFiltros);

btnLimpiar.addEventListener("click", () => {
    buscador.value = "";
    filtroTalla.value = "todos";
    filtroPrecio.value = "todos";
    renderizarAbrigos(abrigos);
});

contenedorProductos.addEventListener("click", (evento) => {
    const botonDetalle = evento.target.closest(".btn-detalle");

    if (botonDetalle) {
        const id = Number(botonDetalle.dataset.id);
        abrirDetalle(id);
    }
});

cerrarModal.addEventListener("click", () => {
    modal.classList.remove("activo");
});

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("activo");

    if (navLinks.classList.contains("activo")) {
        menuToggle.textContent = "×";
        menuToggle.setAttribute("aria-label", "Cerrar menú");
    } else {
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-label", "Abrir menú");
    }
});

navLinks.addEventListener("click", (evento) => {
    if (evento.target.tagName === "A") {
        navLinks.classList.remove("activo");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-label", "Abrir menú");
    }
});

modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
        modal.classList.remove("activo");
    }
});

renderizarAbrigos(abrigos);