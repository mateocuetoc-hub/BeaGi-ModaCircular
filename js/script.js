const beagiConfig = window.beagiConfig || {};
const numeroWhatsApp = beagiConfig.whatsappNumero || "56945571689";
const abrigos = Array.isArray(window.productosBeaGi) ? window.productosBeaGi : [];

const contenedorProductos = document.getElementById("contenedor-productos");
const buscador = document.getElementById("buscador");
const filtroTalla = document.getElementById("filtro-talla");
const filtroPrecio = document.getElementById("filtro-precio");
const filtroDisponibilidad = document.getElementById("filtro-disponibilidad");
const ordenarProductos = document.getElementById("ordenar-productos");
const btnLimpiar = document.getElementById("btn-limpiar");
const contadorProductos = document.getElementById("contador-productos");
const resumenCatalogo = document.getElementById("resumen-catalogo");
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
const novedadesProductos = document.getElementById("novedades-productos");

const btnFavoritosPanel = document.getElementById("btn-favoritos-panel");
const favoritosContador = document.getElementById("favoritos-contador");
const panelFavoritos = document.getElementById("panel-favoritos");
const overlayPanel = document.getElementById("overlay-panel");
const cerrarPanelFavoritos = document.getElementById("cerrar-panel-favoritos");
const panelFavoritosBody = document.getElementById("panel-favoritos-body");
const btnConsultarFavoritos = document.getElementById("btn-consultar-favoritos");
const toast = document.getElementById("toast");

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const mobileFavoritosBtn = document.getElementById("mobile-favoritos-btn");

let categoriaActiva = "todos";
let timeoutToast = null;

const favoritosGuardados = JSON.parse(localStorage.getItem("favoritosBeaGi")) || [];
const favoritos = new Set(favoritosGuardados);

function obtenerImagenes(abrigo) {
    if (Array.isArray(abrigo.imagenes) && abrigo.imagenes.length > 0) {
        return abrigo.imagenes;
    }

    if (abrigo.imagen) {
        return [abrigo.imagen];
    }

    return [];
}

function guardarFavoritos() {
    localStorage.setItem("favoritosBeaGi", JSON.stringify([...favoritos]));
}

function formatearPrecio(precio) {
    if (precio === null || precio === undefined) {
        return "Consultar";
    }

    return precio.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
    });
}

function obtenerDisponibilidad(abrigo) {
    const disponibilidad = (abrigo.disponibilidad || "Disponible").toLowerCase();

    if (disponibilidad.includes("vendido")) {
        return {
            texto: "Vendido",
            clase: "vendido",
        };
    }

    if (disponibilidad.includes("reservado")) {
        return {
            texto: "Reservado",
            clase: "reservado",
        };
    }

    return {
        texto: "Disponible",
        clase: "disponible",
    };
}

function crearMensajeWhatsApp(abrigo) {
    const precioTexto = formatearPrecio(abrigo.precio);
    const disponibilidad = obtenerDisponibilidad(abrigo);

    const mensaje = `Hola BeaGi ModaCircular, me interesa este abrigo:

Producto: ${abrigo.nombre}
Tipo: ${abrigo.tipo}
Talla: ${abrigo.talla}
Estado: ${abrigo.estado}
Precio: ${precioTexto}
Disponibilidad: ${disponibilidad.texto}

¿Me podrías enviar más fotos, medidas y confirmar si sigue disponible?`;

    return encodeURIComponent(mensaje);
}

function crearMensajeFavoritos(lista) {
    const detalle = lista
        .map((abrigo, index) => {
            const disponibilidad = obtenerDisponibilidad(abrigo);

            return `${index + 1}. ${abrigo.nombre}
   Tipo: ${abrigo.tipo}
   Talla: ${abrigo.talla}
   Precio: ${formatearPrecio(abrigo.precio)}
   Disponibilidad: ${disponibilidad.texto}`;
        })
        .join("\n\n");

    const mensaje = `Hola BeaGi ModaCircular, me interesan estos abrigos:

${detalle}

¿Me podrías confirmar disponibilidad, medidas, más fotos y forma de compra?`;

    return encodeURIComponent(mensaje);
}

