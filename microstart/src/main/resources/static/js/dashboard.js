const BASE_URL = "";

function toggleNotifications() {
    document.getElementById("notifyPanel").classList.toggle("show");
}

window.onclick = function (e) {
    if (!e.target.closest(".header-actions")) {
        const notifyPanel = document.getElementById("notifyPanel");
        if (notifyPanel) notifyPanel.classList.remove("show");
    }
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerHTML = msg;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

window.onload = async function () {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const payload = parseJwt(token);
    if (payload) {
        const role = payload.role;
        const adminLinks = document.querySelectorAll('a[href="admin.html"]');

        if (role !== "ROLE_ADMIN") {
            adminLinks.forEach(link => link.style.display = 'none');
        }
    }

    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.onclick = function (e) {
            e.preventDefault();
            logout();
        };
    });

    const profileBtn = document.querySelector('.profile-btn');
    if (profileBtn) {
        profileBtn.onclick = function () { window.location.href = 'profile.html'; }
    }

    initChart();
    showToast("Welcome back to MicroStart");
}

function initChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, '#8b5cf6'); // primary2
    gradient.addColorStop(1, '#3b82f6'); // primary

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Growth',
                data: [40, 65, 52, 84, 72, 92],
                backgroundColor: gradient,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}