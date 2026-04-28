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
    try {
        const res = await fetch(BASE_URL + "/api/funding/applications", {
            headers: { "Authorization": "Bearer " + token }
        });
        
        const container = document.getElementById("applicationsContainer");
        
        if(res.ok) {
            const apps = await res.json();
            if(apps.length === 0) {
                container.innerHTML = `
                    <div class="panel" style="text-align: center; padding: 40px;">
                        <h3 style="color:#fff;">No Applications Yet</h3>
                        <p style="color:var(--muted); margin-top:10px;">You haven't applied for any funding programs.</p>
                        <button class="primary-action" style="margin-top:20px;" onclick="window.location.href='funding.html'">Explore Funding</button>
                    </div>
                `;
                return;
            }
            
            let html = "";
            apps.forEach(app => {
                const isApproved = app.status === 'APPROVED';
                const isRejected = app.status === 'REJECTED';
                const isPending = app.status === 'PENDING';
                
                html += `
                <section class="panel" style="margin-bottom: 20px;">
                    <div class="panel-head">
                        <h3>${app.funding ? app.funding.name : 'Unknown Program'}</h3>
                        <small class="${isApproved ? 'green' : (isRejected ? 'red' : 'blue')}">Status: ${app.status}</small>
                    </div>
                    
                    <p style="color:var(--muted); font-size: 13px; margin-bottom: 15px;">Applied on: ${new Date(app.appliedDate).toLocaleDateString()}</p>
                    
                    <div class="timeline">
                        <div class="step done">
                            <div class="circle"></div>
                            <div>
                                <h4>Submitted</h4>
                                <p>Application received</p>
                            </div>
                        </div>
                        
                        <div class="step ${isPending ? 'active' : 'done'}">
                            <div class="circle"></div>
                            <div>
                                <h4>Under Review</h4>
                                <p>Admin team is verifying details</p>
                            </div>
                        </div>
                        
                        <div class="step ${isApproved || isRejected ? 'done' : ''}">
                            <div class="circle" style="${isRejected ? 'border-color: #ef4444; background: #ef4444;' : ''}"></div>
                            <div>
                                <h4 style="${isRejected ? 'color: #ef4444;' : ''}">${isRejected ? 'Rejected' : 'Final Decision'}</h4>
                                <p>${app.remarks || (isApproved ? 'Approved for funding' : 'Pending decision')}</p>
                            </div>
                        </div>
                    </div>
                </section>
                `;
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = "<p style='color:#ef4444;'>Failed to load tracking data.</p>";
        }
    } catch(e) {
        document.getElementById("applicationsContainer").innerHTML = "<p style='color:#ef4444;'>Error connecting to server</p>";
    }
}