function actualizarResumenCatalogo(listaAbrigos) {
    if (!resumenCatalogo) {
        return;
    }

    const disponibles = listaAbrigos.filter((abrigo) => obtenerDisponibilidad(abrigo).clase === "disponible").length;
    const reservados = listaAbrigos.filter((abrigo) => obtenerDisponibilidad(abrigo).clase === "reservado").length;
    const vendidos = listaAbrigos.filter((abrigo) => obtenerDisponibilidad(abrigo).clase === "vendido").length;

    resumenCatalogo.innerHTML = `
        <div>
            <strong>${disponibles}</strong>
            <span>Disponibles</span>
        </div>

        <div>
            <strong>${reservados}</strong>
            <span>Reservados</span>
        </div>

        <div>
            <strong>${vendidos}</strong>
            <span>Vendidos</span>
        </div>
    `;
}

function ordenarLista(listaAbrigos) {
    const opcion = ordenarProductos ? ordenarProductos.value : "destacados";
    const copia = [...listaAbrigos];

    if (opcion === "menor-precio") {
        return copia.sort((a, b) => {
            const precioA = a.precio === null ? Number.MAX_SAFE_INTEGER : a.precio;
            const precioB = b.precio === null ? Number.MAX_SAFE_INTEGER : b.precio;
            return precioA - precioB;
        });
    }

    if (opcion === "mayor-precio") {
        return copia.sort((a, b) => {
            const precioA = a.precio === null ? -1 : a.precio;
            const precioB = b.precio === null ? -1 : b.precio;
            return precioB - precioA;
        });
    }

    if (opcion === "nombre") {
        return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    }

    return copia.sort((a, b) => {
        if (a.destacado && !b.destacado) return -1;
        if (!a.destacado && b.destacado) return 1;
        return a.id - b.id;
    });
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

function obtenerDescripcionFiltros(cantidad) {
    const partes = [];

    if (filtroDisponibilidad && filtroDisponibilidad.value !== "todos") {
        const texto = filtroDisponibilidad.options[filtroDisponibilidad.selectedIndex].textContent.toLowerCase();
        partes.push(texto);
    }

    if (filtroTalla && filtroTalla.value !== "todos") {
        partes.push(`talla ${filtroTalla.value}`);
    }

    if (filtroPrecio && filtroPrecio.value !== "todos") {
        const texto = filtroPrecio.options[filtroPrecio.selectedIndex].textContent.toLowerCase();
        partes.push(texto);
    }

    if (buscador && buscador.value.trim() !== "") {
        partes.push(`búsqueda: "${buscador.value.trim()}"`);
    }

    if (partes.length === 0) {
        return `Mostrando ${cantidad} de ${abrigos.length} abrigos`;
    }

    return `Mostrando ${cantidad} abrigos · ${partes.join(" · ")}`;
}

function renderizarAbrigos(listaAbrigos) {
    if (!contenedorProductos) {
        return;
    }

    contenedorProductos.innerHTML = "";
    actualizarResumenCatalogo(listaAbrigos);

    if (contadorProductos) {
        contadorProductos.textContent = obtenerDescripcionFiltros(listaAbrigos.length);
    }

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
        const disponibilidad = obtenerDisponibilidad(abrigo);
        const imagenes = obtenerImagenes(abrigo);
        const imagenPrincipal = imagenes[0] || "";

        producto.innerHTML = `
            <div class="producto-imagen">
                ${
                    imagenPrincipal
                        ? `<img src="${imagenPrincipal}" alt="${abrigo.nombre}">`
                        : `<div class="imagen-placeholder">Foto pendiente</div>`
                }

                ${
                    abrigo.destacado
                        ? `<span class="badge-destacado">Destacado</span>`
                        : ""
                }

                ${
                    imagenes.length > 1
                        ? `<span class="badge-fotos">${imagenes.length} fotos</span>`
                        : ""
                }

                <span class="badge-disponibilidad ${disponibilidad.clase}">
                    ${disponibilidad.texto}
                </span>

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
                    rel="noopener noreferrer"
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
    const texto = buscador ? buscador.value.toLowerCase() : "";
    const tallaSeleccionada = filtroTalla ? filtroTalla.value : "todos";
    const precioSeleccionado = filtroPrecio ? filtroPrecio.value : "todos";
    const disponibilidadSeleccionada = filtroDisponibilidad ? filtroDisponibilidad.value : "todos";

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

        const disponibilidadProducto = obtenerDisponibilidad(abrigo).clase;

        const coincideDisponibilidad =
            disponibilidadSeleccionada === "todos" ||
            disponibilidadProducto === disponibilidadSeleccionada;

        let coincideCategoria = true;

        if (categoriaActiva !== "todos" && categoriaActiva !== "favoritos") {
            coincideCategoria = abrigo.tipo === categoriaActiva;
        }

        if (categoriaActiva === "favoritos") {
            coincideCategoria = favoritos.has(abrigo.id);
        }

        return coincideTexto && coincideTalla && coincidePrecio && coincideDisponibilidad && coincideCategoria;
    });

    renderizarAbrigos(ordenarLista(resultado));
}

function abrirDetalle(id) {
    const abrigo = abrigos.find((item) => item.id === id);

    if (!abrigo || !modal) {
        return;
    }

    const imagenes = obtenerImagenes(abrigo);

    if (imagenes.length > 0) {
        modalImagen.innerHTML = `
            <div class="galeria-modal">
                <div class="galeria-principal">
                    <img 
                        id="galeria-img-principal" 
                        src="${imagenes[0]}" 
                        alt="${abrigo.nombre}"
                    >
                </div>

                ${
                    imagenes.length > 1
                        ? `<div class="galeria-miniaturas">
                            ${imagenes
                                .map((imagen, index) => `
                                    <button 
                                        class="miniatura-modal ${index === 0 ? "activa" : ""}" 
                                        data-imagen="${imagen}" 
                                        aria-label="Ver foto ${index + 1}"
                                    >
                                        <img src="${imagen}" alt="Foto ${index + 1} de ${abrigo.nombre}">
                                    </button>
                                `)
                                .join("")}
                        </div>`
                        : ""
                }
            </div>
        `;
    } else {
        modalImagen.innerHTML = `<div class="imagen-placeholder modal-placeholder">Foto pendiente</div>`;
    }

    modalNombre.textContent = abrigo.nombre;
    modalDescripcion.textContent = abrigo.descripcion;
    modalTalla.textContent = abrigo.talla;
    modalEstado.textContent = abrigo.estado;
    modalPrecio.textContent = formatearPrecio(abrigo.precio);
    modalWhatsapp.href = `https://wa.me/${numeroWhatsApp}?text=${crearMensajeWhatsApp(abrigo)}`;

    modal.classList.add("activo");
}

function obtenerNovedades() {
    const productosNuevos = abrigos.filter((abrigo) => abrigo.nuevo === true);

    if (productosNuevos.length > 0) {
        return productosNuevos.slice(0, 6);
    }

    return abrigos.filter((abrigo) => abrigo.destacado === true).slice(0, 6);
}

function renderizarNovedades() {
    if (!novedadesProductos) {
        return;
    }

    const novedades = obtenerNovedades();
    novedadesProductos.innerHTML = "";

    novedades.forEach((abrigo) => {
        const imagenes = obtenerImagenes(abrigo);
        const imagenPrincipal = imagenes[0] || "";
        const precioTexto = formatearPrecio(abrigo.precio);
        const disponibilidad = obtenerDisponibilidad(abrigo);
        const mensajeWhatsApp = crearMensajeWhatsApp(abrigo);

        const card = document.createElement("article");
        card.classList.add("novedad-card");

        card.innerHTML = `
            <div class="novedad-imagen">
                ${
                    imagenPrincipal
                        ? `<img src="${imagenPrincipal}" alt="${abrigo.nombre}">`
                        : `<div class="imagen-placeholder">Foto pendiente</div>`
                }

                <span class="badge-nuevo">Nuevo ingreso</span>
            </div>

            <div class="novedad-info">
                <h3>${abrigo.nombre}</h3>
                <p class="novedad-meta">${abrigo.tipo} · Talla ${abrigo.talla}</p>
                <p>${abrigo.estado}</p>
                <p>Disponibilidad: <strong>${disponibilidad.texto}</strong></p>
                <div class="novedad-precio">${precioTexto}</div>

                <div class="novedad-actions">
                    <button class="btn-detalle" data-id="${abrigo.id}">
                        Ver detalle
                    </button>

                    <a 
                        class="btn-wsp" 
                        href="https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}" 
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        WhatsApp
                    </a>
                </div>
            </div>
        `;

        novedadesProductos.appendChild(card);
    });
}

function mostrarToast(mensaje) {
    if (!toast) {
        return;
    }

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

function actualizarPanelFavoritos() {
    if (!panelFavoritosBody || !favoritosContador || !btnConsultarFavoritos) {
        return;
    }

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

if (buscador) buscador.addEventListener("input", aplicarFiltros);
if (filtroTalla) filtroTalla.addEventListener("change", aplicarFiltros);
if (filtroPrecio) filtroPrecio.addEventListener("change", aplicarFiltros);
if (filtroDisponibilidad) filtroDisponibilidad.addEventListener("change", aplicarFiltros);
if (ordenarProductos) ordenarProductos.addEventListener("change", aplicarFiltros);

if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
        if (buscador) buscador.value = "";
        if (filtroTalla) filtroTalla.value = "todos";
        if (filtroPrecio) filtroPrecio.value = "todos";
        if (filtroDisponibilidad) filtroDisponibilidad.value = "todos";
        if (ordenarProductos) ordenarProductos.value = "destacados";

        categoriaActiva = "todos";

        document.querySelectorAll(".chip").forEach((chip) => {
            chip.classList.remove("activo");
        });

        const chipTodos = document.querySelector('.chip[data-tipo="todos"]');

        if (chipTodos) {
            chipTodos.classList.add("activo");
        }

        renderizarAbrigos(ordenarLista(abrigos));
    });
}

