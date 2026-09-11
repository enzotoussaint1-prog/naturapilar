// =========================================
// CONEXIÓN CON SUPABASE
// =========================================

const SUPABASE_URL =
    "https://nmsschnmwmssoqywquru.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_LIMcZZCX_nzQWB2kdp8N3A_BTFCLPAb";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================================
// CARGAR PRODUCTOS DESDE SUPABASE
// =========================================

async function cargarProductosDesdeSupabase() {

    try {

        const { data, error } =
            await supabaseClient
                .from("productos")
                .select("*")
                .eq("activo", true)
                .order("id", { ascending: true });


        if (error) {

            console.error(
                "Error cargando productos desde Supabase:",
                error
            );

            return;

        }


        if (!data || data.length === 0) {

            console.warn(
                "Supabase no devolvió productos."
            );

            return;

        }


        // Reemplazamos los productos locales
        // por los productos de Supabase.

        productos.splice(
            0,
            productos.length,
            ...data.map(producto => ({

                id: producto.id,

                codigo: producto.codigo,

                nombre: producto.nombre,

                descripcion: producto.descripcion,

                categoria: producto.categoria,

                subcategoria: producto.subcategoria,

                subcategoria3: producto.subcategoria3,

                precio: Number(producto.precio),

                precioAnterior:
                    producto.precio_anterior !== null
                        ? Number(producto.precio_anterior)
                        : null,

                imagen: producto.imagen,

                imagen2: producto.imagen2,

                oferta: producto.oferta,

                destacado: producto.destacado,

                stock: producto.stock

            }))
        );


        // Volvemos a dibujar la tienda
        // utilizando los datos reales de Supabase.
       sincronizarCarritoConStock();
        renderizarProductos(productos);

        renderizarPromociones();

        renderizarCombos();

        console.log(
            "Productos cargados desde Supabase:",
            productos.length
        );


    } catch (error) {

        console.error(
            "Error inesperado conectando con Supabase:",
            error
        );

    }

}
// =========================================
// SINCRONIZAR CARRITO CON STOCK REAL
// =========================================

function sincronizarCarritoConStock() {

    let carritoModificado = false;

    carrito = carrito.filter(item => {

        const producto =
            productos.find(p => p.id == item.id);


        // Si el producto ya no existe
        // o está inactivo

        if (!producto) {

            carritoModificado = true;

            return false;

        }


        // Si quedó sin stock

        if (producto.stock <= 0) {

            carritoModificado = true;

            return false;

        }


        // Si el carrito tiene más unidades
        // que el stock disponible

        if (item.cantidad > producto.stock) {

            item.cantidad =
                producto.stock;

            carritoModificado = true;

        }


        // Actualizar precio e imagen
        // por si fueron modificados

        item.precio =
            producto.precio;

        item.imagen =
            producto.imagen;

        item.nombre =
            producto.nombre;
        
        item.descripcion = producto.descripcion;

        item.codigo =
            producto.codigo;


        return true;

    });


    if (carritoModificado) {

        guardarCarrito();

    }

}
const RECARGO_MERCADOPAGO = 0.05; // 5%

function precioConComisionMP(precio) {
    const conRecargo = precio * (1 + RECARGO_MERCADOPAGO);
    return Math.round(conRecargo / 100) * 100; // redondeo a múltiplo de $100
}

function bloqueDoblePrecio(producto) {
    const precioTransferencia = producto.precio;
    const precioMP = precioConComisionMP(producto.precio);
    const hayOferta = producto.oferta && producto.precioAnterior;
    const porcentajeOferta = hayOferta
        ? Math.round(100 - (producto.precio * 100 / producto.precioAnterior))
        : 0;

    return `
<div class="precios-metodo">
    <div class="precio-metodo precio-transferencia">
        <span class="etiqueta-metodo">Transferencia</span>
        ${hayOferta ? `<span class="precio-anterior">$${producto.precioAnterior.toLocaleString("es-AR")}</span>` : ""}
        <span class="valor-metodo">$${precioTransferencia.toLocaleString("es-AR")}</span>
       <span class="tag-promo">5% de descuento</span>
    </div>
    <div class="precio-metodo precio-mercadopago">
        <span class="etiqueta-metodo">Mercado Pago</span>
        <span class="valor-metodo">$${precioMP.toLocaleString("es-AR")}</span>
    </div>
</div>
`;
}
function alternarImagenProducto(img, principal, secundaria) {
    if (!secundaria) return;
    const mostrandoSecundaria = img.dataset.mostrando === "2";
    img.src = mostrandoSecundaria ? principal : secundaria;
    img.dataset.mostrando = mostrandoSecundaria ? "1" : "2";
}
const contenedorProductos = document.getElementById("contenedor-productos");

const botonCargarMasProductos =
    document.getElementById("btn-cargar-mas-productos");

const PRODUCTOS_POR_TANDA = 24;

let productosFiltradosActuales = [];
let productosMostrados = 0;

function renderizarProductos(lista) {

    productosFiltradosActuales = lista || [];
    productosMostrados = 0;
    contenedorProductos.innerHTML = "";

    if (productosFiltradosActuales.length === 0) {

        contenedorProductos.innerHTML = `
            <div class="sin-resultados">
                <h3>No encontramos productos</h3>
                <p>
                    Probá con otra búsqueda o categoría.
                </p>
            </div>
        `;

        botonCargarMasProductos.style.display = "none";

        return;

    }

    mostrarSiguienteTandaProductos();

}


function mostrarSiguienteTandaProductos() {

    const siguienteTanda =
        productosFiltradosActuales.slice(
            productosMostrados,
            productosMostrados + PRODUCTOS_POR_TANDA
        );

    contenedorProductos.insertAdjacentHTML(
        "beforeend",
        siguienteTanda.map(producto => `
        <article class="producto">

${producto.oferta && producto.precioAnterior
    ? `
        <span class="etiqueta-oferta">
            🔥 OFERTA
            <span class="porcentaje-oferta">
                -${Math.round(
                    ((producto.precioAnterior - producto.precio) /
                    producto.precioAnterior) * 100
                )}%
            </span>
        </span>
    `
    : ""
}

<img
    src="${producto.imagen}"
    alt="${producto.nombre}"
    loading="lazy"
    decoding="async"
    data-mostrando="1"
    onmouseover="this.src='${producto.imagen2 || producto.imagen}'; this.dataset.mostrando='2'"
    onmouseout="this.src='${producto.imagen}'; this.dataset.mostrando='1'"
    ${producto.imagen2 ? `onclick="alternarImagenProducto(this, '${producto.imagen}', '${producto.imagen2}')"` : ""}>

                <h3>${producto.nombre}</h3>

                <p>${producto.descripcion}</p>

                <div class="precios">
${bloqueDoblePrecio(producto)}
                </div>

<button 
class="btn-detalle"
data-id="${producto.id}">
Ver detalle
</button>

<a href="#"
   class="btn-comprar"
   data-id="${producto.id}">
   Comprar
</a>

        </article>
    `).join("")
    );

    productosMostrados += siguienteTanda.length;

    activarAnimacionesProductos();

    if (productosMostrados < productosFiltradosActuales.length) {

        botonCargarMasProductos.style.display = "block";

        botonCargarMasProductos.textContent =
            `Ver más productos (${productosFiltradosActuales.length - productosMostrados} restantes)`;

    } else {

        botonCargarMasProductos.style.display = "none";

    }

}


