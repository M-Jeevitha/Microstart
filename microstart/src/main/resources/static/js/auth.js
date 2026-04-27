const BASE_URL = "http://localhost:8081";

function showMsg(text,type="error"){
const box = document.getElementById("msg");
if(!box) return;
box.className = "msg " + type;
box.innerHTML = text;
}

function togglePassword(id,btn){
const input = document.getElementById(id);

if(input.type === "password"){
input.type = "text";
btn.innerHTML = "🙈";
}else{
input.type = "password";
btn.innerHTML = "👁";
}
}

async function register(){

const fullName = document.getElementById("name").value.trim();
const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();

if(fullName.length < 3){
showMsg("Enter valid full name");
return;
}

if(password.length < 4){
showMsg("Password must be at least 4 characters");
return;
}

try{

const res = await fetch(BASE_URL + "/api/auth/register",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
fullName:fullName,
email:email,
password:password
})
});

const result = await res.json();

if(res.ok){
showMsg("Registration successful! Redirecting...","success");
setTimeout(()=>{
window.location.href="login.html";
},1200);
}else{
showMsg(result.error || result.message || "Registration failed");
}

}catch(e){
showMsg("Unable to connect to server");
}

}

async function login(){

const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();

if(!email || !password){
showMsg("Enter email and password");
return;
}

try{

const res = await fetch(BASE_URL + "/api/auth/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email:email,
password:password
})
});

const result = await res.json();

if(res.ok && result.token){

localStorage.setItem("token",result.token);

showMsg("Login successful!","success");

setTimeout(()=>{
window.location.href="dashboard.html";
},900);

}else{
showMsg(result.error || "Invalid credentials");
}

}catch(e){
showMsg("Unable to connect to server");
}

}