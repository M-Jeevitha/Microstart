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
    loadBudgetData();
};

const BASE_URL = "";

async function loadBudgetData() {
    const token = localStorage.getItem("token");
    if(!token) return;

    try {
        // Fetch summary
        const sumRes = await fetch(BASE_URL + "/api/budgets/summary", {
            headers: { "Authorization": "Bearer " + token }
        });
        if(sumRes.ok) {
            const sumData = await sumRes.json();
            document.getElementById("totalIncome").innerText = "₹" + (sumData.totalIncome || 0);
            document.getElementById("totalExpense").innerText = "₹" + (sumData.totalExpense || 0);
            const net = (sumData.totalIncome || 0) - (sumData.totalExpense || 0);
            const netEl = document.getElementById("netSavings");
            netEl.innerText = "₹" + net;
            netEl.className = net >= 0 ? "green" : "red";
        }

        // Fetch transactions
        const txnRes = await fetch(BASE_URL + "/api/budgets", {
            headers: { "Authorization": "Bearer " + token }
        });
        if(txnRes.ok) {
            const txns = await txnRes.json();
            let html = "";
            txns.forEach(t => {
                const isInc = t.type === 'INCOME';
                const pillClass = isInc ? 'pill-green' : 'pill-red';
                html += `<tr>
                    <td>${new Date(t.date).toLocaleDateString()}</td>
                    <td>${t.category}</td>
                    <td><span class="${pillClass}">${t.type}</span></td>
                    <td>₹${t.amount}</td>
                </tr>`;
            });
            document.getElementById("txnTableBody").innerHTML = html;
        }
    } catch (e) {
        console.error("Failed to load budget data", e);
    }
}

async function addTransaction() {
    const token = localStorage.getItem("token");
    const type = document.getElementById("txnType").value;
    const category = document.getElementById("txnCategory").value.trim();
    const amount = parseFloat(document.getElementById("txnAmount").value);
    const desc = document.getElementById("txnDesc").value.trim();
    const msg = document.getElementById("txnMsg");

    if(!category || isNaN(amount) || amount <= 0) {
        msg.innerHTML = "<span style='color:#ef4444;'>Valid category and amount required</span>";
        return;
    }

    try {
        const res = await fetch(BASE_URL + "/api/budgets", {
            method: "POST",
            headers: { 
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: type,
                category: category,
                amount: amount,
                description: desc
            })
        });

        if(res.ok) {
            msg.innerHTML = "<span style='color:#10b981;'>Transaction added!</span>";
            document.getElementById("txnCategory").value = "";
            document.getElementById("txnAmount").value = "";
            document.getElementById("txnDesc").value = "";
            loadBudgetData(); // Refresh UI
            setTimeout(() => msg.innerHTML="", 3000);
        } else {
            msg.innerHTML = "<span style='color:#ef4444;'>Failed to add</span>";
        }
    } catch(e) {
        msg.innerHTML = "<span style='color:#ef4444;'>Error connecting to server</span>";
    }
}