botonCargarMasProductos.addEventListener(
    "click",
    mostrarSiguienteTandaProductos
);

renderizarProductos(productos);

// =========================================
// COMBOS ARMADOS
// =========================================

const COMBOS = [
    {
        titulo: "Kit Tododia Frambuesa y Pimienta Rosa",
        productosIds: [174, 80, 124],
        imagen: "img/kit-tododia.png"
    },
    {
        titulo: "Kit Kaiak Clasico Masculino",
        productosIds: [7, 192, 159],
        imagen: "img/kit-kaiak-masculino.png"
    },
    {
        titulo: "Kit Cabello Lumina",
        productosIds: [269, 271, 270],
        imagen: "img/kit-lumina.png"
    },
        {
        titulo: "Kit Humor Primeiro Femenino",
        productosIds: [59, 250, 185],
        imagen: "img/kit-humor.png"
    },
    {
        titulo: "Kit Cereza Negra y Praliné",
        productosIds: [121, 77, 222],
        imagen: "img/kit-tododia-praline.png"
    },
    {
        titulo: "Kit Kaiak Clásico Femenino",
        productosIds: [187, 161],
        imagen: "img/kit-kaiak-clasico-femenino.png"
    }
];

const contenedorCombos = document.getElementById("contenedor-combos");

function renderizarCombos() {

    if (!contenedorCombos) return;

    contenedorCombos.innerHTML = COMBOS.map(combo => {

        const productosCombo = combo.productosIds
            .map(id => productos.find(p => p.id === id))
            .filter(p => p);

        if (productosCombo.length === 0) return "";

        const precioTotal = productosCombo.reduce(
            (acc, p) => acc + p.precio, 0
        );

        return `
            <article class="combo-card">

                               <img src="${combo.imagen || productosCombo[0].imagen}" alt="${combo.titulo}" loading="lazy">

                <h3>${combo.titulo}</h3>

                                <ul class="combo-lista">
                    ${productosCombo.map(p => {
                        const detalle = [p.subcategoria, p.subcategoria3]
                            .filter(Boolean)
                            .join(" · ");
                        return `<li>${p.nombre}${detalle ? ` <span class="combo-detalle">(${detalle})</span>` : ""}</li>`;
                    }).join("")}
                </ul>

                <div class="combo-precio">
                    $${precioTotal.toLocaleString("es-AR")}
                </div>

                <button
                    class="btn-comprar"
                    onclick="agregarComboAlCarrito([${combo.productosIds.join(",")}])">
                    Agregar combo al carrito
                </button>

            </article>
        `;

    }).join("");

}


function agregarComboAlCarrito(idsProductos) {

    let algunoAgotado = false;

    idsProductos.forEach(id => {

        const producto = productos.find(p => p.id == id);

        if (!producto || producto.stock <= 0) {
            algunoAgotado = true;
            return;
        }

        const existente = carrito.find(item => item.id == producto.id);

        if (existente) {

            if (existente.cantidad < producto.stock) {
                existente.cantidad++;
            }

        } else {

            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                precio: producto.precio,
                imagen: producto.imagen,
                codigo: producto.codigo,
                cantidad: 1
            });

        }

    });

    guardarCarrito();
    renderizarCarrito();
    abrirPanelCarrito();

    if (algunoAgotado) {
        alert("Uno o más productos del combo están agotados y no se agregaron.");
    }

}
// -----------------------------
// PROMOCIONES
// -----------------------------

const contenedorPromociones = document.getElementById("contenedor-promociones");

function renderizarPromociones() {

    if (!contenedorPromociones) return;

    contenedorPromociones.innerHTML = "";

    const promociones = productos.filter(producto => producto.oferta);

    promociones.forEach(producto => {

        contenedorPromociones.innerHTML += `

        <article class="producto">
        ${producto.oferta && producto.precioAnterior
    ? `
        <span class="etiqueta-oferta">
            🔥 OFERTA
            <span class="porcentaje-oferta">
                -${Math.round(
                    ((producto.precioAnterior - producto.precio) /
                    producto.precioAnterior) * 100
                )}%
            </span>
        </span>
    `
    : ""
}
                        <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy" decoding="async">

            <h3>${producto.nombre}</h3>

           <p>${producto.descripcion}</p>

<div class="precios">

${bloqueDoblePrecio(producto)}

</div>

<a href="#"
   class="btn-comprar"
   data-id="${producto.id}">

    Comprar

</a>

        </article>

        `;

    });

}

renderizarPromociones();
// -----------------------------
// SCROLL SUAVE DEL MENÚ
// -----------------------------

document.querySelectorAll('nav a').forEach(link => {

link.addEventListener('click', function(e){

e.preventDefault();

const destino = document.querySelector(this.getAttribute('href'));

destino.scrollIntoView({
behavior:'smooth'
});

});

});


// -----------------------------
// ANIMACIÓN DE PRODUCTOS
// -----------------------------

function activarAnimacionesProductos() {

    const tarjetasProducto =
        document.querySelectorAll(".producto:not(.producto-animado)");

    const observador =
        new IntersectionObserver(
            (entradas) => {

                entradas.forEach((entrada) => {

                    if (entrada.isIntersecting) {

                        entrada.target.style.opacity = "1";

                        entrada.target.style.transform =
                            "translateY(0px)";

                        observador.unobserve(
                            entrada.target
                        );

                    }

                });

            },
            {
                threshold: 0.15
            }
        );

        tarjetasProducto.forEach((producto) => {

        producto.classList.add("producto-animado");

        producto.style.opacity = "0";

        producto.style.transform =
            "translateY(40px)";

        producto.style.transition =
            "opacity .6s ease, transform .6s ease";

        observador.observe(producto);

    });

}


// =========================================
// CARRITO DE COMPRAS
// =========================================
const UMBRAL_ENVIO_GRATIS = 200000;

let carrito = JSON.parse(
    localStorage.getItem("carritoNaturaPilar")
) || [];


// ELEMENTOS DEL CARRITO

const carritoElemento =
    document.getElementById("carrito");

const overlayCarrito =
    document.getElementById("carrito-overlay");

const abrirCarrito =
    document.getElementById("abrir-carrito");

const cerrarCarrito =
    document.getElementById("cerrar-carrito");

const productosCarrito =
    document.getElementById("carrito-productos");

const totalCarrito =
    document.getElementById("carrito-total");

