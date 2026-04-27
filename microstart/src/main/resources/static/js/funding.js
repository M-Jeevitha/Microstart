function showToast(msg){
const toast=document.getElementById("toast");
toast.innerHTML=msg;
toast.classList.add("show");
setTimeout(()=>toast.classList.remove("show"),2500);
}

function applyFund(name){
showToast("Application started for " + name);
}