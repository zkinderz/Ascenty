// ----------------------
// Contador animado
// ----------------------
const counters = document.querySelectorAll(".counter");

const animateCounter = (counter) => {
    let count = 0;
    const target = parseInt(counter.dataset.target, 10);
    const speed = 100;
    const increment = target / speed;

    const update = () => {
        if (count < target) {
            count += increment;
            counter.innerText = Math.ceil(count);
            requestAnimationFrame(update);
        } else {
            counter.innerText = target;
        }
    };
    update();
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => observer.observe(counter));


// ----------------------
// Controle de cliques obrigatórios
// ----------------------
const requiredIds = [
    "azure", "vmware", "firewall", "servicenow", // Tecnologias
    "mfa", "ferramentas", "bitlocker",           // Segurança
    "politica-notebook", "politica-email-internet", "politica-privacidade" // Políticas
];

let clickedIds = new Set();

function markClicked(id) {
    clickedIds.add(id);
    checkQuizUnlock();
}

function checkQuizUnlock() {
    const allClicked = requiredIds.every(id => clickedIds.has(id));
    const warning = document.querySelector(".quiz-warning");

    if (allClicked) {
        const quizSection = document.getElementById("quiz");
        quizSection.classList.remove("locked");
        const startBtn = document.getElementById("startQuiz");
        startBtn.disabled = false; // habilita botão
        if (warning) warning.style.display = "none"; // remove aviso
    } else {
        // Lista os itens que ainda faltam
        const missing = requiredIds.filter(id => !clickedIds.has(id));
        if (warning) {
            warning.style.display = "block";
            warning.innerHTML = "⚠️ Você ainda precisa clicar em:<br>" + missing.map(m => `• ${m}`).join("<br>");
        }
    }
}


// ----------------------
// Modais interativos (Tecnologias)
// ----------------------
function openModal(tech) {
    const modal = document.getElementById("modal");
    const text = document.getElementById("modal-text");

    let content = "";
    switch(tech) {
        case "azure":
            content = "<h2>Azure</h2><p>Usado para hospedar serviços em nuvem, garantindo escalabilidade, segurança e integração com soluções Microsoft.</p>";
            break;
        case "vmware":
            content = "<h2>VMware</h2><p>Permite virtualização de servidores e aplicações, otimizando recursos físicos e aumentando a eficiência da infraestrutura.</p>";
            break;
        case "firewall":
            content = "<h2>Firewall & IDS/IPS</h2><p>Protegem a rede corporativa, monitorando tráfego e prevenindo ataques.</p>";
            break;
        case "servicenow":
            content = "<h2>ServiceNow</h2><p>Plataforma de gestão de serviços de TI, usada para chamados, automação de processos e melhoria da experiência dos colaboradores.</p>";
            break;
    }

    text.innerHTML = content;
    modal.style.display = "flex";
    markClicked(tech);
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Fecha modal clicando fora da janela
window.onclick = function(event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};


// ----------------------
// Expansão dos Cards (Segurança da Informação e Políticas)
// ----------------------
function toggleExpand(id) {
    const element = document.getElementById(id);

    // Fecha outros cards abertos para manter só um expandido
    const allExpands = document.querySelectorAll(".expand");
    allExpands.forEach(exp => {
        if (exp.id !== id) {
            exp.classList.remove("open");
        }
    });

    // Alterna o card clicado
    element.classList.toggle("open");
    markClicked(id);
}


// ----------------------
// Quiz Interativo com pontuação
// ----------------------
const quizData = [
    { question: "O que é MFA?", options: ["A) Um tipo de antivírus", "B) Autenticação multifator", "C) Um sistema de backup", "D) Um software de rede", "E) Nenhuma das anteriores"], correct: 1 },
    { question: "Qual ferramenta é usada para detectar ataques em tempo real?", options: ["A) Rapid7", "B) Zscaler", "C) SentinelOne", "D) BitLocker", "E) ServiceNow"], correct: 2 },
    { question: "O BitLocker serve para:", options: ["A) Criptografar o disco do computador", "B) Fazer backup na nuvem", "C) Monitorar rede", "D) Gerenciar senhas", "E) Bloquear sites"], correct: 0 },
    { question: "Qual é o principal objetivo da KnowBe4?", options: ["A) Treinar colaboradores contra phishing", "B) Gerenciar senhas", "C) Monitorar servidores", "D) Fazer auditoria de rede", "E) Controlar acessos físicos"], correct: 0 },
    { question: "O que deve ser feito em caso de perda ou roubo de notebook corporativo?", options: ["A) Ignorar e comprar outro", "B) Comunicar imediatamente ao gestor/Service Desk", "C) Esperar o sistema bloquear sozinho", "D) Tentar recuperar os dados sozinho", "E) Nenhuma das anteriores"], correct: 1 }
];

let currentQuestion = 0;
let score = 0;
let quizCompleted = false; // flag de conclusão

const startQuiz = document.getElementById("startQuiz");
const quizBox = document.getElementById("quizBox");
let questionEl = document.getElementById("question");
let optionsEl = document.getElementById("options");
let nextBtn = document.getElementById("nextBtn");

startQuiz.addEventListener("click", () => {
    startQuiz.classList.add("hidden");
    quizBox.classList.remove("hidden");
    currentQuestion = 0;
    score = 0;
    loadQuestion();
});

function loadQuestion() {
    const q = quizData[currentQuestion];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = "";
    nextBtn.disabled = true; // só habilita depois de responder
    q.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.addEventListener("click", () => {
            selectOption(index);
            nextBtn.disabled = false; // habilita próximo
        });
        optionsEl.appendChild(btn);
    });
}

