document.addEventListener("DOMContentLoaded", () => {

    const COLORS = window.PhysicsUtils.colors;
    // Campos de entrada e resultados do módulo de indução
    const fieldInitialInput = document.getElementById("induction-field-initial");
    const fieldFinalInput = document.getElementById("induction-field-final");
    const areaInput = document.getElementById("induction-area");
    const turnsInput = document.getElementById("induction-turns");
    const timeInput = document.getElementById("induction-time");
    const angleInitialInput = document.getElementById("induction-angle-initial");
    const angleFinalInput = document.getElementById("induction-angle-final");
    const resetButton = document.getElementById("induction-reset");

    const fluxInitialResult = document.getElementById("induction-flux-initial");
    const fluxFinalResult = document.getElementById("induction-flux-final");
    const fluxChangeResult = document.getElementById("induction-flux-change");
    const emfResult = document.getElementById("induction-emf");
    const explanation = document.getElementById("induction-explanation");

    const scene = document.getElementById("induction-scene");

    const defaults = {
        fieldInitial: 0.5,
        fieldFinal: 1,
        area: 0.01,
        turns: 10,
        time: 2,
        angleInitial: 0,
        angleFinal: 60
    };

    // Formatação de números compartilhada (vírgula decimal e notação científica)
    const formatNumber = value => window.PhysicsUtils.formatNumber(value, 6);

    // Calcula o fluxo e a FEM induzida
    function calculate() {
        const fieldInitial = Number(fieldInitialInput.value);
        const fieldFinal = Number(fieldFinalInput.value);
        const area = Number(areaInput.value);
        const turns = Number(turnsInput.value);
        const time = Number(timeInput.value);
        const angleInitial = Number(angleInitialInput.value);
        const angleFinal = Number(angleFinalInput.value);

        const values = [
            fieldInitial,
            fieldFinal,
            area,
            turns,
            time,
            angleInitial,
            angleFinal
        ];

        // Confere se nenhum campo está vazio ou fora do limite
        if (values.some(value => !Number.isFinite(value)) ||
            values.some((value, index) => {
                const input = [
                    fieldInitialInput,
                    fieldFinalInput,
                    areaInput,
                    turnsInput,
                    timeInput,
                    angleInitialInput,
                    angleFinalInput
                ][index];

                return input.value.trim() === "";
            }) ||
            fieldInitial < 0 || fieldInitial > 5 ||
            fieldFinal < 0 || fieldFinal > 5 ||
            area < 0.0001 || area > 1 ||
            turns < 1 || turns > 1000 ||
            !Number.isInteger(turns) ||
            time <= 0 || time > 1000 ||
            angleInitial < 0 || angleInitial > 180 ||
            angleFinal < 0 || angleFinal > 180) {
            explanation.textContent = "Informe valores válidos dentro dos limites indicados nos campos.";
            return;
        }

        // Área já em m²; só converte graus -> radianos
        const areaM2 = area;
        const initialRadians = angleInitial * Math.PI / 180;
        const finalRadians = angleFinal * Math.PI / 180;

        // Φ = B · A · cos(θ)
        const fluxInitial = fieldInitial * areaM2 * Math.cos(initialRadians);
        const fluxFinal = fieldFinal * areaM2 * Math.cos(finalRadians);
        // Ignora o "ruído" de ponto flutuante (ex.: 0,005 − 0,005 dando 1e-19)
        let fluxChange = fluxFinal - fluxInitial;
        if (Math.abs(fluxChange) <= 1e-9 * Math.max(Math.abs(fluxInitial), Math.abs(fluxFinal))) {
            fluxChange = 0;
        }
        // Lei de Faraday-Lenz: ε = -N · ΔΦ / Δt
        const emf = -turns * fluxChange / time;

        fluxInitialResult.textContent = `${formatNumber(fluxInitial)} Wb`;
        fluxFinalResult.textContent = `${formatNumber(fluxFinal)} Wb`;
        fluxChangeResult.textContent = `${formatNumber(fluxChange)} Wb`;
        emfResult.textContent = `${formatNumber(emf)} V`;

        // Explicação pela Lei de Lenz + regra da mão direita
        if (fluxChange > 0) {
            explanation.textContent = "O fluxo magnético aumentou. Pela Lei de Lenz, a corrente induzida cria um campo (B induzido, roxo) contra o aumento, ou seja, oposto à normal n. Pela regra da mão direita: com o polegar apontando no sentido do B induzido, os dedos dobrados mostram o sentido da corrente na espira (setas laranja).";
        } else if (fluxChange < 0) {
            explanation.textContent = "O fluxo magnético diminuiu. Pela Lei de Lenz, a corrente induzida cria um campo (B induzido, roxo) que tenta repor o fluxo perdido, no mesmo sentido da normal n. Pela regra da mão direita: com o polegar apontando no sentido do B induzido, os dedos dobrados mostram o sentido da corrente na espira (setas laranja).";
        } else {
            explanation.textContent = "O fluxo magnético não variou (o campo e o ângulo mudaram, mas compensaram um ao outro). Sem variação de fluxo, não há força eletromotriz nem corrente induzida.";
        }

        drawScene({
            fieldInitial, fieldFinal,
            angleInitial, angleFinal,
            fluxInitial, fluxFinal, fluxChange,
            time
        });
    }

    // ---------------- Desenho ----------------
    const BLUE = COLORS.blue;
    const ORANGE = COLORS.orange;
    const PURPLE = COLORS.purple;
    const GRAY = COLORS.textMuted;

    const f1 = n => n.toFixed(1);

    function arrow(x1, y1, x2, y2, color, width = 2.5, opts = {}) {
        const ang = Math.atan2(y2 - y1, x2 - x1);
        const h = opts.head || 10;
        const w = h * 0.55;
        const bx = x2 - h * Math.cos(ang);
        const by = y2 - h * Math.sin(ang);
        const head = [
            [x2, y2],
            [bx + w * Math.sin(ang), by - w * Math.cos(ang)],
            [bx - w * Math.sin(ang), by + w * Math.cos(ang)]
        ].map(p => p.map(f1).join(",")).join(" ");
        const dash = opts.dash ? `stroke-dasharray="${opts.dash}"` : "";
        return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(bx)}" y2="${f1(by)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${dash} opacity="${opts.opacity ?? 1}"/>
                <polygon points="${head}" fill="${color}" opacity="${opts.opacity ?? 1}"/>`;
    }

    // Só a ponta da seta, centrada em (x, y), apontando na direção (dx, dy)
    function arrowHead(x, y, dx, dy, color, size = 9) {
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        return arrow(x - ux * size, y - uy * size, x + ux * size * 0.6, y + uy * size * 0.6, color, 3, { head: size * 1.2 });
    }

    // Desenha uma espira (vista em perspectiva) com o campo, a normal e o ângulo
    // cx, cy: centro; theta: ângulo entre B (pra direita) e a normal n
    function panel(x0, title, B, Bmax, theta, flux, induced) {
        const W = 285;
        const cx = x0 + W / 2;
        const cy = 160;
        const R = 58;
        const K = 0.32;                 // "achatamento" da espira (perspectiva)
        const t = theta * Math.PI / 180;

        // n (normal) e u (direção da espira no plano da tela), com y da tela pra baixo
        const n = [Math.cos(t), -Math.sin(t)];
        const u = [-Math.sin(t), -Math.cos(t)];
        const at = phi => [
            cx + R * Math.cos(phi) * u[0] + K * R * Math.sin(phi) * n[0],
            cy + R * Math.cos(phi) * u[1] + K * R * Math.sin(phi) * n[1]
        ];
        const arc = (from, to) => {
            let d = "";
            for (let i = 0; i <= 40; i++) {
                const p = at(from + (to - from) * i / 40);
                d += `${i ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`;
            }
            return d;
        };

        let svg = `<rect x="${x0}" y="42" width="${W}" height="232" rx="10" fill="${COLORS.canvas}" stroke="${COLORS.lineLight}"/>`;
        svg += `<text x="${cx}" y="62" text-anchor="middle" font-size="13" font-weight="700" fill="${COLORS.ink}">${title}</text>`;

        // Parte de trás da espira (tracejada) e o "disco" da área
        const disk = arc(0, 2 * Math.PI) + "Z";
        svg += `<path d="${disk}" fill="${BLUE}" fill-opacity="0.07"/>`;
        svg += `<path d="${arc(Math.PI, 2 * Math.PI)}" fill="none" stroke="${COLORS.blueLight}" stroke-width="3" stroke-dasharray="5 4"/>`;

        // Linhas de campo: mais grossas quanto maior o B
        const strength = Bmax > 0 ? B / Bmax : 0;
        const rows = [90, 115, 140, 165, 190, 215, 240];
        if (B > 0) {
            for (const y of rows) {
                svg += `<line x1="${x0 + 14}" y1="${y}" x2="${x0 + W - 14}" y2="${y}" stroke="${BLUE}" stroke-width="${f1(1 + 2.2 * strength)}" opacity="${f1(0.35 + 0.5 * strength)}"/>`;
                svg += arrowHead(x0 + 40, y, 1, 0, BLUE, 5 + 3 * strength);
                svg += arrowHead(x0 + W - 30, y, 1, 0, BLUE, 5 + 3 * strength);
            }
        } else {
            for (const y of rows) {
                svg += `<line x1="${x0 + 14}" y1="${y}" x2="${x0 + W - 14}" y2="${y}" stroke="${COLORS.line}" stroke-width="1" stroke-dasharray="3 5"/>`;
            }
        }

        // Parte da frente da espira (por cima das linhas)
        svg += `<path d="${arc(0, Math.PI)}" fill="none" stroke="${BLUE}" stroke-width="5" stroke-linecap="round"/>`;

        // Normal n e o ângulo θ entre B e n
        svg += arrow(cx, cy, cx + n[0] * 78, cy + n[1] * 78, GRAY, 2.5, { dash: "6 4" });
        svg += `<text x="${f1(cx + n[0] * 92)}" y="${f1(cy + n[1] * 92 + 5)}" text-anchor="middle" font-size="14" font-weight="800" fill="${GRAY}">n</text>`;
        if (theta > 0) {
            const r = 26;
            const large = theta > 180 ? 1 : 0;
            svg += `<path d="M ${cx + r} ${cy} A ${r} ${r} 0 ${large} 0 ${f1(cx + r * n[0])} ${f1(cy + r * n[1])}" fill="none" stroke="${COLORS.amber}" stroke-width="2"/>`;
            const mid = t / 2;
            svg += `<text x="${f1(cx + 40 * Math.cos(mid))}" y="${f1(cy - 40 * Math.sin(mid) + 4)}" text-anchor="middle" font-size="12" font-weight="700" fill="${COLORS.amberDark}">${theta}°</text>`;
        }

        // Corrente induzida e campo induzido (só no painel final)
        if (induced) {
            // σ = +1: B induzido no sentido de n; σ = -1: contra n
            const sigma = induced;
            svg += arrow(cx, cy, cx + sigma * n[0] * 52, cy + sigma * n[1] * 52, PURPLE, 4, { head: 12 });
            svg += `<text x="${f1(cx + sigma * n[0] * 66 + 2)}" y="${f1(cy + sigma * n[1] * 66 + 16)}" text-anchor="middle" font-size="12" font-weight="800" fill="${PURPLE}">B ind</text>`;
            // Corrente: percorrendo φ crescente, B induzido aponta pra +n (regra da mão direita)
            for (const phi of [Math.PI / 2, 3 * Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6]) {
                const [px, py] = at(phi);
                const dx = (-Math.sin(phi) * u[0] + K * Math.cos(phi) * n[0]) * sigma;
                const dy = (-Math.sin(phi) * u[1] + K * Math.cos(phi) * n[1]) * sigma;
                svg += arrowHead(px, py, dx, dy, ORANGE, 8);
            }
            const [ix, iy] = at(Math.PI / 2);
            svg += `<text x="${f1(ix + 12 * Math.sign(-u[0] || 1))}" y="${f1(iy + 20)}" font-size="13" font-weight="800" fill="${ORANGE}">i</text>`;
        }

        // Rótulos de baixo
        svg += `<text x="${x0 + 14}" y="84" font-size="12" font-weight="700" fill="${BLUE}">B = ${formatNumber(B)} T →</text>`;
        svg += `<text x="${cx}" y="264" text-anchor="middle" font-size="13" font-weight="700" fill="${COLORS.ink}">Φ = ${formatNumber(flux)} Wb</text>`;
        return svg;
    }

    // Mini desenho da regra da mão direita (polegar = B induzido, dedos = corrente)
    function rightHandIcon(x, y) {
        return `
            <g transform="translate(${x}, ${y})">
                <ellipse cx="0" cy="0" rx="17" ry="6" fill="none" stroke="${ORANGE}" stroke-width="2.5"/>
                ${arrowHead(0, 6, -1, 0, ORANGE, 6)}
                ${arrow(0, 14, 0, -24, PURPLE, 3, { head: 8 })}
            </g>`;
    }

    function drawScene(st) {
        const Bmax = Math.max(st.fieldInitial, st.fieldFinal, 0.0001);
        const sigma = st.fluxChange > 0 ? -1 : st.fluxChange < 0 ? 1 : 0;

        let svg = `<rect x="0" y="0" width="600" height="330" fill="transparent"/>`;
        svg += `<text x="10" y="22" font-size="13" font-weight="700" fill="${BLUE}">Campo B uniforme, apontando para a direita →</text>`;
        svg += panel(8, "Início (t = 0)", st.fieldInitial, Bmax, st.angleInitial, st.fluxInitial, 0);
        svg += panel(307, `Fim (t = ${formatNumber(st.time)} s)`, st.fieldFinal, Bmax, st.angleFinal, st.fluxFinal, sigma);

        // Resumo embaixo
        let summary;
        if (sigma === 0) {
            summary = "ΔΦ = 0 → não há corrente induzida";
        } else {
            summary = st.fluxChange > 0
                ? "ΔΦ > 0 → B induzido contra n (Lenz)"
                : "ΔΦ < 0 → B induzido a favor de n (Lenz)";
        }
        svg += `<text x="300" y="296" text-anchor="middle" font-size="13" font-weight="700" fill="${COLORS.ink}">${summary}</text>`;
        if (sigma !== 0) {
            svg += rightHandIcon(40, 314);
            svg += `<text x="66" y="320" font-size="12" fill="${COLORS.text}">Mão direita: polegar no <tspan fill="${PURPLE}" font-weight="700">B induzido</tspan>, os dedos dobrados dão o sentido da <tspan fill="${ORANGE}" font-weight="700">corrente i</tspan></text>`;
        }

        scene.innerHTML = svg;
    }

    // Volta pros valores padrão
    function reset() {
        fieldInitialInput.value = defaults.fieldInitial;
        fieldFinalInput.value = defaults.fieldFinal;
        areaInput.value = defaults.area;
        turnsInput.value = defaults.turns;
        timeInput.value = defaults.time;
        angleInitialInput.value = defaults.angleInitial;
        angleFinalInput.value = defaults.angleFinal;

        calculate();
    }

    // Recalcula sempre que algum campo muda
    [
        fieldInitialInput,
        fieldFinalInput,
        areaInput,
        turnsInput,
        timeInput,
        angleInitialInput,
        angleFinalInput
    ].forEach(input => {
        input.addEventListener("input", calculate);
    });

    resetButton.addEventListener("click", reset);

    calculate();
});
