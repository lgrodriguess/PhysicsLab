// Carrega os scripts do site (que rodam no navegador) dentro do Node,
// para que os testes usem exatamente o mesmo código que o site usa.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");

function loadSite() {
    const context = { window: {}, console, Math, Number, Intl };
    vm.createContext(context);

    for (const file of ["js/utils.js", "js/data/formulas.js", "js/data/guides.js"]) {
        const code = fs.readFileSync(path.join(root, file), "utf8");
        vm.runInContext(code, context, { filename: file });
    }

    return {
        utils: context.window.PhysicsUtils,
        formulas: context.window.PhysicsLabFormulas,
        guides: context.window.PhysicsLabGuides
    };
}

// Resolve uma fórmula da calculadora pelo id: solve("ohm", "U", { R: 10, I: 2 })
function makeSolver(formulas) {
    return (id, target, values) => {
        const formula = formulas.find(f => f.id === id);
        if (!formula) throw new Error(`Fórmula "${id}" não existe`);
        const result = formula.solve[target](values);
        if (result.error) throw new Error(`${id}/${target}: ${result.error}`);
        return result.value;
    };
}

// Compara números com tolerância relativa (padrão 0,01%)
function close(actual, expected, tolerance = 1e-4) {
    if (expected === 0) return Math.abs(actual) < 1e-12;
    return Math.abs(actual - expected) / Math.abs(expected) <= tolerance;
}

module.exports = { loadSite, makeSolver, close };
