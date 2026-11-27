document.addEventListener("DOMContentLoaded", () => {

    // Calculadora: escolhe uma fórmula e calcula qualquer variável a partir das outras
    const formulaList = document.getElementById("calc-formulas");
    if (!formulaList) return;

    const { prefixes, formatSI, formatNumber, parseNumber, storage, escapeHTML } = window.PhysicsUtils;

    const targetContainer = document.getElementById("calc-targets");
    const inputsContainer = document.getElementById("calc-inputs");
    const formulaTitle = document.getElementById("calc-formula-title");
    const formulaExpr = document.getElementById("calc-formula-expr");
    const resultValue = document.getElementById("calc-result-value");
    const resultLabel = document.getElementById("calc-result-label");
    const stepsBox = document.getElementById("calc-steps");
    const historyList = document.getElementById("calc-history");
    const clearHistoryButton = document.getElementById("calc-clear-history");

    // As fórmulas ficam em js/data/formulas.js (testadas em tests/formulas.test.js)
    const formulas = window.PhysicsLabFormulas;

    // Histórico salvo no navegador e qual fórmula/variável está selecionada
    const historyStore = storage("physicslab.calc.history", []);
    let history = historyStore.load();
    let current = formulas[0];
    let target = Object.keys(current.vars)[0];
    const inputValues = {};

    // Monta a lista de fórmulas na lateral, separada por área
    function renderFormulaList() {
        let lastArea = "";
        formulaList.innerHTML = formulas.map(f => {
            const heading = f.area !== lastArea ? `<span class="calc-area-label">${f.area}</span>` : "";
            lastArea = f.area;
            return `
                ${heading}
                <button class="calc-formula-item ${f.id === current.id ? "active" : ""}" data-formula="${f.id}">
                    <strong>${f.name}</strong>
                    <span>${f.expr}</span>
                </button>
            `;
        }).join("");
    }

    // Botões pra escolher qual variável calcular
    function renderTargets() {
        targetContainer.innerHTML = Object.entries(current.vars).map(([key, meta]) => `
            <button class="calc-target ${key === target ? "active" : ""}" data-target="${key}">
                ${meta.label}
            </button>
        `).join("");
    }

    // Caixinha de prefixo (k, m, µ...) do lado de cada campo
    function prefixOptions(meta) {
        if (meta.angle || meta.noPrefix) return "";
        return `
            <select class="calc-prefix" aria-label="Prefixo da unidade">
                ${prefixes.map(p => `
                    <option value="${p.factor}" ${p.factor === 1 ? "selected" : ""}>${p.symbol}${meta.unit}</option>
                `).join("")}
            </select>
        `;
    }

    // Cria os campos só das variáveis conhecidas (a que vai ser calculada fica de fora)
    function renderInputs() {
        inputsContainer.innerHTML = Object.entries(current.vars)
            .filter(([key]) => key !== target)
            .map(([key, meta]) => {
                const saved = inputValues[`${current.id}.${key}`] ?? "";
                const unitBadge = meta.angle || meta.noPrefix
                    ? `<span class="calc-unit">${meta.unit}</span>`
                    : "";
                return `
                    <div class="calc-input" data-var="${key}">
                        <label>${meta.label}</label>
                        <div class="calc-input-row">
                            <input type="text" inputmode="decimal" placeholder="0" value="${escapeHTML(saved)}">
                            ${prefixOptions(meta)}${unitBadge}
                        </div>
                    </div>
                `;
            }).join("");

        formulaTitle.textContent = current.name;
        formulaExpr.textContent = current.expr;
        resultLabel.textContent = `${current.vars[target].label.toUpperCase()} CALCULADO(A)`;
        calculate();
    }

    // Mostra o histórico dos últimos cálculos
    function renderHistory() {
        if (history.length === 0) {
            historyList.innerHTML = `<li class="calc-history-empty">Nenhum cálculo ainda. Os resultados aparecem aqui.</li>`;
            clearHistoryButton.hidden = true;
            return;
        }

        clearHistoryButton.hidden = false;
        historyList.innerHTML = history.map(item => `
            <li>
                <span>${escapeHTML(item.formula)}</span>
                <strong>${escapeHTML(item.result)}</strong>
            </li>
        `).join("");
    }

    // Lê os campos e já multiplica pelo prefixo, deixando tudo no SI
    function readValues() {
        const values = {};
        const missing = [];

        inputsContainer.querySelectorAll(".calc-input").forEach(group => {
            const key = group.dataset.var;
            const input = group.querySelector("input");
            const prefix = group.querySelector(".calc-prefix");
            const raw = parseNumber(input.value);

            inputValues[`${current.id}.${key}`] = input.value;
            input.classList.toggle("invalid", input.value.trim() !== "" && Number.isNaN(raw));

            if (Number.isNaN(raw)) {
                missing.push(current.vars[key].label);
                return;
            }

            values[key] = raw * (prefix ? Number(prefix.value) : 1);
        });

        return { values, missing };
    }

    function showMessage(message) {
        resultValue.textContent = "—";
        resultValue.classList.remove("error");
        stepsBox.innerHTML = `<p class="calc-hint">${message}</p>`;
    }

    // Usa a fórmula isolada da variável escolhida e mostra o passo a passo
    function calculate() {
        const { values, missing } = readValues();

        if (missing.length > 0) {
            showMessage(`Preencha: ${missing.join(", ")}.`);
            return null;
        }

        const outcome = current.solve[target](values);

        if (outcome.error || !Number.isFinite(outcome.value)) {
            resultValue.textContent = "Indefinido";
            resultValue.classList.add("error");
            stepsBox.innerHTML = `<p class="calc-hint">${outcome.error || "Divisão por zero ou combinação de valores inválida. Verifique os dados."}</p>`;
            return null;
        }

        const meta = current.vars[target];
        const formatted = meta.angle
            ? `${formatNumber(outcome.value, 2)}°`
            : meta.noPrefix
                ? `${formatNumber(outcome.value, 2)} ${meta.unit}`
                : formatSI(outcome.value, meta.unit);

        resultValue.textContent = formatted;
        resultValue.classList.remove("error");

        const given = Object.entries(values).map(([key, value]) => {
            const m = current.vars[key];
            const shown = m.angle ? `${formatNumber(value)}°` : `${formatNumber(value)} ${m.unit}`;
            return `<li><span>${m.label}</span><strong>${shown}</strong></li>`;
        }).join("");

        stepsBox.innerHTML = `
            <div class="calc-step"><span>1</span><div>Dados convertidos para o SI:<ul>${given}</ul></div></div>
            <div class="calc-step"><span>2</span><div>Isolando a incógnita:<div class="formula">${outcome.expr}</div></div></div>
            <div class="calc-step"><span>3</span><div>Resultado: <strong>${formatted}</strong>${outcome.note ? `<p class="calc-note">${outcome.note}</p>` : ""}</div></div>
        `;

        return { formatted };
    }

    // Guarda o resultado no histórico (no máximo 8)
    function saveToHistory() {
        const result = calculate();
        if (!result) return;

        const entry = {
            formula: `${current.name} · ${current.vars[target].label}`,
            result: result.formatted
        };

        if (history[0] && history[0].formula === entry.formula && history[0].result === entry.result) return;

        history = [entry, ...history].slice(0, 8);
        historyStore.save(history);
        renderHistory();
    }

    // Clicou numa fórmula: troca a fórmula atual
    formulaList.addEventListener("click", event => {
        const button = event.target.closest("[data-formula]");
        if (!button) return;
        current = formulas.find(f => f.id === button.dataset.formula);
        target = Object.keys(current.vars)[0];
        renderFormulaList();
        renderTargets();
        renderInputs();
    });

    // Clicou numa variável: passa a calcular ela
    targetContainer.addEventListener("click", event => {
        const button = event.target.closest("[data-target]");
        if (!button) return;
        target = button.dataset.target;
        renderTargets();
        renderInputs();
    });

    // Calcula enquanto digita; Enter ou o botão salvam no histórico
    inputsContainer.addEventListener("input", calculate);
    inputsContainer.addEventListener("change", calculate);

    document.getElementById("calc-save").addEventListener("click", saveToHistory);

    inputsContainer.addEventListener("keydown", event => {
        if (event.key === "Enter") saveToHistory();
    });

    clearHistoryButton.addEventListener("click", () => {
        history = [];
        historyStore.save(history);
        renderHistory();
    });

    renderFormulaList();
    renderTargets();
    renderInputs();
    renderHistory();
});
