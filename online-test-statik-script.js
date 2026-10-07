let questions = [];
let currentIdx = 0;
let selectedAnswers = [];

// ---------------- CONFIG & TIMER ----------------
const quizConfig = document.getElementById("quizConfig");
const TIME_IN_MINUTES = parseInt(quizConfig?.dataset.time || "25", 10);

let timer = TIME_IN_MINUTES * 60;
let timerInterval = null;

const timerDiv = document.getElementById("timer");
const midSubmitBtn = document.getElementById("midSubmitBtn");

function loadQuestions() {
    questions = [];
    document.querySelectorAll(".question-data").forEach(qEl => {
        const q = qEl.querySelector(".q").innerHTML; 
        const opts = Array.from(qEl.querySelectorAll(".opt")).map(el => el.innerHTML);
        const ans = parseInt(qEl.getAttribute("data-answer"), 10);
        const explanation = qEl.getAttribute("data-explanation") || "";
        questions.push({ question: q, options: opts, answer: ans, explanation: explanation });
    });
}

function renderQuestion() {
    if (questions.length === 0) return;
    
    const q = questions[currentIdx];
    const container = document.getElementById("quiz-container");
    
    container.innerHTML = `
        <div class="question-number-circle">${currentIdx + 1}</div>
        <div class="question">${q.question}</div>
        <div class="options">
            ${q.options.map((opt, i) => `
                <div class="option ${selectedAnswers[currentIdx] === i ? 'selected' : ''}" onclick="selectOpt(${i})">${opt}</div>
            `).join('')}
        </div>`;
        
    document.getElementById("questionCountDisplay").innerText = `Question : ${currentIdx + 1}/${questions.length}`;
    
    let attempted = selectedAnswers.filter(v => v !== undefined).length;
    document.getElementById("progressBar").style.width = (attempted / questions.length) * 100 + "%";
    
    document.getElementById("prevBtn").disabled = currentIdx === 0;
    
    if (currentIdx === questions.length - 1) {
        document.getElementById("nextBtn").style.display = "none";
        document.getElementById("submitBtn").style.display = "block";
        if (midSubmitBtn) midSubmitBtn.style.display = "none";
    } else {
        document.getElementById("nextBtn").style.display = "block";
        document.getElementById("submitBtn").style.display = "none";
        if (midSubmitBtn) midSubmitBtn.style.display = "block";
    }
}

function selectOpt(idx) {
    selectedAnswers[currentIdx] = idx;
    renderQuestion();
}

function changeQuestion(step) {
    currentIdx += step;
    renderQuestion();
}

// ---------------- TIMER FUNCTIONS ----------------
function updateTimerDisplay() {
    if (!timerDiv) return;

    if (timer <= 0) {
        timer = 0;
        timerDiv.innerText = "🕛 00:00:00";
        clearInterval(timerInterval);
        submitResults();
        return;
    }

    const hours = Math.floor(timer / 3600);
    const minutes = Math.floor((timer % 3600) / 60);
    const seconds = timer % 60;

    const hDisplay = hours < 10 ? "0" + hours : hours;
    const mDisplay = minutes < 10 ? "0" + minutes : minutes;
    const sDisplay = seconds < 10 ? "0" + seconds : seconds;

    timerDiv.innerText = `🕛 ${hDisplay}:${mDisplay}:${sDisplay}`;

    // शेवटच्या 2 मिनिटांत (120 सेकंद) लाल आणि ब्लिंक
    if (timer <= 120) {
        timerDiv.classList.add("timer-low");
    } else {
        timerDiv.classList.remove("timer-low");
    }

    timer--;
}

function startTimer() {
    clearInterval(timerInterval);
    timer = TIME_IN_MINUTES * 60;
    updateTimerDisplay();
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

// ---------------- SUBMIT & RESULTS ----------------
function submitResults() {
    clearInterval(timerInterval);
    document.getElementById("quizBox").style.display = "none";
    document.getElementById("reportCard").style.display = "block";
    if (midSubmitBtn) midSubmitBtn.style.display = "none";
    
    let correct = 0;
    questions.forEach((q, i) => {
        if (selectedAnswers[i] === q.answer) correct++;
    });
    
    const attempted = selectedAnswers.filter(v => v !== undefined).length;
    document.getElementById("total").innerText = questions.length;
    document.getElementById("attempted").innerText = attempted;
    document.getElementById("correct").innerText = correct;
    document.getElementById("wrong").innerText = attempted - correct;
    document.getElementById("score").innerText = correct;
    document.getElementById("totalScore").innerText = questions.length;
}

if (midSubmitBtn) {
    midSubmitBtn.onclick = () => {
        const confirmSubmit = confirm("Are you sure you want to submit the test now?");
        if (confirmSubmit) {
            submitResults();
        }
    };
}

function showAnalysis() {
    document.getElementById("reportCard").style.display = "block";
    document.getElementById("analysisCard").style.display = "block";
    document.getElementById("analysisCard").scrollIntoView({ behavior: 'smooth' });

    const container = document.getElementById("analysisContent");
    container.innerHTML = questions.map((q, i) => {
        const userAns = selectedAnswers[i];
        let status = userAns === undefined ? "Not Attempted" : (userAns === q.answer ? "Correct" : "Wrong");
        let fClass = userAns === undefined ? "not-attempted-feedback" : (userAns === q.answer ? "correct-feedback" : "wrong-feedback");
        
        return `
            <div class="analysis-box">
                <span class="q-label-analysis">Question : ${i + 1}</span>
                <div class="question">${q.question}</div>
                <div class="options">
                    ${q.options.map((j_opt, j) => {
                        let optClass = (j === q.answer) ? "correct" : (j === userAns ? "wrong" : "");
                        return `<div class="option ${optClass}">${j_opt}</div>`;
                    }).join('')}
                </div>
                <div class="feedback ${fClass}">${status}</div>
                ${q.explanation ? `<div class="explanation-box"><b>📝 स्पष्टीकरण :</b> ${q.explanation}</div>` : ''}
            </div>`;
    }).join('');
}

// ---------------- EVENT LISTENERS ----------------
document.getElementById("centerStartBtn").onclick = () => {
    loadQuestions();
    document.getElementById("initialStartScreen").style.display = "none";
    document.getElementById("quizBox").style.display = "block";
    startTimer();
    renderQuestion();
};

// सुरुवातीला टायमर डिस्प्ले सेट करणे
if (timerDiv) {
    const initHours = Math.floor(timer / 3600);
    const initMinutes = Math.floor((timer % 3600) / 60);
    const initSeconds = timer % 60;
    const h = initHours < 10 ? "0" + initHours : initHours;
    const m = initMinutes < 10 ? "0" + initMinutes : initMinutes;
    const s = initSeconds < 10 ? "0" + initSeconds : initSeconds;
    timerDiv.innerText = `🕛 ${h}:${m}:${s}`;
}