if (chipsCategorias) {
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
}

if (contenedorProductos) {
    contenedorProductos.addEventListener("click", (evento) => {
        const botonDetalle = evento.target.closest(".btn-detalle");
        const botonFavorito = evento.target.closest(".btn-favorito");

        if (botonDetalle) {
            const id = Number(botonDetalle.dataset.id);
            abrirDetalle(id);
        }

        if (botonFavorito) {
            const id = Number(botonFavorito.dataset.id);
            const abrigo = abrigos.find((item) => item.id === id);

            if (favoritos.has(id)) {
                favoritos.delete(id);
                if (abrigo) mostrarToast(`${abrigo.nombre} quitado de favoritos`);
            } else {
                favoritos.add(id);
                if (abrigo) mostrarToast(`${abrigo.nombre} agregado a favoritos`);
            }

            guardarFavoritos();
            aplicarFiltros();
            actualizarPanelFavoritos();
        }
    });
}

if (novedadesProductos) {
    novedadesProductos.addEventListener("click", (evento) => {
        const botonDetalle = evento.target.closest(".btn-detalle");

        if (!botonDetalle) {
            return;
        }

        const id = Number(botonDetalle.dataset.id);
        abrirDetalle(id);
    });
}

if (modalImagen) {
    modalImagen.addEventListener("click", (evento) => {
        const miniatura = evento.target.closest(".miniatura-modal");

        if (!miniatura) {
            return;
        }

        const imagenPrincipal = document.getElementById("galeria-img-principal");

        if (!imagenPrincipal) {
            return;
        }

        imagenPrincipal.src = miniatura.dataset.imagen;

        document.querySelectorAll(".miniatura-modal").forEach((item) => {
            item.classList.remove("activa");
        });

        miniatura.classList.add("activa");
    });
}

