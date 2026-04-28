// Enhanced Budget JavaScript - Money Manager/Wallet App Style

const BASE_URL = "";
let allTransactions = [];
let categoryChart = null;
let incomeExpenseChart = null;
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

// Category colors and icons
const categoryConfig = {
    'Food': { color: '#ff6b6b', icon: '🍔' },
    'Transport': { color: '#4ecdc4', icon: '🚗' },
    'Shopping': { color: '#a855f7', icon: '🛒' },
    'Bills': { color: '#f59e0b', icon: '💡' },
    'Entertainment': { color: '#ec4899', icon: '🎬' },
    'Health': { color: '#10b981', icon: '🏥' },
    'Salary': { color: '#3b82f6', icon: '💼' },
    'Investment': { color: '#8b5cf6', icon: '📈' },
    'Other': { color: '#6b7280', icon: '📦' }
};

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

    // Set default date to today
    document.getElementById('modalDate').valueAsDate = new Date();
    
    loadBudgetData();
};

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
            const totalIncome = sumData.totalIncome || 0;
            const totalExpense = sumData.totalExpense || 0;
            const balance = totalIncome - totalExpense;
            
            document.getElementById("totalIncome").innerText = "₹" + formatNumber(totalIncome);
            document.getElementById("totalExpense").innerText = "₹" + formatNumber(totalExpense);
            document.getElementById("totalBalance").innerText = "₹" + formatNumber(balance);
        }

        // Fetch transactions
        const txnRes = await fetch(BASE_URL + "/api/budgets", {
            headers: { "Authorization": "Bearer " + token }
        });
        if(txnRes.ok) {
            allTransactions = await txnRes.json();
            renderTransactions(allTransactions);
            updateCharts();
            renderBudgetCategories();
        }
    } catch (e) {
        console.error("Failed to load budget data", e);
    }
}

function formatNumber(num) {
    return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function renderTransactions(transactions) {
    const container = document.getElementById('transactionsList');
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💸</div>
                <div class="empty-state-text">No transactions yet</div>
                <div class="empty-state-sub">Click the + button to add your first transaction</div>
            </div>
        `;
        return;
    }

    // Sort by date (newest first)
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    sorted.forEach(t => {
        const config = categoryConfig[t.category] || categoryConfig['Other'];
        const isInc = t.type === 'INCOME';
        const amountClass = isInc ? 'income' : 'expense';
        const amountPrefix = isInc ? '+' : '-';
        
        html += `
            <div class="transaction-item">
                <div class="transaction-icon" style="background: ${config.color}20; color: ${config.color}">
                    ${config.icon}
                </div>
                <div class="transaction-details">
                    <div class="transaction-category">${t.category}</div>
                    <div class="transaction-desc">${t.description || 'No description'}</div>
                    <div class="transaction-date">${new Date(t.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                    })}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountPrefix}₹${formatNumber(t.amount)}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filterTransactions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    
    let filtered = allTransactions;
    
    if (searchTerm) {
        filtered = filtered.filter(t => 
            t.category.toLowerCase().includes(searchTerm) ||
            (t.description && t.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    renderTransactions(filtered);
}

function updateCharts() {
    updateCategoryChart();
    updateIncomeExpenseChart();
}

function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const period = document.getElementById('chartPeriod').value;
    
    // Filter transactions by period
    let filtered = filterByPeriod(allTransactions, period);
    const expenses = filtered.filter(t => t.type === 'EXPENSE');
    
    // Group by category
    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = labels.map(cat => categoryConfig[cat]?.color || categoryConfig['Other'].color);
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#94a3b8',
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

function updateIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    const period = document.getElementById('chartPeriod').value;
    
    let filtered = filterByPeriod(allTransactions, period);
    
    const totalIncome = filtered.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filtered.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    
    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }
    
    incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [totalIncome, totalExpense],
                backgroundColor: ['#10b981', '#ef4444'],
                borderRadius: 12,
                barThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return '₹' + formatNumber(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 14, weight: 600 }
                    }
                }
            }
        }
    });
}

