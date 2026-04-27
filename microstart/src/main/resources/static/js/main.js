function toggleMenu(){
document.querySelector(".menu").classList.toggle("show");
}

function reveal(){
document.querySelectorAll(".reveal").forEach(el=>{
const top = el.getBoundingClientRect().top;
if(top < window.innerHeight - 100){
el.classList.add("active");
}
});
}

window.addEventListener("scroll",reveal);
window.addEventListener("load",reveal);