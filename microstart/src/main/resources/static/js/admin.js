window.onload = function() {
    const token = localStorage.getItem("token");
    if(!token){
        window.location.href="admin-login.html";
        return;
    }
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || payload.authorities;
        
        if(!role || !role.includes("ROLE_ADMIN")) {
            window.location.href="login.html";
            return;
        }
    } catch(e) {
        window.location.href="admin-login.html";
        return;
    }

    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href="admin-login.html";
        };
    });
    
    loadDashboardStats();
    initAdminChart();
};

// Load dashboard statistics
async function loadDashboardStats() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("/api/admin/dashboard/stats", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (res.ok) {
            const stats = await res.json();
            // Update dashboard stats cards
            const statCards = document.querySelectorAll('.stat-card h2');
            if (statCards.length >= 1) statCards[0].textContent = stats.totalUsers || 0;
            if (statCards.length >= 2) statCards[1].textContent = stats.pendingApplications || 0;
            if (statCards.length >= 3) statCards[2].textContent = "₹" + (stats.fundsDisbursed || 0).toLocaleString();
        }
    } catch(e) {
        console.error("Failed to load dashboard stats");
    }
}

// Load all users for user management
async function loadUsers() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("/api/admin/users", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (res.ok) {
            const users = await res.json();
            const table = document.querySelector('#usersTab .admin-table tbody');
            if (!table) return;
            
            if (users.length === 0) {
                table.innerHTML = "<tr><td colspan='6' style='text-align: center; color: var(--muted);'>No users found.</td></tr>";
                return;
            }
            
            let html = "";
            users.forEach(user => {
                const roleColor = user.role === 'ROLE_ADMIN' ? 'pill-red' : 
                                 user.role === 'ROLE_SUSPENDED' ? 'pill-red' : 'pill-blue';
                const statusColor = user.role === 'ROLE_SUSPENDED' ? 'pill-red' : 'pill-green';
                const statusText = user.role === 'ROLE_SUSPENDED' ? 'Suspended' : 'Verified';
                
                html += `
                <tr>
                    <td>#${user.id}</td>
                    <td>${user.fullName || 'N/A'}</td>
                    <td>${user.email}</td>
                    <td><span class="${roleColor}">${user.role.replace('ROLE_', '')}</span></td>
                    <td><span class="${statusColor}">${statusText}</span></td>
                    <td>
                        <button class="action-sm">Edit</button>
                        ${user.role === 'ROLE_SUSPENDED' ? 
                            `<button class="action-sm" style="color: #10b981;" onclick="activateUser(${user.id})">Activate</button>` :
                            `<button class="action-sm" style="color: #ef4444;" onclick="suspendUser(${user.id})">Suspend</button>`
                        }
                    </td>
                </tr>
                `;
            });
            table.innerHTML = html;
        }
    } catch(e) {
        console.error("Failed to load users");
    }
}

// Suspend user
async function suspendUser(userId) {
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to suspend this user?")) return;
    
    try {
        const res = await fetch(`/api/admin/users/${userId}/suspend`, {
            method: "PUT",
            headers: { "Authorization": "Bearer " + token }
        });
        
        if (res.ok) {
            showToast("User suspended successfully!");
            loadUsers();
        } else {
            showToast("Failed to suspend user");
        }
    } catch(e) {
        showToast("Error connecting to server");
    }
}

// Activate user
async function activateUser(userId) {
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to activate this user?")) return;
    
    try {
        const res = await fetch(`/api/admin/users/${userId}/activate`, {
            method: "PUT",
            headers: { "Authorization": "Bearer " + token }
        });
        
        if (res.ok) {
            showToast("User activated successfully!");
            loadUsers();
        } else {
            showToast("Failed to activate user");
        }
    } catch(e) {
        showToast("Error connecting to server");
    }
}

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
    
    // Load data based on tab
    if (tabId === 'usersTab') {
        loadUsers();
    } else if (tabId === 'dashboardTab') {
        loadDashboardStats();
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

// Funding sub-tab switching
function switchFundingSubTab(tab) {
    document.querySelectorAll('#fundingTab .admin-nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tab + 'SubTab').classList.add('active');
    
    document.getElementById('programsSubContent').style.display = tab === 'programs' ? 'block' : 'none';
    document.getElementById('biddingSubContent').style.display = tab === 'bidding' ? 'block' : 'none';
    document.getElementById('applicationsSubContent').style.display = tab === 'applications' ? 'block' : 'none';
    
    if (tab === 'bidding') {
        loadOpenIdeas();
        loadMyBids();
    } else if (tab === 'applications') {
        loadFundingApplications();
    }
}

// Load open ideas for bidding
async function loadOpenIdeas() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("/api/funding/ideas/open", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (res.ok) {
            const ideas = await res.json();
            const grid = document.getElementById("ideasBiddingGrid");
            if (ideas.length === 0) {
                grid.innerHTML = "<p style='color:var(--muted);'>No open ideas for bidding.</p>";
                return;
            }
            
            let html = "";
            ideas.forEach(idea => {
                html += `
                <div class="stat-card" style="padding: 20px;">
                    <span style="font-weight:600; color:#fff;">${idea.title}</span>
                    <p style="color:var(--muted); font-size:13px; margin:8px 0;">${idea.description.substring(0, 80)}${idea.description.length > 80 ? '...' : ''}</p>
                    <div style="margin-top:10px; font-size:12px; color:var(--muted);">
                        <div>Category: ${idea.category}</div>
                        <div>Requested: ₹${idea.requestedAmount?.toLocaleString() || 0}</div>
                        <div>Highest Bid: ₹${idea.highestBid?.toLocaleString() || 0}</div>
                    </div>
                    <div style="margin-top:15px;">
                        <input type="number" id="bidAmount_${idea.id}" class="input" placeholder="Your bid (₹)" step="1000" style="margin-bottom:8px;">
                        <input type="text" id="bidMessage_${idea.id}" class="input" placeholder="Message to entrepreneur" style="margin-bottom:8px;">
                        <button class="primary-action" style="padding:8px 15px; font-size:12px;" onclick="placeBid(${idea.id})">Place Bid</button>
                    </div>
                </div>
                `;
            });
            grid.innerHTML = html;
        }
    } catch(e) {
        document.getElementById("ideasBiddingGrid").innerHTML = "<p style='color:#ef4444;'>Failed to load ideas.</p>";
    }
}

// Place a bid on an idea
async function placeBid(ideaId) {
    const token = localStorage.getItem("token");
    const amount = parseFloat(document.getElementById(`bidAmount_${ideaId}`).value);
    const message = document.getElementById(`bidMessage_${ideaId}`).value.trim();
    
    if (isNaN(amount) || amount <= 0) {
        showToast("Please enter a valid bid amount");
        return;
    }
    
    try {
        const res = await fetch(`/api/funding/ideas/${ideaId}/bid`, {
            method: "POST",
            headers: { 
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bidAmount: amount,
                message: message
            })
        });
        
        if (res.ok) {
            showToast("Bid placed successfully!");
            loadOpenIdeas();
            loadMyBids();
        } else {
            const err = await res.json();
            showToast(err.message || "Failed to place bid");
        }
    } catch(e) {
        showToast("Error connecting to server");
    }
}

