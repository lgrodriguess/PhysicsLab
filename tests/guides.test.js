// Confere se os números citados nos textos "O que observar" dos cenários
// batem com a física (js/data/guides.js).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadSite, makeSolver, close } = require("./load");

const { formulas, guides } = loadSite();
const solve = makeSolver(formulas);
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

const scenario = (page, id) => {
    const s = guides[page].scenarios.find(item => item.id === id);
    assert.ok(s, `cenário ${page}/${id} não existe`);
    return s;
};

// Texto no formato brasileiro: 0.6 -> "0,6"
const br = value => String(Number(value.toPrecision(6))).replace(".", ",");

function assertMentions(s, value, unit) {
    const text = `${br(value)} ${unit}`;
    assert.ok(s.observe.includes(text), `"${s.label}" deveria citar "${text}"`);
}

test("todo cenário aponta para campos que existem na página", () => {
    for (const [page, guide] of Object.entries(guides)) {
        assert.ok(html.includes(`id="${page}"`), `página ${page} não existe`);
        for (const s of guide.scenarios) {
            for (const id of Object.keys(s.values)) {
                assert.ok(html.includes(`id="${id}"`), `${page}/${s.id}: campo ${id} não existe`);
            }
        }
    }
});

test("todo guia tem objetivos, cenários, perguntas, erros comuns e dicas", () => {
    for (const [page, guide] of Object.entries(guides)) {
        for (const key of ["title", "goals", "scenarios", "questions", "mistakes", "teacher"]) {
            assert.ok(guide[key] && guide[key].length, `${page}: falta ${key}`);
        }
    }
});

// ---- Circuitos ----
test("circuitos: série com resistores iguais", () => {
    const s = scenario("circuits", "series-equal");
    const v = s.values;
    const I = solve("ohm", "I", { U: v["circuit-voltage"], R: v["resistance-1"] + v["resistance-2"] });
    assertMentions(s, I, "A");
    assertMentions(s, solve("ohm", "U", { R: v["resistance-1"], I }), "V");
});

test("circuitos: série com resistores diferentes", () => {
    const s = scenario("circuits", "series-diff");
    const v = s.values;
    const I = solve("ohm", "I", { U: v["circuit-voltage"], R: v["resistance-1"] + v["resistance-2"] });
    assertMentions(s, I, "A");
    assertMentions(s, I * v["resistance-2"], "V");
    assertMentions(s, I * v["resistance-1"], "V");
});

test("circuitos: paralelo com resistores iguais", () => {
    const s = scenario("circuits", "parallel-equal");
    const Req = solve("parallel", "Req", { R1: s.values["resistance-1"], R2: s.values["resistance-2"] });
    assertMentions(s, Req, "Ω");
});

test("circuitos: paralelo com resistores diferentes", () => {
    const s = scenario("circuits", "parallel-diff");
    const U = s.values["circuit-voltage"];
    assertMentions(s, U / s.values["resistance-1"], "A");
    assertMentions(s, U / s.values["resistance-2"], "A");
});

test("circuitos: associação mista", () => {
    const s = scenario("circuits", "mixed");
    const v = s.values;
    const Rp = solve("parallel", "Req", { R1: v["resistance-2"], R2: v["resistance-3"] });
    const Req = v["resistance-1"] + Rp;
    const I = v["circuit-voltage"] / Req;
    assertMentions(s, Rp, "Ω");
    assertMentions(s, Req, "Ω");
    assertMentions(s, I, "A");
    assertMentions(s, I / 2, "A");
});

test("circuitos: dobrar a tensão quadruplica a potência", () => {
    const s = scenario("circuits", "double-voltage");
    const v = s.values;
    const R = v["resistance-1"] + v["resistance-2"];
    const I = v["circuit-voltage"] / R;
    assertMentions(s, I, "A");
    assertMentions(s, solve("joule", "P", { R, I }), "W");
});

// ---- Magnetismo ----
for (const id of ["positive-in", "strong-field"]) {
    test(`magnetismo: raio da trajetória (${id})`, () => {
        const v = scenario("magnetism", id).values;
        const r = solve("radius", "r", { m: v["mag-mass"], v: v["mag-velocity"], q: Math.abs(v["mag-charge"]), B: v["mag-field"] });
        const strong = scenario("magnetism", "strong-field");
        // O texto do cenário "campo 4× mais forte" compara os dois raios
        assert.ok(strong.observe.includes(`${br(r)} m`), `deveria citar o raio ${br(r)} m`);
    });
}

test("magnetismo: v paralela a B dá força nula", () => {
    const v = scenario("magnetism", "parallel").values;
    const F = solve("magforce", "F", { q: v["mag-charge"], v: v["mag-velocity"], B: v["mag-field"], theta: v["mag-angle"] });
    assert.equal(F, 0);
});

// ---- Indução ----
function inductionEmf(id) {
    const v = scenario("induction", id).values;
    const phi = (B, angle) => solve("flux", "Phi", { B, A: v["induction-area"], theta: angle });
    const dPhi = phi(v["induction-field-final"], v["induction-angle-final"]) - phi(v["induction-field-initial"], v["induction-angle-initial"]);
    // A calculadora dá o módulo (ε = N · |ΔΦ| / Δt); o sinal vem da Lei de Lenz: ε = −N · ΔΦ / Δt
    const magnitude = solve("faraday", "emf", { N: v["induction-turns"], dPhi, dt: v["induction-time"] });
    return dPhi === 0 ? 0 : -Math.sign(dPhi) * magnitude;
}

test("indução: FEM quando B aumenta e quando B diminui", () => {
    const up = inductionEmf("increase");
    const down = inductionEmf("decrease");
    assert.ok(close(up, -0.08) && close(down, 0.08), `ε = ${up} e ${down}`);
    assert.ok(scenario("induction", "increase").observe.includes("−0,08 V"));
    assert.ok(scenario("induction", "decrease").observe.includes("+0,08 V"));
});

test("indução: campo constante não gera FEM", () => {
    assert.equal(inductionEmf("constant"), 0);
});

test("indução: 10× mais espiras e variação 10× mais rápida dão FEM 10× maior", () => {
    const base = inductionEmf("increase");
    assert.ok(close(inductionEmf("more-turns"), 10 * base));
    assert.ok(close(inductionEmf("faster"), 10 * base));
    assert.ok(scenario("induction", "more-turns").observe.includes("−0,8 V"));
});

// ---- Capacitores ----
test("capacitores: associação do exemplo de aula", () => {
    const s = scenario("capacitors", "assoc");
    const C1 = s.values["cap-c1"], C2 = s.values["cap-c2"], U = s.values["cap-assoc-v"];
    const Cs = solve("cseries", "Ceq", { C1, C2 });
    const Q = solve("capcharge", "Q", { C: Cs, V: U });
    assertMentions(s, Q / C2, "V");   // o menor capacitor fica com a maior tensão
    assertMentions(s, Q / C1, "V");
    assert.ok(s.observe.includes(`${br(solve("cparallel", "Ceq", { C1, C2 }) * 1e6)} µF`));
});

test("capacitores: aproximar as placas 4× multiplica C por 4", () => {
    const air = scenario("capacitors", "air").values;
    const closer = scenario("capacitors", "closer").values;
    const C = v => solve("capplate", "C", { kappa: Number(v["cap-material"]), A: v["cap-area"], d: v["cap-dist"] });
    assert.ok(close(C(closer) / C(air), 4));
});
