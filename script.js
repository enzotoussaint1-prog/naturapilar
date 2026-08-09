const contenedorProductos = document.getElementById("contenedor-productos");

function renderizarProductos(lista) {

    contenedorProductos.innerHTML = "";

    lista.forEach(producto => {

        contenedorProductos.innerHTML += `
            <article class="producto">

${producto.oferta ?

`<div class="etiqueta-oferta">

🔥 OFERTA

</div>`

: ""}

       <img
    src="${producto.imagen}"
    alt="${producto.nombre}"
    onmouseover="this.src='${producto.imagen2 || producto.imagen}'"
    onmouseout="this.src='${producto.imagen}'">
     
                <h3>${producto.nombre}</h3>

                <p>${producto.descripcion}</p>

              <div class="precios">

${producto.oferta && producto.precioAnterior ? `

<span class="precio-anterior">

$${producto.precioAnterior.toLocaleString("es-AR")}

</span>

<div class="descuento">

-${Math.round(
100 - (producto.precio * 100 / producto.precioAnterior)
)}% OFF

</div>

` : ""}

<span class="precio-actual">

$${producto.precio.toLocaleString("es-AR")}

</span>

</div>

<button 
class="btn-detalle"
data-id="${producto.id}">
Ver detalle
</button>

<a href="#"
class="btn-comprar"
data-producto="${producto.nombre}">
 Comprar
</a>

            </article>
        `;

    });

}
renderizarProductos(productos);
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
        ${producto.oferta ?

`
<div class="etiqueta-oferta">
🔥 OFERTA
</div>
`

: ""}

            <img src="${producto.imagen}" alt="${producto.nombre}">

            <h3>${producto.nombre}</h3>

           <p>${producto.descripcion}</p>

<div class="precios">

${producto.precioAnterior ? `

<span class="precio-anterior">

$${producto.precioAnterior.toLocaleString("es-AR")}

</span>

<div class="descuento">

-${Math.round(
100 - (producto.precio * 100 / producto.precioAnterior)
)}% OFF

</div>

` : ""}

<span class="precio-actual">

$${producto.precio.toLocaleString("es-AR")}

</span>

</div>

<a href="#"
               class="btn-comprar"
               data-producto="${producto.nombre}">

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

const tarjetasProducto = document.querySelectorAll(".producto");

const observador = new IntersectionObserver((entradas)=>{

entradas.forEach((entrada)=>{

if(entrada.isIntersecting){

entrada.target.style.opacity="1";
entrada.target.style.transform="translateY(0px)";

}

});

},{
threshold:0.2
});

tarjetasProducto.forEach((producto)=>{
producto.style.opacity="0";
producto.style.transform="translateY(40px)";
producto.style.transition=".6s";

observador.observe(producto);

});


// =========================================
// CARRITO DE COMPRAS
// =========================================

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
// AGREGAR PRODUCTO
// =========================================

