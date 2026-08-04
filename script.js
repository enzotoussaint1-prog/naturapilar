const productos = [
    {
        id: 1,
        nombre: "Kit Tododia Algodón",
        descripcion: "Crema hidratante 400 ml + Body Splash 200 ml",
        categoria: "Tododia",
        precio: 31900,
        imagen: "img/algodon.jpeg"
    },
    {
        id: 2,
        nombre: "Kit Tododia Acerola",
        descripcion: "Crema hidratante + Body Splash",
        categoria: "Tododia",
        precio: 31900,
        imagen: "img/acerola.jpeg"
    },
    {
        id: 3,
        nombre: "Pitanga Preta",
        descripcion: "Perfume Ekos 150 ml",
        categoria: "Perfumes",
        precio: 30000,
        imagen: "img/pitanga.jpeg"
    },
    {
        id: 4,
        nombre: "Kit Humor Rojo",
        descripcion: "Labial + Esmalte + Perfume",
        categoria: "Maquillaje",
        precio: 20000,
        imagen: "img/humor.png"
    }
];
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

const productos = document.querySelectorAll(".producto");

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

productos.forEach((producto)=>{

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
