const numeroWhatsApp = "569XXXXXXXX";

const abrigos = [
    {
        id: 1,
        nombre: "Abrigo Beige Clásico",
        tipo: "Abrigo de Paño",
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
        tipo: "Abrigo Largo",
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
        tipo: "Abrigo Urbano",
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
        destacado: i % 7 === 0,
    });
}

const contenedorProductos = document.getElementById("contenedor-productos");
const buscador = document.getElementById("buscador");
const filtroTalla = document.getElementById("filtro-talla");
const filtroPrecio = document.getElementById("filtro-precio");
const btnLimpiar = document.getElementById("btn-limpiar");
const contadorProductos = document.getElementById("contador-productos");
const chipsCategorias = document.getElementById("chips-categorias");

const modal = document.getElementById("modal-producto");
const cerrarModal = document.getElementById("cerrar-modal");
const modalImagen = document.getElementById("modal-imagen");
const modalNombre = document.getElementById("modal-nombre");
const modalDescripcion = document.getElementById("modal-descripcion");
const modalTalla = document.getElementById("modal-talla");
const modalEstado = document.getElementById("modal-estado");
const modalPrecio = document.getElementById("modal-precio");
const modalWhatsapp = document.getElementById("modal-whatsapp");

const btnSubir = document.getElementById("btn-subir");

let categoriaActiva = "todos";

const favoritosGuardados = JSON.parse(localStorage.getItem("favoritosBeaGi")) || [];
const favoritos = new Set(favoritosGuardados);

function guardarFavoritos() {
    localStorage.setItem("favoritosBeaGi", JSON.stringify([...favoritos]));
}

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

function activarAnimacionesTarjetas() {
    const tarjetas = document.querySelectorAll(".producto");

    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visible");
                }
            });
        },
        {
            threshold: 0.15,
        }
    );

    tarjetas.forEach((tarjeta) => observador.observe(tarjeta));
}

function renderizarAbrigos(listaAbrigos) {
    contenedorProductos.innerHTML = "";

    contadorProductos.textContent = `Mostrando ${listaAbrigos.length} de ${abrigos.length} abrigos`;

    if (listaAbrigos.length === 0) {
        contenedorProductos.innerHTML = `
            <div class="sin-resultados">
                <h3>No encontramos abrigos con esos filtros</h3>
                <p>Prueba cambiando la talla, el precio o la categoría.</p>
            </div>
        `;
        return;
    }

    listaAbrigos.forEach((abrigo) => {
        const producto = document.createElement("div");
        producto.classList.add("producto");

        const precioTexto = formatearPrecio(abrigo.precio);
        const mensajeWhatsApp = crearMensajeWhatsApp(abrigo);
        const esFavorito = favoritos.has(abrigo.id);

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

                <button class="btn-favorito ${esFavorito ? "activo" : ""}" data-id="${abrigo.id}" aria-label="Agregar a favoritos">
                    ${esFavorito ? "♥" : "♡"}
                </button>
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

    activarAnimacionesTarjetas();
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

        let coincideCategoria = true;

        if (categoriaActiva !== "todos" && categoriaActiva !== "favoritos") {
            coincideCategoria = abrigo.tipo === categoriaActiva;
        }

        if (categoriaActiva === "favoritos") {
            coincideCategoria = favoritos.has(abrigo.id);
        }

        return coincideTexto && coincideTalla && coincidePrecio && coincideCategoria;
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
    categoriaActiva = "todos";

    document.querySelectorAll(".chip").forEach((chip) => {
        chip.classList.remove("activo");
    });

    document.querySelector('.chip[data-tipo="todos"]').classList.add("activo");

    renderizarAbrigos(abrigos);
});

chipsCategorias.addEventListener("click", (evento) => {
    const chip = evento.target.closest(".chip");

    if (!chip) {
        return;
    }

    categoriaActiva = chip.dataset.tipo;

    document.querySelectorAll(".chip").forEach((item) => {
        item.classList.remove("activo");
    });

    chip.classList.add("activo");

    aplicarFiltros();
});

contenedorProductos.addEventListener("click", (evento) => {
    const botonDetalle = evento.target.closest(".btn-detalle");
    const botonFavorito = evento.target.closest(".btn-favorito");

    if (botonDetalle) {
        const id = Number(botonDetalle.dataset.id);
        abrirDetalle(id);
    }

    if (botonFavorito) {
        const id = Number(botonFavorito.dataset.id);

        if (favoritos.has(id)) {
            favoritos.delete(id);
        } else {
            favoritos.add(id);
        }

        guardarFavoritos();
        aplicarFiltros();
    }
});

cerrarModal.addEventListener("click", () => {
    modal.classList.remove("activo");
});

modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
        modal.classList.remove("activo");
    }
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        modal.classList.remove("activo");
    }
});