// Load admin's bids
async function loadMyBids() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("/api/funding/bids/my", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (res.ok) {
            const bids = await res.json();
            const table = document.getElementById("myBidsTable");
            if (bids.length === 0) {
                table.innerHTML = "<tr><td colspan='4' style='text-align: center; color: var(--muted);'>No bids placed yet.</td></tr>";
                return;
            }
            
            let html = "";
            bids.forEach(bid => {
                const statusColor = bid.status === 'ACCEPTED' ? 'pill-green' : 
                                   bid.status === 'REJECTED' ? 'pill-red' : 'pill-blue';
                html += `
                <tr>
                    <td>${bid.idea?.title || 'N/A'}</td>
                    <td>₹${bid.bidAmount?.toLocaleString() || 0}</td>
                    <td><span class="${statusColor}">${bid.status}</span></td>
                    <td>${new Date(bid.createdAt).toLocaleDateString()}</td>
                </tr>
                `;
            });
            table.innerHTML = html;
        }
    } catch(e) {
        document.getElementById("myBidsTable").innerHTML = "<tr><td colspan='4' style='text-align: center; color: #ef4444;'>Failed to load bids.</td></tr>";
    }
}

// Load funding applications for admin review
async function loadFundingApplications() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("/api/funding/admin/applications", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (res.ok) {
            const applications = await res.json();
            const table = document.getElementById("fundingApplicationsTable");
            if (applications.length === 0) {
                table.innerHTML = "<tr><td colspan='5' style='text-align: center; color: var(--muted);'>No funding applications.</td></tr>";
                return;
            }
            
            let html = "";
            applications.forEach(app => {
                const statusColor = app.status === 'APPROVED' ? 'pill-green' : 
                                   app.status === 'REJECTED' ? 'pill-red' : 'pill-yellow';
                const isPending = app.status === 'PENDING';
                
                html += `
                <tr>
                    <td>#${app.id}</td>
                    <td>${app.user?.fullName || app.user?.email || 'Unknown'}</td>
                    <td>${app.funding?.name || 'Unknown'}</td>
                    <td><span class="${statusColor}">${app.status}</span></td>
                    <td>
                        ${isPending ? `
                        <button class="action-sm" style="color: #10b981;" onclick="approveApplication(${app.id})">Approve</button>
                        <button class="action-sm" style="color: #ef4444;" onclick="rejectApplication(${app.id})">Reject</button>
                        ` : '<span style="color:var(--muted); font-size:12px;">Completed</span>'}
                    </td>
                </tr>
                `;
            });
            table.innerHTML = html;
        }
    } catch(e) {
        document.getElementById("fundingApplicationsTable").innerHTML = "<tr><td colspan='5' style='text-align: center; color: #ef4444;'>Failed to load applications.</td></tr>";
    }
}

// Approve funding application
async function approveApplication(appId) {
    const token = localStorage.getItem("token");
    const remarks = prompt("Enter remarks for approval (optional):", "Approved");
    
    if (remarks === null) return;
    
    try {
        const res = await fetch(`/api/funding/admin/approve/${appId}?remarks=${encodeURIComponent(remarks)}`, {
            method: "PUT",
            headers: { "Authorization": "Bearer " + token }
        });
        
        if (res.ok) {
            showToast("Application approved successfully!");
            loadFundingApplications();
        } else {
            const err = await res.json();
            showToast(err.message || "Failed to approve application");
        }
    } catch(e) {
        showToast("Error connecting to server");
    }
}

// Reject funding application
async function rejectApplication(appId) {
    const token = localStorage.getItem("token");
    const remarks = prompt("Enter remarks for rejection:", "Rejected");
    
    if (remarks === null) return;
    
    try {
        const res = await fetch(`/api/funding/admin/reject/${appId}?remarks=${encodeURIComponent(remarks)}`, {
            method: "PUT",
            headers: { "Authorization": "Bearer " + token }
        });
        
        if (res.ok) {
            showToast("Application rejected successfully!");
            loadFundingApplications();
        } else {
            const err = await res.json();
            showToast(err.message || "Failed to reject application");
        }
    } catch(e) {
        showToast("Error connecting to server");
    }
}