const contadorCarrito =
    document.getElementById("contador-carrito");

const continuarCompra =
    document.getElementById("continuar-compra");

// =========================================
// FORMULARIO DE DATOS DE COMPRA
// =========================================

const formularioCompraOverlay =
    document.getElementById(
        "formulario-compra-overlay"
    );

const formularioDatosCompra =
    document.getElementById(
        "formulario-datos-compra"
    );

const cerrarFormularioCompra =
    document.getElementById(
        "cerrar-formulario-compra"
    );
const confirmarPedido =
    document.getElementById(
        "confirmar-pedido"
    );

const tipoEntrega =
    document.getElementById(
        "tipo-entrega"
    );

const datosEnvio =
    document.getElementById(
        "datos-envio"
    );

const direccionCliente =
    document.getElementById(
        "direccion-cliente"
    );

const localidadCliente =
    document.getElementById(
        "localidad-cliente"
    );
const provinciaCliente =
    document.getElementById(
        "provincia-cliente"
    );

const cpCliente =
    document.getElementById(
        "cp-cliente"
    );

const totalFormulario =
    document.getElementById(
        "total-formulario"
    );
const metodoPagoOverlay = document.getElementById("metodo-pago-overlay");
const cerrarMetodoPago = document.getElementById("cerrar-metodo-pago");
const elegirMercadoPago = document.getElementById("elegir-mercadopago");
const elegirTransferencia = document.getElementById("elegir-transferencia");
const totalMetodoMP = document.getElementById("total-metodo-mp");
const totalMetodoTransferencia = document.getElementById("total-metodo-transferencia");

function calcularTotalCarrito() {
    return carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
}
function calcularTotalConRecargoMP() {
    return carrito.reduce((acc, item) => acc + (precioConComisionMP(item.precio) * item.cantidad), 0);
}
function abrirMetodoPago() {
    metodoPagoOverlay.classList.add("activo");
    totalMetodoTransferencia.textContent = "$" + calcularTotalCarrito().toLocaleString("es-AR");
    totalMetodoMP.textContent = "$" + calcularTotalConRecargoMP().toLocaleString("es-AR");
}
function cerrarMetodoPagoFn() { metodoPagoOverlay.classList.remove("activo"); }

cerrarMetodoPago.addEventListener("click", cerrarMetodoPagoFn);
elegirMercadoPago.addEventListener("click", function() { cerrarMetodoPagoFn(); abrirFormularioCompra(); });
elegirTransferencia.addEventListener("click", function() { cerrarMetodoPagoFn(); abrirTransferencia(); });

const transferenciaOverlay = document.getElementById("transferencia-overlay");
const cerrarTransferencia = document.getElementById("cerrar-transferencia");
const totalTransferencia = document.getElementById("total-transferencia");
const whatsappComprobante = document.getElementById("whatsapp-comprobante");
const ALIAS_TRANSFERENCIA = "natura.valen.pilar";

function abrirTransferencia() {
    transferenciaOverlay.classList.add("activo");
    const total = calcularTotalCarrito();
    totalTransferencia.textContent = "$" + total.toLocaleString("es-AR");

    const detalle = carrito
    .map(item =>
        `- ${item.cantidad}x ${item.nombre}\n` +
        `  ID: ${item.id}\n` +
        `  Código: ${item.codigo}`
    )
    .join("\n\n");

    const mensaje = encodeURIComponent(
        `Hola! Quiero comprar:\n${detalle}\n\nTotal: $${total.toLocaleString("es-AR")} (transferencia, Alias: ${ALIAS_TRANSFERENCIA})\n\nMis datos:\nNombre:\nRetiro o dirección de envío:\n\nTe mando el comprobante 👇`
    );

    whatsappComprobante.href = `https://wa.me/5491150241149?text=${mensaje}`;
}
function cerrarTransferenciaFn() { transferenciaOverlay.classList.remove("activo"); }
cerrarTransferencia.addEventListener("click", cerrarTransferenciaFn);


// =========================================
// MOSTRAR FORMULARIO
// =========================================

function abrirFormularioCompra() {

    formularioCompraOverlay.classList.add(
        "activo"
    );

    const total = calcularTotalConRecargoMP();

    totalFormulario.textContent =
        "$" +
        total.toLocaleString("es-AR");

}


// =========================================
// CERRAR FORMULARIO
// =========================================

function cerrarFormulario() {

    formularioCompraOverlay.classList.remove(
        "activo"
    );

}


// =========================================
// CAMBIAR TIPO DE ENTREGA
// =========================================

tipoEntrega.addEventListener(
    "change",
    function() {

        if (this.value === "envio") {

            datosEnvio.style.display = "block";
            direccionCliente.required = true;
            localidadCliente.required = true;
            provinciaCliente.required = true;
            cpCliente.required = true;

        } else {

            datosEnvio.style.display = "none";
            direccionCliente.required = false;
            localidadCliente.required = false;
            provinciaCliente.required = false;
            cpCliente.required = false;

            direccionCliente.value = "";
            localidadCliente.value = "";
            provinciaCliente.value = "";
            cpCliente.value = "";

        }

    }
);

// =========================================
// CERRAR FORMULARIO
// =========================================

cerrarFormularioCompra.addEventListener(
    "click",
    cerrarFormulario
);


// =========================================
// CERRAR HACIENDO CLICK AFUERA
// =========================================

formularioCompraOverlay.addEventListener(
    "click",
    function(e) {

        if (
            e.target ===
            formularioCompraOverlay
        ) {

            cerrarFormulario();

        }

    }
);




// =========================================
// GUARDAR CARRITO
// =========================================

function guardarCarrito() {

    localStorage.setItem(
        "carritoNaturaPilar",
        JSON.stringify(carrito)
    );

}


// =========================================
// ABRIR CARRITO
// =========================================

function abrirPanelCarrito() {

    carritoElemento.classList.add("abierto");

    overlayCarrito.classList.add("activo");

}


// =========================================
// CERRAR CARRITO
// =========================================

function cerrarPanelCarrito() {

    carritoElemento.classList.remove("abierto");

    overlayCarrito.classList.remove("activo");

}


// =========================================
// AGREGAR PRODUCTO AL CARRITO
// =========================================

function agregarAlCarrito(id) {

    const producto =
        productos.find(p => p.id == id);

    if (!producto) return;


    // =========================================
    // VERIFICAR STOCK
    // =========================================

    if (producto.stock <= 0) {

        alert(
            "Este producto está agotado."
        );

        return;

    }


    const productoExistente =
        carrito.find(item => item.id == producto.id);


    // =========================================
    // SI YA ESTÁ EN EL CARRITO
    // =========================================

    if (productoExistente) {

        // No permitir superar el stock disponible

        if (
            productoExistente.cantidad >=
            producto.stock
        ) {

            alert(
                `Solo hay ${producto.stock} unidad${
                    producto.stock === 1 ? "" : "es"
                } disponible${
                    producto.stock === 1 ? "" : "s"
                }.`
            );

            renderizarCarrito();

            return;

        }


        productoExistente.cantidad++;

    }


    // =========================================
    // SI ES UN PRODUCTO NUEVO
    // =========================================

    else {

        carrito.push({

            id: producto.id,

            nombre: producto.nombre,

            descripcion: producto.descripcion,

            precio: producto.precio,

            imagen: producto.imagen,

            codigo: producto.codigo,

            cantidad: 1

        });

    }


    guardarCarrito();

    renderizarCarrito();

    abrirPanelCarrito();

}