if (cerrarModal) {
    cerrarModal.addEventListener("click", () => {
        modal.classList.remove("activo");
    });
}

if (modal) {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) {
            modal.classList.remove("activo");
        }
    });
}

if (btnFavoritosPanel) {
    btnFavoritosPanel.addEventListener("click", abrirPanelFavoritos);
}

if (cerrarPanelFavoritos) {
    cerrarPanelFavoritos.addEventListener("click", cerrarPanel);
}

if (overlayPanel) {
    overlayPanel.addEventListener("click", cerrarPanel);
}

if (panelFavoritosBody) {
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
}

if (mobileFavoritosBtn) {
    mobileFavoritosBtn.addEventListener("click", abrirPanelFavoritos);
}

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        if (modal) modal.classList.remove("activo");
        cerrarPanel();
    }
});

window.addEventListener("scroll", () => {
    if (!btnSubir) {
        return;
    }

    if (window.scrollY > 500) {
        btnSubir.classList.add("visible");
    } else {
        btnSubir.classList.remove("visible");
    }
});

if (btnSubir) {
    btnSubir.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });
}

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

/* FAQ */
const preguntasFaq = document.querySelectorAll(".faq-pregunta");

preguntasFaq.forEach((pregunta) => {
    pregunta.addEventListener("click", () => {
        const item = pregunta.closest(".faq-item");

        document.querySelectorAll(".faq-item").forEach((faq) => {
            if (faq !== item) {
                faq.classList.remove("activo");
            }
        });

        item.classList.toggle("activo");
    });
});

