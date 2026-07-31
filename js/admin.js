(() => {
    "use strict";

    const configuracion = window.beagiConfig || {};

    const apiBaseUrl = (
        configuracion.apiBaseUrl ||
        "http://localhost:8080/api"
    ).replace(/\/+$/, "");

    const seccionLogin = document.querySelector("#seccion-login");
    const panelAdministrativo = document.querySelector(
        "#panel-administrativo"
    );

    const formularioLogin = document.querySelector("#formulario-login");
    const campoUsuario = document.querySelector("#usuario");
    const campoContrasena = document.querySelector("#contrasena");
    const botonIngresar = document.querySelector("#boton-ingresar");
    const mensajeLogin = document.querySelector("#mensaje-login");

    const estadoSesion = document.querySelector("#estado-sesion");
    const botonCerrarSesion = document.querySelector(
        "#boton-cerrar-sesion"
    );

    const botonesNavegacion = document.querySelectorAll(
        ".navegacion-admin [data-seccion]"
    );

    const contenidosSeccion = document.querySelectorAll(
        "[data-contenido-seccion]"
    );

    const resumenProductos = document.querySelector(
        "#resumen-productos"
    );
    const totalProductos = document.querySelector("#total-productos");
    const productosDisponibles = document.querySelector(
        "#productos-disponibles"
    );
    const productosSinStock = document.querySelector(
        "#productos-sin-stock"
    );

    const estadoProductos = document.querySelector("#estado-productos");
    const contenedorTablaProductos = document.querySelector(
        "#contenedor-tabla-productos"
    );
    const cuerpoTablaProductos = document.querySelector(
        "#cuerpo-tabla-productos"
    );

    const formateadorPrecio = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });

    let autorizacionAdmin = "";

    if (
        !seccionLogin ||
        !panelAdministrativo ||
        !formularioLogin ||
        !campoUsuario ||
        !campoContrasena ||
        !botonIngresar ||
        !mensajeLogin ||
        !estadoSesion ||
        !botonCerrarSesion
    ) {
        console.error(
            "No se pudieron encontrar los elementos del panel administrativo."
        );

        return;
    }

    function mostrarMensaje(texto, tipo = "") {
        mensajeLogin.textContent = texto;
        mensajeLogin.className = "mensaje-login";

        if (tipo) {
            mensajeLogin.classList.add(`es-${tipo}`);
        }
    }

    function cambiarEstadoCarga(cargando) {
        botonIngresar.disabled = cargando;
        campoUsuario.disabled = cargando;
        campoContrasena.disabled = cargando;

        botonIngresar.textContent = cargando
            ? "Verificando..."
            : "Ingresar";
    }

    function crearAutorizacion(usuario, contrasena) {
        return `Basic ${btoa(`${usuario}:${contrasena}`)}`;
    }

    function cambiarSeccion(nombreSeccion) {
        botonesNavegacion.forEach((boton) => {
            const activo = boton.dataset.seccion === nombreSeccion;

            boton.classList.toggle("activo", activo);

            if (activo) {
                boton.setAttribute("aria-current", "page");
            } else {
                boton.removeAttribute("aria-current");
            }
        });

        contenidosSeccion.forEach((seccion) => {
            seccion.hidden =
                seccion.dataset.contenidoSeccion !== nombreSeccion;
        });
    }

    function obtenerStock(producto) {
        const stock = Number(producto.stock);

        return Number.isFinite(stock) ? stock : 0;
    }

    function estaDisponible(producto) {
        return Boolean(producto.disponible) &&
            obtenerStock(producto) > 0;
    }

    function obtenerUrlImagen(producto) {
        const primeraImagen = Array.isArray(producto.imagenes)
            ? producto.imagenes[0]
            : null;

        let candidata = "";

        if (typeof primeraImagen === "string") {
            candidata = primeraImagen;
        } else if (primeraImagen && typeof primeraImagen === "object") {
            candidata =
                primeraImagen.url ||
                primeraImagen.ruta ||
                primeraImagen.imagenUrl ||
                "";
        }

        candidata =
            candidata ||
            producto.imagenUrl ||
            producto.imagen ||
            "";

        if (!candidata) {
            return "";
        }

        try {
            const url = new URL(candidata, `${apiBaseUrl}/`);

            if (!["http:", "https:"].includes(url.protocol)) {
                return "";
            }

            return url.href;
        } catch {
            return "";
        }
    }

    function crearMarcadorSinImagen() {
        const marcador = document.createElement("span");

        marcador.className = "producto-sin-imagen";
        marcador.textContent = "B";
        marcador.setAttribute("aria-hidden", "true");

        return marcador;
    }

    function crearVistaImagen(producto) {
        const urlImagen = obtenerUrlImagen(producto);

        if (!urlImagen) {
            return crearMarcadorSinImagen();
        }

        const imagen = document.createElement("img");

        imagen.className = "producto-imagen";
        imagen.src = urlImagen;
        imagen.alt = "";
        imagen.loading = "lazy";

        imagen.addEventListener("error", () => {
            imagen.replaceWith(crearMarcadorSinImagen());
        });

        return imagen;
    }

    function crearBotonAccion(texto, tipo, producto) {
        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = `boton-accion-producto ${tipo}`.trim();
        boton.textContent = texto;
        boton.disabled = true;
        boton.title = "Disponible próximamente";
        boton.setAttribute(
            "aria-label",
            `${texto} ${producto.nombre || "producto"}`
        );

        return boton;
    }

    function crearFilaProducto(producto) {
        const fila = document.createElement("tr");

        const celdaProducto = document.createElement("td");
        const identidadProducto = document.createElement("div");
        const informacionProducto = document.createElement("div");
        const nombreProducto = document.createElement("strong");
        const descripcionProducto = document.createElement("small");

        identidadProducto.className = "producto-identidad";
        informacionProducto.className = "producto-informacion";

        nombreProducto.textContent =
            producto.nombre || "Producto sin nombre";

        descripcionProducto.textContent =
            producto.descripcion || "Sin descripción";

        informacionProducto.append(
            nombreProducto,
            descripcionProducto
        );

        identidadProducto.append(
            crearVistaImagen(producto),
            informacionProducto
        );

        celdaProducto.append(identidadProducto);

        const celdaCategoria = document.createElement("td");

        celdaCategoria.textContent =
            producto.categoria?.nombre || "Sin categoría";

        const celdaPrecio = document.createElement("td");
        const precio = Number(producto.precio);

        celdaPrecio.className = "precio-producto";
        celdaPrecio.textContent = formateadorPrecio.format(
            Number.isFinite(precio) ? precio : 0
        );

        const celdaStock = document.createElement("td");

        celdaStock.className = "stock-producto";
        celdaStock.textContent = String(obtenerStock(producto));

        const celdaEstado = document.createElement("td");
        const etiquetaEstado = document.createElement("span");
        const disponible = estaDisponible(producto);

        etiquetaEstado.className = [
            "etiqueta-estado",
            disponible ? "disponible" : "no-disponible"
        ].join(" ");

        if (obtenerStock(producto) <= 0) {
            etiquetaEstado.textContent = "Sin stock";
        } else {
            etiquetaEstado.textContent = disponible
                ? "Disponible"
                : "No disponible";
        }

        celdaEstado.append(etiquetaEstado);

        const celdaAcciones = document.createElement("td");
        const acciones = document.createElement("div");

        acciones.className = "acciones-producto";

        acciones.append(
            crearBotonAccion("Editar", "", producto),
            crearBotonAccion("Eliminar", "eliminar", producto)
        );

        celdaAcciones.append(acciones);

        fila.append(
            celdaProducto,
            celdaCategoria,
            celdaPrecio,
            celdaStock,
            celdaEstado,
            celdaAcciones
        );

        return fila;
    }

    function actualizarResumen(productos) {
        const disponibles = productos.filter(estaDisponible).length;
        const sinStock = productos.filter(
            (producto) => obtenerStock(producto) <= 0
        ).length;

        totalProductos.textContent = String(productos.length);
        productosDisponibles.textContent = String(disponibles);
        productosSinStock.textContent = String(sinStock);

        resumenProductos.hidden = false;
    }

    function mostrarEstadoProductos(texto, esError = false) {
        estadoProductos.textContent = texto;
        estadoProductos.classList.toggle("es-error", esError);
        estadoProductos.hidden = false;
    }

    async function cargarProductos() {
        if (
            !resumenProductos ||
            !totalProductos ||
            !productosDisponibles ||
            !productosSinStock ||
            !estadoProductos ||
            !contenedorTablaProductos ||
            !cuerpoTablaProductos
        ) {
            console.error(
                "No se encontraron los elementos del módulo Productos."
            );

            return;
        }

        resumenProductos.hidden = true;
        contenedorTablaProductos.hidden = true;
        cuerpoTablaProductos.replaceChildren();

        mostrarEstadoProductos("Cargando productos...");

        try {
            const respuesta = await fetch(
                `${apiBaseUrl}/productos`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status}`);
            }

            const productos = await respuesta.json();

            if (!Array.isArray(productos)) {
                throw new Error(
                    "La respuesta de productos no es una lista."
                );
            }

            actualizarResumen(productos);

            if (productos.length === 0) {
                mostrarEstadoProductos(
                    "Todavía no hay productos registrados."
                );

                return;
            }

            const fragmento = document.createDocumentFragment();

            productos.forEach((producto) => {
                fragmento.append(crearFilaProducto(producto));
            });

            cuerpoTablaProductos.append(fragmento);

            estadoProductos.hidden = true;
            contenedorTablaProductos.hidden = false;
        } catch (error) {
            console.error("Error al cargar los productos:", error);

            mostrarEstadoProductos(
                "No fue posible cargar los productos. Inténtalo nuevamente.",
                true
            );
        }
    }

    function abrirPanel(usuario) {
        formularioLogin.reset();

        seccionLogin.hidden = true;
        panelAdministrativo.hidden = false;

        estadoSesion.textContent = `Sesión activa: ${usuario}`;

        cambiarSeccion("productos");
        cargarProductos();
    }

    function cerrarSesion() {
        autorizacionAdmin = "";

        panelAdministrativo.hidden = true;
        seccionLogin.hidden = false;

        formularioLogin.reset();
        estadoSesion.textContent = "Sesión activa";

        mostrarMensaje("Sesión cerrada correctamente.", "exito");

        campoUsuario.focus();
    }

    formularioLogin.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const usuario = campoUsuario.value.trim();
        const contrasena = campoContrasena.value;

        if (!usuario || !contrasena) {
            mostrarMensaje(
                "Ingresa el usuario y la contraseña.",
                "error"
            );

            return;
        }

        let autorizacionTemporal;

        try {
            autorizacionTemporal = crearAutorizacion(
                usuario,
                contrasena
            );
        } catch {
            mostrarMensaje(
                "Las credenciales contienen caracteres no compatibles.",
                "error"
            );

            return;
        }

        cambiarEstadoCarga(true);
        mostrarMensaje("Verificando credenciales...");

        try {
            const respuesta = await fetch(`${apiBaseUrl}/pedidos`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: autorizacionTemporal
                },
                cache: "no-store"
            });

            if (
                respuesta.status === 401 ||
                respuesta.status === 403
            ) {
                mostrarMensaje(
                    "Usuario o contraseña incorrectos.",
                    "error"
                );

                return;
            }

            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status}`);
            }

            autorizacionAdmin = autorizacionTemporal;

            mostrarMensaje("");
            abrirPanel(usuario);
        } catch (error) {
            console.error("Error al iniciar sesión:", error);

            mostrarMensaje(
                "No fue posible conectar con el servidor. Inténtalo nuevamente.",
                "error"
            );
        } finally {
            cambiarEstadoCarga(false);
        }
    });

    botonesNavegacion.forEach((boton) => {
        boton.addEventListener("click", () => {
            cambiarSeccion(boton.dataset.seccion);
        });
    });

    botonCerrarSesion.addEventListener("click", cerrarSesion);
})();