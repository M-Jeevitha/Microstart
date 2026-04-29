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

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.course-tab').forEach(t => t.classList.remove('active'));
    
    // Map tab names to button IDs
    const tabButtonId = tab === 'submit' ? 'submitTab' : 
                        tab === 'my-ideas' ? 'myIdeasTab' : 
                        tab === 'programs' ? 'programsTab' : '';
    
    if (tabButtonId) {
        document.getElementById(tabButtonId).classList.add('active');
    }
    
    document.getElementById('submitSection').style.display = tab === 'submit' ? 'block' : 'none';
    document.getElementById('myIdeasSection').style.display = tab === 'my-ideas' ? 'block' : 'none';
    document.getElementById('programsSection').style.display = tab === 'programs' ? 'block' : 'none';
    
    if (tab === 'my-ideas') {
        loadMyIdeas();
    } else if (tab === 'programs') {
        loadFundingPrograms();
    }
}

// Submit new idea
async function submitIdea() {
    const token = localStorage.getItem("token");
    const title = document.getElementById("ideaTitle").value.trim();
    const description = document.getElementById("ideaDescription").value.trim();
    const category = document.getElementById("ideaCategory").value;
    const amount = parseFloat(document.getElementById("ideaAmount").value);
    const msg = document.getElementById("ideaMsg");

    if (!title || !description || !category || isNaN(amount) || amount <= 0) {
        msg.innerHTML = "<span style='color:#ef4444;'>Please fill all fields with valid values</span>";
        return;
    }

    try {
        const res = await fetch(BASE_URL + "/api/funding/ideas", {
            method: "POST",
            headers: { 
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                description: description,
                category: category,
                requestedAmount: amount
            })
        });

        if (res.ok) {
            showToast("Idea submitted successfully! Investors can now bid on it.");
            document.getElementById("ideaTitle").value = "";
            document.getElementById("ideaDescription").value = "";
            document.getElementById("ideaCategory").value = "";
            document.getElementById("ideaAmount").value = "";
            msg.innerHTML = "";
        } else {
            const err = await res.json();
            msg.innerHTML = "<span style='color:#ef4444;'>" + (err.message || "Failed to submit idea") + "</span>";
        }
    } catch(e) {
        msg.innerHTML = "<span style='color:#ef4444;'>Error connecting to server</span>";
    }
}

// Load user's ideas
async function loadMyIdeas() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(BASE_URL + "/api/funding/ideas/my", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (res.ok) {
            const ideas = await res.json();
            const grid = document.getElementById("myIdeasGrid");
            if (ideas.length === 0) {
                grid.innerHTML = "<p style='color:var(--muted);'>You haven't submitted any ideas yet.</p>";
                return;
            }
            
            let html = "";
            ideas.forEach(idea => {
                const statusColor = idea.status === 'OPEN' ? 'green' : 
                                   idea.status === 'BIDDING' ? 'blue' : 
                                   idea.status === 'AWARDED' ? 'purple' : 'gray';
                const statusText = idea.status.replace('_', ' ');
                
                html += `
                <div class="idea-card">
                    <span style="font-weight:600; color:#fff;">${idea.title}</span>
                    <p style="color:var(--muted); font-size:13px; margin:8px 0;">${idea.description.substring(0, 100)}${idea.description.length > 100 ? '...' : ''}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                        <small style="color:var(--muted);">${idea.category}</small>
                        <small class="${statusColor}">${statusText}</small>
                    </div>
                    <div style="margin-top:10px; font-weight:600; color:#fff;">Requested: ₹${idea.requestedAmount?.toLocaleString() || 0}</div>
                    ${idea.highestBid > 0 ? `
                    <div class="bid-info">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#fff; font-weight:600;">Highest Bid: ₹${idea.highestBid.toLocaleString()}</span>
                            ${idea.status === 'BIDDING' ? `<button class="mini-btn" onclick="acceptBid(${idea.id}, ${idea.winningBidId})">Accept</button>` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
                `;
            });
            grid.innerHTML = html;
        }
    } catch(e) {
        document.getElementById("myIdeasGrid").innerHTML = "<p style='color:#ef4444;'>Failed to load ideas.</p>";
    }
}

// Accept a bid
async function acceptBid(ideaId, bidId) {
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to accept this bid? This will award the funding to the investor.")) {
        return;
    }

    try {
        const res = await fetch(BASE_URL + `/api/funding/ideas/${ideaId}/accept-bid/${bidId}`, {
            method: "PUT",
            headers: { "Authorization": "Bearer " + token }
        });

        if (res.ok) {
            showToast("Bid accepted! Funding awarded.");
            loadMyIdeas();
        } else {
            const err = await res.json();
            showToast(err.message || "Failed to accept bid");
        }
    } catch(e) {
        showToast("Error connecting to server");
    }
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