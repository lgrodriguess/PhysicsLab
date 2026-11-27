document.addEventListener("DOMContentLoaded", () => {

    // Módulo de capacitores de placas paralelas
    const svg = document.getElementById("cap-svg");
    if (!svg) return;

    const { constants, formatNumber, formatSI } = window.PhysicsUtils;
    const eps0 = constants.epsilon0;

    const el = id => document.getElementById(id);

    const inputs = {
        area: el("cap-area"),
        dist: el("cap-dist"),
        kappa: el("cap-kappa"),
        voltage: el("cap-voltage"),
        c1: el("cap-c1"),
        c2: el("cap-c2"),
        assocV: el("cap-assoc-v")
    };
    const material = el("cap-material");
    const mode = el("cap-mode");

    const defaults = { area: 0.01, dist: 0.002, kappa: 1, voltage: 12, c1: 0.000006, c2: 0.000003, assocV: 18 };

    const NS = "http://www.w3.org/2000/svg";

    // Lê os campos e retorna null se algum valor for inválido
    function read() {
        const v = {};
        for (const [key, input] of Object.entries(inputs)) {
            v[key] = Number(input.value);
            if (input.value.trim() === "" || !Number.isFinite(v[key])) return null;
        }
        // Entradas no SI: área em m², distância em m, capacitâncias em F
        if (v.area < 0.0001 || v.area > 1) return null;
        if (v.dist < 0.0001 || v.dist > 0.02) return null;
        if (v.kappa < 1 || v.kappa > 100) return null;
        if (v.voltage < 1 || v.voltage > 1000) return null;
        if (v.c1 <= 0 || v.c2 <= 0 || v.assocV <= 0) return null;
        return v;
    }

    // Desenha o capacitor: placas, dielétrico, cargas e campo
    function draw(v, r) {
        const gap = 22 + v.dist * 1000 * 6;   // desenho em px: 6 px por mm de distância
        const top = 150 - gap / 2 - 10;
        const bottom = 150 + gap / 2;

        const plateTop = el("cap-plate-top");
        const plateBottom = el("cap-plate-bottom");
        const diel = el("cap-dielectric");

        plateTop.setAttribute("y", top);
        plateBottom.setAttribute("y", bottom);
        diel.setAttribute("y", top + 10);
        diel.setAttribute("height", gap);
        diel.setAttribute("opacity", v.kappa > 1 ? Math.min(0.55, 0.15 + Math.log10(v.kappa) * 0.2) : 0);

        // Quanto mais carga, mais sinais de + e − aparecem nas placas
        const count = Math.max(2, Math.min(12, Math.round(2 + Math.log10(Math.max(r.Q, 1e-12) / 1e-12) * 1.1)));
        let signs = "";
        for (let i = 0; i < count; i++) {
            const x = 190 + (220 * (i + 0.5)) / count;
            signs += `<text x="${x}" y="${top - 6}" fill="#dc2626">+</text>`;
            signs += `<text x="${x}" y="${bottom + 26}" fill="#2563eb">−</text>`;
        }
        el("cap-signs").innerHTML = signs;

        // Setas do campo, mais densas quando E é maior
        const arrows = Math.max(3, Math.min(9, Math.round(3 + Math.log10(Math.max(r.E, 1)) )));
        // Quanto maior o κ do dielétrico, mais grossas e mais "pesadas" ficam as setas
        // (κ = 1 mantém o tamanho original; κ = 100 chega a ~3,2x)
        const scale = 1 + Math.log10(v.kappa) * 1.1;
        const strokeWidth = 2 * scale;
        const y1 = top + 11;                            // logo abaixo da placa de cima
        const y2 = bottom - 1;                          // logo acima da placa de baixo
        const head = Math.min(9 * scale, (y2 - y1) * 0.8); // altura da ponta (cabe entre as placas)
        const half = head * 0.6;                        // meia largura da ponta
        let field = "";
        for (let i = 0; i < arrows; i++) {
            const x = 190 + (220 * (i + 0.5)) / arrows;
            field += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2 - head + 1}" stroke-width="${strokeWidth}"/><polygon points="${x},${y2} ${x - half},${y2 - head} ${x + half},${y2 - head}" stroke="none"/>`;
        }
        el("cap-field").innerHTML = field;

        // Fios e bateria (ou chave aberta)
        const connected = mode.value === "connected";
        let wires = `<path d="M 300 ${top} V 36 H 90 V 120"/><path d="M 300 ${bottom + 10} V 264 H 90 V 180"/>`;
        wires += `<line x1="74" y1="120" x2="106" y2="120" stroke-width="4"/><line x1="82" y1="132" x2="98" y2="132" stroke-width="4"/>`;
        wires += `<line x1="82" y1="168" x2="98" y2="168" stroke-width="4"/><line x1="74" y1="180" x2="106" y2="180" stroke-width="4"/>`;
        el("cap-wires").innerHTML = wires + (connected ? "" : `<line x1="300" y1="36" x2="326" y2="20" stroke="#dc2626"/>`);
    }

    // Função principal: calcula tudo e atualiza a tela
    function update() {
        const v = read();
        const explanation = el("cap-explanation");
        if (!v) {
            explanation.textContent = "Informe valores válidos dentro dos limites indicados nos campos.";
            return;
        }

        // Área e distância já estão em m² e m: C0 = ε0·A/d e C = κ·C0
        const A = v.area;
        const d = v.dist;
        const C0 = eps0 * A / d;
        const C = v.kappa * C0;

        let Q, V;
        // Bateria ligada: V fica fixo. Bateria desligada: Q fica fixo
        if (mode.value === "connected") {
            V = v.voltage;
            Q = C * V;
        } else {
            Q = C0 * v.voltage;
            V = Q / C;
        }

        // Campo entre as placas (E = V/d) e energia (U = C·V²/2)
        const E = V / d;
        const U = 0.5 * C * V * V;

        el("cap-c0").textContent = formatSI(C0, "F");
        el("cap-c").textContent = formatSI(C, "F");
        el("cap-q").textContent = formatSI(Q, "C");
        el("cap-v").textContent = formatSI(V, "V");
        el("cap-e").textContent = formatSI(E, "V/m");
        el("cap-u").textContent = formatSI(U, "J");

        el("cap-visual-value").textContent = `C = ${formatSI(C, "F")} · Q = ${formatSI(Q, "C")} · V = ${formatSI(V, "V")}`;

        if (mode.value === "connected") {
            explanation.textContent = v.kappa > 1
                ? `Com a bateria ligada, a tensão fica em ${formatNumber(V)} V. O dielétrico multiplica a capacitância por ${formatNumber(v.kappa)} e a carga armazenada também, por isso a energia cresce na mesma proporção.`
                : "Sem dielétrico, C = ε0·A/d. Aumente a área ou aproxime as placas para aumentar a capacitância.";
        } else {
            explanation.textContent = v.kappa > 1
                ? `O capacitor foi carregado com ${formatNumber(v.voltage)} V e depois desligado da bateria, então a carga ${formatSI(Q, "C")} não muda. Com o dielétrico, a capacitância sobe por κ = ${formatNumber(v.kappa)} e a tensão cai para ${formatSI(V, "V")}. A energia também cai, porque parte do trabalho é feito sobre o dielétrico quando ele é puxado para dentro.`
                : "Sem dielétrico, nada mudou em relação ao capacitor carregado. Aumente κ para ver a tensão cair com a carga constante.";
        }

        // Associação de dois capacitores: série e paralelo
        const c1 = v.c1;
        const c2 = v.c2;
        // Série: 1/Ceq = 1/C1 + 1/C2   |   Paralelo: Ceq = C1 + C2
        const cs = c1 * c2 / (c1 + c2);
        const cp = c1 + c2;
        const qs = cs * v.assocV;
        el("cap-series-ceq").textContent = formatSI(cs, "F");
        el("cap-parallel-ceq").textContent = formatSI(cp, "F");
        el("cap-series-detail").textContent = `${formatSI(qs, "C")} ; ${formatNumber(qs / c1, 3)} V ; ${formatNumber(qs / c2, 3)} V`;
        el("cap-parallel-detail").textContent = `${formatNumber(v.assocV, 3)} V ; ${formatSI(c1 * v.assocV, "C")} ; ${formatSI(c2 * v.assocV, "C")}`;

        draw(v, { Q, E });
    }

    Object.values(inputs).forEach(input => input.addEventListener("input", update));
    mode.addEventListener("change", update);

    // Ao escolher um material, coloca o κ dele no campo
    material.addEventListener("change", () => {
        if (material.value !== "custom") inputs.kappa.value = material.value;
        update();
    });

    // Se digitar um κ que bate com algum material, seleciona ele na lista
    inputs.kappa.addEventListener("input", () => {
        const match = [...material.options].find(o => o.value !== "custom" && Number(o.value) === Number(inputs.kappa.value));
        material.value = match ? match.value : "custom";
    });

    el("cap-reset").addEventListener("click", () => {
        for (const [key, input] of Object.entries(inputs)) input.value = defaults[key];
        material.value = "1";
        mode.value = "connected";
        update();
    });

    update();
});
