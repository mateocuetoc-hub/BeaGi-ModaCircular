const numeroWhatsApp = "569XXXXXXXX";

const abrigos = [];

for (let i = 1; i <= 35; i++) {
    abrigos.push({
        nombre: `Abrigo ${i}`,
        talla: "Por definir",
        estado: "Por definir",
        precio: "Consultar",
        imagen: "",
    });
}

const contenedorProductos = document.getElementById("contenedor-productos");

abrigos.forEach((abrigo) => {
    const mensaje = `Hola, me interesa el ${abrigo.nombre}. Talla: ${abrigo.talla}. Precio: ${abrigo.precio}`;
    const mensajeWhatsApp = encodeURIComponent(mensaje);

    const producto = document.createElement("div");
    producto.classList.add("producto");

    producto.innerHTML = `
        <div class="imagen-placeholder">Foto pendiente</div>

        <h3>${abrigo.nombre}</h3>
        <p>Talla: ${abrigo.talla}</p>
        <p>Estado: ${abrigo.estado}</p>
        <p class="precio">${abrigo.precio}</p>

        <a 
            class="btn-wsp" 
            href="https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}" 
            target="_blank"
        >
            Consultar por WhatsApp
        </a>
    `;

    contenedorProductos.appendChild(producto);
});