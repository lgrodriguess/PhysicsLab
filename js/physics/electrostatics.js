document.addEventListener("DOMContentLoaded", () => {

    const COLORS = window.PhysicsUtils.colors;

    // Módulo de eletrostática: duas cargas no eixo x e um ponto P
    const svg = document.getElementById("es-svg");
    if (!svg) return;

    const { constants, formatNumber, formatSI } = window.PhysicsUtils;
    const k = constants.k;

    const inputs = {
        q1: document.getElementById("es-q1"),
        q2: document.getElementById("es-q2"),
        d: document.getElementById("es-d"),
        px: document.getElementById("es-px"),
        py: document.getElementById("es-py")
    };

    const out = {
        eMag: document.getElementById("es-e-mag"),
        eAngle: document.getElementById("es-e-angle"),
        eComp: document.getElementById("es-e-comp"),
        potential: document.getElementById("es-potential"),
        force: document.getElementById("es-force"),
        dist: document.getElementById("es-dist"),
        explanation: document.getElementById("es-explanation")
    };

    const g = {
        lines: document.getElementById("es-lines"),
        arrows: document.getElementById("es-line-arrows"),
        charges: document.getElementById("es-charges"),
        equi: document.getElementById("es-equipotential"),
        vector: document.getElementById("es-vector"),
        head: document.getElementById("es-vector-head"),
        probe: document.getElementById("es-probe"),
        label: document.getElementById("es-probe-label")
    };

    // Entradas no SI: cargas em C e distâncias em m (por dentro o módulo usa nC e cm)
    const defaults = { q1: 5e-9, q2: -5e-9, d: 0.4, px: 0.2, py: 0.15 };

    // Posições em cm; S é a escala e (OX, OY) é a origem no desenho
    const S = 4.6;
    const OX = 116;
    const OY = 160;
    const X_MIN = -20, X_MAX = 100, Y_LIM = 34;

    const toPx = (x, y) => [OX + S * x, OY - S * y];

    // Lê os campos e retorna null se algum valor for inválido
    function readValues() {
        const v = {};
        for (const [key, el] of Object.entries(inputs)) {
            v[key] = Number(el.value);
            if (el.value.trim() === "" || !Number.isFinite(v[key])) return null;
        }
        // C -> nC e m -> cm (arredonda pra não sobrar ruído de ponto flutuante)
        const scale = (x, factor) => Number((x * factor).toPrecision(12));
        v.q1 = scale(v.q1, 1e9);
        v.q2 = scale(v.q2, 1e9);
        v.d = scale(v.d, 100);
        v.px = scale(v.px, 100);
        v.py = scale(v.py, 100);
        if (Math.abs(v.q1) > 50 || Math.abs(v.q2) > 50) return null;
        if (v.d < 10 || v.d > 80) return null;
        if (v.px < X_MIN || v.px > X_MAX || Math.abs(v.py) > 33) return null;
        return v;
    }

    // Calcula o campo E e o potencial V num ponto, somando o efeito de cada carga
    // E = k·q/r²  e  V = k·q/r  (cargas em nC, distâncias em cm)
    function fieldAt(charges, x, y) {
        let ex = 0, ey = 0, V = 0;
        for (const c of charges) {
            const dx = (x - c.x) / 100;
            const dy = (y - c.y) / 100;
            const r2 = Math.max(dx * dx + dy * dy, 1e-6);
            const r = Math.sqrt(r2);
            const q = c.q * 1e-9;
            const e = k * q / r2;
            ex += e * dx / r;
            ey += e * dy / r;
            V += k * q / r;
        }
        return { ex, ey, V };
    }

    // Segue a direção do campo passo a passo pra desenhar uma linha de campo
    function traceLine(charges, start, sign) {
        const pts = [[start.x, start.y]];
        let x = start.x, y = start.y;
        for (let i = 0; i < 900; i++) {
            const f = fieldAt(charges, x, y);
            const mag = Math.hypot(f.ex, f.ey);
            if (!mag) break;
            x += sign * 0.45 * f.ex / mag;
            y += sign * 0.45 * f.ey / mag;
            pts.push([x, y]);
            if (x < X_MIN - 2 || x > X_MAX + 2 || Math.abs(y) > Y_LIM + 2) break;
            if (charges.some(c => Math.hypot(x - c.x, y - c.y) < 1.1)) break;
        }
        return pts;
    }

    // Desenha as linhas de campo saindo das cargas (com setinhas no meio)
    function drawFieldLines(charges) {
        g.lines.innerHTML = "";
        g.arrows.innerHTML = "";

        const active = charges.filter(c => c.q !== 0);
        if (!active.length) return;

        const hasPositive = active.some(c => c.q > 0);
        const sources = active.filter(c => hasPositive ? c.q > 0 : c.q < 0);
        const sign = hasPositive ? 1 : -1;
        const maxQ = Math.max(...active.map(c => Math.abs(c.q)));

        let paths = "";
        let heads = "";

        for (const src of sources) {
            const n = Math.max(6, Math.round(16 * Math.abs(src.q) / maxQ));
            for (let i = 0; i < n; i++) {
                const a = 2 * Math.PI * (i + 0.5) / n;
                const start = { x: src.x + 1.1 * Math.cos(a), y: src.y + 1.1 * Math.sin(a) };
                const pts = traceLine(charges, start, sign);
                if (pts.length < 2) continue;

                paths += "M" + pts.map(p => toPx(p[0], p[1]).map(n2 => n2.toFixed(1)).join(" ")).join(" L");

                const mid = Math.floor(pts.length / 2);
                if (mid >= 1 && pts.length > 8) {
                    const [x1, y1] = toPx(pts[mid - 1][0], pts[mid - 1][1]);
                    const [x2, y2] = toPx(pts[mid][0], pts[mid][1]);
                    const ang = Math.atan2(y2 - y1, x2 - x1) + (hasPositive ? 0 : Math.PI);
                    const ca = Math.cos(ang), sa = Math.sin(ang);
                    const px = (x1 + x2) / 2, py = (y1 + y2) / 2;
                    const pts2 = [[6, 0], [-4, 4], [-4, -4]].map(([u, w]) => `${(px + u * ca - w * sa).toFixed(1)},${(py + u * sa + w * ca).toFixed(1)}`);
                    heads += `<polygon points="${pts2.join(" ")}"/>`;
                }
            }
        }

        g.lines.innerHTML = `<path d="${paths}"/>`;
        g.arrows.innerHTML = heads;
    }

    // Desenha as cargas: vermelha = positiva, azul = negativa
    function drawCharges(charges) {
        g.charges.innerHTML = charges.map((c, i) => {
            const [x, y] = toPx(c.x, c.y);
            const fill = c.q > 0 ? COLORS.red : c.q < 0 ? COLORS.blue : COLORS.neutral;
            const sign = c.q > 0 ? "+" : c.q < 0 ? "−" : "0";
            return `
                <circle cx="${x}" cy="${y}" r="13" fill="${fill}" stroke="#fff" stroke-width="2"/>
                <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">${sign}</text>
                <text x="${x}" y="${y + 32}" text-anchor="middle" font-size="12" fill="${COLORS.textMuted}">q${i + 1} = ${formatSI(Number((c.q * 1e-9).toPrecision(12)), "C")}</text>
            `;
        }).join("");
    }

    // Desenha a linha equipotencial que passa por P
    // (procura na grade os pontos onde o potencial é igual ao de P)
    function drawEquipotential(charges, level) {
        const step = 1;
        const nx = Math.round((X_MAX - X_MIN) / step);
        const ny = Math.round(2 * Y_LIM / step);
        const clamp = v => Math.max(-1e5, Math.min(1e5, v));

        const val = [];
        for (let j = 0; j <= ny; j++) {
            const row = [];
            for (let i = 0; i <= nx; i++) {
                row.push(clamp(fieldAt(charges, X_MIN + i * step, -Y_LIM + j * step).V) - level);
            }
            val.push(row);
        }

        const cross = (x1, y1, v1, x2, y2, v2) => {
            const t = v1 / (v1 - v2);
            return toPx(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
        };

        let d = "";
        for (let j = 0; j < ny; j++) {
            for (let i = 0; i < nx; i++) {
                const x = X_MIN + i * step, y = -Y_LIM + j * step;
                const v0 = val[j][i], v1 = val[j][i + 1], v2 = val[j + 1][i + 1], v3 = val[j + 1][i];
                const pts = [];
                if ((v0 < 0) !== (v1 < 0)) pts.push(cross(x, y, v0, x + step, y, v1));
                if ((v1 < 0) !== (v2 < 0)) pts.push(cross(x + step, y, v1, x + step, y + step, v2));
                if ((v3 < 0) !== (v2 < 0)) pts.push(cross(x, y + step, v3, x + step, y + step, v2));
                if ((v0 < 0) !== (v3 < 0)) pts.push(cross(x, y, v0, x, y + step, v3));
                if (pts.length === 2) {
                    d += `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}L${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)}`;
                } else if (pts.length === 4) {
                    d += `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}L${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)}`;
                    d += `M${pts[2][0].toFixed(1)} ${pts[2][1].toFixed(1)}L${pts[3][0].toFixed(1)} ${pts[3][1].toFixed(1)}`;
                }
            }
        }
        g.equi.setAttribute("d", d);
    }

    // Desenha o ponto P e a seta do campo elétrico nele
    function drawProbe(v, f) {
        const [x, y] = toPx(v.px, v.py);
        g.probe.setAttribute("cx", x);
        g.probe.setAttribute("cy", y);
        g.label.setAttribute("x", x + 12);
        g.label.setAttribute("y", y - 10);

        const mag = Math.hypot(f.ex, f.ey);
        if (!mag) {
            g.vector.setAttribute("opacity", 0);
            g.head.setAttribute("opacity", 0);
            return;
        }
        g.vector.setAttribute("opacity", 1);
        g.head.setAttribute("opacity", 1);

        const ux = f.ex / mag, uy = -f.ey / mag;
        const len = 46;
        const x2 = x + ux * len, y2 = y + uy * len;
        g.vector.setAttribute("x1", x + ux * 9);
        g.vector.setAttribute("y1", y + uy * 9);
        g.vector.setAttribute("x2", x2 - ux * 6);
        g.vector.setAttribute("y2", y2 - uy * 6);
        const nxp = -uy, nyp = ux;
        g.head.setAttribute("points", [
            [x2, y2],
            [x2 - ux * 12 + nxp * 6, y2 - uy * 12 + nyp * 6],
            [x2 - ux * 12 - nxp * 6, y2 - uy * 12 - nyp * 6]
        ].map(p => p.join(",")).join(" "));
    }

    // Monta o texto explicando o resultado
    function explain(v, f) {
        const mag = Math.hypot(f.ex, f.ey);
        if (!mag) {
            return "As duas cargas são nulas, então não há campo nem potencial.";
        }
        const same = v.q1 * v.q2 > 0;
        const opposite = v.q1 * v.q2 < 0;
        let text = "O campo em P é a soma vetorial dos campos de q1 e q2, e o potencial é a soma algébrica dos potenciais de cada uma. ";
        if (same) text += "Como as cargas têm o mesmo sinal, elas se repelem e as linhas de campo se afastam uma da outra. ";
        if (opposite) text += "Como as cargas têm sinais opostos, elas se atraem e as linhas de campo saem da positiva e chegam à negativa. ";
        text += f.V >= 0
            ? "O potencial positivo indica que, em P, domina a influência de cargas positivas."
            : "O potencial negativo indica que, em P, domina a influência de cargas negativas.";
        return text;
    }

    // Função principal: calcula tudo e atualiza a tela
    function update() {
        const v = readValues();
        if (!v) {
            out.explanation.textContent = "Informe valores válidos dentro dos limites indicados nos campos.";
            return;
        }

        const charges = [
            { x: 0, y: 0, q: v.q1 },
            { x: v.d, y: 0, q: v.q2 }
        ];

        const f = fieldAt(charges, v.px, v.py);
        const mag = Math.hypot(f.ex, f.ey);
        const angle = Math.atan2(f.ey, f.ex) * 180 / Math.PI;
        const r1 = Math.hypot(v.px - charges[0].x, v.py - charges[0].y);
        const r2 = Math.hypot(v.px - charges[1].x, v.py - charges[1].y);

        out.eMag.textContent = formatSI(mag, "N/C");
        out.eAngle.textContent = mag ? `${formatNumber(angle, 1)}°` : "—";
        out.eComp.textContent = `${formatNumber(f.ex, 2)} ; ${formatNumber(f.ey, 2)} N/C`;
        out.potential.textContent = formatSI(f.V, "V");
        // Força numa carga de prova de 1 nC: F = q·E
        out.force.textContent = formatSI(mag * 1e-9, "N");
        out.dist.textContent = `${formatNumber(r1 / 100, 3)} ; ${formatNumber(r2 / 100, 3)} m`;
        out.explanation.textContent = explain(v, f);

        drawFieldLines(charges);
        drawEquipotential(charges, f.V);
        drawCharges(charges);
        drawProbe(v, f);
    }

    // Recalcula sempre que algum campo muda
    Object.values(inputs).forEach(el => el.addEventListener("input", update));

    document.getElementById("es-reset").addEventListener("click", () => {
        for (const [key, el] of Object.entries(inputs)) el.value = defaults[key];
        update();
    });

    // Arrastar o ponto P
    let dragging = false;

    function moveProbe(event) {
        const pt = svg.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        const x = Math.round((p.x - OX) / S);
        const y = Math.round((OY - p.y) / S);
        // O desenho trabalha em cm, mas o campo de entrada é em m
        inputs.px.value = Math.max(X_MIN, Math.min(X_MAX, x)) / 100;
        inputs.py.value = Math.max(-33, Math.min(33, y)) / 100;
        update();
    }

    g.probe.addEventListener("pointerdown", event => {
        dragging = true;
        g.probe.setPointerCapture(event.pointerId);
        g.probe.style.cursor = "grabbing";
        event.preventDefault();
    });
    g.probe.addEventListener("pointermove", event => {
        if (dragging) moveProbe(event);
    });
    g.probe.addEventListener("pointerup", () => {
        dragging = false;
        g.probe.style.cursor = "grab";
    });
    g.probe.addEventListener("pointercancel", () => {
        dragging = false;
        g.probe.style.cursor = "grab";
    });

    update();
});
