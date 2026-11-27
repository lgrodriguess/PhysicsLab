// Recursos de sala de aula e de estudo:
// - cenários prontos em cada simulador (um clique monta a situação)
// - guia de estudo (aluno) com dicas para o professor
// - modo projetor e tela cheia
document.addEventListener("DOMContentLoaded", () => {

    const { escapeHTML, storage } = window.PhysicsUtils;

    // Textos dos guias e cenários ficam em js/data/guides.js
    const GUIDES = window.PhysicsLabGuides || {};

    // ------------------------------------------------------------------
    // Aplicar um cenário: escreve nos campos e avisa o simulador
    // (dispara os mesmos eventos que o usuário dispararia)
    // ------------------------------------------------------------------
    function applyScenario(pageId, scenario) {
        if (scenario.circuit) {
            const button = document.querySelector(`.circuit-type[data-circuit="${scenario.circuit}"]`);
            if (button) button.click();
        }

        for (const [id, value] of Object.entries(scenario.values)) {
            const field = document.getElementById(id);
            if (!field) continue;
            field.value = value;
            const eventName = field.tagName === "SELECT" ? "change" : "input";
            field.dispatchEvent(new Event(eventName, { bubbles: true }));
        }

        // Marca o cenário ativo e mostra o que observar
        const bar = document.querySelector(`.learn-bar[data-page="${pageId}"]`);
        if (bar) {
            bar.querySelectorAll(".scenario-chip").forEach(chip => {
                const active = chip.dataset.scenario === scenario.id;
                chip.classList.toggle("active", active);
                if (active) chip.title = "Clique de novo para voltar aos valores padrão";
                else chip.removeAttribute("title");
            });
            const observe = bar.querySelector(".scenario-observe");
            observe.innerHTML = `<strong>O que observar:</strong> ${escapeHTML(scenario.observe)}`;
            observe.hidden = false;
        }
    }

    // Volta o simulador aos valores iniciais usando o próprio botão "Restaurar" dele
    const RESET_BUTTONS = {
        circuits: "reset-circuit",
        magnetism: "mag-reset",
        induction: "induction-reset",
        electrostatics: "es-reset",
        capacitors: "cap-reset"
    };

    function resetToDefaults(pageId) {
        // O circuito padrão é em série (o "Restaurar" dele não muda o tipo)
        if (pageId === "circuits") {
            const series = document.querySelector('.circuit-type[data-circuit="series"]');
            if (series) series.click();
        }

        // O clique no "Restaurar" também desmarca o cenário (ver listener abaixo)
        const resetButton = document.getElementById(RESET_BUTTONS[pageId]);
        if (resetButton) resetButton.click();
    }

    // Se o usuário mexer em algum parâmetro, o cenário deixa de valer
    function clearActiveScenario(pageId) {
        const bar = document.querySelector(`.learn-bar[data-page="${pageId}"]`);
        if (!bar) return;
        bar.querySelectorAll(".scenario-chip.active").forEach(chip => {
            chip.classList.remove("active");
            chip.removeAttribute("title");
        });
    }

    // ------------------------------------------------------------------
    // Barra de cenários no topo de cada simulador
    // ------------------------------------------------------------------
    for (const [pageId, guide] of Object.entries(GUIDES)) {
        const page = document.getElementById(pageId);
        const heading = page && page.querySelector(".page-heading");
        if (!heading) continue;

        const bar = document.createElement("div");
        bar.className = "learn-bar";
        bar.dataset.page = pageId;
        bar.innerHTML = `
            <div class="learn-bar-head">
                <div>
                    <span class="eyebrow">CENÁRIOS PRONTOS</span>
                    <p>Escolha uma situação para montar a simulação com um clique.</p>
                </div>
                <button class="guide-button" type="button" data-guide="${pageId}">
                    <span aria-hidden="true">📘</span> Guia de estudo
                </button>
            </div>
            <div class="scenario-chips">
                ${guide.scenarios.map((s, i) => `
                    <button class="scenario-chip" type="button" data-scenario="${s.id}">
                        <span class="scenario-number">${i + 1}</span>${escapeHTML(s.label)}
                    </button>`).join("")}
            </div>
            <p class="scenario-observe" hidden></p>
        `;
        heading.after(bar);

        bar.addEventListener("click", event => {
            const chip = event.target.closest(".scenario-chip");
            if (!chip) return;

            // Clicar de novo no cenário que já está ativo volta aos valores padrão
            if (chip.classList.contains("active")) {
                resetToDefaults(pageId);
                return;
            }

            const scenario = guide.scenarios.find(s => s.id === chip.dataset.scenario);
            if (scenario) applyScenario(pageId, scenario);
        });

        // "Restaurar valores" desmarca o cenário e esconde o "O que observar"
        const resetButton = document.getElementById(RESET_BUTTONS[pageId]);
        if (resetButton) {
            resetButton.addEventListener("click", () => {
                clearActiveScenario(pageId);
                bar.querySelector(".scenario-observe").hidden = true;
            });
        }

        // Mudança feita à mão pelo usuário (evento "confiável") limpa o cenário ativo
        page.addEventListener("input", event => {
            if (event.isTrusted && !bar.contains(event.target)) clearActiveScenario(pageId);
        });
        page.addEventListener("change", event => {
            if (event.isTrusted && !bar.contains(event.target)) clearActiveScenario(pageId);
        });
    }

    // ------------------------------------------------------------------
    // Guia de estudo (painel lateral)
    // ------------------------------------------------------------------
    const overlay = document.createElement("div");
    overlay.className = "guide-overlay";
    overlay.hidden = true;

    const drawer = document.createElement("aside");
    drawer.className = "guide-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-labelledby", "guide-title");
    drawer.hidden = true;

    document.body.append(overlay, drawer);

    let openPage = null;
    let lastFocus = null;

    const list = items => `<ul>${items.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;

    function renderGuide(pageId) {
        const guide = GUIDES[pageId];
        drawer.innerHTML = `
            <header class="guide-header">
                <div>
                    <span class="eyebrow">GUIA DE ESTUDO</span>
                    <h2 id="guide-title">${escapeHTML(guide.title)}</h2>
                </div>
                <button class="guide-close" type="button" aria-label="Fechar guia">✕</button>
            </header>

            <div class="guide-body">
                <section class="guide-section">
                    <h3>🎯 O que você vai aprender</h3>
                    ${list(guide.goals)}
                </section>

                <section class="guide-section">
                    <h3>🧪 Explore passo a passo</h3>
                    <p class="guide-hint">Antes de cada passo, tente <strong>prever</strong> o que vai acontecer. Depois <strong>observe</strong> e tente <strong>explicar</strong>.</p>
                    <ol class="guide-steps">
                        ${guide.scenarios.map(s => `
                            <li>
                                <div>
                                    <strong>${escapeHTML(s.label)}</strong>
                                    <p>${escapeHTML(s.observe)}</p>
                                </div>
                                <button class="guide-apply" type="button" data-scenario="${s.id}">Aplicar</button>
                            </li>`).join("")}
                    </ol>
                </section>

                <section class="guide-section">
                    <h3>💬 Pense e responda</h3>
                    <div class="guide-questions">
                        ${guide.questions.map(item => `
                            <details class="guide-question">
                                <summary>${escapeHTML(item.q)}</summary>
                                <p>${escapeHTML(item.a)}</p>
                            </details>`).join("")}
                    </div>
                </section>

                <section class="guide-section">
                    <h3>⚠️ Erros comuns</h3>
                    ${list(guide.mistakes)}
                </section>

                <details class="guide-section guide-teacher">
                    <summary><h3>👩‍🏫 Dicas para o professor</h3></summary>
                    ${list(guide.teacher)}
                </details>
            </div>
        `;
    }

    function openGuide(pageId) {
        if (!GUIDES[pageId]) return;
        lastFocus = document.activeElement;
        openPage = pageId;
        renderGuide(pageId);
        overlay.hidden = false;
        drawer.hidden = false;
        document.body.classList.add("guide-open");
        drawer.querySelector(".guide-close").focus();
    }

    function closeGuide() {
        if (drawer.hidden) return;
        overlay.hidden = true;
        drawer.hidden = true;
        document.body.classList.remove("guide-open");
        openPage = null;
        if (lastFocus) lastFocus.focus();
    }

    document.addEventListener("click", event => {
        const opener = event.target.closest("[data-guide]");
        if (opener) openGuide(opener.dataset.guide);
    });

    overlay.addEventListener("click", closeGuide);

    drawer.addEventListener("click", event => {
        if (event.target.closest(".guide-close")) {
            closeGuide();
            return;
        }
        const apply = event.target.closest(".guide-apply");
        if (apply && openPage) {
            const pageId = openPage;
            const scenario = GUIDES[pageId].scenarios.find(s => s.id === apply.dataset.scenario);
            closeGuide();
            if (scenario) {
                applyScenario(pageId, scenario);
                const bar = document.querySelector(`.learn-bar[data-page="${pageId}"]`);
                if (bar) bar.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeGuide();
    });

    // Trocar de página fecha o guia
    window.addEventListener("popstate", closeGuide);
    document.addEventListener("click", event => {
        if (event.target.closest(".nav-item[data-page]")) closeGuide();
    });

    // ------------------------------------------------------------------
    // Modo projetor e tela cheia
    // ------------------------------------------------------------------
    const projectorPref = storage("physicslab.projector", false);
    const projectorButton = document.getElementById("projector-toggle");
    const fullscreenButton = document.getElementById("fullscreen-toggle");

    function setProjector(on) {
        document.body.classList.toggle("projector", on);
        if (projectorButton) {
            projectorButton.setAttribute("aria-pressed", String(on));
            projectorButton.classList.toggle("active", on);
        }
        projectorPref.save(on);
    }

    if (projectorButton) {
        projectorButton.addEventListener("click", () => {
            setProjector(!document.body.classList.contains("projector"));
        });
    }
    setProjector(projectorPref.load() === true);

    const canFullscreen = document.fullscreenEnabled && document.documentElement.requestFullscreen;

    if (fullscreenButton) {
        if (!canFullscreen) {
            fullscreenButton.hidden = true;
        } else {
            fullscreenButton.addEventListener("click", () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen().catch(() => {});
                }
            });
            document.addEventListener("fullscreenchange", () => {
                const on = Boolean(document.fullscreenElement);
                fullscreenButton.setAttribute("aria-pressed", String(on));
                fullscreenButton.classList.toggle("active", on);
                fullscreenButton.querySelector(".tool-label").textContent = on ? "Sair da tela cheia" : "Tela cheia";
            });
        }
    }
});
