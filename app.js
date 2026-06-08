let questions = [];
let current = 0;
let score = 0;
let timer = null;
let finished = false;

let elapsed = 0;

document.addEventListener("DOMContentLoaded", () => {
    updateStats();

    document
        .getElementById("russianBtn")
        .addEventListener("click", loadTest);
});

/* ---------------- START TEST ---------------- */

async function loadTest() {
    const response = await fetch("data/russian.json");
    const data = await response.json();

    questions = data.map(q => shuffleQuestion(q));
    shuffle(questions);

    current = 0;
    score = 0;
    elapsed = 0;
    finished = false;

    showQuestion();
    startTimer();
}

/* ---------------- SHUFFLE ---------------- */

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function shuffleQuestion(question) {
    const answers = question.answers.map((text, index) => ({
        text,
        correct: index === question.correct
    }));

    shuffle(answers);

    question.answers = answers.map(a => a.text);
    question.correct = answers.findIndex(a => a.correct);

    return question;
}

/* ---------------- SHOW QUESTION ---------------- */

function showQuestion() {

    if (current >= questions.length) {
        finishTest();
        return;
    }

    const q = questions[current];

    document.body.innerHTML = `
    <div class="app">
        <div class="card">

            <div class="topBar">
                <div>Вопрос ${current + 1} / ${questions.length}</div>
                <div>${Math.round((current / questions.length) * 100)}%</div>
            </div>

            <div class="progress">
                <div style="width:${(current / questions.length) * 100}%"></div>
            </div>

            <h2 class="question">${q.question}</h2>

            <div class="answers">
                ${q.answers.map((a, i) => `
                    <button class="answerBtn" data-index="${i}">
                        ${a}
                    </button>
                `).join("")}
            </div>

            <div class="actions">
                <button id="nextBtn" class="btn next" style="display:none;">
                    Далее →
                </button>

                <button id="endTestBtn" class="btn danger">
                    Закончить
                </button>

                <button id="menuBtn" class="btn ghost">
                    В меню
                </button>
            </div>

        </div>
    </div>
    `;

    injectStyles();

    document.querySelectorAll(".answerBtn")
        .forEach(btn => btn.addEventListener("click", () => answer(btn)));

    document.getElementById("nextBtn")
        .addEventListener("click", () => {
            current++;
            showQuestion();
        });

    document.getElementById("menuBtn")
        .addEventListener("click", () => location.reload());

    document.getElementById("endTestBtn")
        .addEventListener("click", finishTest);
}

/* ---------------- ANSWER ---------------- */

function answer(button) {

    const index = Number(button.dataset.index);
    const correct = questions[current].correct;

    document.getElementById("nextBtn").style.display = "block";

    document.querySelectorAll(".answerBtn").forEach(btn => {
        btn.disabled = true;

        const i = Number(btn.dataset.index);

        if (i === correct) {
            btn.style.background = "#22c55e";
            btn.style.color = "white";
        }

        if (i === index && index !== correct) {
            btn.style.background = "#ef4444";
            btn.style.color = "white";
        }
    });

    if (index === correct) score++;

    // 🔥 ВАЖНО: убираем фокус (это и есть твоя фиолетовая подсветка)
    button.blur();
}

/* ---------------- FINISH ---------------- */

function finishTest() {

    if (finished) return;
    finished = true;

    if (timer) clearInterval(timer);

    const best = Number(localStorage.getItem("bestRussian") || 0);
    const attempts = Number(localStorage.getItem("attemptsRussian") || 0) + 1;

    localStorage.setItem("attemptsRussian", attempts);

    if (score > best) {
        localStorage.setItem("bestRussian", score);
    }

    document.body.innerHTML = `
    <div class="app">
        <div class="card" style="text-align:center">

            <h1>Тест завершён 🚀</h1>

            <h2>${score} из ${questions.length}</h2>

            <h3>Время: ${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2,"0")}</h3>

            <button onclick="location.reload()" class="btn next" style="margin-top:20px;">
                На главную
            </button>

        </div>
    </div>
    `;

    updateStats();
}

/* ---------------- STATS ---------------- */

function updateStats() {

    const best = Number(localStorage.getItem("bestRussian") || 0);
    const attempts = Number(localStorage.getItem("attemptsRussian") || 0);

    const percent = Math.round((best / 80) * 100);

    const bestEl = document.getElementById("bestResult");
    const attemptsEl = document.getElementById("attempts");
    const percentEl = document.getElementById("percent");

    if (bestEl) bestEl.textContent = best;
    if (attemptsEl) attemptsEl.textContent = attempts;
    if (percentEl) percentEl.textContent = percent + "%";
}

/* ---------------- TIMER ---------------- */

function startTimer() {
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
        elapsed++;
    }, 1000);
}

/* ---------------- STYLES ---------------- */

function injectStyles() {
    if (document.getElementById("style")) return;

    const style = document.createElement("style");
    style.id = "style";

    style.innerHTML = `
    body {
        margin:0;
        font-family:Arial;
        background: linear-gradient(135deg,#0f172a,#020617);
        color:white;
    }

    .app {
        min-height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        padding:20px;
    }

    .card {
        width:100%;
        max-width:700px;
        background:#111827;
        padding:25px;
        border-radius:18px;
        box-shadow:0 10px 40px rgba(0,0,0,0.6);
    }

    .topBar {
        display:flex;
        justify-content:space-between;
        font-size:14px;
        opacity:0.8;
    }

    .progress {
        height:6px;
        background:#1f2937;
        border-radius:10px;
        margin:10px 0 20px;
        overflow:hidden;
    }

    .progress div {
        height:100%;
        background:#22c55e;
    }

    .question {
        margin:20px 0;
        font-size:22px;
    }

    .answers {
        display:flex;
        flex-direction:column;
        gap:10px;
    }

    .answerBtn {
        padding: 14px;
        border: none;
        border-radius: 12px;
        background: #1f2937;
        color: white;
        cursor: pointer;
        text-align: left;

        outline: none !important;
        box-shadow: none !important;

        transition: background 0.2s ease, transform 0.05s ease;

        -webkit-tap-highlight-color: transparent !important;
    }

    .answerBtn:hover {
        background: #374151;
    }

    .answerBtn:active {
        transform: scale(0.99);
    }

    .answerBtn:focus,
    .answerBtn:focus-visible {
        outline: none !important;
        box-shadow: none !important;
    }

    button {
        outline: none !important;
        -webkit-tap-highlight-color: transparent !important;
    }

    .actions {
        margin-top:20px;
        display:flex;
        gap:10px;
        flex-wrap:wrap;
    }

    .btn {
        flex:1;
        padding:12px;
        border:none;
        border-radius:12px;
        cursor:pointer;
        font-weight:bold;
    }

    .next { background:#22c55e; color:black; }
    .danger { background:#ef4444; color:white; }
    .ghost { background:#334155; color:white; }
    `;
    document.head.appendChild(style);
}