/* Lives TikTok */
const liveConfig = {
    fechaObjetivo: null,
    diaTexto: "Por definir",
    horaTexto: "Por definir",
    tiktokUrl: beagiConfig.tiktokUrl || "https://www.tiktok.com/",
};

const liveDia = document.getElementById("live-dia");
const liveHora = document.getElementById("live-hora");
const liveEstadoTexto = document.getElementById("live-estado-texto");
const liveDias = document.getElementById("live-dias");
const liveHoras = document.getElementById("live-horas");
const liveMinutos = document.getElementById("live-minutos");
const liveSegundos = document.getElementById("live-segundos");
const btnLiveWhatsapp = document.getElementById("btn-live-whatsapp");
const btnDinamicaLive = document.getElementById("btn-dinamica-live");
const dinamicaLive = document.getElementById("dinamica-live");

function configurarLiveTikTok() {
    if (!liveDia || !liveHora) {
        return;
    }

    liveDia.textContent = liveConfig.diaTexto;
    liveHora.textContent = liveConfig.horaTexto;

    const mensaje = encodeURIComponent(
        "Hola, me gustaría que me avisen cuando definan el próximo live de TikTok de BeaGi ModaCircular."
    );

    if (btnLiveWhatsapp) {
        btnLiveWhatsapp.href = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    }

    if (!liveConfig.fechaObjetivo) {
        liveEstadoTexto.textContent = "Fecha y hora por definir";
        liveDias.textContent = "--";
        liveHoras.textContent = "--";
        liveMinutos.textContent = "--";
        liveSegundos.textContent = "--";
    }
}

