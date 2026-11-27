document.addEventListener("DOMContentLoaded", () => {

    const COLORS = window.PhysicsUtils.colors;
    // Campos de entrada e resultados do módulo de magnetismo
    const chargeInput = document.getElementById("mag-charge");
    const velocityInput = document.getElementById("mag-velocity");
    const massInput = document.getElementById("mag-mass");
    const fieldInput = document.getElementById("mag-field");
    const angleInput = document.getElementById("mag-angle");
    const fieldDirInput = document.getElementById("mag-field-dir");
    const fieldLabel = document.getElementById("magnetic-field-label");
    const legendField = document.getElementById("magnetic-legend-field");
    const fieldSenseResult = document.getElementById("mag-field-sense");
    const spinResult = document.getElementById("mag-spin");
    const handScene = document.getElementById("mag-hand-scene");
    const resetButton = document.getElementById("mag-reset");

    const forceResult = document.getElementById("mag-force");
    const radiusResult = document.getElementById("mag-radius");
    const perpendicularResult = document.getElementById("mag-perpendicular");
    const motionResult = document.getElementById("mag-motion");
    const explanation = document.getElementById("mag-explanation");

    const trajectory = document.getElementById("magnetic-trajectory");
    const particle = document.getElementById("magnetic-particle");
    const fieldPoints = document.getElementById("magnetic-field-points");
    const angleLabel = document.getElementById("magnetic-angle-label");
    const senseLabel = document.getElementById("magnetic-sense-label");
    const vArrow = document.getElementById("magnetic-v-arrow");
    const fArrow = document.getElementById("magnetic-f-arrow");
    const vLabel = document.getElementById("magnetic-v-label");
    const fLabel = document.getElementById("magnetic-f-label");
    const section = document.getElementById("magnetism");

    const defaults = {
        charge: 0.000005,
        velocity: 20,
        mass: 0.000001,
        field: 0.5,
        angle: 90,
        fieldDir: "in"
    };

    // true = campo entrando na tela (⊗), false = saindo (⊙)
    const fieldIsIn = () => fieldDirInput.value !== "out";

    // Formatação de números compartilhada (vírgula decimal e notação científica)
    const formatNumber = value => window.PhysicsUtils.formatNumber(value, 4);

    // Desenha os ⊗ (entrando) ou ⊙ (saindo) do campo magnético
    function drawField() {
        const into = fieldIsIn();
        const mark = into
            ? `<path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke="${COLORS.textSoft}" stroke-width="1.5"/>`
            : `<circle r="2.6" fill="${COLORS.textSoft}"/>`;
        let points = "";

        for (let x = 60; x <= 540; x += 60) {
            for (let y = 75; y <= 225; y += 50) {
                points += `
                    <g transform="translate(${x}, ${y})">
                        <circle r="8" fill="none" stroke="${COLORS.textSoft}" stroke-width="1.5"/>
                        ${mark}
                    </g>
                `;
            }
        }

        fieldPoints.innerHTML = points;

        const text = into ? "⊗ entrando na tela" : "⊙ saindo da tela";
        fieldLabel.textContent = `Campo magnético: ${text}`;
        legendField.textContent = into ? "⊗ Campo entrando na tela" : "⊙ Campo saindo da tela";
        fieldSenseResult.textContent = into ? "Entrando na tela (⊗)" : "Saindo da tela (⊙)";
    }

    // ---- Movimento animado da partícula (com vetores v e F) ----
    // Na tela o eixo y cresce pra baixo. Com B entrando na tela, F = q·(v × B) faz uma
    // carga positiva girar no sentido ANTI-HORÁRIO; com B saindo, no HORÁRIO.
    // Carga negativa: tudo ao contrário.
    const CENTER = { x: 300, y: 150 };
    const CIRCLE_RADIUS = 65;     // raio desenhado do círculo (só visual)
    const CIRCLE_SPEED = 1.4;     // rad/s
    const HELIX_RADIUS = 40;
    const HELIX_SPEED = 3;        // rad/s
    const HELIX_DRIFT = 50;       // px/s ao longo do campo
    const TRACK_START = 100;
    const TRACK_LENGTH = 400;

    const reducedMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Estado atual: tipo de movimento, sentido de giro e direção do deslocamento
    let motion = { mode: "rest", spin: -1, dir: 1 };

    // Posição da partícula e direção de v e F no instante t (segundos)
    function stateAt(t) {
        const { mode, spin, dir } = motion;

        if (mode === "circle") {
            const phi = spin * CIRCLE_SPEED * t;
            return {
                x: CENTER.x + CIRCLE_RADIUS * Math.cos(phi),
                y: CENTER.y + CIRCLE_RADIUS * Math.sin(phi),
                v: { x: -spin * Math.sin(phi), y: spin * Math.cos(phi) },
                vPerp: { x: -spin * Math.sin(phi), y: spin * Math.cos(phi) },
                f: { x: -Math.cos(phi), y: -Math.sin(phi) }
            };
        }

        if (mode === "helix") {
            const phi = spin * HELIX_SPEED * t;
            const travelled = (HELIX_DRIFT * t) % TRACK_LENGTH;
            const cx = dir > 0 ? TRACK_START + travelled : TRACK_START + TRACK_LENGTH - travelled;
            // v = deslocamento ao longo do campo + giro
            const vx = dir * HELIX_DRIFT - spin * HELIX_RADIUS * HELIX_SPEED * Math.sin(phi);
            const vy = spin * HELIX_RADIUS * HELIX_SPEED * Math.cos(phi);
            const norm = Math.hypot(vx, vy) || 1;
            return {
                x: cx + HELIX_RADIUS * Math.cos(phi),
                y: CENTER.y + HELIX_RADIUS * Math.sin(phi),
                v: { x: vx / norm, y: vy / norm },
                vPerp: { x: -spin * Math.sin(phi), y: spin * Math.cos(phi) },
                f: { x: -Math.cos(phi), y: -Math.sin(phi) }
            };
        }

        if (mode === "straight") {
            const travelled = (90 * t) % TRACK_LENGTH;
            return {
                x: dir > 0 ? TRACK_START + travelled : TRACK_START + TRACK_LENGTH - travelled,
                y: CENTER.y,
                v: { x: dir, y: 0 },
                f: null
            };
        }

        return { x: CENTER.x, y: CENTER.y, v: null, f: null };
    }

    function placeArrow(line, label, x, y, direction, length) {
        if (!direction) {
            line.setAttribute("visibility", "hidden");
            label.setAttribute("visibility", "hidden");
            return;
        }

        const startOffset = 11;   // começa fora da bolinha
        const x1 = x + direction.x * startOffset;
        const y1 = y + direction.y * startOffset;
        const x2 = x + direction.x * (startOffset + length);
        const y2 = y + direction.y * (startOffset + length);

        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("visibility", "visible");

        label.setAttribute("x", x2 + direction.x * 12 - 4);
        label.setAttribute("y", y2 + direction.y * 12 + 5);
        label.setAttribute("visibility", "visible");
    }

    function render(t) {
        const state = stateAt(t);

        particle.setAttribute("cx", state.x);
        particle.setAttribute("cy", state.y);

        placeArrow(vArrow, vLabel, state.x, state.y, state.v, 48);
        placeArrow(fArrow, fLabel, state.x, state.y, state.f, 38);
        drawHand(state.vPerp || null);
    }

    // ---- Regra da mão direita (desenho em perspectiva) ----
    // Eixos do mundo: X = direita da tela, Y = cima, Z = saindo da tela (na direção de quem olha).
    // Projeção oblíqua: o eixo Z aparece inclinado pra baixo e pra esquerda.
    const HAND = { cx: 185, cy: 122, s: 38 };
    const VIEW = [0.55, 0.55, 1];   // direção de onde a gente olha (pra saber o que está na frente)

    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const add = (...vs) => vs.reduce((r, v) => [r[0] + v[0], r[1] + v[1], r[2] + v[2]], [0, 0, 0]);
    const mul = (v, k) => [v[0] * k, v[1] * k, v[2] * k];

    function project(p) {
        const k = 0.65;
        return [
            HAND.cx + HAND.s * (p[0] - k * p[2]),
            HAND.cy - HAND.s * (p[1] - k * p[2])
        ];
    }

    const pt = p => project(p).map(n => n.toFixed(1)).join(",");

    function arrow3d(from, dir, len, color, label, labelOffset = 0.45) {
        const to = add(from, mul(dir, len));
        const [x1, y1] = project(from);
        const [x2, y2] = project(to);
        const ang = Math.atan2(y2 - y1, x2 - x1);
        const h = 11;
        const head = [
            [x2, y2],
            [x2 - h * Math.cos(ang) + 5 * Math.sin(ang), y2 - h * Math.sin(ang) - 5 * Math.cos(ang)],
            [x2 - h * Math.cos(ang) - 5 * Math.sin(ang), y2 - h * Math.sin(ang) + 5 * Math.cos(ang)]
        ].map(p => p.map(n => n.toFixed(1)).join(",")).join(" ");
        const [lx, ly] = project(add(to, mul(dir, labelOffset)));
        return `
            <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${(x2 - 8 * Math.cos(ang)).toFixed(1)}" y2="${(y2 - 8 * Math.sin(ang)).toFixed(1)}" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
            <polygon points="${head}" fill="${color}"/>
            <text x="${lx.toFixed(1)}" y="${(ly + 5).toFixed(1)}" text-anchor="middle" font-size="15" font-weight="800" fill="${color}">${label}</text>`;
    }

    function handLegend(lines) {
        return lines.map((l, i) =>
            `<text x="390" y="${62 + i * 26}" font-size="13" fill="${l.color || COLORS.text}" font-weight="${l.bold ? 700 : 500}">${l.text}</text>`
        ).join("");
    }

    function drawHand(vScreen) {
        if (!handScene) return;
        const charge = Number(chargeInput.value);
        const into = fieldIsIn();
        const B = [0, 0, into ? -1 : 1];

        // Plano da tela (um quadrado no plano XY) e o símbolo do campo atravessando
        const screenSquare = [[-2.4, -2.3, 0], [2.4, -2.3, 0], [2.4, 2.3, 0], [-2.4, 2.3, 0]].map(pt).join(" ");
        let svg = `<polygon points="${screenSquare}" fill="${COLORS.lineLight}" fill-opacity="0.55" stroke="${COLORS.neutral}" stroke-dasharray="5 4"/>`;
        const [tx, ty] = project([2.4, 2.3, 0]);
        svg += `<text x="${tx - 4}" y="${ty - 6}" text-anchor="end" font-size="11" fill="${COLORS.textSoft}">plano da tela</text>`;

        if (!vScreen || motion.mode === "rest" || motion.mode === "straight" || charge === 0) {
            svg += arrow3d([0, 0, 0], B, 2.6, COLORS.blue, "B");
            svg += handLegend([
                { text: into ? "B ⊗ entra na tela" : "B ⊙ sai da tela", color: COLORS.blue, bold: true },
                { text: "Sem força magnética agora:" },
                { text: motion.mode === "rest" ? "a partícula está parada." : "F = q·v·B·sen θ = 0." }
            ]);
            handScene.innerHTML = svg;
            return;
        }

        // v na tela (y pra baixo) -> mundo (y pra cima)
        const a = [vScreen.x, -vScreen.y, 0];          // polegar
        const b = B;                                   // dedos
        const n = cross(a, b);                         // palma (v × B)
        const F = charge > 0 ? n : mul(n, -1);         // força de verdade

        const P = (s, t) => add(mul(a, s), mul(b, t));
        const facing = dot(n, VIEW) > 0;               // a palma está virada pra gente?
        const skin = facing ? COLORS.skin : COLORS.skinShadow;
        const line = COLORS.skinLine;

        // Palma, dedos e polegar (tudo no plano formado por v e B)
        const palm = [P(-0.5, -0.9), P(0.5, -0.9), P(0.55, 0.35), P(-0.5, 0.35)].map(pt).join(" ");
        let hand = `<polygon points="${palm}" fill="${skin}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>`;
        const fingers = [[-0.37, 1.15], [-0.12, 1.35], [0.13, 1.3], [0.38, 1.1]];
        for (const [s, len] of fingers) {
            const [x1, y1] = project(P(s, 0.3));
            const [x2, y2] = project(P(s, len));
            hand += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${line}" stroke-width="10" stroke-linecap="round"/>
                     <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${skin}" stroke-width="7" stroke-linecap="round"/>`;
        }
        const [ax1, ay1] = project(P(0.45, -0.55));
        const [ax2, ay2] = project(P(1.25, -0.2));
        hand += `<line x1="${ax1}" y1="${ay1}" x2="${ax2}" y2="${ay2}" stroke="${line}" stroke-width="11" stroke-linecap="round"/>
                 <line x1="${ax1}" y1="${ay1}" x2="${ax2}" y2="${ay2}" stroke="${skin}" stroke-width="8" stroke-linecap="round"/>`;
        // punho
        const wrist = [P(-0.45, -0.9), P(0.45, -0.9), P(0.4, -1.5), P(-0.4, -1.5)].map(pt).join(" ");
        hand = `<polygon points="${wrist}" fill="${skin}" stroke="${line}" stroke-width="2"/>` + hand;

        const vArrow3 = arrow3d(P(1.35, -0.15), a, 0.9, COLORS.green, "v");
        const bArrow3 = arrow3d(P(0, 1.45), b, 1.0, COLORS.blue, "B");
        const center = P(0, -0.3);
        const fArrow3 = arrow3d(center, F, 2.0, COLORS.red, "F");

        // A força sai da palma (q > 0) ou das costas da mão (q < 0).
        // Desenha a seta de F atrás ou na frente da mão, conforme o lado pra onde ela aponta.
        const fInFront = dot(F, VIEW) > 0;
        svg += (fInFront ? hand + fArrow3 : fArrow3 + hand) + vArrow3 + bArrow3;

        svg += handLegend([
            { text: "👍 Polegar → velocidade v", color: COLORS.green, bold: true },
            { text: `✋ Dedos → campo B (${into ? "⊗ entra" : "⊙ sai"})`, color: COLORS.blue, bold: true },
            { text: charge > 0 ? "🖐 Palma empurra → força F" : "🖐 Costas da mão → força F", color: COLORS.red, bold: true },
            { text: charge > 0 ? "Carga positiva: F sai da palma." : "Carga negativa: F é o oposto," },
            { text: charge > 0 ? "" : "sai pelas costas da mão." },
            { text: facing ? "(vendo a palma da mão)" : "(vendo as costas da mão)", color: COLORS.textSoft }
        ]);

        handScene.innerHTML = svg;
    }

    // Monta o caminho (trajetória) de acordo com o tipo de movimento
    function trajectoryPath() {
        if (motion.mode === "circle") {
            const left = CENTER.x - CIRCLE_RADIUS;
            const right = CENTER.x + CIRCLE_RADIUS;
            return `M ${right} ${CENTER.y} A ${CIRCLE_RADIUS} ${CIRCLE_RADIUS} 0 1 1 ${left} ${CENTER.y} A ${CIRCLE_RADIUS} ${CIRCLE_RADIUS} 0 1 1 ${right} ${CENTER.y}`;
        }

        if (motion.mode === "helix") {
            const duration = TRACK_LENGTH / HELIX_DRIFT;
            const steps = 400;
            let d = "";

            for (let i = 0; i <= steps; i++) {
                const t = (i / steps) * duration * 0.999;
                const phi = motion.spin * HELIX_SPEED * t;
                const travelled = HELIX_DRIFT * t;
                const cx = motion.dir > 0 ? TRACK_START + travelled : TRACK_START + TRACK_LENGTH - travelled;
                const px = cx + HELIX_RADIUS * Math.cos(phi);
                const py = CENTER.y + HELIX_RADIUS * Math.sin(phi);
                d += `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)} `;
            }

            return d;
        }

        return `M ${TRACK_START} ${CENTER.y} L ${TRACK_START + TRACK_LENGTH} ${CENTER.y}`;
    }

    // Define o tipo de movimento a partir dos parâmetros e redesenha
    function drawTrajectory(angle, charge, velocity, field) {
        // q > 0 com B entrando: anti-horário (spin = -1 na tela, que tem y pra baixo).
        // Trocar o sinal da carga OU o sentido do campo inverte o giro.
        const into = fieldIsIn();
        const spin = (charge > 0 ? -1 : 1) * (into ? 1 : -1);
        const spinText = spin < 0 ? "anti-horário" : "horário";
        let sense = "";

        if (velocity === 0) {
            motion = { mode: "rest", spin, dir: 1 };
            sense = "Partícula em repouso: não há força magnética";
        } else if (charge === 0 || field === 0 || angle === 0 || angle === 180) {
            motion = { mode: "straight", spin, dir: angle === 180 ? -1 : 1 };
            sense = "F = 0: a velocidade não muda (movimento retilíneo uniforme)";
        } else if (angle === 90) {
            motion = { mode: "circle", spin, dir: 1 };
            sense = `Carga ${charge > 0 ? "positiva" : "negativa"}: giro no sentido ${spinText}, F aponta para o centro`;
        } else {
            motion = { mode: "helix", spin, dir: angle < 90 ? 1 : -1 };
            sense = `Carga ${charge > 0 ? "positiva" : "negativa"}: giro ${spinText} (projeção da hélice)`;
        }

        trajectory.setAttribute("d", trajectoryPath());
        spinResult.textContent = (motion.mode === "circle" || motion.mode === "helix")
            ? spinText.charAt(0).toUpperCase() + spinText.slice(1)
            : "Não gira";
        senseLabel.textContent = sense;
        angleLabel.textContent = `Ângulo de entrada: ${angle}°`;

        // Pausado: redesenha o quadro parado com os novos parâmetros
        if (paused) {
            render(simTime);
        }
    }

    // ---- Controle da animação: pausar e câmera lenta ----
    // simTime é o "tempo da simulação": só avança quando não está pausado,
    // e avança mais devagar na câmera lenta (speed < 1).
    const playButton = document.getElementById("mag-play");
    const speedButtons = document.querySelectorAll("#magnetism .speed-button");
    let simTime = 0.4;
    let speed = 1;
    let paused = reducedMotion;   // com "reduzir movimento" ativo, começa parado
    let lastNow = null;

    function updatePlayButton() {
        if (!playButton) return;
        playButton.querySelector(".playback-icon").textContent = paused ? "▶" : "⏸";
        playButton.querySelector(".playback-label").textContent = paused ? "Continuar" : "Pausar";
        playButton.setAttribute("aria-pressed", String(paused));
    }

    function togglePause() {
        paused = !paused;
        lastNow = null;
        updatePlayButton();
    }

    if (playButton) playButton.addEventListener("click", togglePause);

    speedButtons.forEach(button => {
        button.addEventListener("click", () => {
            speed = Number(button.dataset.speed);
            speedButtons.forEach(b => b.classList.toggle("active", b === button));
            if (paused) togglePause();
        });
    });

    // Barra de espaço pausa/continua (só na página de magnetismo e fora de campos de texto)
    document.addEventListener("keydown", event => {
        if (event.code !== "Space" || !section || !section.classList.contains("active")) return;
        if (event.target.closest("input, select, textarea, button, summary, [contenteditable]")) return;
        if (document.body.classList.contains("guide-open")) return;
        event.preventDefault();
        togglePause();
    });

    // Anima só enquanto a página de magnetismo está visível
    function frame(now) {
        const visible = section && section.classList.contains("active");

        if (visible && !paused) {
            if (lastNow !== null) {
                // Limita o passo pra não dar "pulo" ao voltar de outra aba
                simTime += Math.min((now - lastNow) / 1000, 0.1) * speed;
            }
            lastNow = now;
            render(simTime);
        } else {
            lastNow = null;
        }

        requestAnimationFrame(frame);
    }

    updatePlayButton();
    requestAnimationFrame(frame);

    // Faz os cálculos da força magnética e do raio
    function calculate() {
        const charge = Number(chargeInput.value);
        const velocity = Number(velocityInput.value);
        const mass = Number(massInput.value);
        const field = Number(fieldInput.value);
        const angle = Number(angleInput.value);

        const values = [charge, velocity, mass, field, angle];

        // Confere se os valores estão dentro dos limites
        if (values.some(value => !Number.isFinite(value)) ||
            charge < -0.00001 || charge > 0.00001 ||
            velocity < 0 || velocity > 100 ||
            mass < 0.0000001 || mass > 0.00001 ||
            field < 0 || field > 2 ||
            angle < 0 || angle > 180) {
            explanation.textContent = "Informe valores dentro dos limites indicados nos campos.";
            return;
        }

        // Carga em C e massa em kg (já estão no SI)
        const chargeCoulombs = Math.abs(charge);
        const velocityPerpendicular = velocity * Math.sin(angle * Math.PI / 180);
        const massKg = mass;

        // F = |q| · v · B · sen(θ)
        const force = chargeCoulombs * velocity * field * Math.sin(angle * Math.PI / 180);

        // r = m · v⊥ / (|q| · B)
        let radius = null;

        if (chargeCoulombs > 0 && field > 0 && velocityPerpendicular > 0) {
            radius = (massKg * velocityPerpendicular) / (chargeCoulombs * field);
        }

        forceResult.textContent = `${formatNumber(force)} N`;
        perpendicularResult.textContent = `${formatNumber(velocityPerpendicular)} m/s`;

        if (radius === null) {
            radiusResult.textContent = "Não aplicável";
        } else {
            radiusResult.textContent = `${formatNumber(radius)} m`;
        }

        // Define o tipo de movimento a partir do ângulo e da força
        let motion = "";

        if (velocity === 0) {
            motion = "Repouso";
        } else if (force === 0) {
            motion = "Movimento retilíneo";
        } else if (angle === 90) {
            motion = "Circular";
        } else {
            motion = "Helicoidal";
        }

        // Texto explicando o resultado
        motionResult.textContent = motion;

        if (velocity === 0) {
            explanation.textContent = "A partícula está em repouso. Como não existe velocidade, não há força magnética.";
        } else if (charge === 0) {
            explanation.textContent = "A partícula não possui carga elétrica. Portanto, o campo magnético não exerce força magnética sobre ela.";
        } else if (field === 0) {
            explanation.textContent = "O campo magnético é zero. Sem campo magnético, não existe força magnética.";
        } else if (angle === 0 || angle === 180) {
            explanation.textContent = "A velocidade está paralela ou antiparalela ao campo magnético. A força magnética é zero e a partícula continua em movimento retilíneo.";
        } else if (angle === 90) {
            explanation.textContent = `A velocidade é perpendicular ao campo magnético. A força magnética é máxima para esses valores e a partícula realiza movimento circular, com raio de ${formatNumber(radius)} m. Como o campo ${fieldIsIn() ? "entra na" : "sai da"} tela e a carga é ${charge > 0 ? "positiva" : "negativa"}, ela gira no sentido ${(charge > 0) === fieldIsIn() ? "anti-horário" : "horário"} (veja a regra da mão direita abaixo); a força (vermelha) aponta sempre para o centro e a velocidade (verde) é tangente à trajetória.`;
        } else {
            explanation.textContent = `A velocidade possui componentes paralela e perpendicular ao campo magnético. A partícula realiza movimento helicoidal, combinando movimento circular com movimento ao longo do campo. O raio da parte circular é ${formatNumber(radius)} m e o giro é no sentido ${(charge > 0) === fieldIsIn() ? "anti-horário" : "horário"}, pois o campo ${fieldIsIn() ? "entra na" : "sai da"} tela e a carga é ${charge > 0 ? "positiva" : "negativa"}.`;
        }

        drawTrajectory(angle, charge, velocity, field);
    }

    // Volta pros valores padrão
    function reset() {
        chargeInput.value = defaults.charge;
        velocityInput.value = defaults.velocity;
        massInput.value = defaults.mass;
        fieldInput.value = defaults.field;
        angleInput.value = defaults.angle;
        fieldDirInput.value = defaults.fieldDir;
        drawField();

        calculate();
    }

    // Recalcula sempre que algum campo muda
    [chargeInput, velocityInput, massInput, fieldInput, angleInput].forEach(input => {
        input.addEventListener("input", calculate);
    });

    resetButton.addEventListener("click", reset);

    // Trocar o sentido do campo redesenha os ⊗/⊙ e recalcula o giro
    fieldDirInput.addEventListener("change", () => {
        drawField();
        calculate();
    });

    drawField();
    calculate();
});
