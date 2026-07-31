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

    const botonNuevoProducto = document.querySelector(
        "#boton-nuevo-producto"
    );
    const contenedorFormularioProducto = document.querySelector(
        "#contenedor-formulario-producto"
    );
    const formularioProducto = document.querySelector(
        "#formulario-producto"
    );
    const botonCancelarProducto = document.querySelector(
        "#boton-cancelar-producto"
    );
    const botonDescartarProducto = document.querySelector(
        "#boton-descartar-producto"
    );
    const botonGuardarProducto = document.querySelector(
        "#boton-guardar-producto"
    );
    const mensajeFormularioProducto = document.querySelector(
        "#mensaje-formulario-producto"
    );
    const campoProductoNombre = document.querySelector(
        "#producto-nombre"
    );
    const campoProductoCategoria = document.querySelector(
        "#producto-categoria"
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

    function mostrarMensajeFormularioProducto(
        texto,
        tipo = ""
    ) {
        mensajeFormularioProducto.textContent = texto;

        mensajeFormularioProducto.classList.remove(
            "es-error",
            "es-exito"
        );

        if (tipo) {
            mensajeFormularioProducto.classList.add(
                `es-${tipo}`
            );
        }
    }

    function cambiarEstadoCreacionProducto(estaCreando) {
        botonGuardarProducto.disabled = estaCreando;

        botonGuardarProducto.textContent = estaCreando
            ? "Creando producto..."
            : "Crear producto";
    }

    async function cargarCategoriasProducto() {
        campoProductoCategoria.disabled = true;
        campoProductoCategoria.replaceChildren(
            new Option("Cargando categorías...", "")
        );

        try {
            const respuesta = await fetch(
                `${apiBaseUrl}/categorias`,
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

            const categorias = await respuesta.json();

            if (!Array.isArray(categorias)) {
                throw new Error(
                    "La respuesta de categorías no es una lista."
                );
            }

            categorias.sort((categoriaA, categoriaB) => {
                return String(categoriaA.nombre).localeCompare(
                    String(categoriaB.nombre),
                    "es",
                    {
                        sensitivity: "base"
                    }
                );
            });

            const textoOpcionInicial = categorias.length > 0
                ? "Selecciona una categoría"
                : "No hay categorías registradas";

            const opcionInicial = new Option(
                textoOpcionInicial,
                ""
            );

            opcionInicial.disabled = true;
            opcionInicial.selected = true;

            const fragmento = document.createDocumentFragment();

            fragmento.append(opcionInicial);

            categorias.forEach((categoria) => {
                const opcion = new Option(
                    categoria.nombre,
                    String(categoria.id)
                );

                fragmento.append(opcion);
            });

            campoProductoCategoria.replaceChildren(fragmento);
            campoProductoCategoria.disabled =
                categorias.length === 0;

            if (categorias.length === 0) {
                mostrarMensajeFormularioProducto(
                    "Primero debes registrar al menos una categoría.",
                    "error"
                );

                return false;
            }

            return true;
        } catch (error) {
            console.error(
                "Error al cargar las categorías:",
                error
            );

            campoProductoCategoria.replaceChildren(
                new Option(
                    "No fue posible cargar las categorías",
                    ""
                )
            );

            mostrarMensajeFormularioProducto(
                "No fue posible cargar las categorías.",
                "error"
            );

            return false;
        }
    }

    async function abrirFormularioProducto() {
        contenedorFormularioProducto.hidden = false;

        botonNuevoProducto.setAttribute(
            "aria-expanded",
            "true"
        );

        mostrarMensajeFormularioProducto("");

        const categoriasCargadas =
            await cargarCategoriasProducto();

        contenedorFormularioProducto.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        if (categoriasCargadas) {
            campoProductoNombre.focus();
        }
    }

    function cerrarFormularioProducto() {
        formularioProducto.reset();

        contenedorFormularioProducto.hidden = true;

        botonNuevoProducto.setAttribute(
            "aria-expanded",
            "false"
        );

        cambiarEstadoCreacionProducto(false);
        mostrarMensajeFormularioProducto("");
    }

    async function leerDetalleError(respuesta) {
        const tipoContenido =
            respuesta.headers.get("content-type") || "";

        try {
            if (tipoContenido.includes("application/json")) {
                const datosError = await respuesta.json();

                return (
                    datosError.mensaje ||
                    datosError.message ||
                    datosError.detail ||
                    ""
                );
            }

            return (await respuesta.text()).trim();
        } catch {
            return "";
        }
    }

    async function crearProducto(evento) {
        evento.preventDefault();

        if (!formularioProducto.checkValidity()) {
            formularioProducto.reportValidity();

            return;
        }

        const datosFormulario =
            new FormData(formularioProducto);

        const nombre = String(
            datosFormulario.get("nombre") || ""
        ).trim();

        const descripcion = String(
            datosFormulario.get("descripcion") || ""
        ).trim();

        const precio = Number(
            datosFormulario.get("precio")
        );

        const stock = Number(
            datosFormulario.get("stock")
        );

        const categoriaId = Number(
            datosFormulario.get("categoriaId")
        );

        const talla = String(
            datosFormulario.get("talla") || ""
        ).trim();

        const estado = String(
            datosFormulario.get("estado") || ""
        ).trim();

        if (
            !nombre ||
            !Number.isFinite(precio) ||
            precio < 0 ||
            !Number.isInteger(stock) ||
            stock < 0 ||
            !Number.isInteger(categoriaId) ||
            categoriaId <= 0
        ) {
            mostrarMensajeFormularioProducto(
                "Revisa el nombre, precio, stock y categoría.",
                "error"
            );

            return;
        }

        const producto = {
            nombre,
            descripcion: descripcion || null,
            precio,
            stock,
            disponible:
                datosFormulario.get("disponible") !== null,
            nuevo:
                datosFormulario.get("nuevo") !== null,
            destacado:
                datosFormulario.get("destacado") !== null,
            categoriaId,
            talla: talla || null,
            estado: estado || null
        };

        cambiarEstadoCreacionProducto(true);

        mostrarMensajeFormularioProducto(
            "Guardando producto..."
        );

        try {
            const respuesta = await fetch(
                `${apiBaseUrl}/productos`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: autorizacionAdmin
                    },
                    body: JSON.stringify(producto)
                }
            );

            if (
                respuesta.status === 401 ||
                respuesta.status === 403
            ) {
                mostrarMensajeFormularioProducto(
                    "La sesión administrativa no es válida. Vuelve a iniciar sesión.",
                    "error"
                );

                return;
            }

            if (!respuesta.ok) {
                const detalleError =
                    await leerDetalleError(respuesta);

                throw new Error(
                    detalleError ||
                    `HTTP ${respuesta.status}`
                );
            }

            const productoCreado = await respuesta.json();

            formularioProducto.reset();

            mostrarMensajeFormularioProducto(
                `"${productoCreado.nombre || nombre}" fue creado correctamente.`,
                "exito"
            );

            await cargarProductos();

            campoProductoNombre.focus();
        } catch (error) {
            console.error(
                "Error al crear el producto:",
                error
            );

            mostrarMensajeFormularioProducto(
                "No fue posible crear el producto. Revisa los datos e inténtalo nuevamente.",
                "error"
            );
        } finally {
            cambiarEstadoCreacionProducto(false);
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

        cerrarFormularioProducto();

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

    botonNuevoProducto.addEventListener("click", () => {
        if (contenedorFormularioProducto.hidden) {
            abrirFormularioProducto();

            return;
        }

        cerrarFormularioProducto();
    });

    botonCancelarProducto.addEventListener(
        "click",
        cerrarFormularioProducto
    );

    botonDescartarProducto.addEventListener(
        "click",
        cerrarFormularioProducto
    );

    formularioProducto.addEventListener(
        "submit",
        crearProducto
    );

    botonCerrarSesion.addEventListener("click", cerrarSesion);
})();