// =========================================
// MOSTRAR CARRITO
// =========================================

function renderizarCarrito() {

    productosCarrito.innerHTML = "";


    if (carrito.length === 0) {

        productosCarrito.innerHTML = `
            <p class="carrito-vacio">
                Tu carrito está vacío.
            </p>
        `;

                totalCarrito.textContent = "$0";

        contadorCarrito.textContent = "0";

        continuarCompra.disabled = true;


        return;

    }


    let total = 0;

    let cantidadTotal = 0;


    carrito.forEach(item => {

        const subtotal =
            item.precio * item.cantidad;

        total += subtotal;

        cantidadTotal += item.cantidad;


        productosCarrito.innerHTML += `

            <div class="item-carrito">

                <img
                    src="${item.imagen}"
                    alt="${item.nombre}">

                <div>

                    <h3>
                        ${item.nombre}
                    </h3>

                    <div class="item-precio">
                        $${item.precio.toLocaleString("es-AR")}
                    </div>

                    <div class="controles-cantidad">

                        <button
                            class="btn-cantidad"
                            data-accion="restar"
                            data-id="${item.id}">
                            −
                        </button>

                        <span class="cantidad">
    ${item.cantidad}
</span>

${(() => {

    const producto =
        productos.find(p => p.id == item.id);

    if (
        producto &&
        item.cantidad >= producto.stock
    ) {

        return `
            <small class="limite-stock">
                Límite de stock disponible
            </small>
        `;

    }

    return "";

})()}

                       <button
    class="btn-cantidad"
    data-accion="sumar"
    data-id="${item.id}"
    ${(() => {

        const producto =
            productos.find(p => p.id == item.id);

        return producto &&
               item.cantidad >= producto.stock
            ? "disabled"
            : "";

    })()}>
    +
    </button>

                        <button
                            class="btn-eliminar"
                            data-accion="eliminar"
                            data-id="${item.id}">
                            Eliminar
                        </button>

                    </div>

                </div>

            </div>

        `;

    });


        totalCarrito.textContent =
        "$" + total.toLocaleString("es-AR");


    contadorCarrito.textContent =
        cantidadTotal;


    continuarCompra.disabled = false;



}


// =========================================
// CAMBIAR CANTIDAD
// =========================================

function cambiarCantidad(id, cambio) {

    const item =
        carrito.find(producto => producto.id == id);

    if (!item) return;


    const producto =
        productos.find(p => p.id == id);

    if (!producto) return;


    // =========================================
    // AUMENTAR CANTIDAD
    // =========================================

    if (cambio > 0) {

        if (item.cantidad >= producto.stock) {

            alert(
                `No podés agregar más unidades. ` +
                `Hay ${producto.stock} disponible${
                    producto.stock === 1 ? "" : "s"
                }.`
            );

            renderizarCarrito();

            return;

        }

    }


    item.cantidad += cambio;


    // =========================================
    // ELIMINAR SI LLEGA A 0
    // =========================================

    if (item.cantidad <= 0) {

        carrito =
            carrito.filter(
                producto => producto.id != id
            );

    }


    guardarCarrito();

    renderizarCarrito();

}


// =========================================
// ELIMINAR PRODUCTO
// =========================================

function eliminarDelCarrito(id) {

    carrito =
        carrito.filter(
            producto => producto.id != id
        );


    guardarCarrito();

    renderizarCarrito();

}


// =========================================
// BOTONES COMPRAR
// =========================================

document.addEventListener("click", function(e) {

    const boton = e.target.closest(".btn-comprar");

    if (!boton) return;

    e.preventDefault();

    const idProducto = boton.dataset.id;

    if (!idProducto) {

        console.error(
            "El botón Comprar no tiene data-id."
        );

        return;

    }

    const producto = productos.find(
        p => p.id == idProducto
    );

    if (!producto) {

        console.error(
            "No se encontró el producto con ID:",
            idProducto
        );

        return;

    }

    agregarAlCarrito(producto.id);

});


// =========================================
// CONTROLES DEL CARRITO
// =========================================

document.addEventListener("click", function(e) {

    const boton =
        e.target.closest("[data-accion]");

    if (!boton) return;


    const id =
        boton.dataset.id;

    const accion =
        boton.dataset.accion;


    if (accion === "sumar") {

        cambiarCantidad(id, 1);

    }


    if (accion === "restar") {

        cambiarCantidad(id, -1);

    }


    if (accion === "eliminar") {

        eliminarDelCarrito(id);

    }

});


// =========================================
// ABRIR Y CERRAR CARRITO
// =========================================

abrirCarrito.addEventListener(
    "click",
    abrirPanelCarrito
);


cerrarCarrito.addEventListener(
    "click",
    cerrarPanelCarrito
);


overlayCarrito.addEventListener(
    "click",
    cerrarPanelCarrito
);


// =========================================
// CONTINUAR COMPRA
// =========================================

continuarCompra.addEventListener(
    "click",
    function() {

        if (carrito.length === 0) {

            alert(
                "Tu carrito está vacío."
            );

            return;

        }

        // Abrir formulario de datos de compra
        cerrarPanelCarrito();
        modal.style.display = "none";
        abrirMetodoPago();

    }
);


// =========================================
// CONFIRMAR DATOS Y CREAR CHECKOUT
// =========================================

