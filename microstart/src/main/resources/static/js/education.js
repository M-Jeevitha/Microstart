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

    loadQuestion();
};

const quizData = [
    {
        question: "[Budgeting Basics] What is the popular 50/30/20 rule in budgeting?",
        options: [
            "50% Needs, 30% Wants, 20% Savings",
            "50% Savings, 30% Needs, 20% Wants",
            "50% Wants, 30% Savings, 20% Needs"
        ],
        answer: 0
    },
    {
        question: "[Understanding Credit] What is the most important factor in calculating your credit score?",
        options: [
            "Types of credit used",
            "Payment history",
            "Length of credit history"
        ],
        answer: 1
    },
    {
        question: "[Loans & Grants] What is the fundamental difference between a loan and a grant?",
        options: [
            "Grants must be repaid, loans do not",
            "Loans must be repaid, grants do not",
            "Both must be repaid with interest"
        ],
        answer: 1
    }
];

let currentQuestion = 0;
let score = 0;

function loadQuestion() {
    const q = quizData[currentQuestion];
    document.getElementById("quizQuestion").innerText = `Q${currentQuestion + 1}: ${q.question}`;
    
    let optionsHtml = "";
    q.options.forEach((opt, index) => {
        optionsHtml += `
            <label class="check" style="background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border: 1px solid var(--glass-border); cursor: pointer;">
                <input type="radio" name="quizOpt" value="${index}" style="margin-right: 10px;">
                <span>${opt}</span>
            </label>
        `;
    });
    
    document.getElementById("quizOptions").innerHTML = optionsHtml;
    document.getElementById("quizResult").innerHTML = "";
}

function submitDynamicQuiz() {
    const selected = document.querySelector('input[name="quizOpt"]:checked');
    const resultBox = document.getElementById("quizResult");
    
    if (!selected) {
        resultBox.innerHTML = "<div style='color:#ef4444; font-weight:600;'>Please select an option.</div>";
        return;
    }
    
    const ansIndex = parseInt(selected.value);
    if (ansIndex === quizData[currentQuestion].answer) {
        score++;
        resultBox.innerHTML = "<div style='color:#10b981; font-weight:600;'>Correct! Great job. 🏆</div>";
    } else {
        resultBox.innerHTML = "<div style='color:#ef4444; font-weight:600;'>Incorrect. The right answer was: " + quizData[currentQuestion].options[quizData[currentQuestion].answer] + "</div>";
    }
    
    document.getElementById("quizSubmitBtn").style.display = "none";
    
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            loadQuestion();
            document.getElementById("quizSubmitBtn").style.display = "block";
        } else {
            document.getElementById("quizContainer").innerHTML = `
                <div style="text-align:center; padding: 20px;">
                    <h3 style="color:#fff; font-size:24px;">Quiz Complete! 🎉</h3>
                    <p style="color:var(--muted); margin-top:10px; font-size:16px;">You scored ${score} out of ${quizData.length}</p>
                    <button class="primary-action" style="margin-top: 20px;" onclick="location.reload()">Retake Quiz</button>
                </div>
            `;
        }
    }, 2500);
}