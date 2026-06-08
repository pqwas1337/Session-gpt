let questions = [];
let current = 0;
let score = 0;
let timer = null;
let finished = false;
let elapsed = 0;

let currentType = "russian";

const TESTS = {
    russian: window.location.hostname.includes("github")
        ? "/Session-gpt/data/russian.json"
        : "./data/russian.json",

    physics: window.location.hostname.includes("github")
        ? "/Session-gpt/data/physics.json"
        : "./data/physics.json"
};

document.addEventListener("DOMContentLoaded", () => {

    updateStats("russian");
    updateStats("physics");

    document.getElementById("russianBtn")
        ?.addEventListener("click", () => loadTest("russian"));

    document.getElementById("physicsBtn")
        ?.addEventListener("click", () => loadTest("physics"));
});

/* ---------------- LOAD ---------------- */

async function loadTest(type = "russian") {

    currentType = type;

    try {
        const response = await fetch(TESTS[type]);

        if (!response.ok) {
            throw new Error("JSON не найден: " + response.status);
        }

        const data = await response.json();

        questions = data.map(q => shuffleQuestion(q));
        shuffle(questions);

        current = 0;
        score = 0;
        elapsed = 0;
        finished = false;

        showQuestion(type);
        startTimer();

    } catch (e) {
        console.error(e);
        alert("Ошибка загрузки теста");
    }
}

/* ---------------- SHUFFLE ---------------- */

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function shuffleQuestion(question) {

    const answers = question.answers.map((a, index) => {
        if (typeof a === "string") {
            return {
                text: a,
                correct: index === question.correct
            };
        }
        return a;
    });

    shuffle(answers);
    question.answers = answers;

    return question;
}

/* ---------------- SHOW ---------------- */

function showQuestion(type) {

    if (current >= questions.length) {
        finishTest(type);
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
                        ${a.text}
                    </button>
                `).join("")}
            </div>

            <div class="actions">
                <button id="nextBtn" class="btn next" style="display:none;">Далее →</button>
                <button id="endTestBtn" class="btn danger">Закончить</button>
                <button id="menuBtn" class="btn ghost">В меню</button>
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
            showQuestion(type);
        });

    document.getElementById("endTestBtn")
        .addEventListener("click", () => finishTest(type));

    document.getElementById("menuBtn")
        .addEventListener("click", () => location.reload());
}

/* ---------------- ANSWER ---------------- */

function answer(button) {

    const index = Number(button.dataset.index);
    const answers = questions[current].answers;

    const isCorrect = answers[index].correct;

    document.getElementById("nextBtn").style.display = "block";

    document.querySelectorAll(".answerBtn").forEach(btn => {
        btn.disabled = true;

        const i = Number(btn.dataset.index);

        if (answers[i].correct) {
            btn.style.background = "#22c55e";
        }

        if (i === index && !isCorrect) {
            btn.style.background = "#ef4444";
        }
    });

    if (isCorrect) score++;

    button.blur();
}

/* ---------------- FINISH ---------------- */

function finishTest(type) {

    if (finished) return;
    finished = true;

    if (timer) clearInterval(timer);

    const bestKey = "best_" + type;
    const attemptsKey = "attempts_" + type;

    const best = Number(localStorage.getItem(bestKey) || 0);
    const attempts = Number(localStorage.getItem(attemptsKey) || 0) + 1;

    localStorage.setItem(attemptsKey, attempts);

    if (score > best) {
        localStorage.setItem(bestKey, score);
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

    updateStats(type);
}

/* ---------------- STATS ---------------- */

function updateStats(type) {

    const best = Number(localStorage.getItem("best_" + type) || 0);
    const attempts = Number(localStorage.getItem("attempts_" + type) || 0);

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

    timer = setInterval(() => elapsed++, 1000);
}

/* ---------------- STYLE ---------------- */

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
        padding:14px;
        border:none;
        border-radius:12px;
        background:#1f2937;
        color:white;
        cursor:pointer;
        text-align:left;
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
