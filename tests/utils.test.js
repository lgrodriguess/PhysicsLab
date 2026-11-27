// Testes das funções compartilhadas (js/utils.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadSite } = require("./load");

const { utils } = loadSite();

test("formatNumber usa vírgula decimal e ponto de milhar", () => {
    assert.equal(utils.formatNumber(0.4), "0,4");
    assert.equal(utils.formatNumber(1234.5), "1.234,5");
});

test("formatNumber usa notação científica para valores muito pequenos ou grandes", () => {
    assert.equal(utils.formatNumber(5e-5), "5,000 × 10^-5");
    assert.equal(utils.formatNumber(8.9875e9), "8,988 × 10^9");
});

test("formatNumber devolve traço para valores inválidos", () => {
    assert.equal(utils.formatNumber(NaN), "—");
    assert.equal(utils.formatNumber(Infinity), "—");
});

test("formatSI escolhe o prefixo certo", () => {
    assert.equal(utils.formatSI(0.002, "A"), "2 mA");
    assert.equal(utils.formatSI(4.7e-6, "F"), "4,7 µF");
    assert.equal(utils.formatSI(12000, "V"), "12 kV");
});

test("parseNumber aceita vírgula decimal e espaços", () => {
    assert.equal(utils.parseNumber("0,5"), 0.5);
    assert.equal(utils.parseNumber(" 12 "), 12);
    assert.ok(Number.isNaN(utils.parseNumber("")));
    assert.ok(Number.isNaN(utils.parseNumber("abc")));
});

test("constantes físicas no SI", () => {
    const { mu0, k, e, epsilon0 } = utils.constants;
    assert.ok(Math.abs(mu0 - 4 * Math.PI * 1e-7) < 1e-20);
    assert.ok(Math.abs(k - 1 / (4 * Math.PI * epsilon0)) / k < 1e-3, "k ≈ 1/(4π·ε0)");
    assert.ok(Math.abs(e - 1.602e-19) < 1e-22);
});

test("paleta de cores tem só cores hexadecimais válidas", () => {
    for (const [name, value] of Object.entries(utils.colors)) {
        assert.match(value, /^#[0-9a-f]{6}$/i, `cor ${name}`);
    }
});
