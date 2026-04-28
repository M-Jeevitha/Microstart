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
    loadFundingPrograms();
};

const BASE_URL = "";

function showToast(msg){
    const toast=document.getElementById("toast");
    if(!toast) return;
    toast.innerHTML=msg;
    toast.classList.add("show");
    setTimeout(()=>toast.classList.remove("show"),2500);
}

async function loadFundingPrograms() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(BASE_URL + "/api/funding", {
            headers: { "Authorization": "Bearer " + token }
        });
        if(res.ok) {
            const fundings = await res.json();
            const grid = document.getElementById("fundingGrid");
            if(fundings.length === 0) {
                grid.innerHTML = "<p style='color:var(--muted);'>No funding programs available right now.</p>";
                return;
            }
            
            let html = "";
            fundings.forEach(f => {
                html += `
                <div class="stat-card">
                    <span>${f.name}</span>
                    <h2>₹${f.maxAmount}</h2>
                    <small class="green">Open</small>
                    <button class="mini-btn full-btn" onclick="applyFund(${f.id}, '${f.name}')">Apply</button>
                </div>
                `;
            });
            grid.innerHTML = html;
        }
    } catch(e) {
        document.getElementById("fundingGrid").innerHTML = "<p style='color:#ef4444;'>Failed to load programs.</p>";
    }
}

async function applyFund(id, name) {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(BASE_URL + "/api/funding/apply/" + id, {
            method: "POST",
            headers: { "Authorization": "Bearer " + token }
        });
        
        if(res.ok) {
            showToast("Application submitted for " + name);
        } else {
            const err = await res.json();
            showToast(err.message || "Failed to apply");
        }
    } catch(e) {
        showToast("Error connecting to server");
    }
}