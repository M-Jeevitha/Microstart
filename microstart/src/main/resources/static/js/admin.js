window.onload = function() {
    const token = localStorage.getItem("token");
    if(!token){
        window.location.href="login.html";
        return;
    }
    
    // Parse JWT to check role
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if(payload.role !== "ROLE_ADMIN") {
            // Not an admin! Redirect to standard dashboard
            window.location.href="dashboard.html";
            return;
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

    initAdminChart();
};

function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Remove active class from nav buttons
    document.querySelectorAll('.admin-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Set active class on clicked button
    const eventTarget = event.currentTarget;
    if(eventTarget) {
        eventTarget.classList.add('active');
    }
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    if(!toast) return;
    toast.innerHTML = msg;
    toast.className = "toast show";
    setTimeout(()=>{
        toast.className = toast.className.replace("show", "");
    }, 3000);
}

function addFunding(){
    let name=document.getElementById("fundName").value.trim();
    let amount=document.getElementById("fundAmount").value.trim();
    
    if(name==="" || amount===""){
        document.getElementById("adminMsg").innerHTML=
        "<div style='color:#ef4444; font-weight:600;'>Fill all fields</div>";
        return;
    }
    
    document.getElementById("adminMsg").innerHTML=
    "<div style='color:#10b981; font-weight:600;'>Funding Program Added Successfully</div>";
    
    document.getElementById("fundName").value="";
    document.getElementById("fundAmount").value="";
    document.getElementById("fundType").value="";
    
    showToast("Program Published");
}

function initAdminChart() {
    const ctx = document.getElementById('adminTrendChart').getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [{
                label: 'New Registrations',
                data: [120, 150, 180, 170, 210, 280],
                borderColor: '#3b82f6',
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}