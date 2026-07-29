const beagiConfig = window.beagiConfig || {};
const numeroWhatsApp = beagiConfig.whatsappNumero || "56945571689";
const abrigos = Array.isArray(window.productosBeaGi) ? window.productosBeaGi : [];
const confecciones = Array.isArray(window.confeccionesBeaGi)
    ? window.confeccionesBeaGi
    : [];

const productosTienda = [...abrigos, ...confecciones];

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
const contenedorConfecciones = document.getElementById(
    "contenedor-confecciones"
);
const contadorConfecciones = document.getElementById(
    "contador-confecciones"
);
const chipsConfecciones = document.getElementById(
    "chips-confecciones"
);

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


let categoriaActiva = "todos";
let confeccionActiva = "todos";
let timeoutToast = null;

function cargarFavoritos() {
    try {
        const datosGuardados = localStorage.getItem("favoritosBeaGi");
        const favoritosGuardados = JSON.parse(datosGuardados || "[]");

        return Array.isArray(favoritosGuardados)
            ? favoritosGuardados
            : [];
    } catch (error) {
        console.warn(
            "No fue posible cargar los favoritos guardados:",
            error
        );

        localStorage.removeItem("favoritosBeaGi");

        return [];
    }
}

const favoritos = new Set(cargarFavoritos());

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

