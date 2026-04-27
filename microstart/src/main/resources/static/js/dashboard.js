function toggleNotifications(){
document.getElementById("notifyPanel").classList.toggle("show");
}

window.onclick = function(e){
if(!e.target.closest(".header-actions")){
document.getElementById("notifyPanel").classList.remove("show");
}
}

function showToast(msg){
const toast = document.getElementById("toast");
toast.innerHTML = msg;
toast.classList.add("show");

setTimeout(()=>{
toast.classList.remove("show");
},3000);
}

window.onload = function(){
showToast("Welcome back to MicroStart");
}