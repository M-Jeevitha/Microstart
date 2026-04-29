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
        
        // Load user profile from API
        loadUserProfile();
        
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

// Load user profile from backend
async function loadUserProfile() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("/api/user/profile", {
            headers: { "Authorization": "Bearer " + token }
        });
        
        if (res.ok) {
            const user = await res.json();
            document.getElementById("profName").value = user.fullName || "";
            document.getElementById("profEmail").value = user.email || "";
            document.getElementById("profileAvatar").innerText = (user.fullName ? user.fullName.charAt(0).toUpperCase() : "U");
            
            if (user.phone) document.getElementById("profPhone").value = user.phone;
            if (user.pan) document.getElementById("profPan").value = user.pan;
            if (user.aadhar) document.getElementById("profAadhar").value = user.aadhar;
            if (user.incomeRange) document.getElementById("profIncome").value = user.incomeRange;
        }
    } catch(e) {
        console.error("Failed to load profile");
    }
}

function updateProfile(){
    const token = localStorage.getItem("token");
    const fullName = document.getElementById("profName").value.trim();
    const phone = document.getElementById("profPhone").value.trim();
    
    if (!fullName) {
        document.getElementById("profMsg").innerHTML = "<div style='color:#ef4444; font-weight:600;'>Name is required</div>";
        return;
    }
    
    fetch("/api/user/profile", {
        method: "PUT",
        headers: { 
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ fullName, phone })
    })
    .then(res => {
        if (res.ok) {
            document.getElementById("profMsg").innerHTML = "<div style='color:#10b981; font-weight:600;'>Profile updated successfully</div>";
            showToast("Profile Saved");
            loadUserProfile();
        } else {
            document.getElementById("profMsg").innerHTML = "<div style='color:#ef4444; font-weight:600;'>Failed to update profile</div>";
        }
    })
    .catch(e => {
        document.getElementById("profMsg").innerHTML = "<div style='color:#ef4444; font-weight:600;'>Error connecting to server</div>";
    });
}

function updateKYC(){
    const token = localStorage.getItem("token");
    const pan = document.getElementById("profPan").value.trim();
    const aadhar = document.getElementById("profAadhar").value.trim();
    const incomeRange = document.getElementById("profIncome").value;
    
    if (!pan || !aadhar || !incomeRange) {
        document.getElementById("kycMsg").innerHTML = "<div style='color:#ef4444; font-weight:600;'>Please fill all KYC fields</div>";
        return;
    }
    
    fetch("/api/user/kyc", {
        method: "PUT",
        headers: { 
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ pan, aadhar, incomeRange })
    })
    .then(res => {
        if (res.ok) {
            document.getElementById("kycMsg").innerHTML = "<div style='color:#10b981; font-weight:600;'>KYC details submitted for verification</div>";
            showToast("KYC Submitted");
        } else {
            document.getElementById("kycMsg").innerHTML = "<div style='color:#ef4444; font-weight:600;'>Failed to submit KYC</div>";
        }
    })
    .catch(e => {
        document.getElementById("kycMsg").innerHTML = "<div style='color:#ef4444; font-weight:600;'>Error connecting to server</div>";
    });
}