function actualizarCuentaRegresivaLive() {
    if (!liveConfig.fechaObjetivo) {
        return;
    }

    const objetivo = new Date(liveConfig.fechaObjetivo).getTime();
    const ahora = new Date().getTime();
    const diferencia = objetivo - ahora;

    if (diferencia <= 0) {
        liveEstadoTexto.textContent = "El live ya debería haber comenzado";
        liveDias.textContent = "00";
        liveHoras.textContent = "00";
        liveMinutos.textContent = "00";
        liveSegundos.textContent = "00";
        return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
    const segundos = Math.floor((diferencia / 1000) % 60);

    liveEstadoTexto.textContent = "Próximo live programado";
    liveDias.textContent = String(dias).padStart(2, "0");
    liveHoras.textContent = String(horas).padStart(2, "0");
    liveMinutos.textContent = String(minutos).padStart(2, "0");
    liveSegundos.textContent = String(segundos).padStart(2, "0");
}

if (btnDinamicaLive && dinamicaLive) {
    btnDinamicaLive.addEventListener("click", () => {
        dinamicaLive.classList.toggle("activo");

        if (dinamicaLive.classList.contains("activo")) {
            btnDinamicaLive.textContent = "Ocultar dinámica del live";
        } else {
            btnDinamicaLive.textContent = "Ver dinámica del live";
        }
    });
}

function configurarEnlacesSeguros() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
        link.setAttribute("rel", "noopener noreferrer");
    });
}

renderizarAbrigos(ordenarLista(abrigos));
renderizarNovedades();
actualizarPanelFavoritos();
configurarLiveTikTok();
actualizarCuentaRegresivaLive();
setInterval(actualizarCuentaRegresivaLive, 1000);
configurarEnlacesSeguros();



/* ============================= */
/* ANIMACIONES INTERACTIVAS UX */
/* ============================= */

function configurarScrollReveal() {
    const elementos = document.querySelectorAll(`
        .hero-texto,
        .hero-card,
        .barra-info,
        .live-info,
        .live-card,
        .novedades .seccion-header,
        .novedades-top,
        .novedad-card,
        .catalogo-header,
        .catalogo-controles,
        .chips-categorias,
        .resumen-catalogo,
        .paso-card,
        .faq-item,
        .ubicacion-info,
        .mapa-card,
        .footer-contenido
    `);

    elementos.forEach((elemento) => {
        elemento.classList.add("scroll-reveal");
    });

    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("reveal-visible");
                    observador.unobserve(entrada.target);
                }
            });
        },
        {
            threshold: 0.12,
        }
    );

    elementos.forEach((elemento) => observador.observe(elemento));
}

function configurarHeaderCompacto() {
    const header = document.querySelector(".header");

    if (!header) {
        return;
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 80) {
            header.classList.add("header-compact");
        } else {
            header.classList.remove("header-compact");
        }
    });
}

function configurarRippleBotones() {
    const selectorBotones = `
        .btn-principal,
        .btn-secundario,
        .btn-wsp,
        .btn-detalle,
        .chip,
        .btn-favoritos-panel,
        .whatsapp-flotante,
        .btn-subir,
        .menu-toggle,
        .mobile-bottom-nav a,
        .mobile-bottom-nav button
    `;

    document.addEventListener("click", (evento) => {
        const boton = evento.target.closest(selectorBotones);

        if (!boton) {
            return;
        }

        const rect = boton.getBoundingClientRect();
        const circulo = document.createElement("span");
        const size = Math.max(rect.width, rect.height);
        const x = evento.clientX - rect.left - size / 2;
        const y = evento.clientY - rect.top - size / 2;

        circulo.classList.add("ripple-effect");
        circulo.style.width = `${size}px`;
        circulo.style.height = `${size}px`;
        circulo.style.left = `${x}px`;
        circulo.style.top = `${y}px`;

        boton.appendChild(circulo);

        setTimeout(() => {
            circulo.remove();
        }, 650);
    });
}