formularioDatosCompra.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();


        // =========================================
        // EVITAR DOBLE CLICK
        // =========================================

        confirmarPedido.disabled = true;

        confirmarPedido.textContent =
            "Preparando pago...";


        try {

            // =========================================
            // OBTENER DATOS DEL CLIENTE
            // =========================================

            const formData =
                new FormData(
                    formularioDatosCompra
                );


           const nombre =
    formData.get("nombre_cliente");

const telefono =
    formData.get("telefono");

const email =
    formData.get("email");

const tipoEntregaValor =
    formData.get("tipo_entrega");

const direccion =
    formData.get("direccion");

const localidad =
    formData.get("localidad");
            
 const provincia =
    formData.get("provincia");

const codigoPostal =
    formData.get("codigo_postal");           

const notas =
    formData.get("notas");

            // =========================================
            // VERIFICAR CARRITO
            // =========================================

            if (
                !carrito ||
                carrito.length === 0
            ) {

                throw new Error(
                    "El carrito está vacío."
                );

            }


            // =========================================
            // LLAMAR A SUPABASE
            // =========================================

            const respuesta =
    await fetch(
        `${SUPABASE_URL}/functions/v1/hyper-action`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "apikey":
                                SUPABASE_KEY

                        },

                        body: JSON.stringify({

                         carrito: carrito.map(item => ({ ...item, precio: precioConComisionMP(item.precio) })),

                            cliente: {

                                nombre:
                                    nombre,

                                telefono:
                                    telefono,

                                email:
                                    email,

                                tipoEntrega:
                                    tipoEntregaValor,

                                direccion:
                                    direccion,

                                localidad:
                                    localidad,
                                notas: notas

                            }

                        })

                    }
                );


            // =========================================
            // LEER RESPUESTA
            // =========================================

            const data =
                await respuesta.json();


            console.log(
                "Respuesta crear-preferencia:",
                data
            );


            // =========================================
            // VERIFICAR ERROR
            // =========================================

            if (!respuesta.ok) {

                console.error(
                    "Error llamando a Supabase:",
                    data
                );

                throw new Error(
                    data?.error ||
                    "No se pudo crear la preferencia de pago."
                );

            }


            // =========================================
            // VERIFICAR CHECKOUT
            // =========================================

            if (
                !data ||
                !data.init_point
            ) {

                console.error(
                    "Mercado Pago no devolvió init_point:",
                    data
                );

                throw new Error(
                    "Mercado Pago no devolvió el checkout."
                );

            }


            // =========================================
            // GUARDAR CARRITO TEMPORALMENTE
            // =========================================

            localStorage.setItem(
                "carritoAntesDelPago",
                JSON.stringify(carrito)
            );


            // =========================================
            // IR A MERCADO PAGO
            // =========================================

            console.log(
                "Redirigiendo a Mercado Pago:",
                data.init_point
            );


            window.location.href =
                data.init_point;


        } catch (error) {

            console.error(
                "Error iniciando checkout:",
                error
            );


            alert(
                error.message ||
                "No pudimos iniciar el pago. " +
                "Por favor intentá nuevamente."
            );


            confirmarPedido.disabled =
                false;


            confirmarPedido.textContent =
                "Continuar con el pago";

        }

    }
);


           
// =========================================
// INICIAR CARRITO
// =========================================

renderizarCarrito();
// =========================================
// CARGAR PRODUCTOS DESDE SUPABASE
// =========================================

cargarProductosDesdeSupabase();

// -----------------------------
// MENÚ ACTIVO
// -----------------------------

const secciones=document.querySelectorAll("section");
const links=document.querySelectorAll("nav a");

window.addEventListener("scroll",()=>{

let actual="";

secciones.forEach((seccion)=>{

const top=window.scrollY;

const offset=seccion.offsetTop-150;

const altura=seccion.offsetHeight;

if(top>=offset && top<offset+altura){

actual=seccion.getAttribute("id");

}

});

links.forEach((link)=>{

link.classList.remove("activo");

if(link.getAttribute("href")=="#"+actual){

link.classList.add("activo");

}

});

});


// -----------------------------
// EFECTO EN BOTONES
// -----------------------------

const botones=document.querySelectorAll("a");

botones.forEach((boton)=>{

boton.addEventListener("mouseenter",()=>{

boton.style.transition=".3s";
boton.style.transform="scale(1.05)";

});

boton.addEventListener("mouseleave",()=>{

boton.style.transform="scale(1)";

});
    
});


// -----------------------------
// BUSCADOR DE PRODUCTOS
// -----------------------------

const buscador = document.getElementById("buscador");

if(buscador){

let temporizadorBusqueda;

buscador.addEventListener("input", () => {

    clearTimeout(temporizadorBusqueda);

    temporizadorBusqueda = setTimeout(() => {

    const texto = buscador.value.toLowerCase();

    const resultado = productos.filter(producto => {

    const nombre =
        (producto.nombre || "").toLowerCase();

    const descripcion =
        (producto.descripcion || "").toLowerCase();

    const categoria =
        (producto.categoria || "").toLowerCase();

    const subcategoria =
        (producto.subcategoria || "").toLowerCase();

    const subcategoria3 =
        (producto.subcategoria3 || "").toLowerCase();

    return (
        nombre.includes(texto) ||
        descripcion.includes(texto) ||
        categoria.includes(texto) ||
        subcategoria.includes(texto) ||
        subcategoria3.includes(texto)
    );

});

    renderizarProductos(resultado);
    }, 300);    

});

}
// -----------------------------
// FILTROS DINAMICOS
// -----------------------------

// =========================================
// FILTROS DE PRODUCTOS
// =========================================

