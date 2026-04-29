window.onload = function() {
    const token = localStorage.getItem("token");
    if(!token){
        window.location.href="login.html";
        return;
    }
    
    // Parse JWT to check role
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || payload.authorities;
        
        // Only show admin link if role contains admin
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
    loadApplications();
};

const BASE_URL = "";

async function loadApplications() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("applicationsContainer");
    
    try {
        // Load funding applications
        const fundingRes = await fetch(BASE_URL + "/api/funding/applications", {
            headers: { "Authorization": "Bearer " + token }
        });
        
        // Load user's ideas
        const ideasRes = await fetch(BASE_URL + "/api/funding/ideas/my", {
            headers: { "Authorization": "Bearer " + token }
        });
        
        let html = "";
        
        // Add funding applications section
        if(fundingRes.ok) {
            const apps = await fundingRes.json();
            if(apps.length > 0) {
                html += `<div class="panel" style="margin-bottom: 30px;">
                    <div class="panel-head">
                        <h3>📋 Funding Program Applications</h3>
                    </div>`;
                
                apps.forEach(app => {
                    const isApproved = app.status === 'APPROVED';
                    const isRejected = app.status === 'REJECTED';
                    const isPending = app.status === 'PENDING';
                    
                    html += `
                    <div style="padding: 15px; border-bottom: 1px solid var(--glass-border);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:600; color:#fff;">${app.funding ? app.funding.name : 'Unknown Program'}</span>
                            <small class="${isApproved ? 'green' : (isRejected ? 'red' : 'blue')}">${app.status}</small>
                        </div>
                        <p style="color:var(--muted); font-size: 12px; margin-top:5px;">Applied: ${new Date(app.appliedDate).toLocaleDateString()}</p>
                        ${app.remarks ? `<p style="color:var(--muted); font-size: 12px;">Remarks: ${app.remarks}</p>` : ''}
                    </div>
                    `;
                });
                
                html += `</div>`;
            }
        }
        
        // Add ideas section
        if(ideasRes.ok) {
            const ideas = await ideasRes.json();
            if(ideas.length > 0) {
                html += `<div class="panel">
                    <div class="panel-head">
                        <h3>💡 Idea Submissions</h3>
                    </div>`;
                
                ideas.forEach(idea => {
                    const statusColor = idea.status === 'OPEN' ? 'green' : 
                                       idea.status === 'BIDDING' ? 'blue' : 
                                       idea.status === 'AWARDED' ? 'purple' : 'gray';
                    
                    html += `
                    <div style="padding: 15px; border-bottom: 1px solid var(--glass-border);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:600; color:#fff;">${idea.title}</span>
                            <small class="${statusColor}">${idea.status}</small>
                        </div>
                        <p style="color:var(--muted); font-size: 12px; margin-top:5px;">Category: ${idea.category} | Requested: ₹${idea.requestedAmount?.toLocaleString() || 0}</p>
                        ${idea.highestBid > 0 ? `<p style="color:var(--muted); font-size: 12px;">Highest Bid: ₹${idea.highestBid.toLocaleString()}</p>` : ''}
                    </div>
                    `;
                });
                
                html += `</div>`;
            }
        }
        
        // If no data
        if(!html) {
            container.innerHTML = `
                <div class="panel" style="text-align: center; padding: 40px;">
                    <h3 style="color:#fff;">No Applications Yet</h3>
                    <p style="color:var(--muted); margin-top:10px;">You haven't applied for any funding programs or submitted ideas.</p>
                    <button class="primary-action" style="margin-top:20px;" onclick="window.location.href='funding.html'">Explore Funding</button>
                </div>
            `;
        } else {
            container.innerHTML = html;
        }
    } catch(e) {
        document.getElementById("applicationsContainer").innerHTML = "<p style='color:#ef4444;'>Error connecting to server</p>";
    }
}
