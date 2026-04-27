window.addEventListener("scroll", reveal);

function reveal(){

let reveals = document.querySelectorAll(".reveal");

for(let i=0;i<reveals.length;i++){

let windowHeight = window.innerHeight;
let top = reveals[i].getBoundingClientRect().top;
let point = 100;

if(top < windowHeight - point){
reveals[i].classList.add("active");
}

}
}

reveal();