function renderizarConfecciones(listaConfecciones) {
    if (!contenedorConfecciones) {
        return;
    }

    contenedorConfecciones.innerHTML = "";

    if (contadorConfecciones) {
        contadorConfecciones.textContent =
            `Mostrando ${listaConfecciones.length} de ` +
            `${confecciones.length} confecciones`;
    }

    if (listaConfecciones.length === 0) {
        contenedorConfecciones.innerHTML = `
            <div class="sin-resultados">
                <h3>No encontramos confecciones en esta categoría</h3>
                <p>Prueba seleccionando otra opción.</p>
            </div>
        `;
        return;
    }

    const listaOrdenada = [...listaConfecciones].sort((a, b) => {
        if (a.destacado && !b.destacado) return -1;
        if (!a.destacado && b.destacado) return 1;

        return a.id - b.id;
    });

    listaOrdenada.forEach((confeccion) => {
        const producto = document.createElement("article");
        producto.classList.add("producto");

        const precioTexto = formatearPrecio(confeccion.precio);
        const mensajeWhatsApp = crearMensajeWhatsApp(confeccion);
        const esFavorito = favoritos.has(confeccion.id);
        const disponibilidad = obtenerDisponibilidad(confeccion);
        const imagenes = obtenerImagenes(confeccion);
        const imagenPrincipal = imagenes[0] || "";

        producto.innerHTML = `
            <div class="producto-imagen">
                ${
                    imagenPrincipal
                        ? `
                            <img
                                src="${imagenPrincipal}"
                                alt="${confeccion.nombre}"
                            >
                        `
                        : `
                            <div class="imagen-placeholder">
                                Foto pendiente
                            </div>
                        `
                }

                ${
                    confeccion.destacado
                        ? `
                            <span class="badge-destacado">
                                Destacado
                            </span>
                        `
                        : ""
                }

                ${
                    imagenes.length > 1
                        ? `
                            <span class="badge-fotos">
                                ${imagenes.length} fotos
                            </span>
                        `
                        : ""
                }

                <span
                    class="badge-disponibilidad ${disponibilidad.clase}"
                >
                    ${disponibilidad.texto}
                </span>

                <button
                    class="btn-favorito ${esFavorito ? "activo" : ""}"
                    type="button"
                    data-id="${confeccion.id}"
                    aria-label="${
                        esFavorito
                            ? "Quitar de favoritos"
                            : "Agregar a favoritos"
                    }"
                >
                    ${esFavorito ? "♥" : "♡"}
                </button>
            </div>

            <h3>${confeccion.nombre}</h3>

            <p class="tipo-producto">
                ${confeccion.tipo}
            </p>

            <p>${confeccion.talla}</p>
            <p>Estado: ${confeccion.estado}</p>
            <p class="precio">${precioTexto}</p>

            <div class="producto-actions">
                <button
                    class="btn-detalle"
                    type="button"
                    data-id="${confeccion.id}"
                >
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

        contenedorConfecciones.appendChild(producto);
    });

    activarAnimacionesTarjetas();
}

function aplicarFiltroConfecciones() {
    const resultado = confecciones.filter((confeccion) => {
        return (
            confeccionActiva === "todos" ||
            confeccion.tipo === confeccionActiva
        );
    });

    renderizarConfecciones(resultado);
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
    const abrigo = productosTienda.find((item) => item.id === id);

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

    const esConfeccion = confecciones.some(
        (item) => item.id === abrigo.id
    );

    const tituloModalMovil = modal.querySelector(
        ".modal-mobile-title strong"
    );

    if (tituloModalMovil) {
        tituloModalMovil.textContent = esConfeccion
            ? "Detalle de la confección"
            : "Detalle del abrigo";
    }

    modalWhatsapp.textContent = esConfeccion
        ? "Consultar esta confección"
        : "Consultar este abrigo";

    modal.classList.add("activo");
    document.body.classList.add("modal-abierto");

    const tarjetaModal = modal.querySelector(".modal-card");

    if (tarjetaModal) {
        tarjetaModal.scrollTop = 0;
    }
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
    return productosTienda.filter((producto) =>
        favoritos.has(producto.id)
    );
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

if (chipsConfecciones) {
    chipsConfecciones.addEventListener("click", (evento) => {
        const chip = evento.target.closest(".chip-confeccion");

        if (!chip) {
            return;
        }

        confeccionActiva = chip.dataset.confeccion;

        chipsConfecciones
            .querySelectorAll(".chip-confeccion")
            .forEach((item) => {
                item.classList.remove("activo");
            });

        chip.classList.add("activo");
        aplicarFiltroConfecciones();
    });
}

if (contenedorConfecciones) {
    contenedorConfecciones.addEventListener("click", (evento) => {
        const botonDetalle = evento.target.closest(".btn-detalle");
        const botonFavorito = evento.target.closest(".btn-favorito");

        if (botonDetalle) {
            abrirDetalle(Number(botonDetalle.dataset.id));
        }

        if (botonFavorito) {
            const id = Number(botonFavorito.dataset.id);
            const confeccion = confecciones.find(
                (item) => item.id === id
            );

            if (favoritos.has(id)) {
                favoritos.delete(id);

                if (confeccion) {
                    mostrarToast(
                        `${confeccion.nombre} quitado de favoritos`
                    );
                }
            } else {
                favoritos.add(id);

                if (confeccion) {
                    mostrarToast(
                        `${confeccion.nombre} agregado a favoritos`
                    );
                }
            }

            guardarFavoritos();
            aplicarFiltroConfecciones();
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
        document.body.classList.remove("modal-abierto");
    });
}

if (modal) {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) {
            modal.classList.remove("activo");
        document.body.classList.remove("modal-abierto");
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
        const abrigo = productosTienda.find((item) => item.id === id);

        favoritos.delete(id);
        guardarFavoritos();

        aplicarFiltros();
        aplicarFiltroConfecciones();
        actualizarPanelFavoritos();

        if (abrigo) {
            mostrarToast(`${abrigo.nombre} quitado de favoritos`);
        }
    });
}


document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        if (modal) modal.classList.remove("activo");
        document.body.classList.remove("modal-abierto");
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
renderizarConfecciones(confecciones);
renderizarNovedades();
actualizarPanelFavoritos();
configurarLiveTikTok();

if (liveConfig.fechaObjetivo) {
    actualizarCuentaRegresivaLive();
    setInterval(actualizarCuentaRegresivaLive, 1000);
}

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

/* ============================= */
/* MODO APP MÓVIL POR SECCIONES */
/* ============================= */

const mobilePagesConfig = [
    {
        id: "inicio",
        label: "Inicio",
        selectors: [
            "#inicio",
            ".barra-info",
            "#novedades",
            "#confecciones",
            "#catalogo",
            "#nosotros",
            "#como-comprar",
            "#ubicacion",
            "#contacto",
        ],
    },
    {
        id: "lives",
        label: "Lives",
        selectors: ["#lives-tiktok"],
    },
    {
        id: "preguntas",
        label: "Preguntas",
        selectors: ["#preguntas-frecuentes"],
    },
];

function esVistaMovilBeaGi() {
    return window.matchMedia("(max-width: 768px)").matches;
}

function obtenerPaginaPorHash(hash) {
    const limpio = hash.replace("#", "");

    if (
        [
            "inicio",
            "novedades",
            "confecciones",
            "catalogo",
            "nosotros",
            "como-comprar",
            "ubicacion",
            "contacto",
        ].includes(limpio)
    ) {
        return "inicio";
    }

    if (limpio === "lives-tiktok") {
        return "lives";
    }

    if (limpio === "preguntas-frecuentes") {
        return "preguntas";
    }

    return "inicio";
}

let paginaMovilActiva = obtenerPaginaPorHash(window.location.hash);

function crearSwitcherMovil() {
    if (document.getElementById("mobile-section-switcher")) {
        return;
    }

    const header = document.querySelector(".header");

    if (!header) {
        return;
    }

    const switcher = document.createElement("nav");
    switcher.id = "mobile-section-switcher";
    switcher.className = "mobile-section-switcher";
    switcher.setAttribute("aria-label", "Secciones principales");

    switcher.innerHTML = mobilePagesConfig
        .map((page) => `
            <button class="mobile-switch-btn" type="button" data-mobile-page="${page.id}">
                ${page.label}
            </button>
        `)
        .join("");

    header.insertAdjacentElement("afterend", switcher);
}

function obtenerElementosPaginaMovil(page) {
    const elementos = [];

    page.selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((elemento) => {
            elementos.push(elemento);
        });
    });

    return elementos;
}

function prepararSeccionesMoviles() {
    mobilePagesConfig.forEach((page) => {
        obtenerElementosPaginaMovil(page).forEach((elemento) => {
            elemento.classList.add("mobile-page-section");
        });
    });
}

function activarPaginaMovil(pageId, moverArriba = true) {
    if (!esVistaMovilBeaGi()) {
        return;
    }

    document.body.classList.add("mobile-page-mode");

    const page = mobilePagesConfig.find((item) => item.id === pageId) || mobilePagesConfig[0];

    paginaMovilActiva = page.id;

    document.querySelectorAll(".mobile-page-section").forEach((elemento) => {
        elemento.classList.remove("mobile-section-active");
        elemento.classList.add("mobile-section-hidden");
    });

    obtenerElementosPaginaMovil(page).forEach((elemento) => {
        elemento.classList.remove("mobile-section-hidden");
        elemento.classList.add("mobile-section-active");
    });

    document.querySelectorAll(".mobile-switch-btn").forEach((boton) => {
        boton.classList.toggle("activo", boton.dataset.mobilePage === page.id);
    });

    if (moverArriba) {
        window.scrollTo(0, 0);
    }
}

function desactivarModoMovilSecciones() {
    document.body.classList.remove("mobile-page-mode");

    document.querySelectorAll(".mobile-page-section").forEach((elemento) => {
        elemento.classList.remove("mobile-section-hidden", "mobile-section-active");
    });

    document.querySelectorAll(".mobile-switch-btn").forEach((boton) => {
        boton.classList.remove("activo");
    });
}

function configurarModoAppMovil() {
    crearSwitcherMovil();
    prepararSeccionesMoviles();

    const switcher = document.getElementById("mobile-section-switcher");

    if (switcher) {
        switcher.addEventListener("click", (evento) => {
            const boton = evento.target.closest(".mobile-switch-btn");

            if (!boton) {
                return;
            }

            activarPaginaMovil(boton.dataset.mobilePage);
        });
    }

    document.addEventListener("click", (evento) => {
        const link = evento.target.closest('a[href^="#"]');

        if (!link || !esVistaMovilBeaGi()) {
            return;
        }

        const hash = link.getAttribute("href");

        if (!hash || hash === "#") {
            return;
        }

        const pageId = obtenerPaginaPorHash(hash);

        if (!pageId) {
            return;
        }

        evento.preventDefault();

        if (navLinks) {
            navLinks.classList.remove("activo");
        }

        if (menuToggle) {
            menuToggle.textContent = "☰";
            menuToggle.setAttribute("aria-label", "Abrir menú");
        }

        activarPaginaMovil(pageId, false);

        /*
        Después de mostrar la sección correcta, desplazamos
        hasta el elemento exacto que se presionó.
        */
        requestAnimationFrame(() => {
            const destino = document.querySelector(hash);

            if (destino) {
                destino.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });

    const mediaMovil = window.matchMedia("(max-width: 768px)");

    const aplicarModoSegunPantalla = () => {
        if (mediaMovil.matches) {
            activarPaginaMovil(paginaMovilActiva, false);
        } else {
            desactivarModoMovilSecciones();
        }
    };

    aplicarModoSegunPantalla();

    /*
    Solo reaccionamos cuando realmente se cruza el límite
    entre celular y escritorio. Ya no reaccionamos cuando
    la barra del navegador móvil aparece o desaparece.
    */
    if (mediaMovil.addEventListener) {
        mediaMovil.addEventListener("change", aplicarModoSegunPantalla);
    } else {
        mediaMovil.addListener(aplicarModoSegunPantalla);
    }
}

configurarModoAppMovil();

/* ===================================== */
/* SECCIONES INDEPENDIENTES EN ESCRITORIO */
/* ===================================== */

const desktopPagesConfig = [
    {
        id: "inicio",
        selectors: [
            "#inicio",
            ".barra-info",
            "#novedades",
            "#confecciones",
            "#catalogo",
            "#nosotros",
            "#como-comprar",
            "#ubicacion",
            "#contacto",
        ],
    },
    {
        id: "lives",
        selectors: ["#lives-tiktok"],
    },
    {
        id: "preguntas",
        selectors: ["#preguntas-frecuentes"],
    },
];

function esVistaEscritorioBeaGi() {
    return window.matchMedia("(min-width: 769px)").matches;
}

function obtenerVistaEscritorioPorHash(hash) {
    const id = hash.replace("#", "");

    if (id === "lives-tiktok") {
        return "lives";
    }

    if (id === "preguntas-frecuentes") {
        return "preguntas";
    }

    return "inicio";
}

function obtenerElementosVistaEscritorio(vista) {
    const elementos = [];

    vista.selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((elemento) => {
            elementos.push(elemento);
        });
    });

    return elementos;
}

function prepararVistasEscritorio() {
    desktopPagesConfig.forEach((vista) => {
        obtenerElementosVistaEscritorio(vista).forEach((elemento) => {
            elemento.classList.add("desktop-page-section");
        });
    });
}

function activarVistaEscritorio(vistaId) {
    if (!esVistaEscritorioBeaGi()) {
        return;
    }

    document.body.classList.add("desktop-page-mode");

    const vista =
        desktopPagesConfig.find((item) => item.id === vistaId) ||
        desktopPagesConfig[0];

    document
        .querySelectorAll(".desktop-page-section")
        .forEach((elemento) => {
            elemento.classList.add("desktop-section-hidden");
            elemento.classList.remove("desktop-section-active");
        });

    obtenerElementosVistaEscritorio(vista).forEach((elemento) => {
        elemento.classList.remove("desktop-section-hidden");
        elemento.classList.add("desktop-section-active");
    });
}

function desactivarVistasEscritorio() {
    document.body.classList.remove("desktop-page-mode");

    document
        .querySelectorAll(".desktop-page-section")
        .forEach((elemento) => {
            elemento.classList.remove(
                "desktop-section-hidden",
                "desktop-section-active"
            );
        });
}

function navegarEscritorio(hash, actualizarUrl = true) {
    const vistaId = obtenerVistaEscritorioPorHash(hash);

    activarVistaEscritorio(vistaId);

    if (actualizarUrl && window.location.hash !== hash) {
        history.pushState(null, "", hash);
    }

    requestAnimationFrame(() => {
        const destino = document.querySelector(hash);

        if (destino) {
            destino.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    });
}

function configurarVistasEscritorio() {
    prepararVistasEscritorio();

    document.addEventListener("click", (evento) => {
        const enlace = evento.target.closest('a[href^="#"]');

        if (!enlace || !esVistaEscritorioBeaGi()) {
            return;
        }

        const hash = enlace.getAttribute("href");

        if (!hash || hash === "#") {
            return;
        }

        evento.preventDefault();
        navegarEscritorio(hash);
    });

    window.addEventListener("popstate", () => {
        if (!esVistaEscritorioBeaGi()) {
            return;
        }

        navegarEscritorio(window.location.hash || "#inicio", false);
    });

    const mediaEscritorio = window.matchMedia("(min-width: 769px)");

    const aplicarModoEscritorio = () => {
        if (mediaEscritorio.matches) {
            navegarEscritorio(
                window.location.hash || "#inicio",
                false
            );
        } else {
            desactivarVistasEscritorio();
        }
    };

    aplicarModoEscritorio();

    if (mediaEscritorio.addEventListener) {
        mediaEscritorio.addEventListener(
            "change",
            aplicarModoEscritorio
        );
    } else {
        mediaEscritorio.addListener(aplicarModoEscritorio);
    }
}

configurarVistasEscritorio();