function filterByPeriod(transactions, period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(period) {
        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return transactions.filter(t => new Date(t.date) >= weekAgo);
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return transactions.filter(t => new Date(t.date) >= monthStart);
        default:
            return transactions;
    }
}

function renderBudgetCategories() {
    const container = document.getElementById('budgetCategories');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filter expenses for current month
    const monthlyExpenses = allTransactions.filter(t => {
        const date = new Date(t.date);
        return t.type === 'EXPENSE' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
    });
    
    // Group by category
    const categorySpending = {};
    monthlyExpenses.forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });
    
    if (Object.keys(budgets).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <div class="empty-state-text">No budgets set</div>
                <div class="empty-state-sub">Click "+ Add Budget" to set spending limits</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    Object.entries(budgets).forEach(([category, limit]) => {
        const spent = categorySpending[category] || 0;
        const percentage = Math.min((spent / limit) * 100, 100);
        const remaining = limit - spent;
        const config = categoryConfig[category] || categoryConfig['Other'];
        
        let progressClass = 'safe';
        if (percentage >= 90) progressClass = 'danger';
        else if (percentage >= 70) progressClass = 'warning';
        
        html += `
            <div class="budget-item">
                <div class="budget-item-header">
                    <div class="budget-category">
                        <div class="budget-icon" style="background: ${config.color}20; color: ${config.color}">
                            ${config.icon}
                        </div>
                        ${category}
                    </div>
                    <div class="budget-amount">₹${formatNumber(spent)} / ₹${formatNumber(limit)}</div>
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar ${progressClass}" style="width: ${percentage}%"></div>
                </div>
                <div class="budget-details">
                    <span>${percentage.toFixed(0)}% used</span>
                    <span>${remaining >= 0 ? '₹' + formatNumber(remaining) + ' left' : 'Over by ₹' + formatNumber(Math.abs(remaining))}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Modal Functions
function openAddModal() {
    document.getElementById('addModal').classList.add('active');
}

function closeAddModal() {
    document.getElementById('addModal').classList.remove('active');
    resetModalForm();
}

function openBudgetModal() {
    document.getElementById('budgetModal').classList.add('active');
}

function closeBudgetModal() {
    document.getElementById('budgetModal').classList.remove('active');
    document.getElementById('budgetLimit').value = '';
}

function resetModalForm() {
    document.getElementById('modalAmount').value = '';
    document.getElementById('modalDesc').value = '';
    document.getElementById('selectedCategory').value = '';
    document.getElementById('modalDate').valueAsDate = new Date();
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
    setTransactionType('EXPENSE');
}

function setTransactionType(type) {
    document.getElementById('modalTxnType').value = type;
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
}

function selectCategory(category) {
    document.getElementById('selectedCategory').value = category;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.category === category) {
            btn.classList.add('selected');
        }
    });
}

async function submitTransaction() {
    const token = localStorage.getItem("token");
    const type = document.getElementById('modalTxnType').value;
    const category = document.getElementById('selectedCategory').value;
    const amount = parseFloat(document.getElementById('modalAmount').value);
    const desc = document.getElementById('modalDesc').value.trim();
    const date = document.getElementById('modalDate').value;

    if(!category || isNaN(amount) || amount <= 0) {
        alert('Please select a category and enter a valid amount');
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
                description: desc,
                date: date || new Date().toISOString().split('T')[0]
            })
        });

        if(res.ok) {
            closeAddModal();
            loadBudgetData();
        } else {
            alert('Failed to add transaction');
        }
    } catch(e) {
        alert('Error connecting to server');
    }
}

function submitBudget() {
    const category = document.getElementById('budgetCategory').value;
    const limit = parseFloat(document.getElementById('budgetLimit').value);

    if(isNaN(limit) || limit <= 0) {
        alert('Please enter a valid budget limit');
        return;
    }

    budgets[category] = limit;
    localStorage.setItem('budgets', JSON.stringify(budgets));
    
    closeBudgetModal();
    renderBudgetCategories();
}

function togglePeriodFilter() {
    const select = document.getElementById('chartPeriod');
    select.focus();
}