function agregarAlCarrito(id) {

    const producto =
        productos.find(p => p.id == id);

    if (!producto) return;


    const productoExistente =
        carrito.find(item => item.id == producto.id);


    if (productoExistente) {

        productoExistente.cantidad++;

    } else {

        carrito.push({

            id: producto.id,

            nombre: producto.nombre,

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

                        <button
                            class="btn-cantidad"
                            data-accion="sumar"
                            data-id="${item.id}">
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


    item.cantidad += cambio;


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

    const boton =
        e.target.closest(".btn-comprar");

    if (!boton) return;

    e.preventDefault();


    const idProducto = boton.dataset.id;

const nombreProducto = boton.dataset.producto;

let producto;

if (idProducto) {

    producto = productos.find(
        p => p.id == idProducto
    );

} else {

    producto = productos.find(
        p => p.nombre === nombreProducto
    );

}


    if (!producto) {

        console.error(
            "No se encontró el producto:",
            nombreProducto
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
            return;
        }


        alert(
            "Siguiente paso: completar los datos de compra."
        );

    }
);


// =========================================
// INICIAR CARRITO
// =========================================

renderizarCarrito();



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

buscador.addEventListener("input", () => {

    const texto = buscador.value.toLowerCase();

    const resultado = productos.filter(producto =>

        producto.nombre.toLowerCase().includes(texto) ||
        producto.descripcion.toLowerCase().includes(texto) ||
        producto.categoria.toLowerCase().includes(texto)

    );

    renderizarProductos(resultado);

});

}
// -----------------------------
// FILTROS DINAMICOS
// -----------------------------

const botonesCategoria = document.querySelectorAll(".filtro");

const contenedorSubfiltros = document.getElementById("subfiltros");

const contenedorSubfiltros3 =
document.getElementById("subfiltros3");

const subcategorias = {

    Perfumes:[
        "Todos",
        "Kaiak",
        "Humor",
        "Luna",
        "Essencial",
        "Homen",
        "Ilia",
        "Kriska",
        "Biografia",
        "Deos corporales",
        "Frescor Ekos"
    ],

    Tododia:[
        "Todos",
        "Jabones",
        "Jabones liquidos",
        "Desodorantes",
        "Hidratantes",
        "Mascara concentrada",
        "Trio",
        "BodySplash",
        "Cabello",
        "Varios"
    ],
    
     Infantiles:[
        "Todos",
        "Perfume",
        "Shampoo",
        "Acondicionador"
    ],
    
    Maquillaje:[
        "Todos"
    ],
    
    "Cuidado linea perfumes":[]

};

const subcategorias3 = {

    Hidratantes:[
        "Todos",
        "400 ml",
        "Rep.400ml",
        "200 ml",
        "100 ml",
        "50 ml"
    ],
    Desodorantes:[
        "Todos",
        "Linea tododia",
        "Linea perfumes"
    ],

    Kaiak:[
        "Todos",
        "Masculino",
        "Femenino"
    ],
    
     Essencial:[
        "Todos",
        "Masculino",
        "Femenino"
    ],
    Biografia:[
        "Todos",
        "Masculino",
        "Femenino"
    ],
    "Deos corporales":[
        "Todos",
        "Masculino",
        "Femenino"
    ],
     Luna:[
        "Todos",
        "75ml",
        "50ml"
    ],
    Humor:[
        "Todos",
        "Masculino",
        "Femenino",
        "Unisex",
        "Mini 25ml"
    ]

};


function mostrarSubfiltros(categoria){

    contenedorSubfiltros.innerHTML = "";
    contenedorSubfiltros3.innerHTML = "";

    if(!subcategorias[categoria]){
        return;
    }

    subcategorias[categoria].forEach(sub => {

        contenedorSubfiltros.innerHTML += `
            <button 
                class="subfiltro ${sub === "Todos" ? "activo" : ""}"
                data-subcategoria="${sub}">
                ${sub}
            </button>
        `;
    });

    activarSubfiltros();
}




function activarSubfiltros(){


const botonesSub = document.querySelectorAll(".subfiltro");


botonesSub.forEach(boton=>{


boton.addEventListener("click",()=>{


botonesSub.forEach(btn=>
btn.classList.remove("activo")
);


boton.classList.add("activo");


const sub = boton.dataset.subcategoria;


// limpiar tercer nivel
contenedorSubfiltros3.innerHTML="";


// crear tercer nivel si existe

if(subcategorias3[sub]){


subcategorias3[sub].forEach(nivel3=>{


contenedorSubfiltros3.innerHTML += `

<button 
class="subfiltro3 ${nivel3==="Todos" ? "activo":""}"
data-subcategoria3="${nivel3}">

${nivel3}

</button>

`;

});


activarSubfiltros3();


}


// si no tiene tercer nivel filtra normal

else{


const resultado = productos.filter(producto=>

producto.subcategoria === sub

);


renderizarProductos(resultado);


}


});


});


}

function activarSubfiltros3(){

const botones3 = document.querySelectorAll(".subfiltro3");

botones3.forEach(boton=>{

boton.addEventListener("click",()=>{

botones3.forEach(btn=>btn.classList.remove("activo"));

boton.classList.add("activo");

const sub3 = boton.dataset.subcategoria3;

const botonPadre = document.querySelector(".subfiltro.activo");

if(!botonPadre) return;

const subPadre = botonPadre.dataset.subcategoria;

let resultado;

if(sub3==="Todos"){

resultado = productos.filter(producto=>

producto.subcategoria===subPadre

);

}else{

resultado = productos.filter(producto=>

producto.subcategoria===subPadre &&
producto.subcategoria3===sub3

);

}

renderizarProductos(resultado);

});

});

}



botonesCategoria.forEach(boton=>{


boton.addEventListener("click",()=>{


botonesCategoria.forEach(btn=>
btn.classList.remove("activo")
);


boton.classList.add("activo");


const categoria = boton.dataset.categoria;



if(categoria==="Todos"){

contenedorSubfiltros.innerHTML="";

renderizarProductos(productos);


}else{


mostrarSubfiltros(categoria);


const resultado = productos.filter(producto=>

producto.categoria === categoria

);


renderizarProductos(resultado);


}



  });

});    
const modal = document.getElementById("modal-producto");

const detalle = document.getElementById("detalle-producto");

const cerrar = document.querySelector(".cerrar-modal");


document.addEventListener("click", function(e){

if(e.target.classList.contains("btn-detalle")){


const id = e.target.dataset.id;


const producto = productos.find(p => p.id == id);



detalle.innerHTML = `

<h2>${producto.nombre}</h2>


<div class="galeria-detalle">


<img 
id="imagen-detalle"
class="imagen-principal-detalle"
src="${producto.imagen}"
alt="${producto.nombre}">


<div class="miniaturas">


<img 
src="${producto.imagen}"
onclick="cambiarImagen('${producto.imagen}')">


${producto.imagen2 ? `

<img 
src="${producto.imagen2}"
onclick="cambiarImagen('${producto.imagen2}')">

` : ""}


</div>


</div>

<p>${producto.descripcion}</p>


<div class="precios-detalle">

${producto.oferta && producto.precioAnterior ? `

<span class="precio-anterior">
$${producto.precioAnterior.toLocaleString("es-AR")}
</span>

<span class="descuento">
-${Math.round(
100 - (producto.precio * 100 / producto.precioAnterior)
)}% OFF
</span>

` : ""}


<h3>
$${producto.precio.toLocaleString("es-AR")}
</h3>


</div>


<p>
🔢 Código del producto: ${producto.codigo}
</p>


<button
    class="btn-comprar"
    data-id="${producto.id}">

    Agregar al carrito

</button>

`;


modal.style.display="block";


}

});



cerrar.onclick=function(){

modal.style.display="none";

}



window.onclick=function(e){

if(e.target==modal){

modal.style.display="none";

}

}
function cambiarImagen(imagen){

document.getElementById("imagen-detalle").src = imagen;

}
