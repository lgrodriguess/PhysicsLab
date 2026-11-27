document.addEventListener("DOMContentLoaded", () => {

    // Exercícios: questões numéricas sorteadas e questões conceituais
    const card = document.getElementById("exercise-card");
    if (!card) return;

    const { parseNumber, pick, shuffle, storage, escapeHTML } = window.PhysicsUtils;
    const { generators, conceptual, fmt } = window.PhysicsLabExerciseBank;

    const topicButtons = document.querySelectorAll(".exercise-topic");
    const tagEl = document.getElementById("exercise-tag");
    const typeEl = document.getElementById("exercise-type");
    const statementEl = document.getElementById("exercise-statement");
    const answerArea = document.getElementById("exercise-answer");
    const feedbackEl = document.getElementById("exercise-feedback");
    const checkButton = document.getElementById("exercise-check");
    const nextButton = document.getElementById("exercise-next");
    const hintButton = document.getElementById("exercise-hint");
    const hintBox = document.getElementById("exercise-hint-box");

    const statCorrect = document.getElementById("stat-correct");
    const statTotal = document.getElementById("stat-total");
    const statAccuracy = document.getElementById("stat-accuracy");
    const statStreak = document.getElementById("stat-streak");
    const statBest = document.getElementById("stat-best");
    const topicStatsEl = document.getElementById("exercise-topic-stats");
    const resetStatsButton = document.getElementById("exercise-reset-stats");

    const topicNames = {
        electrostatics: "Eletrostática",
        capacitors: "Capacitores",
        circuits: "Circuitos",
        magnetism: "Magnetismo",
        induction: "Indução"
    };

    // Estatísticas salvas no navegador (acertos, total, sequência e por tema)
    const statsStore = storage("physicslab.exercises.stats", null);
    const emptyStats = () => ({
        correct: 0,
        total: 0,
        streak: 0,
        best: 0,
        byTopic: {
            electrostatics: { correct: 0, total: 0 },
            capacitors: { correct: 0, total: 0 },
            circuits: { correct: 0, total: 0 },
            magnetism: { correct: 0, total: 0 },
            induction: { correct: 0, total: 0 }
        }
    });

    let stats = (() => {
        const saved = statsStore.load();
        if (!saved) return emptyStats();
        const fresh = emptyStats();
        return { ...fresh, ...saved, byTopic: { ...fresh.byTopic, ...saved.byTopic } };
    })();
    let activeTopic = "all";
    let question = null;
    let answered = false;
    let lastKey = "";

    // Atualiza os números e as barrinhas de desempenho por tema
    function updateStats() {
        statCorrect.textContent = stats.correct;
        statTotal.textContent = stats.total;
        statAccuracy.textContent = stats.total ? `${Math.round(stats.correct / stats.total * 100)}%` : "—";
        statStreak.textContent = stats.streak;
        statBest.textContent = stats.best;

        topicStatsEl.innerHTML = Object.entries(stats.byTopic).map(([topic, s]) => {
            const pct = s.total ? Math.round(s.correct / s.total * 100) : 0;
            return `
                <div class="topic-stat">
                    <div class="topic-stat-head">
                        <span>${topicNames[topic]}</span>
                        <strong>${s.correct}/${s.total}</strong>
                    </div>
                    <div class="topic-stat-bar"><i class="${topic}" style="width:${pct}%"></i></div>
                </div>
            `;
        }).join("");
    }

    // Sorteia uma questão do tema escolhido (60% numérica, 40% conceitual), sem repetir a anterior
    function newQuestion() {
        const numeric = generators.filter(g => activeTopic === "all" || g.topic === activeTopic);
        const concepts = conceptual.filter(c => activeTopic === "all" || c.topic === activeTopic);

        let candidate;
        let key;
        let attempts = 0;

        do {
            if (Math.random() < 0.6) {
                const gen = pick(numeric);
                candidate = { kind: "numeric", topic: gen.topic, ...gen.build() };
                key = "";
            } else {
                const item = pick(concepts);
                const order = shuffle(item.options.map((_, i) => i));
                candidate = {
                    kind: "choice",
                    ...item,
                    options: order.map(i => item.options[i]),
                    correct: order.indexOf(item.correct)
                };
                key = item.statement;
            }
            attempts++;
        } while (key && key === lastKey && attempts < 5);

        lastKey = key;
        question = candidate;
        answered = false;
        renderQuestion();
    }

    // Mostra a questão: campo de resposta (numérica) ou alternativas embaralhadas (conceitual)
    function renderQuestion() {
        tagEl.textContent = topicNames[question.topic];
        tagEl.className = `theory-area ${{ electrostatics: "green", capacitors: "teal", circuits: "blue", magnetism: "purple", induction: "orange" }[question.topic]}`;
        typeEl.textContent = question.kind === "numeric" ? "Questão numérica" : "Questão conceitual";
        statementEl.innerHTML = question.statement;
        feedbackEl.hidden = true;
        feedbackEl.className = "exercise-feedback";
        hintBox.hidden = true;
        hintButton.hidden = question.kind !== "numeric";
        checkButton.hidden = false;
        checkButton.disabled = false;

        if (question.kind === "numeric") {
            hintBox.textContent = question.hint;
            answerArea.innerHTML = `
                <label class="exercise-input">
                    <span>Sua resposta</span>
                    <div class="calc-input-row">
                        <input type="text" inputmode="decimal" id="exercise-value" placeholder="Ex.: 12,5" autocomplete="off">
                        <span class="calc-unit">${question.unit}</span>
                    </div>
                </label>
            `;
            const input = document.getElementById("exercise-value");
            input.addEventListener("keydown", event => {
                if (event.key === "Enter") {
                    answered ? newQuestion() : checkAnswer();
                }
            });
            input.focus({ preventScroll: true });
        } else {
            answerArea.innerHTML = `
                <div class="exercise-options">
                    ${question.options.map((opt, i) => `
                        <button class="exercise-option" data-option="${i}">
                            <span>${String.fromCharCode(65 + i)}</span>${escapeHTML(opt)}
                        </button>
                    `).join("")}
                </div>
            `;
        }
    }

    // Conta o acerto/erro e atualiza a sequência
    function register(isCorrect) {
        stats.total++;
        stats.byTopic[question.topic].total++;

        if (isCorrect) {
            stats.correct++;
            stats.byTopic[question.topic].correct++;
            stats.streak++;
            stats.best = Math.max(stats.best, stats.streak);
        } else {
            stats.streak = 0;
        }

        statsStore.save(stats);
        updateStats();
    }

    // Mostra se acertou e a resolução
    function showFeedback(isCorrect, bodyHTML) {
        feedbackEl.hidden = false;
        feedbackEl.classList.add(isCorrect ? "correct" : "wrong");
        feedbackEl.innerHTML = `
            <strong>${isCorrect ? "✓ Resposta correta!" : "✗ Não foi dessa vez."}</strong>
            ${bodyHTML}
        `;
        checkButton.hidden = true;
        hintButton.hidden = true;
        answered = true;
    }

    // Corrige a questão numérica aceitando uma margem de ±2%
    function checkAnswer() {
        if (answered || !question) return;

        if (question.kind === "numeric") {
            const input = document.getElementById("exercise-value");
            const value = parseNumber(input.value);

            if (Number.isNaN(value)) {
                input.classList.add("invalid");
                input.focus();
                return;
            }

            input.classList.remove("invalid");
            input.disabled = true;

            const tolerance = question.tolerance ?? 0.02;
            const isCorrect = Math.abs(value - question.answer) <= Math.abs(question.answer) * tolerance + 1e-9;

            register(isCorrect);
            showFeedback(isCorrect, `
                <p>Resposta esperada: <b>${fmt(question.answer, 3)} ${question.unit}</b> (tolerância de ±${Math.round(tolerance * 100)}%).</p>
                <ol class="exercise-solution">${question.solution.map(step => `<li>${step}</li>`).join("")}</ol>
            `);
        }
    }

    // Corrige a questão conceitual quando clica numa alternativa
    answerArea.addEventListener("click", event => {
        const option = event.target.closest("[data-option]");
        if (!option || answered || question.kind !== "choice") return;

        const chosen = Number(option.dataset.option);
        const isCorrect = chosen === question.correct;

        answerArea.querySelectorAll(".exercise-option").forEach((button, i) => {
            button.disabled = true;
            if (i === question.correct) button.classList.add("correct");
            if (i === chosen && !isCorrect) button.classList.add("wrong");
        });

        register(isCorrect);
        showFeedback(isCorrect, `<p>${escapeHTML(question.explanation)}</p>`);
    });

    checkButton.addEventListener("click", checkAnswer);
    nextButton.addEventListener("click", newQuestion);
    hintButton.addEventListener("click", () => {
        hintBox.hidden = !hintBox.hidden;
    });

    // Filtro por tema
    topicButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeTopic = button.dataset.topic;
            topicButtons.forEach(b => b.classList.toggle("active", b === button));
            newQuestion();
        });
    });

    // Zerar estatísticas (pede pra clicar duas vezes pra confirmar)
    resetStatsButton.addEventListener("click", () => {
        if (resetStatsButton.dataset.confirm !== "1") {
            resetStatsButton.dataset.confirm = "1";
            resetStatsButton.textContent = "Clique de novo para confirmar";
            setTimeout(() => {
                resetStatsButton.dataset.confirm = "";
                resetStatsButton.textContent = "↻ Zerar estatísticas";
            }, 3000);
            return;
        }
        resetStatsButton.dataset.confirm = "";
        resetStatsButton.textContent = "↻ Zerar estatísticas";
        stats = emptyStats();
        statsStore.save(stats);
        updateStats();
    });

    updateStats();
    newQuestion();
});
