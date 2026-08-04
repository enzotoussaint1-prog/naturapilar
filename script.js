console.log("script.js cargado");
console.log(productos);
const contenedorProductos = document.getElementById("contenedor-productos");

function renderizarProductos(lista) {

    contenedorProductos.innerHTML = "";

    lista.forEach(producto => {

        contenedorProductos.innerHTML += `
            <article class="producto">

                <img src="${producto.imagen}"
                     alt="${producto.nombre}">

                <h3>${producto.nombre}</h3>

                <p>${producto.descripcion}</p>

                <span>$${producto.precio.toLocaleString("es-AR")}</span>

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

    const mensaje = `Hola 😊
Me interesa comprar:

${producto}

¿Podrías pasarme más información?`;

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

buscador.addEventListener("input", () => {

    const texto = buscador.value.toLowerCase();

    const resultado = productos.filter(producto =>

        producto.nombre.toLowerCase().includes(texto) ||
        producto.descripcion.toLowerCase().includes(texto) ||
        producto.categoria.toLowerCase().includes(texto)

    );

    renderizarProductos(resultado);

});
// -----------------------------
// FILTROS DINAMICOS
// -----------------------------

const botonesCategoria = document.querySelectorAll(".filtro");

const contenedorSubfiltros = document.getElementById("subfiltros");


const subcategorias = {

    Perfumes:[
        "Todos",
        "Kaiak",
        "Humor",
        "Luna",
        "Essencial",
        "Homem"
    ],

    Tododia:[
        "Todos",
        "Cremas",
        "Jabones",
        "Desodorantes",
        "Hidratantes"
    ],

    Maquillaje:[
        "Todos"
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


if(sub==="Todos"){

renderizarProductos(productos);

}else{


const resultado = productos.filter(producto=>

producto.subcategoria === sub

);


renderizarProductos(resultado);


}


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
