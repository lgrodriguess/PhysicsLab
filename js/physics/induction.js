document.addEventListener("DOMContentLoaded", () => {
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

    const coil = document.getElementById("induction-coil");
    const visualValue = document.getElementById("induction-visual-value");
    const fieldLines = document.getElementById("induction-field-lines");
    const fieldArrows = document.getElementById("induction-field-arrows");

    const defaults = {
        fieldInitial: 0.5,
        fieldFinal: 1,
        area: 0.01,
        turns: 10,
        time: 2,
        angleInitial: 0,
        angleFinal: 60
    };

    function formatNumber(value) {
        if (value !== 0 && Math.abs(value) < 0.001) {
            return value.toExponential(3).replace(".", ",");
        }

        return value.toLocaleString("pt-BR", {
            maximumFractionDigits: 6
        });
    }

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
        const fluxChange = fluxFinal - fluxInitial;
        // Lei de Faraday-Lenz: ε = -N · ΔΦ / Δt
        const emf = -turns * fluxChange / time;

        fluxInitialResult.textContent = `${formatNumber(fluxInitial)} Wb`;
        fluxFinalResult.textContent = `${formatNumber(fluxFinal)} Wb`;
        fluxChangeResult.textContent = `${formatNumber(fluxChange)} Wb`;
        emfResult.textContent = `${formatNumber(emf)} V`;

        // Explicação pela Lei de Lenz (o sinal mostra se o fluxo subiu ou desceu)
        if (fluxChange > 0) {
            explanation.textContent = "O fluxo magnético aumentou. Pela Lei de Lenz, a corrente induzida produz um campo magnético que se opõe a esse aumento.";
        } else if (fluxChange < 0) {
            explanation.textContent = "O fluxo magnético diminuiu. Pela Lei de Lenz, a corrente induzida produz um campo magnético que tenta compensar essa diminuição.";
        } else {
            explanation.textContent = "O fluxo magnético não sofreu variação. Portanto, não existe força eletromotriz induzida nesse intervalo.";
        }

        // Gira a espira no desenho conforme o ângulo final
        coil.setAttribute("transform", `rotate(${angleFinal - 90} 300 150)`);
        visualValue.textContent = `Campo final: ${formatNumber(fieldFinal)} T | Ângulo final: ${angleFinal}°`;

        const fieldColor = fieldFinal > fieldInitial ? "#2563eb" : "#64748b";
        fieldLines.setAttribute("stroke", fieldColor);
        fieldArrows.setAttribute("fill", fieldColor);
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