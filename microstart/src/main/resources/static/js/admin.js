function addFunding(){

let name=document.getElementById("fundName").value;
let amount=document.getElementById("fundAmount").value;

if(name==="" || amount===""){
document.getElementById("adminMsg").innerHTML=
"<div class='error-box'>Fill all fields</div>";
return;
}

document.getElementById("adminMsg").innerHTML=
"<div class='success-box'>Funding Program Added Successfully</div>";

document.getElementById("fundName").value="";
document.getElementById("fundAmount").value="";
}