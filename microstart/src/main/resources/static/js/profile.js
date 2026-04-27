window.onload = function() {
    const token = localStorage.getItem("token");
    if(!token){
        window.location.href="login.html";
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || payload.authorities;
        
        // Show Admin link if Admin
        if(role && role.includes("ROLE_ADMIN")) {
            const adminLink = document.getElementById("adminLink");
            if(adminLink) adminLink.style.display = "block";
        }
        
        // Populate profile with payload data (sub is usually email)
        document.getElementById("profEmail").value = payload.sub || "user@example.com";
        document.getElementById("profileAvatar").innerText = (payload.sub ? payload.sub.charAt(0).toUpperCase() : "U");
        
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

function showToast(msg) {
    const toast = document.getElementById("toast");
    if(!toast) return;
    toast.innerHTML = msg;
    toast.className = "toast show";
    setTimeout(()=>{
        toast.className = toast.className.replace("show", "");
    }, 3000);
}

function updateProfile(){
    document.getElementById("profMsg").innerHTML=
    "<div style='color:#10b981; font-weight:600;'>Profile updated successfully</div>";
    showToast("Profile Saved");
}

function updateKYC(){
    document.getElementById("kycMsg").innerHTML=
    "<div style='color:#10b981; font-weight:600;'>KYC details submitted for verification</div>";
    showToast("KYC Submitted");
}