function configurarContadoresInicio() {
    const contadores = document.querySelectorAll(".hero-datos strong");

    if (contadores.length === 0) {
        return;
    }

    const animarNumero = (elemento) => {
        const textoOriginal = elemento.textContent.trim();
        const numero = parseInt(textoOriginal.replace(/\D/g, ""), 10);

        if (Number.isNaN(numero)) {
            return;
        }

        const sufijo = textoOriginal.replace(/[0-9]/g, "");
        let actual = 0;
        const pasos = 35;
        const incremento = numero / pasos;

        elemento.classList.add("animando-contador");

        const intervalo = setInterval(() => {
            actual += incremento;

            if (actual >= numero) {
                elemento.textContent = `${numero}${sufijo}`;
                clearInterval(intervalo);

                setTimeout(() => {
                    elemento.classList.remove("animando-contador");
                }, 500);

                return;
            }

            elemento.textContent = `${Math.floor(actual)}${sufijo}`;
        }, 25);
    };

    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    contadores.forEach((contador) => animarNumero(contador));
                    observador.disconnect();
                }
            });
        },
        {
            threshold: 0.5,
        }
    );

    const heroDatos = document.querySelector(".hero-datos");

    if (heroDatos) {
        observador.observe(heroDatos);
    }
}

function configurarMenuActivoPorScroll() {
    const enlaces = document.querySelectorAll(".nav-links a[href^='#']");
    const secciones = [];

    enlaces.forEach((enlace) => {
        const id = enlace.getAttribute("href");
        const seccion = document.querySelector(id);

        if (seccion) {
            secciones.push({
                enlace,
                seccion,
            });
        }
    });

    if (secciones.length === 0) {
        return;
    }

    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (!entrada.isIntersecting) {
                    return;
                }

                enlaces.forEach((enlace) => enlace.classList.remove("activo-link"));

                const item = secciones.find((dato) => dato.seccion === entrada.target);

                if (item) {
                    item.enlace.classList.add("activo-link");
                }
            });
        },
        {
            rootMargin: "-35% 0px -55% 0px",
            threshold: 0,
        }
    );

    secciones.forEach((dato) => observador.observe(dato.seccion));
}

configurarScrollReveal();
configurarHeaderCompacto();
configurarRippleBotones();
configurarContadoresInicio();
configurarMenuActivoPorScroll();



/* ============================= */
/* MENÚ INTERACTIVO DESPLEGABLE */
/* ============================= */

function configurarDropdownsMenu() {
    const dropdowns = document.querySelectorAll(".nav-dropdown");

    dropdowns.forEach((dropdown) => {
        const boton = dropdown.querySelector(".nav-dropdown-toggle");

        if (!boton) {
            return;
        }

        boton.addEventListener("click", (evento) => {
            evento.stopPropagation();

            dropdowns.forEach((item) => {
                if (item !== dropdown) {
                    item.classList.remove("abierto");
                }
            });

            dropdown.classList.toggle("abierto");
        });
    });

    document.addEventListener("click", () => {
        dropdowns.forEach((dropdown) => {
            dropdown.classList.remove("abierto");
        });
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            dropdowns.forEach((dropdown) => {
                dropdown.classList.remove("abierto");
            });
        }
    });

    dropdowns.forEach((dropdown) => {
        dropdown.addEventListener("click", (evento) => {
            const link = evento.target.closest("a");

            if (link) {
                dropdown.classList.remove("abierto");
            }
        });
    });
}

configurarDropdownsMenu();

/* ============================= */
/* FAVORITOS DESDE MENÚ MÓVIL */
/* ============================= */

const navFavoritosMobile = document.getElementById("nav-favoritos-mobile");

if (navFavoritosMobile) {
    navFavoritosMobile.addEventListener("click", () => {
        if (navLinks) {
            navLinks.classList.remove("activo");
        }

        if (menuToggle) {
            menuToggle.textContent = "☰";
            menuToggle.setAttribute("aria-label", "Abrir menú");
        }

        if (typeof abrirPanelFavoritos === "function") {
            abrirPanelFavoritos();
        }
    });
}
