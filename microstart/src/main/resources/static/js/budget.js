window.onload = function() {
    const token = localStorage.getItem("token");
    if(!token){
        window.location.href="login.html";
        return;
    }
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || payload.authorities;
        
        if(role && role.includes("ROLE_ADMIN")) {
            const adminLinks = document.querySelectorAll('a[href="admin.html"]');
            adminLinks.forEach(link => link.style.display = "block");
        } else {
            const adminLinks = document.querySelectorAll('a[href="admin.html"]');
            adminLinks.forEach(link => link.style.display = "none");
        }
    } catch(e) {
        window.location.href="login.html";
        return;
    }

    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href="login.html";
        };
    });
};

function calcBudget(){

let income=parseFloat(document.getElementById("income").value)||0;
let expense=parseFloat(document.getElementById("expense").value)||0;

let save=income-expense;

document.getElementById("resultBox").innerHTML=`
<div class="stat-card" style="margin-top:20px;">
<span>Estimated Savings</span>
<h2>₹${save}</h2>
<small class="${save>=0?'green':'red'}">
${save>=0?'Good Financial Health':'Overspending Alert'}
</small>
</div>
`;
}