document.addEventListener("DOMContentLoaded", () => {

    // Pega os sliders e elementos da página de circuitos
    const voltageInput = document.getElementById("circuit-voltage");

    if (!voltageInput) return;

    const resistanceInputs = [
        document.getElementById("resistance-1"),
        document.getElementById("resistance-2"),
        document.getElementById("resistance-3")
    ];

    const circuitButtons = document.querySelectorAll(".circuit-type");
    const resistance3Group = document.getElementById("resistance-3-group");

    const diagram = document.getElementById("circuit-diagram");
    const resultsBody = document.getElementById("resistor-results");

    const defaults = {
        voltage: 12,
        resistances: [10, 20, 30]
    };

    // Tipo de circuito escolhido (série, paralelo ou misto)
    let selectedCircuit = "series";

    function format(value, decimals = 2) {
        return Number(value).toFixed(decimals).replace(".", ",");
    }

    function updateText(id, value) {
        document.getElementById(id).textContent = value;
    }

    function getParameters() {

        return {
            voltage: Number(voltageInput.value),

            resistances: resistanceInputs.map(input =>
                Number(input.value)
            )
        };

    }

    // Calcula Req, corrente total e os valores de cada resistor
    function calculateCircuit(voltage, resistances, type) {
        const activeResistances = type === "mixed" ? resistances : resistances.slice(0, 2);
        let equivalentResistance = 0;
        let totalCurrent = 0;
        const components = [];

        // Série: Req = soma dos R, e a corrente é a mesma em todos
        if (type === "series") {
            equivalentResistance = activeResistances.reduce(
                (total, activeResistances) => total + activeResistances,
                0
            );

            totalCurrent = voltage / equivalentResistance;

            activeResistances.forEach((resistance, index) => {
                const current = totalCurrent;
                const componentVoltage = current * resistance;
                const power = componentVoltage * current;

                components.push({
                    name: `R${index + 1}`,
                    resistance,
                    voltage: componentVoltage,
                    current,
                    power
                });

            });

        }

        // Paralelo: 1/Req = soma de 1/R, e a tensão é a mesma em todos
        else if (type === "parallel") {
            const inverseSum = activeResistances.reduce(
                (total, activeResistances) => total + (1 / activeResistances),
                0
            );

            equivalentResistance = 1 / inverseSum;
            totalCurrent = voltage / equivalentResistance;

            activeResistances.forEach((resistance, index) => {
                const componentVoltage = voltage;
                const current = componentVoltage / resistance;
                const power = componentVoltage * current;

                components.push({
                    name: `R${index + 1}`,
                    resistance,
                    voltage: componentVoltage,
                    current,
                    power
                });

            });

        }

        // Misto: R1 em série com (R2 // R3)
        else if (type === "mixed") {

            const parallelResistance =
                (resistances[1] * resistances[2]) /
                (resistances[1] + resistances[2]);

            equivalentResistance =
                resistances[0] + parallelResistance;

            totalCurrent = voltage / equivalentResistance;

            // A tensão que sobra depois de R1 fica no trecho em paralelo
            const voltageR1 = totalCurrent * resistances[0];

            const parallelVoltage = voltage - voltageR1;

            const currentR2 = parallelVoltage / resistances[1];
            const currentR3 = parallelVoltage / resistances[2];

            components.push({
                name: "R1",
                resistance: resistances[0],
                voltage: voltageR1,
                current: totalCurrent,
                power: voltageR1 * totalCurrent
            });

            components.push({
                name: "R2",
                resistance: resistances[1],
                voltage: parallelVoltage,
                current: currentR2,
                power: parallelVoltage * currentR2
            });

            components.push({
                name: "R3",
                resistance: resistances[2],
                voltage: parallelVoltage,
                current: currentR3,
                power: parallelVoltage * currentR3
            });

        }

        return {
            equivalentResistance,
            totalCurrent,
            totalVoltage: voltage,
            totalPower: voltage * totalCurrent,
            components
        };

    }

    // Mostra os resultados nos cards e monta a tabela dos resistores
    function updateResults(results) {

        updateText(
            "result-resistance",
            `${format(results.equivalentResistance)} Ω`
        );

        updateText(
            "result-current",
            `${format(results.totalCurrent)} A`
        );

        updateText(
            "result-voltage",
            `${format(results.totalVoltage)} V`
        );

        updateText(
            "result-power",
            `${format(results.totalPower)} W`
        );

        resultsBody.innerHTML = "";

        results.components.forEach(component => {

            const row = document.createElement("tr");

            const values = [
                component.name,
                `${format(component.resistance)} Ω`,
                `${format(component.voltage)} V`,
                `${format(component.current)} A`,
                `${format(component.power)} W`
            ];

            values.forEach(value => {

                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);

            });

            resultsBody.appendChild(row);

        });

    }

    // Desenha o zigue-zague do resistor no SVG (deitado)
    function resistorHorizontal(x, y, name) {
        return `
            <path class="circuit-resistor"
                d="
                M ${x} ${y}
                L ${x + 10} ${y - 10}
                L ${x + 25} ${y + 10}
                L ${x + 40} ${y - 10}
                L ${x + 55} ${y + 10}
                L ${x + 70} ${y - 10}
                L ${x + 85} ${y}
                Z
                " />

            <text class="circuit-text"
                x="${x + 47}" y="${y - 25}"
                text-anchor="middle">${name}</text>
        `;
    }

    // Mesmo resistor, só que em pé (usado no paralelo)
    function resistorVertical(x, y, name) {
        return `
            <path class="circuit-resistor"
                d="
                M ${x} ${y}
                L ${x - 10} ${y + 10}
                L ${x + 10} ${y + 25}
                L ${x - 10} ${y + 40}
                L ${x + 10} ${y + 55}
                L ${x - 10} ${y + 70}
                L ${x} ${y + 85}
                Z
                " />

            <text class="circuit-text"
                x="${x + 25}" y="${y + 48}">${name}</text>
        `;

    }

    // Desenha o símbolo da bateria
    function battery(x, y) {

        return `
            <line class="circuit-battery"
                x1="${x - 9}" y1="${y - 18}"
                x2="${x + 9}" y2="${y - 18}" />

            <line class="circuit-battery"
                x1="${x - 17}" y1="${y}"
                x2="${x + 17}" y2="${y}" />

            <text class="circuit-positive"
                x="${x + 25}" y="${y - 13}">+</text>

            <text class="circuit-small-text"
                x="${x + 24}" y="${y + 13}">−</text>
        `;

    }

    // Monta o diagrama do circuito de acordo com o tipo escolhido
    function drawCircuit(resistances, voltage) {

        let drawing = "";

        if (selectedCircuit === "series") {

            drawing = `
                <path class="circuit-wire"
                    d="M 100 162 V 65 H 170
                       M 255 65 H 335
                       M 420 65 H 500 V 235 H 100 V 180" />

                ${battery(100, 180)}

                ${resistorHorizontal(170, 65, "R1")}
                ${resistorHorizontal(335, 65, "R2")}

                <text class="circuit-resistance-value"
                    x="212" y="105"
                    text-anchor="middle">${resistances[0]} Ω</text>

                <text class="circuit-resistance-value"
                    x="377" y="105"
                    text-anchor="middle">${resistances[1]} Ω</text>

                <text class="circuit-text"
                    x="300" y="275"
                    text-anchor="middle">Circuito em série</text>
            `;

        }

        else if (selectedCircuit === "parallel") {
            drawing = `
                <path class="circuit-wire"
                    d="M 100 162 V 65 H 405
                       M 100 180 V 235 H 405" />

                <path class="circuit-wire"
                    d="M 225 65 V 125
                       M 225 210 V 235
                       M 405 65 V 125
                       M 405 210 V 235" />

                ${battery(100, 180)}
                ${resistorVertical(225, 125, "R1")}
                ${resistorVertical(405, 125, "R2")}

                <text class="circuit-resistance-value"
                    x="250" y="191">${resistances[0]} Ω</text>

                <text class="circuit-resistance-value"
                    x="430" y="191">${resistances[1]} Ω</text>

                <text class="circuit-text"
                    x="255" y="275"
                    text-anchor="middle">Circuito em paralelo</text>
            `;

        }

        else if (selectedCircuit === "mixed") {
            drawing = `
                <path class="circuit-wire"
                    d="M 100 162 V 65 H 170
                       M 255 65 H 420
                       M 100 180 V 235 H 420" />

                <path class="circuit-wire"
                    d="M 290 65 V 125
                       M 290 210 V 235
                       M 420 65 V 125
                       M 420 210 V 235" />

                ${battery(100, 180)}

                ${resistorHorizontal(170, 65, "R1")}
                ${resistorVertical(290, 125, "R2")}
                ${resistorVertical(420, 125, "R3")}

                <text class="circuit-resistance-value"
                    x="210" y="105"
                    text-anchor="middle">${resistances[0]} Ω</text>

                <text class="circuit-resistance-value"
                    x="315" y="191">${resistances[1]} Ω</text>

                <text class="circuit-resistance-value"
                    x="445" y="191">${resistances[2]} Ω</text>

                <text class="circuit-text"
                    x="260" y="275"
                    text-anchor="middle">Circuito misto</text>
            `;
        }

        diagram.innerHTML = `
            <svg viewBox="0 0 620 300"
                 role="img"
                 aria-label="Diagrama do circuito elétrico">

                ${drawing}

                <text class="circuit-text"
                    x="65" y="175"
                    text-anchor="end">Fonte</text>

                <text class="circuit-small-text"
                    x="65" y="195"
                    text-anchor="end">${format(voltage)} V</text>

            </svg>
        `;
    }

    // Lê os valores, recalcula e redesenha tudo
    function updateSimulation() {

        const parameters = getParameters();
        const voltage = parameters.voltage;
        const resistances = parameters.resistances;

        updateText("voltage-value", voltage);

        resistances.forEach((resistance, index) => {
            updateText(
                `resistance-${index + 1}-value`,
                resistance
            );

        });

        const results = calculateCircuit(
            voltage,
            resistances,
            selectedCircuit
        );

        updateResults(results);
        drawCircuit(resistances, voltage);
    }

    // Botões de série / paralelo / misto (R3 só aparece no misto)
    circuitButtons.forEach(button => {

        button.addEventListener("click", () => {

            selectedCircuit = button.dataset.circuit;

            circuitButtons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            resistance3Group.style.display =
                selectedCircuit === "mixed" ? "block" : "none";

            updateSimulation();

        });
    });

    // Recalcula sempre que mexer em algum slider
    voltageInput.addEventListener("input", updateSimulation);

    resistanceInputs.forEach(input => {
        input.addEventListener("input", updateSimulation);
    });

    // Botão de resetar volta pros valores padrão
    document.getElementById("reset-circuit")
        .addEventListener("click", () => {

            voltageInput.value = defaults.voltage;

            resistanceInputs.forEach((input, index) => {
                input.value = defaults.resistances[index];
            });

            updateSimulation();

        });

    resistance3Group.style.display = "none";
    updateSimulation();
});