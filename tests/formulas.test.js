// Testes das fórmulas da calculadora (js/data/formulas.js).
// Rodar: npm test   (ou: node --test)
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadSite, makeSolver, close } = require("./load");

const { formulas, utils } = loadSite();
const solve = makeSolver(formulas);

function assertClose(actual, expected, message) {
    assert.ok(close(actual, expected), `${message}: obtido ${actual}, esperado ${expected}`);
}

// ---------------------------------------------------------------------------
// 1) Valores conhecidos, calculados à mão (exemplos de livro)
// ---------------------------------------------------------------------------
const { k, mu0, epsilon0 } = utils.constants;

const known = [
    ["Lei de Ohm", "ohm", "U", { R: 10, I: 0.6 }, 6],
    ["Potência", "power", "P", { U: 12, I: 0.5 }, 6],
    ["Efeito Joule", "joule", "P", { R: 20, I: 1.2 }, 28.8],
    ["Resistores em paralelo", "parallel", "Req", { R1: 10, R2: 60 }, 60 / 7],
    ["Lei de Coulomb", "coulomb", "F", { q1: 1e-6, q2: 1e-6, r: 0.1 }, k * 1e-12 / 0.01],
    ["Campo de carga puntiforme", "efield", "E", { Q: 5e-9, r: 0.2 }, k * 5e-9 / 0.04],
    ["Potencial elétrico", "potential", "V", { Q: 5e-9, r: 0.2 }, k * 5e-9 / 0.2],
    ["Lei de Gauss (plano)", "gaussplane", "E", { sigma: 2 * epsilon0 * 500 }, 500],
    ["Capacitor de placas", "capplate", "C", { kappa: 1, A: 0.01, d: 0.002 }, epsilon0 * 0.01 / 0.002],
    ["Capacitores em série", "cseries", "Ceq", { C1: 6e-6, C2: 3e-6 }, 2e-6],
    ["Capacitores em paralelo", "cparallel", "Ceq", { C1: 6e-6, C2: 3e-6 }, 9e-6],
    ["Energia no capacitor", "capenergy", "U", { C: 2e-6, V: 18 }, 0.5 * 2e-6 * 18 ** 2],
    ["Força magnética (90°)", "magforce", "F", { q: 5e-6, v: 20, B: 0.5, theta: 90 }, 5e-5],
    ["Força magnética (30°)", "magforce", "F", { q: 5e-6, v: 20, B: 0.5, theta: 30 }, 2.5e-5],
    ["Raio da trajetória", "radius", "r", { m: 1e-6, v: 20, q: 5e-6, B: 0.5 }, 8],
    ["Campo de fio retilíneo", "wire", "B", { I: 10, d: 0.05 }, mu0 * 10 / (2 * Math.PI * 0.05)],
    ["Campo de solenoide", "solenoid", "B", { N: 1000, L: 0.5, I: 2 }, mu0 * 2000 * 2],
    ["Fluxo magnético (0°)", "flux", "Phi", { B: 0.5, A: 0.01, theta: 0 }, 0.005],
    ["Lei de Faraday", "faraday", "emf", { N: 10, dPhi: 0.008, dt: 1 }, 0.08],
    ["FEM de movimento", "motional", "emf", { B: 0.5, L: 0.2, v: 3 }, 0.3],
    ["Transformador ideal", "transformer", "U2", { U1: 220, N1: 1000, N2: 50 }, 11]
];

for (const [name, id, target, values, expected] of known) {
    test(`valor conhecido: ${name}`, () => {
        assertClose(solve(id, target, values), expected, name);
    });
}

test("fluxo é zero com B paralelo ao plano da espira (90°)", () => {
    const phi = solve("flux", "Phi", { B: 0.5, A: 0.01, theta: 90 });
    assert.ok(Math.abs(phi) < 1e-15, `Φ = ${phi}`);
});

test("força magnética é zero com v paralela a B (0°)", () => {
    assert.equal(solve("magforce", "F", { q: 5e-6, v: 20, B: 0.5, theta: 0 }), 0);
});

// ---------------------------------------------------------------------------
// 2) Coerência: isolar qualquer variável tem que devolver o valor original.
//    Ex.: se U = R·I dá 6 V, então R = U/I tem que dar de volta o R usado.
// ---------------------------------------------------------------------------

// Gerador pseudoaleatório com semente fixa (o teste dá sempre o mesmo resultado)
function random(seed) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
    };
}

function sampleValues(formula, rand) {
    const values = {};
    for (const [name, meta] of Object.entries(formula.vars)) {
        values[name] = meta.angle ? 15 + rand() * 60 : 0.5 + rand() * 4.5;
    }
    // Restrições físicas de algumas fórmulas
    if (formula.id === "cspherical") values.rb = values.ra + 0.5 + rand();
    if (formula.id === "coupling") values.kc = 0.1 + rand() * 0.9;
    return values;
}

for (const formula of formulas) {
    test(`coerência entre as formas isoladas: ${formula.name}`, () => {
        const names = Object.keys(formula.vars);
        const [main, ...others] = names;
        const rand = random(formula.id.length * 7919);
        let base = null;

        // Sorteia entradas válidas e calcula a variável principal
        for (let attempt = 0; attempt < 50 && !base; attempt++) {
            const values = sampleValues(formula, rand);
            const inputs = { ...values };
            delete inputs[main];
            const result = formula.solve[main](inputs);
            if (!result.error && Number.isFinite(result.value)) {
                values[main] = result.value;
                base = values;
            }
        }
        assert.ok(base, `não foi possível sortear valores válidos para ${formula.id}`);

        // Recalcula cada outra variável a partir das demais
        for (const name of others) {
            if (!formula.solve[name]) continue;
            const inputs = { ...base };
            delete inputs[name];
            const result = formula.solve[name](inputs);
            assert.ok(!result.error, `${formula.id}/${name}: ${result.error}`);
            assertClose(result.value, base[name], `${formula.id}: ${name}`);
        }
    });
}

test("toda fórmula tem uma forma isolada para cada variável", () => {
    for (const formula of formulas) {
        for (const name of Object.keys(formula.vars)) {
            assert.equal(typeof formula.solve[name], "function", `${formula.id} sem solve.${name}`);
        }
    }
});
