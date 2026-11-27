document.addEventListener("DOMContentLoaded", () => {
    // Campos de entrada e resultados do módulo de magnetismo
    const chargeInput = document.getElementById("mag-charge");
    const velocityInput = document.getElementById("mag-velocity");
    const massInput = document.getElementById("mag-mass");
    const fieldInput = document.getElementById("mag-field");
    const angleInput = document.getElementById("mag-angle");
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
        angle: 90
    };

    function formatNumber(value) {
    if (value !== 0 && Math.abs(value) < 0.001) {
        return value.toExponential(3).replace(".", ",");
    }
    return value.toLocaleString("pt-BR", {
        maximumFractionDigits: 4
    });
    }

    // Desenha os ⊗ do campo magnético entrando na tela
    function drawField() {
        let points = "";

        for (let x = 60; x <= 540; x += 60) {
            for (let y = 75; y <= 225; y += 50) {
                points += `
                    <g transform="translate(${x}, ${y})">
                        <circle r="8" fill="none" stroke="#64748b" stroke-width="1.5"/>
                        <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke="#64748b" stroke-width="1.5"/>
                    </g>
                `;
            }
        }

        fieldPoints.innerHTML = points;
    }

    // ---- Movimento animado da partícula (com vetores v e F) ----
    // Na tela o eixo y cresce pra baixo. O campo B entra na tela, então para q > 0
    // a força F = q·(v × B) faz a carga girar no sentido ANTI-HORÁRIO (q < 0: horário).
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
        const spin = charge > 0 ? -1 : 1;   // q > 0: anti-horário na tela; q < 0: horário
        let sense = "";

        if (velocity === 0) {
            motion = { mode: "rest", spin, dir: 1 };
            sense = "Partícula em repouso: não há força magnética";
        } else if (charge === 0 || field === 0 || angle === 0 || angle === 180) {
            motion = { mode: "straight", spin, dir: angle === 180 ? -1 : 1 };
            sense = "F = 0: a velocidade não muda (movimento retilíneo uniforme)";
        } else if (angle === 90) {
            motion = { mode: "circle", spin, dir: 1 };
            sense = charge > 0
                ? "Carga positiva: giro no sentido anti-horário, F aponta para o centro"
                : "Carga negativa: giro no sentido horário, F aponta para o centro";
        } else {
            motion = { mode: "helix", spin, dir: angle < 90 ? 1 : -1 };
            sense = charge > 0
                ? "Carga positiva: giro anti-horário (projeção da hélice)"
                : "Carga negativa: giro horário (projeção da hélice)";
        }

        trajectory.setAttribute("d", trajectoryPath());
        senseLabel.textContent = sense;
        angleLabel.textContent = `Ângulo de entrada: ${angle}°`;

        // Com "reduzir movimento" ativo, mostra um quadro parado com os vetores
        if (reducedMotion) {
            render(0.4);
        }
    }

    // Anima só enquanto a página de magnetismo está visível
    const startTime = performance.now();

    function frame(now) {
        if (section && section.classList.contains("active")) {
            render((now - startTime) / 1000);
        }
        requestAnimationFrame(frame);
    }

    if (!reducedMotion) {
        requestAnimationFrame(frame);
    }

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
            explanation.textContent = `A velocidade é perpendicular ao campo magnético. A força magnética é máxima para esses valores e a partícula realiza movimento circular, com raio de ${formatNumber(radius)} m. Como o campo entra na tela e a carga é ${charge > 0 ? "positiva, ela gira no sentido anti-horário" : "negativa, ela gira no sentido horário"}; a força (vermelha) aponta sempre para o centro e a velocidade (verde) é tangente à trajetória.`;
        } else {
            explanation.textContent = `A velocidade possui componentes paralela e perpendicular ao campo magnético. A partícula realiza movimento helicoidal, combinando movimento circular com movimento ao longo do campo. O raio da parte circular é ${formatNumber(radius)} m.`;
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

        calculate();
    }

    // Recalcula sempre que algum campo muda
    [chargeInput, velocityInput, massInput, fieldInput, angleInput].forEach(input => {
        input.addEventListener("input", calculate);
    });

    resetButton.addEventListener("click", reset);

    drawField();
    calculate();
});