// Normaliza textos para evitar problemas con:
// mayúsculas, minúsculas, acentos y espacios.
function normalizarFiltro(texto) {

    return String(texto || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
}


// =========================================
// ELEMENTOS DE LOS FILTROS
// =========================================

const botonesCategoria =
    document.querySelectorAll(".filtro");

const btnToggleCategorias =
    document.getElementById("btn-toggle-categorias");

const filtrosCategorias =
    document.getElementById("filtros-categorias");

const contenedorSubfiltros =
    document.getElementById("subfiltros");

const contenedorSubfiltros3 =
    document.getElementById("subfiltros3");


// =========================================
// ABRIR / CERRAR CATEGORÍAS
// =========================================

if (btnToggleCategorias && filtrosCategorias) {

    btnToggleCategorias.addEventListener("click", function () {

        filtrosCategorias.classList.toggle("abierto");

    });

}


// =========================================
// MOSTRAR SUBCATEGORÍAS
// =========================================

function mostrarSubfiltros(categoria) {

    contenedorSubfiltros.innerHTML = "";
    contenedorSubfiltros3.innerHTML = "";

    const categoriaNormalizada =
        normalizarFiltro(categoria);


    // Productos pertenecientes a la categoría
    const productosCategoria =
        productos.filter(producto => {

            return normalizarFiltro(producto.categoria)
                === categoriaNormalizada;

        });


    // Obtener subcategorías reales desde Supabase
    const subcategoriasDisponibles = [];

    productosCategoria.forEach(producto => {

        const sub =
            String(producto.subcategoria || "").trim();

        if (!sub) return;

        const yaExiste =
            subcategoriasDisponibles.some(item =>
                normalizarFiltro(item) ===
                normalizarFiltro(sub)
            );

        if (!yaExiste) {

            subcategoriasDisponibles.push(sub);

        }

    });


    // Si no hay subcategorías,
    // no mostramos nada.
    if (subcategoriasDisponibles.length === 0) {

        return;

    }


    // Botón TODOS
    contenedorSubfiltros.innerHTML += `
        <button
            class="subfiltro activo"
            data-subcategoria="Todos">
            Todos
        </button>
    `;


    // Subcategorías encontradas
    subcategoriasDisponibles.forEach(subcategoria => {

        contenedorSubfiltros.innerHTML += `
            <button
                class="subfiltro"
                data-subcategoria="${subcategoria}">
                ${subcategoria}
            </button>
        `;

    });


    activarSubfiltros();

}


// =========================================
// ACTIVAR SUBFILTROS
// =========================================

function activarSubfiltros() {

    const botonesSub =
        document.querySelectorAll(".subfiltro");


    botonesSub.forEach(boton => {

        boton.addEventListener("click", function () {

            // Quitar activo de todos
            botonesSub.forEach(btn => {

                btn.classList.remove("activo");

            });


            // Activar botón seleccionado
            boton.classList.add("activo");


            const sub =
                boton.dataset.subcategoria;


            // Categoría principal seleccionada
            const botonCategoria =
                document.querySelector(".filtro.activo");


            if (!botonCategoria) return;


            const categoria =
                botonCategoria.dataset.categoria;


            // Limpiar tercer nivel
            contenedorSubfiltros3.innerHTML = "";


            // =====================================
            // SUBCATEGORÍA: TODOS
            // =====================================

            if (sub === "Todos") {

                const resultado =
                    productos.filter(producto => {

                        return normalizarFiltro(
                            producto.categoria
                        ) === normalizarFiltro(
                            categoria
                        );

                    });


                renderizarProductos(resultado);

                return;

            }


            // =====================================
            // FILTRAR POR CATEGORÍA + SUBCATEGORÍA
            // =====================================

            const resultado =
                productos.filter(producto => {

                    return (
                        normalizarFiltro(
                            producto.categoria
                        ) === normalizarFiltro(
                            categoria
                        )

                        &&

                        normalizarFiltro(
                            producto.subcategoria
                        ) === normalizarFiltro(
                            sub
                        )
                    );

                });


            renderizarProductos(resultado);


            // =====================================
            // BUSCAR SUBCATEGORÍAS NIVEL 3
            // =====================================

            mostrarSubfiltros3(
                categoria,
                sub
            );

        });

    });

}


// =========================================
// MOSTRAR SUBCATEGORÍAS NIVEL 3
// =========================================

function mostrarSubfiltros3(
    categoria,
    subcategoria
) {

    contenedorSubfiltros3.innerHTML = "";


    const categoriaNormalizada =
        normalizarFiltro(categoria);

    const subcategoriaNormalizada =
        normalizarFiltro(subcategoria);


    // Buscar productos que pertenezcan
    // a la categoría y subcategoría seleccionadas.
    const productosSubcategoria =
        productos.filter(producto => {

            return (

                normalizarFiltro(
                    producto.categoria
                ) === categoriaNormalizada

                &&

                normalizarFiltro(
                    producto.subcategoria
                ) === subcategoriaNormalizada

            );

        });


    // Obtener valores reales de subcategoria3
    const niveles3 = [];


    productosSubcategoria.forEach(producto => {

        const nivel3 =
            String(
                producto.subcategoria3 || ""
            ).trim();


        if (!nivel3) return;


        const yaExiste =
            niveles3.some(item =>

                normalizarFiltro(item) ===
                normalizarFiltro(nivel3)

            );


        if (!yaExiste) {

            niveles3.push(nivel3);

        }

    });


    // Si no existen niveles 3,
    // no mostramos nada.
    if (niveles3.length === 0) {

        return;

    }


    // Botón TODOS
    contenedorSubfiltros3.innerHTML += `
        <button
            class="subfiltro3 activo"
            data-subcategoria3="Todos">
            Todos
        </button>
    `;


    // Crear botones automáticamente
    niveles3.forEach(nivel3 => {

        contenedorSubfiltros3.innerHTML += `
            <button
                class="subfiltro3"
                data-subcategoria3="${nivel3}">
                ${nivel3}
            </button>
        `;

    });


    activarSubfiltros3();

}


// =========================================
// ACTIVAR SUBFILTROS NIVEL 3
// =========================================

function activarSubfiltros3() {

    const botones3 =
        document.querySelectorAll(".subfiltro3");


    botones3.forEach(boton => {

        boton.addEventListener("click", function () {

            // Quitar activo
            botones3.forEach(btn => {

                btn.classList.remove("activo");

            });


            // Activar seleccionado
            boton.classList.add("activo");


            const sub3 =
                boton.dataset.subcategoria3;


            // Categoría principal
            const botonCategoria =
                document.querySelector(".filtro.activo");


            if (!botonCategoria) return;


            const categoria =
                botonCategoria.dataset.categoria;


            // Subcategoría principal
            const botonPadre =
                document.querySelector(".subfiltro.activo");


            if (!botonPadre) return;


            const subcategoria =
                botonPadre.dataset.subcategoria;


            // =====================================
            // NIVEL 3: TODOS
            // =====================================

            if (sub3 === "Todos") {

                const resultado =
                    productos.filter(producto => {

                        return (

                            normalizarFiltro(
                                producto.categoria
                            ) === normalizarFiltro(
                                categoria
                            )

                            &&

                            normalizarFiltro(
                                producto.subcategoria
                            ) === normalizarFiltro(
                                subcategoria
                            )

                        );

                    });


                renderizarProductos(resultado);

                return;

            }


            // =====================================
            // NIVEL 3 ESPECÍFICO
            // =====================================

            const resultado =
                productos.filter(producto => {

                    return (

                        normalizarFiltro(
                            producto.categoria
                        ) === normalizarFiltro(
                            categoria
                        )

                        &&

                        normalizarFiltro(
                            producto.subcategoria
                        ) === normalizarFiltro(
                            subcategoria
                        )

                        &&

                        normalizarFiltro(
                            producto.subcategoria3
                        ) === normalizarFiltro(
                            sub3
                        )

                    );

                });


            renderizarProductos(resultado);

        });

    });

}


// =========================================
// CLIC EN CATEGORÍA PRINCIPAL
// =========================================

botonesCategoria.forEach(boton => {

    boton.addEventListener("click", function () {


        // Quitar activo de todas
        botonesCategoria.forEach(btn => {

            btn.classList.remove("activo");

        });


        // Activar categoría seleccionada
        boton.classList.add("activo");


        const categoria =
            boton.dataset.categoria;


        // Limpiar subfiltros anteriores
        contenedorSubfiltros.innerHTML = "";
        contenedorSubfiltros3.innerHTML = "";


        // =====================================
        // CATEGORÍA: TODOS
        // =====================================

        if (
            normalizarFiltro(categoria)
            === "todos"
        ) {

            renderizarProductos(productos);

        }


        // =====================================
        // CATEGORÍA ESPECÍFICA
        // =====================================

        else {

            mostrarSubfiltros(categoria);


            const resultado =
                productos.filter(producto => {

                    return normalizarFiltro(
                        producto.categoria
                    ) === normalizarFiltro(
                        categoria
                    );

                });


            renderizarProductos(resultado);

        }


        // =====================================
        // ACTUALIZAR BOTÓN SUPERIOR
        // =====================================

        if (btnToggleCategorias) {

            btnToggleCategorias.textContent =
                "📂 Categoría: " + categoria;

        }


        // Cerrar menú
        if (filtrosCategorias) {

            filtrosCategorias.classList.remove(
                "abierto"
            );

        }

    });

});
// =========================================
// MODAL - VER DETALLE DEL PRODUCTO
// =========================================

const modal = document.getElementById("modal-producto");

const detalle = document.getElementById("detalle-producto");

const cerrar = document.querySelector(".cerrar-modal");


// =========================================
// ABRIR DETALLE
// =========================================

document.addEventListener("click", function(e) {

    if (!e.target.classList.contains("btn-detalle")) {
        return;
    }

    const id = e.target.dataset.id;

    const producto = productos.find(
        p => p.id == id
    );

    if (!producto) {
        console.error(
            "No se encontró el producto:",
            id
        );
        return;
    }


    // =========================================
    // CONSTRUIR DETALLE
    // =========================================

    detalle.innerHTML = `

        <div class="detalle-layout">

            <!-- =================================
                 GALERÍA DE IMÁGENES
                 ================================= -->

            <div class="galeria-detalle">

                <div class="imagen-principal-contenedor">

                    <img
                        id="imagen-detalle"
                        class="imagen-principal-detalle"
                        src="${producto.imagen}"
                        alt="${producto.nombre}">

                </div>


                <div class="miniaturas">

                    <img
    class="miniatura-activa"
    src="${producto.imagen}"
    onclick="cambiarImagen('${producto.imagen}', this)"
    alt="${producto.nombre}">

${
    producto.imagen2
    ? `
        <img
            src="${producto.imagen2}"
            onclick="cambiarImagen('${producto.imagen2}', this)"
            alt="${producto.nombre}">
      `
    : ""
}

                </div>

            </div>


            <!-- =================================
                 INFORMACIÓN DEL PRODUCTO
                 ================================= -->

            <div class="informacion-detalle">

                <h2>
                    ${producto.nombre}
                </h2>


                <div class="descripcion-detalle">

                    <p>
                        ${producto.descripcion}
                    </p>

                </div>


                <!-- =================================
                     PRECIOS
                     ================================= -->

                <div class="precios-detalle">

                    ${bloqueDoblePrecio(producto)}

                </div>


                <!-- =================================
                     CÓDIGO
                     ================================= -->

                <p class="codigo-detalle">

                    🔢 Código del producto:
                    <strong>${producto.codigo}</strong>

                </p>


                <!-- =================================
                     BOTÓN
                     ================================= -->

                <button
                    class="btn-comprar btn-comprar-detalle"
                    data-id="${producto.id}">

                    Agregar al carrito

                </button>

            </div>

        </div>

    `;


    // =========================================
    // MOSTRAR MODAL
    // =========================================

    modal.style.display = "block";


    // Evitar scroll del fondo
    document.body.classList.add("modal-abierto");

});


// =========================================
// CERRAR MODAL
// =========================================

cerrar.onclick = function() {

    modal.style.display = "none";

    document.body.classList.remove(
        "modal-abierto"
    );

};


// =========================================
// CERRAR HACIENDO CLICK AFUERA
// =========================================

window.addEventListener("click", function(e) {

    if (e.target === modal) {

        modal.style.display = "none";

        document.body.classList.remove(
            "modal-abierto"
        );

    }

});


// =========================================
// CAMBIAR IMAGEN
// =========================================

function cambiarImagen(imagen, miniatura) {

    const imagenPrincipal =
        document.getElementById(
            "imagen-detalle"
        );

    if (!imagenPrincipal) return;


    imagenPrincipal.src = imagen;


    // Quitar selección anterior

    document
        .querySelectorAll(
            ".miniaturas img"
        )
        .forEach(img => {

            img.classList.remove(
                "miniatura-activa"
            );

        });


    // Marcar la seleccionada

    if (miniatura) {

        miniatura.classList.add(
            "miniatura-activa"
        );

    }

}
// =========================================
// CARRUSEL DE BANNERS
// =========================================

const banners = [
    "img/banner1.jpg",
    "img/banner2.jpg",
    "img/banner3.jpg",
    "img/banner4.jpg"
];

const carruselSlides =
    document.getElementById("carrusel-slides");

const carruselIndicadores =
    document.getElementById("carrusel-indicadores");

const botonAnterior =
    document.getElementById("carrusel-anterior");

const botonSiguiente =
    document.getElementById("carrusel-siguiente");

let bannerActual = 0;


// =========================================
// CREAR BANNERS
// =========================================

banners.forEach((banner, indice) => {

    carruselSlides.innerHTML += `

        <div class="carrusel-slide">

            <img
                src="${banner}"
                alt="Banner Natura ${indice + 1}">

        </div>

    `;

});


// =========================================
// CREAR INDICADORES
// =========================================

banners.forEach((banner, indice) => {

    carruselIndicadores.innerHTML += `

        <button
            class="carrusel-indicador ${
                indice === 0 ? "activo" : ""
            }"
            data-slide="${indice}">
        </button>

    `;

});


// =========================================
// MOSTRAR BANNER
// =========================================

function mostrarBanner(indice) {

    bannerActual = indice;

    carruselSlides.style.transform =
        `translateX(-${bannerActual * 100}%)`;


    const indicadores =
        document.querySelectorAll(
            ".carrusel-indicador"
        );


    indicadores.forEach(indicador => {

        indicador.classList.remove("activo");

    });


    if (indicadores[bannerActual]) {

        indicadores[bannerActual]
            .classList.add("activo");

    }

}


// =========================================
// SIGUIENTE
// =========================================

botonSiguiente.addEventListener(
    "click",
    function() {

        bannerActual++;

        if (bannerActual >= banners.length) {

            bannerActual = 0;

        }

        mostrarBanner(bannerActual);

    }
);


// =========================================
// ANTERIOR
// =========================================

botonAnterior.addEventListener(
    "click",
    function() {

        bannerActual--;

        if (bannerActual < 0) {

            bannerActual =
                banners.length - 1;

        }

        mostrarBanner(bannerActual);

    }
);


// =========================================
// INDICADORES
// =========================================

document.addEventListener(
    "click",
    function(e) {

        if (
            !e.target.classList.contains(
                "carrusel-indicador"
            )
        ) {

            return;

        }


        const indice =
            Number(
                e.target.dataset.slide
            );


        mostrarBanner(indice);

    }
);


// =========================================
// CAMBIO AUTOMÁTICO
// =========================================

setInterval(function() {

    bannerActual++;

    if (bannerActual >= banners.length) {

        bannerActual = 0;

    }

    mostrarBanner(bannerActual);

}, 5000);


// =========================================
// RESULTADO DEL PAGO (vuelta desde Mercado Pago)
// =========================================

function mostrarResultadoPago() {

    const params = new URLSearchParams(window.location.search);
    const pago = params.get("pago");

    if (!pago) {
        return;
    }

    const overlay = document.getElementById("resultado-pago-overlay");
    const caja = document.getElementById("resultado-pago");
    const icono = document.getElementById("resultado-pago-icono");
    const titulo = document.getElementById("resultado-pago-titulo");
    const mensaje = document.getElementById("resultado-pago-mensaje");
    const boton = document.getElementById("resultado-pago-boton");
    const cerrar = document.getElementById("cerrar-resultado-pago");

    if (!overlay || !caja || !titulo || !mensaje) {
        return;
    }

    caja.classList.remove("exito", "rechazado", "pendiente");

    if (pago === "exitoso") {

        caja.classList.add("exito");
        icono.textContent = "✅";
        titulo.textContent = "¡Gracias por tu compra!";
        mensaje.textContent =
            "Tu pago fue aprobado y ya registramos tu pedido. " +
            "En breve nos comunicamos por WhatsApp para coordinar la entrega.";

        // Se creó el pedido correctamente: vaciamos el carrito
        carrito = [];
        guardarCarrito();
        renderizarCarrito();
        localStorage.removeItem("carritoAntesDelPago");

    } else if (pago === "pendiente") {

        caja.classList.add("pendiente");
        icono.textContent = "⏳";
        titulo.textContent = "Tu pago está pendiente";
        mensaje.textContent =
            "Registramos tu pedido y estamos esperando la confirmación " +
            "de Mercado Pago. Esto puede tardar unos minutos u horas " +
            "según el medio de pago que hayas elegido. Te avisamos por " +
            "WhatsApp apenas se confirme.";

        // El pedido ya quedó registrado: vaciamos el carrito
        carrito = [];
        guardarCarrito();
        renderizarCarrito();
        localStorage.removeItem("carritoAntesDelPago");

    } else if (pago === "fallido") {

        caja.classList.add("rechazado");
        icono.textContent = "❌";
        titulo.textContent = "No pudimos procesar tu pago";
        mensaje.textContent =
            "El pago fue rechazado o cancelado. Tus productos siguen " +
            "en el carrito, podés intentar de nuevo con otro medio de " +
            "pago o escribirnos por WhatsApp si preferís coordinar así.";

        // El pago no se concretó: restauramos el carrito previo al pago
        const carritoPrevio = localStorage.getItem("carritoAntesDelPago");

        if (carritoPrevio) {
            carrito = JSON.parse(carritoPrevio);
            guardarCarrito();
            renderizarCarrito();
        }

    } else {
        return;
    }

    overlay.classList.add("activo");

    function cerrarModalResultado() {
        overlay.classList.remove("activo");
    }

    if (boton) {
        boton.onclick = cerrarModalResultado;
    }

    if (cerrar) {
        cerrar.onclick = cerrarModalResultado;
    }

    // Limpiamos el parámetro de la URL para que no vuelva a
    // dispararse el modal si el cliente recarga la página
    const urlLimpia = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, urlLimpia);

}

