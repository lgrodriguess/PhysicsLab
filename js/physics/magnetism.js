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

    const defaults = {
        charge: 5,
        velocity: 20,
        mass: 1,
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

    // Desenha a trajetória: reta, círculo ou hélice, dependendo do ângulo
    function drawTrajectory(angle, charge, velocity, field) {
        let path = "";
        let x = 300;
        let y = 150;

        if (velocity === 0 || charge === 0 || field === 0) {
            path = "M 120 150 L 480 150";
        } else if (angle === 0 || angle === 180) {
            path = "M 100 150 L 500 150";
            x = angle === 0 ? 480 : 120;
        } else if (angle === 90) {
            path = charge > 0
                ? "M 400 150 A 100 100 0 1 1 399.9 150"
                : "M 400 150 A 100 100 0 1 0 399.9 150";
            x = 400;
        } else {
            const direction = charge > 0 ? 1 : -1;
            path = `M 100 150 Q 200 ${150 - direction * 60} 300 150 T 500 150`;
            x = 500;
        }

        trajectory.setAttribute("d", path);
        particle.setAttribute("cx", x);
        particle.setAttribute("cy", y);
        angleLabel.textContent = `Ângulo de entrada: ${angle}°`;
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
            charge < -10 || charge > 10 ||
            velocity < 0 || velocity > 100 ||
            mass < 0.1 || mass > 10 ||
            field < 0 || field > 2 ||
            angle < 0 || angle > 180) {
            explanation.textContent = "Informe valores dentro dos limites indicados nos campos.";
            return;
        }

        // Converte µC -> C e mg -> kg
        const chargeCoulombs = Math.abs(charge) * 0.000001;
        const velocityPerpendicular = velocity * Math.sin(angle * Math.PI / 180);
        const massKg = mass * 0.000001;

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
            explanation.textContent = `A velocidade é perpendicular ao campo magnético. A força magnética é máxima para esses valores e a partícula realiza movimento circular, com raio de ${formatNumber(radius)} m.`;
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