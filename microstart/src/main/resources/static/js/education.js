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

    initEducationPlatform();
};

const eduModules = [
    {
        id: 1,
        title: "1. Budgeting Basics",
        content: `
            <h3>The 50/30/20 Rule</h3>
            <p>Budgeting is the foundation of financial health. The 50/30/20 rule is a simple way to budget your money effectively:</p>
            <ul>
                <li><strong style="color:#8b5cf6;">50% Needs:</strong> Rent, groceries, utilities, insurance.</li>
                <li><strong style="color:#10b981;">30% Wants:</strong> Dining out, entertainment, hobbies.</li>
                <li><strong style="color:#3b82f6;">20% Savings:</strong> Debt repayment, emergency fund, investments.</li>
            </ul>
            <p style="margin-top:15px;">By strictly allocating 20% of your income to savings, you build a safety net and create long-term wealth.</p>
        `,
        question: "According to the 50/30/20 rule, what percentage of your income should go strictly towards Savings and Investments?",
        options: ["10%", "20%", "30%", "50%"],
        answer: 1
    },
    {
        id: 2,
        title: "2. Understanding Credit",
        content: `
            <h3>Mastering Your Credit Score</h3>
            <p>Your credit score dictates your ability to get loans, mortgages, and even affects job prospects. It is calculated using five factors:</p>
            <ol>
                <li><strong style="color:#10b981;">Payment History (35%):</strong> The most crucial factor. Always pay on time.</li>
                <li><strong style="color:#3b82f6;">Credit Utilization (30%):</strong> Keep your credit card balances below 30% of your limit.</li>
                <li><strong style="color:#8b5cf6;">Length of History (15%):</strong> Older accounts boost your score.</li>
                <li><strong>New Credit (10%)</strong></li>
                <li><strong>Credit Mix (10%)</strong></li>
            </ol>
        `,
        question: "Which factor has the highest impact on your credit score calculation?",
        options: ["Credit Utilization", "Length of Credit History", "Payment History", "New Credit Inquiries"],
        answer: 2
    },
    {
        id: 3,
        title: "3. Loans vs. Grants",
        content: `
            <h3>Funding Your Startup</h3>
            <p>When seeking capital, you will encounter two primary mechanisms:</p>
            <div style="background:rgba(59, 130, 246, 0.1); padding:15px; border-left:3px solid #3b82f6; margin: 15px 0;">
                <strong>Loans:</strong> Borrowed money that must be repaid with interest over a set period. Helps build business credit if paid consistently.
            </div>
            <div style="background:rgba(16, 185, 129, 0.1); padding:15px; border-left:3px solid #10b981; margin: 15px 0;">
                <strong>Grants:</strong> Free capital provided by governments or organizations. They do not need to be repaid, but are highly competitive and require strict reporting.
            </div>
        `,
        question: "What is the primary characteristic of a business grant?",
        options: ["It must be repaid with a fixed interest rate", "It does not need to be repaid", "It requires giving up company equity", "It is issued exclusively by private banks"],
        answer: 1
    }
];

let activeModuleIndex = 0;
let userScore = 0;
let completedModules = new Set();

function initEducationPlatform() {
    renderNavigation();
    loadModule(0);
}

function renderNavigation() {
    const list = document.getElementById("lessonList");
    let html = "";
    eduModules.forEach((mod, index) => {
        const isActive = index === activeModuleIndex ? 'active' : '';
        const isCompleted = completedModules.has(index) ? 'completed' : '';
        html += `<li class="${isActive} ${isCompleted}" onclick="loadModule(${index})">${mod.title}</li>`;
    });
    list.innerHTML = html;
}

function loadModule(index) {
    activeModuleIndex = index;
    const mod = eduModules[index];
    
    // Update active state in nav
    document.querySelectorAll(".edu-nav li").forEach((li, i) => {
        if(i === index) li.classList.add('active');
        else li.classList.remove('active');
    });

    // Load Reading Pane
    document.getElementById("lessonTitle").innerText = mod.title;
    document.getElementById("lessonBody").innerHTML = mod.content;

    // Load Quiz Pane
    document.getElementById("quizQuestion").innerText = mod.question;
    let optsHtml = "";
    mod.options.forEach((opt, i) => {
        optsHtml += `
            <label class="opt-label" onclick="selectOption(this)">
                <input type="radio" name="eduOpt" value="${i}" style="margin-right: 15px; accent-color: var(--primary);">
                <span>${opt}</span>
            </label>
        `;
    });
    document.getElementById("quizOptions").innerHTML = optsHtml;
    
    const resultBox = document.getElementById("quizResult");
    const submitBtn = document.getElementById("quizSubmitBtn");
    const nextBtn = document.getElementById("nextLessonBtn");

    if (completedModules.has(index)) {
        resultBox.innerHTML = "<span style='color:#10b981; font-weight:600;'>✓ You have already mastered this module!</span>";
        submitBtn.style.display = "none";
        nextBtn.style.display = index < eduModules.length - 1 ? "block" : "none";
        // Disable radios
        document.querySelectorAll('input[name="eduOpt"]').forEach(r => r.disabled = true);
    } else {
        resultBox.innerHTML = "";
        submitBtn.style.display = "block";
        nextBtn.style.display = "none";
    }
}

function selectOption(labelElement) {
    document.querySelectorAll('.opt-label').forEach(el => el.classList.remove('selected'));
    labelElement.classList.add('selected');
    const radio = labelElement.querySelector('input');
    if(!radio.disabled) {
        radio.checked = true;
    }
}

function submitLessonQuiz() {
    const selected = document.querySelector('input[name="eduOpt"]:checked');
    const resultBox = document.getElementById("quizResult");
    
    if (!selected) {
        resultBox.innerHTML = "<span style='color:#ef4444; font-weight:600;'>Please select an answer first.</span>";
        return;
    }
    
    const mod = eduModules[activeModuleIndex];
    const ansIndex = parseInt(selected.value);
    
    if (ansIndex === mod.answer) {
        resultBox.innerHTML = "<span style='color:#10b981; font-weight:600;'>Correct! +10 Points 🏆</span>";
        userScore += 10;
        document.getElementById("totalScore").innerText = userScore;
        completedModules.add(activeModuleIndex);
        
        document.getElementById("quizSubmitBtn").style.display = "none";
        if (activeModuleIndex < eduModules.length - 1) {
            document.getElementById("nextLessonBtn").style.display = "block";
        }
        renderNavigation(); // Update checkmarks
    } else {
        resultBox.innerHTML = "<span style='color:#ef4444; font-weight:600;'>Incorrect. Review the reading material and try again!</span>";
    }
}

function nextLesson() {
    if (activeModuleIndex < eduModules.length - 1) {
        loadModule(activeModuleIndex + 1);
    }
}