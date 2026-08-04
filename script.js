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

document.querySelectorAll(".producto a").forEach((boton)=>{

boton.addEventListener("click",function(e){

e.preventDefault();

const producto = this.parentElement.querySelector("h3").innerText;

const mensaje =
"Hola 😊 Me interesa comprar el producto: " +
producto +
". ¿Podrías pasarme más información?";

const telefono = "5491150241149";

window.open(
"https://wa.me/"+telefono+"?text="+encodeURIComponent(mensaje),
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