mostrarResultadoPago();
// =========================================
// SUSCRIPCIÓN A PROMOCIONES
// =========================================

async function suscribir(datos, origen) {

    try {

        const { error } = await supabaseClient
            .from("suscriptores")
            .insert({
                nombre: datos.nombre,
                email: datos.email,
                whatsapp: datos.whatsapp,
                ciudad: datos.ciudad,
                origen: origen
            });

        if (error) {

            if (error.code === "23505") {
                return { ok: false, mensaje: "Ese email ya está suscripto. ¡Gracias por tu interés! 💚" };
            }

            console.error("Error al suscribir:", error);
            return { ok: false, mensaje: "No pudimos guardar tu suscripción. Intentá de nuevo." };

        }

        return { ok: true, mensaje: "¡Listo! Ya estás suscripto 🎉" };

    } catch (err) {

        console.error("Error inesperado al suscribir:", err);
        return { ok: false, mensaje: "No pudimos guardar tu suscripción. Intentá de nuevo." };

    }

}


// --- Formulario fijo (sección) ---

const formularioSuscripcion = document.getElementById("formulario-suscripcion");
const mensajeSuscripcion = document.getElementById("suscripcion-mensaje");

if (formularioSuscripcion) {

    formularioSuscripcion.addEventListener("submit", async function(e) {

        e.preventDefault();

        const boton = document.getElementById("suscripcion-boton");
        boton.disabled = true;
        boton.textContent = "Enviando...";

        const resultado = await suscribir({
            nombre: document.getElementById("suscripcion-nombre").value,
            email: document.getElementById("suscripcion-email").value,
            whatsapp: document.getElementById("suscripcion-whatsapp").value,
            ciudad: document.getElementById("suscripcion-ciudad").value
        }, "seccion");

        mensajeSuscripcion.textContent = resultado.mensaje;

        if (resultado.ok) {
            formularioSuscripcion.reset();
        }

        boton.disabled = false;
        boton.textContent = "Quiero recibir promos";

    });

}


