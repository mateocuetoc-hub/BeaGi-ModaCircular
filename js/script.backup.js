const numeroWhatsApp = "56945571689";

const abrigos = window.productosBeaGi || [];

const contenedorProductos = document.getElementById("contenedor-productos");
const buscador = document.getElementById("buscador");
const filtroTalla = document.getElementById("filtro-talla");
const filtroPrecio = document.getElementById("filtro-precio");
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

let categoriaActiva = "todos";

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
        if (a.destacado && !b.destacado) {
            return -1;
        }

        if (!a.destacado && b.destacado) {
            return 1;
        }

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

function renderizarAbrigos(listaAbrigos) {
    contenedorProductos.innerHTML = "";

    actualizarResumenCatalogo(listaAbrigos);

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

    const resultadoOrdenado = ordenarLista(resultado);
    renderizarAbrigos(resultadoOrdenado);
}

function abrirDetalle(id) {
    const abrigo = abrigos.find((item) => item.id === id);

    if (!abrigo) {
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

buscador.addEventListener("input", aplicarFiltros);
filtroTalla.addEventListener("change", aplicarFiltros);
filtroPrecio.addEventListener("change", aplicarFiltros);

if (ordenarProductos) {
    ordenarProductos.addEventListener("change", aplicarFiltros);
}

btnLimpiar.addEventListener("click", () => {
    buscador.value = "";
    filtroTalla.value = "todos";
    filtroPrecio.value = "todos";

    if (ordenarProductos) {
        ordenarProductos.value = "destacados";
    }
    categoriaActiva = "todos";

    document.querySelectorAll(".chip").forEach((chip) => {
        chip.classList.remove("activo");
    });

    document.querySelector('.chip[data-tipo="todos"]').classList.add("activo");

    renderizarAbrigos(ordenarLista(abrigos));
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
            const disponibilidad = obtenerDisponibilidad(abrigo);

            return `${index + 1}. ${abrigo.nombre}
   Tipo: ${abrigo.tipo}
   Talla: ${abrigo.talla}
   Precio: ${formatearPrecio(abrigo.precio)}
   Disponibilidad: ${disponibilidad.texto}`;
        })
        .join("

");

    const mensaje = `Hola BeaGi ModaCircular, me interesan estos abrigos:

${detalle}

¿Me podrías confirmar disponibilidad, medidas, más fotos y forma de compra?`;

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




/* ============================= */
/* FAQ INTERACTIVO */
/* ============================= */

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



/* ============================= */
/* LIVES TIKTOK */
/* ============================= */

const liveConfig = {
    fechaObjetivo: null,
    diaTexto: "Por definir",
    horaTexto: "Por definir",
    tiktokUrl: "https://www.tiktok.com/",
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
        return;
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

configurarLiveTikTok();
actualizarCuentaRegresivaLive();
setInterval(actualizarCuentaRegresivaLive, 1000);



/* ============================= */
/* BARRA INFERIOR MÓVIL */
/* ============================= */

const mobileFavoritosBtn = document.getElementById("mobile-favoritos-btn");

if (mobileFavoritosBtn && btnFavoritosPanel) {
    mobileFavoritosBtn.addEventListener("click", () => {
        btnFavoritosPanel.click();
    });
}



/* ============================= */
/* NOVEDADES / ÚLTIMOS INGRESOS */
/* ============================= */

const novedadesProductos = document.getElementById("novedades-productos");

function obtenerNovedades() {
    const productosNuevos = abrigos.filter((abrigo) => abrigo.nuevo === true);

    if (productosNuevos.length > 0) {
        return productosNuevos.slice(0, 6);
    }

    return abrigos
        .filter((abrigo) => abrigo.destacado === true)
        .slice(0, 6);
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

renderizarNovedades();
