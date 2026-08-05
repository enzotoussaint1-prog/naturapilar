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


// -----------------------------
// BOTÓN COMPRAR
// -----------------------------

document.addEventListener("click", (e) => {

    if (!e.target.classList.contains("btn-comprar")) return;

    e.preventDefault();

    const producto = e.target.dataset.producto;

    const productoSeleccionado = productos.find(
p => p.nombre === producto
);


const mensaje = `Hola Natura Pilar 😊

Me interesa este producto:

🛍️ ${productoSeleccionado.nombre}

💰 Precio:
$${productoSeleccionado.precio.toLocaleString("es-AR")}

📦 Stock disponible:
${productoSeleccionado.stock}

¿Podrían brindarme más información?`;

    const telefono = "5491150241149";

    window.open(
        `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
        "_blank"
    );

});



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
        "Frescor Ekos"
    ],

    Tododia:[
        "Todos",
        "Cremas",
        "Jabones",
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
    ]

};

const subcategorias3 = {

    Hidratantes:[
        "Todos",
        "400ml",
        "200ml",
        "100ml",
        "50ml"
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
     Luna:[
        "Todos",
        "75ml",
        "50ml"
    ],
    
     Humor:[
        "Todos",
        "Masculino",
        "Femenimo"
    ]

};


function mostrarSubfiltros(categoria){


    contenedorSubfiltros.innerHTML="";


    if(!subcategorias[categoria]){

        return;

    }


    subcategorias[categoria].forEach(sub =>{


        contenedorSubfiltros.innerHTML += `

        <button 
        class="subfiltro ${sub==="Todos" ? "activo":""}"
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
📦 Stock disponible: ${producto.stock}
</p>


<a 
class="btn-comprar"
href="https://wa.me/5491150241149?text=Hola%20Natura%20Pilar%20me%20interesa%20${producto.nombre}"
target="_blank">

Comprar por WhatsApp

</a>

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