// --- Popup automático ---

const popupSuscripcionOverlay = document.getElementById("popup-suscripcion-overlay");
const cerrarPopupSuscripcion = document.getElementById("cerrar-popup-suscripcion");
const formularioPopupSuscripcion = document.getElementById("formulario-popup-suscripcion");
const mensajePopupSuscripcion = document.getElementById("popup-suscripcion-mensaje");

function mostrarPopupSuscripcion() {

    if (localStorage.getItem("popupSuscripcionVisto")) return;
    if (!popupSuscripcionOverlay) return;

    popupSuscripcionOverlay.classList.add("activo");
    localStorage.setItem("popupSuscripcionVisto", "true");

}

setTimeout(mostrarPopupSuscripcion, 8000);

if (cerrarPopupSuscripcion) {

    cerrarPopupSuscripcion.addEventListener("click", function() {
        popupSuscripcionOverlay.classList.remove("activo");
    });

}

if (formularioPopupSuscripcion) {

    formularioPopupSuscripcion.addEventListener("submit", async function(e) {

        e.preventDefault();

        const boton = document.getElementById("popup-suscripcion-boton");
        boton.disabled = true;
        boton.textContent = "Enviando...";

        const resultado = await suscribir({
            nombre: document.getElementById("popup-nombre").value,
            email: document.getElementById("popup-email").value,
            whatsapp: document.getElementById("popup-whatsapp").value,
            ciudad: document.getElementById("popup-ciudad").value
        }, "popup");

        mensajePopupSuscripcion.textContent = resultado.mensaje;

        if (resultado.ok) {
            formularioPopupSuscripcion.reset();
            setTimeout(() => popupSuscripcionOverlay.classList.remove("activo"), 1800);
        }

        boton.disabled = false;
        boton.textContent = "Quiero recibir promos";

    });

}
