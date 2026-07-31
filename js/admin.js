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

    function activarNavegacionInicial() {
        botonesNavegacion.forEach((boton, indice) => {
            const activo = indice === 0;

            boton.classList.toggle("activo", activo);

            if (activo) {
                boton.setAttribute("aria-current", "page");
            } else {
                boton.removeAttribute("aria-current");
            }
        });
    }

    function abrirPanel(usuario) {
        formularioLogin.reset();

        seccionLogin.hidden = true;
        panelAdministrativo.hidden = false;

        estadoSesion.textContent = `Sesión activa: ${usuario}`;

        activarNavegacionInicial();
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

    botonCerrarSesion.addEventListener("click", cerrarSesion);
})();