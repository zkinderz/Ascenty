document.addEventListener("DOMContentLoaded", () => {
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
    "azure","vmware","firewall","servicenow",
    "mfa","ferramentas","bitlocker",
    "politica-notebook","politica-email-internet","politica-privacidade"
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
      if (quizSection) quizSection.classList.remove("locked");
      const startBtn = document.getElementById("startQuiz");
      if (startBtn) startBtn.disabled = false;
      if (warning) warning.style.display = "none";
    } else {
      const missing = requiredIds.filter(id => !clickedIds.has(id));
      if (warning) {
        warning.style.display = "block";
        warning.innerHTML = "⚠️ Você ainda precisa clicar em:<br>" + missing.map(m => `• ${m}`).join("<br>");
      }
    }
  }

 // ----------------------
// Modais interativos
// ----------------------
window.openModal = function(tech) {
  const modal = document.getElementById("modal");
  const text = document.getElementById("modal-text");
  if (!modal || !text) return;

  // monta as chaves de tradução dinamicamente
  const titleKey = `tecnologia_${tech}_title`;
  const textKey = `tecnologia_${tech}_text`;

  let content = "";
  if (translations[currentLang]) {
    const title = translations[currentLang][titleKey] || "";
    const body = translations[currentLang][textKey] || "";
    content = `<h2>${title}</h2><p>${body}</p>`;
  }

  text.innerHTML = content;
  modal.style.display = "flex";
  markClicked(tech);
};

window.closeModal = function() {
  const modal = document.getElementById("modal");
  if (modal) modal.style.display = "none";
};

window.addEventListener("click", (event) => {
  const modal = document.getElementById("modal");
  if (modal && event.target === modal) {
    modal.style.display = "none";
  }
});


  // ----------------------
  // Expansão dos Cards
  // ----------------------
  window.toggleExpand = function(id) {
    const element = document.getElementById(id);
    if (!element) return;

    document.querySelectorAll(".expand").forEach(exp => {
      if (exp.id !== id) exp.classList.remove("open");
    });

    element.classList.toggle("open");
    markClicked(id);
  };

  // ----------------------
  // Quiz Interativo
  // ----------------------
  const quizData = [
    { question: "O que é MFA?", options: ["A) Antivírus","B) Autenticação multifator","C) Backup","D) Rede","E) Nenhuma"], correct: 1 },
    { question: "Ferramenta para detectar ataques?", options: ["A) Rapid7","B) Zscaler","C) SentinelOne","D) BitLocker","E) ServiceNow"], correct: 2 },
    { question: "BitLocker serve para:", options: ["A) Criptografar disco","B) Backup","C) Monitorar rede","D) Senhas","E) Bloquear sites"], correct: 0 },
    { question: "Objetivo da KnowBe4?", options: ["A) Treinar contra phishing","B) Gerenciar senhas","C) Monitorar servidores","D) Auditoria","E) Acessos físicos"], correct: 0 },
    { question: "Perda de notebook corporativo?", options: ["A) Ignorar","B) Comunicar gestor/Service Desk","C) Esperar bloqueio","D) Recuperar sozinho","E) Nenhuma"], correct: 1 }
  ];

  let currentQuestion = 0;
  let score = 0;
  let quizCompleted = false;

  const startQuiz = document.getElementById("startQuiz");
  const quizBox = document.getElementById("quizBox");
  let questionEl = document.getElementById("question");
  let optionsEl = document.getElementById("options");
  let nextBtn = document.getElementById("nextBtn");

  if (startQuiz) {
    startQuiz.addEventListener("click", () => {
      startQuiz.classList.add("hidden");
      quizBox.classList.remove("hidden");
      currentQuestion = 0;
      score = 0;
      loadQuestion();
    });
  }

  function loadQuestion() {
    const q = quizData[currentQuestion];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = "";
    nextBtn.disabled = true;
    q.options.forEach((opt, index) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        selectOption(index);
        nextBtn.disabled = false;
      });
      optionsEl.appendChild(btn);
    });
  }

  function selectOption(index) {
    const q = quizData[currentQuestion];
    const buttons = optionsEl.querySelectorAll("button");
    buttons.forEach(btn => btn.disabled = true);
    if (index === q.correct) {
      buttons[index].style.background = "#22c55e";
      buttons[index].style.color = "#fff";
      score++;
    } else {
      buttons[index].style.background = "#ef4444";
      buttons[index].style.color = "#fff";
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentQuestion++;
      if (currentQuestion < quizData.length) {
        loadQuestion();
      } else {
        showResult();
      }
    });
  }

  function showResult() {
    const percentage = Math.round((score / quizData.length) * 100);
    if (percentage >= 70) {
      quizBox.innerHTML = `<h3>🎉 Parabéns! Você acertou ${percentage}%.</h3><p>Quiz concluído com sucesso!</p>`;
      markQuizCompleted();
    } else {
      quizBox.innerHTML = `<h3>⚠️ Você acertou ${percentage}%.</h3><p>Revise o conteúdo e refaça.</p><button id="retryBtn" class="next-btn">Refazer Quiz</button>`;
      const retryBtn = document.getElementById("retryBtn");
      retryBtn.addEventListener("click", () => {
        quizBox.classList.add("hidden");
        startQuiz.classList.remove("hidden");
        quizBox.innerHTML = `<div id="question"></div><div id="options"></div><button id="nextBtn" class="next-btn">Próxima Pergunta</button>`;
        questionEl = document.getElementById("question");
        optionsEl = document.getElementById("options");
        nextBtn = document.getElementById("nextBtn");
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

  function markQuizCompleted() {
    quizCompleted = true;
  }

  window.addEventListener("beforeunload", (event) => {
    if (!quizCompleted) {
      event.preventDefault();
      event.returnValue = "⚠️ Você ainda não concluiu o quiz. Finalize antes de sair!";
    }
  });
});

// js/script.js

let translations = {};
let currentLang = "pt"; // padrão: português

// Carrega o arquivo lang.json
async function loadTranslations() {
  try {
    const response = await fetch("js/lang.json");
    translations = await response.json();
    applyTranslations(currentLang); // aplica o idioma padrão
  } catch (error) {
    console.error("Erro ao carregar traduções:", error);
  }
}

// Aplica as traduções no HTML
function applyTranslations(lang) {
  currentLang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    } else {
      el.textContent = ""; // limpa se não achar tradução
    }
  });
}

// Listener para troca de idioma
document.getElementById("langSwitcher").addEventListener("change", (e) => {
  applyTranslations(e.target.value);
});

// Inicializa ao carregar a página
document.addEventListener("DOMContentLoaded", loadTranslations);