window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
        btnSubir.classList.add("visible");
    } else {
        btnSubir.classList.remove("visible");
    }
});

btnSubir.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
});

/* Menú hamburguesa */
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {
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
}

renderizarAbrigos(abrigos);




/* ============================= */
/* PANEL DE FAVORITOS */
/* ============================= */

const btnFavoritosPanel = document.getElementById("btn-favoritos-panel");
const favoritosContador = document.getElementById("favoritos-contador");
const panelFavoritos = document.getElementById("panel-favoritos");
const overlayPanel = document.getElementById("overlay-panel");
const cerrarPanelFavoritos = document.getElementById("cerrar-panel-favoritos");
const panelFavoritosBody = document.getElementById("panel-favoritos-body");
const btnConsultarFavoritos = document.getElementById("btn-consultar-favoritos");
const toast = document.getElementById("toast");

let timeoutToast = null;

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add("activo");

    clearTimeout(timeoutToast);

    timeoutToast = setTimeout(() => {
        toast.classList.remove("activo");
    }, 2200);
}

function obtenerListaFavoritos() {
    return abrigos.filter((abrigo) => favoritos.has(abrigo.id));
}

function crearMensajeFavoritos(lista) {
    const detalle = lista
        .map((abrigo, index) => {
            return `${index + 1}. ${abrigo.nombre} - ${abrigo.tipo} - Talla ${abrigo.talla} - ${formatearPrecio(abrigo.precio)}`;
        })
        .join("\n");

    const mensaje = `Hola, me interesan estos abrigos de BeaGi ModaCircular:\n\n${detalle}\n\n¿Me podrías dar más información?`;

    return encodeURIComponent(mensaje);
}

function actualizarPanelFavoritos() {
    const lista = obtenerListaFavoritos();

    favoritosContador.textContent = lista.length;

    if (lista.length === 0) {
        panelFavoritosBody.innerHTML = `
            <div class="panel-vacio">
                <h3>Aún no tienes favoritos</h3>
                <p>Marca el corazón de los abrigos que quieras revisar después.</p>
            </div>
        `;

        btnConsultarFavoritos.classList.add("deshabilitado");
        btnConsultarFavoritos.removeAttribute("href");
        return;
    }

    panelFavoritosBody.innerHTML = "";

    lista.forEach((abrigo) => {
        const item = document.createElement("div");
        item.classList.add("item-favorito");

        item.innerHTML = `
            <div class="item-favorito-img">Foto pendiente</div>

            <div class="item-favorito-info">
                <h3>${abrigo.nombre}</h3>
                <p>${abrigo.tipo}</p>
                <p>Talla ${abrigo.talla} · ${formatearPrecio(abrigo.precio)}</p>
            </div>

            <button class="quitar-favorito-panel" data-id="${abrigo.id}" aria-label="Quitar favorito">
                ×
            </button>
        `;

        panelFavoritosBody.appendChild(item);
    });

    btnConsultarFavoritos.classList.remove("deshabilitado");
    btnConsultarFavoritos.href = `https://wa.me/${numeroWhatsApp}?text=${crearMensajeFavoritos(lista)}`;
}

function abrirPanelFavoritos() {
    actualizarPanelFavoritos();
    panelFavoritos.classList.add("activo");
    overlayPanel.classList.add("activo");
}

function cerrarPanel() {
    panelFavoritos.classList.remove("activo");
    overlayPanel.classList.remove("activo");
}

btnFavoritosPanel.addEventListener("click", abrirPanelFavoritos);
cerrarPanelFavoritos.addEventListener("click", cerrarPanel);
overlayPanel.addEventListener("click", cerrarPanel);

panelFavoritosBody.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".quitar-favorito-panel");

    if (!boton) {
        return;
    }

    const id = Number(boton.dataset.id);
    const abrigo = abrigos.find((item) => item.id === id);

    favoritos.delete(id);
    guardarFavoritos();

    aplicarFiltros();
    actualizarPanelFavoritos();

    if (abrigo) {
        mostrarToast(`${abrigo.nombre} quitado de favoritos`);
    }
});

contenedorProductos.addEventListener("click", (evento) => {
    const botonFavorito = evento.target.closest(".btn-favorito");

    if (!botonFavorito) {
        return;
    }

    const id = Number(botonFavorito.dataset.id);
    const abrigo = abrigos.find((item) => item.id === id);

    setTimeout(() => {
        actualizarPanelFavoritos();

        if (!abrigo) {
            return;
        }

        if (favoritos.has(id)) {
            mostrarToast(`${abrigo.nombre} agregado a favoritos`);
        } else {
            mostrarToast(`${abrigo.nombre} quitado de favoritos`);
        }
    }, 0);
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        cerrarPanel();
    }
});

actualizarPanelFavoritos();