function selectOption(index) {
    const q = quizData[currentQuestion];
    const buttons = optionsEl.querySelectorAll("button");
    buttons.forEach(btn => btn.disabled = true);
    if (index === q.correct) {
        buttons[index].style.background = "#22c55e"; // verde
        buttons[index].style.color = "#fff";
        score++;
    } else {
        buttons[index].style.background = "#ef4444"; // vermelho
        buttons[index].style.color = "#fff";
    }
}

nextBtn.addEventListener("click", () => {
    currentQuestion++;
    if (currentQuestion < quizData.length) {
        loadQuestion();
    } else {
        showResult();
    }
});

function showResult() {
    const percentage = Math.round((score / quizData.length) * 100);
    if (percentage >= 70) {
        quizBox.innerHTML = `
            <h3>🎉 Parabéns! Você acertou ${percentage}% das perguntas.</h3>
            <p>Você concluiu o quiz da integração com sucesso!</p>
        `;
        markQuizCompleted(); // libera saída do site
    } else {
        quizBox.innerHTML = `
            <h3>⚠️ Você acertou apenas ${percentage}% das perguntas.</h3>
            <p>É necessário revisar o conteúdo e refazer o questionário.</p>
            <button id="retryBtn" class="next-btn">Refazer Quiz</button>
        `;
        document.getElementById("retryBtn").addEventListener("click", () => {
            // Reinicia o quiz corretamente
            quizBox.classList.add("hidden");
            startQuiz.classList.remove("hidden");
            quizBox.innerHTML = `
                <div id="question"></div>
                <div id="options"></div>
                <button id="nextBtn" class="next-btn">Próxima Pergunta</button>
            `;
            // Reatribui elementos
            questionEl = document.getElementById("question");
            optionsEl = document.getElementById("options");
            nextBtn = document.getElementById("nextBtn");

            // Reaplica evento do botão "Próxima Pergunta"
            nextBtn.addEventListener("click", () => {
                currentQuestion++;
                if (currentQuestion < quizData.length) {
                    loadQuestion();
                } else {
                    showResult();
                }
            });
        });
    }
}

// ----------------------
// Bloqueio de saída até concluir o quiz
// ----------------------
function markQuizCompleted() {
    quizCompleted = true;
}

window.addEventListener("beforeunload", (event) => {
    if (!quizCompleted) {
        event.preventDefault();
        event.returnValue = "⚠️ Você ainda não concluiu o quiz. Finalize antes de sair!";
    }
});
