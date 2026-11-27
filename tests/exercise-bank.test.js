const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");

function loadBank() {
    const context = { window: {}, console, Math, Number, Intl };
    vm.createContext(context);
    for (const file of ["js/utils.js", "js/data/exercise-bank.js"]) {
        vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
    }
    return context.window.PhysicsLabExerciseBank;
}

test("banco de exercícios carrega geradores e questões conceituais", () => {
    const bank = loadBank();
    assert.ok(bank.generators.length > 0);
    assert.ok(bank.conceptual.length > 0);
    assert.strictEqual(typeof bank.fmt, "function");
});

test("todo gerador numérico monta uma questão completa", () => {
    const { generators } = loadBank();
    for (const gen of generators) {
        for (let i = 0; i < 20; i++) {
            const q = gen.build();
            assert.ok(q.statement && q.unit && q.hint, `gerador de ${gen.topic} incompleto`);
            assert.ok(Number.isFinite(q.answer), `resposta inválida em ${gen.topic}`);
            assert.ok(q.solution.length > 0);
        }
    }
});

test("questões conceituais têm alternativa correta válida", () => {
    const { conceptual } = loadBank();
    for (const q of conceptual) {
        assert.ok(q.options.length >= 2, q.statement);
        assert.ok(q.correct >= 0 && q.correct < q.options.length, q.statement);
        assert.ok(q.explanation);
    }
});

test("arquivos citados no index.html e no service worker existem", () => {
    const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
    const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
    const refs = [...html.matchAll(/(?:href|src)="((?:css|js)\/[^"]+)"/g)].map(m => m[1]);
    const cached = [...sw.matchAll(/"\.\/((?:css|js)\/[^"]+)"/g)].map(m => m[1]);
    assert.ok(refs.length > 10);
    for (const f of [...refs, ...cached]) assert.ok(fs.existsSync(path.join(root, f)), `falta ${f}`);
    assert.deepStrictEqual([...refs].sort(), [...cached].sort(), "index.html e sw.js listam arquivos diferentes");
});
