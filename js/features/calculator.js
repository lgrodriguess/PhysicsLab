document.addEventListener("DOMContentLoaded", () => {

    const formulaList = document.getElementById("calc-formulas");
    if (!formulaList) return;

    const { constants, prefixes, formatSI, formatNumber, parseNumber, storage, escapeHTML } = window.PhysicsUtils;

    const targetContainer = document.getElementById("calc-targets");
    const inputsContainer = document.getElementById("calc-inputs");
    const formulaTitle = document.getElementById("calc-formula-title");
    const formulaExpr = document.getElementById("calc-formula-expr");
    const resultValue = document.getElementById("calc-result-value");
    const resultLabel = document.getElementById("calc-result-label");
    const stepsBox = document.getElementById("calc-steps");
    const historyList = document.getElementById("calc-history");
    const clearHistoryButton = document.getElementById("calc-clear-history");

    const deg = Math.PI / 180;
    const sin = a => Math.sin(a * deg);
    const cos = a => Math.cos(a * deg);
    const { mu0 } = constants;
    const kC = constants.k;
    const eps0 = constants.epsilon0;

    const formulas = [
        {
            id: "ohm",
            area: "Circuitos",
            name: "Lei de Ohm",
            expr: "U = R · I",
            vars: {
                U: { label: "Tensão", unit: "V" },
                R: { label: "Resistência", unit: "Ω" },
                I: { label: "Corrente", unit: "A" }
            },
            solve: {
                U: v => ({ value: v.R * v.I, expr: "U = R · I" }),
                R: v => ({ value: v.U / v.I, expr: "R = U / I" }),
                I: v => ({ value: v.U / v.R, expr: "I = U / R" })
            }
        },
        {
            id: "power",
            area: "Circuitos",
            name: "Potência elétrica",
            expr: "P = U · I",
            vars: {
                P: { label: "Potência", unit: "W" },
                U: { label: "Tensão", unit: "V" },
                I: { label: "Corrente", unit: "A" }
            },
            solve: {
                P: v => ({ value: v.U * v.I, expr: "P = U · I" }),
                U: v => ({ value: v.P / v.I, expr: "U = P / I" }),
                I: v => ({ value: v.P / v.U, expr: "I = P / U" })
            }
        },
        {
            id: "joule",
            area: "Circuitos",
            name: "Efeito Joule",
            expr: "P = R · I²",
            vars: {
                P: { label: "Potência", unit: "W" },
                R: { label: "Resistência", unit: "Ω" },
                I: { label: "Corrente", unit: "A" }
            },
            solve: {
                P: v => ({ value: v.R * v.I ** 2, expr: "P = R · I²" }),
                R: v => ({ value: v.P / v.I ** 2, expr: "R = P / I²" }),
                I: v => ({ value: Math.sqrt(v.P / v.R), expr: "I = √(P / R)" })
            }
        },
        {
            id: "parallel",
            area: "Circuitos",
            name: "Dois resistores em paralelo",
            expr: "Req = R1·R2 / (R1 + R2)",
            vars: {
                Req: { label: "Resistência equivalente", unit: "Ω" },
                R1: { label: "Resistência R1", unit: "Ω" },
                R2: { label: "Resistência R2", unit: "Ω" }
            },
            solve: {
                Req: v => ({ value: v.R1 * v.R2 / (v.R1 + v.R2), expr: "Req = R1·R2 / (R1 + R2)" }),
                R1: v => ({ value: v.Req * v.R2 / (v.R2 - v.Req), expr: "R1 = Req·R2 / (R2 − Req)" }),
                R2: v => ({ value: v.Req * v.R1 / (v.R1 - v.Req), expr: "R2 = Req·R1 / (R1 − Req)" })
            }
        },
        {
            id: "current",
            area: "Circuitos",
            name: "Corrente elétrica",
            expr: "I = ΔQ / Δt",
            vars: {
                I: { label: "Corrente", unit: "A" },
                Q: { label: "Carga transportada", unit: "C" },
                t: { label: "Intervalo de tempo", unit: "s" }
            },
            solve: {
                I: v => ({ value: v.Q / v.t, expr: "I = ΔQ / Δt" }),
                Q: v => ({ value: v.I * v.t, expr: "ΔQ = I · Δt" }),
                t: v => ({ value: v.Q / v.I, expr: "Δt = ΔQ / I" })
            }
        },
        {
            id: "resistivity",
            area: "Circuitos",
            name: "Resistência de um fio (2ª Lei de Ohm)",
            expr: "R = ρ · L / A",
            vars: {
                R: { label: "Resistência", unit: "Ω" },
                rho: { label: "Resistividade ρ", unit: "Ω·m" },
                L: { label: "Comprimento", unit: "m" },
                A: { label: "Área da seção", unit: "m²", noPrefix: true }
            },
            solve: {
                R: v => ({ value: v.rho * v.L / v.A, expr: "R = ρ · L / A" }),
                rho: v => ({ value: v.R * v.A / v.L, expr: "ρ = R · A / L" }),
                L: v => ({ value: v.R * v.A / v.rho, expr: "L = R · A / ρ" }),
                A: v => ({ value: v.rho * v.L / v.R, expr: "A = ρ · L / R" })
            }
        },
        {
            id: "realbattery",
            area: "Circuitos",
            name: "Fonte real (resistência interna)",
            expr: "U = ε − r · I",
            vars: {
                U: { label: "Tensão nos terminais", unit: "V" },
                emf: { label: "FEM da fonte ε", unit: "V" },
                r: { label: "Resistência interna r", unit: "Ω" },
                I: { label: "Corrente", unit: "A" }
            },
            solve: {
                U: v => ({ value: v.emf - v.r * v.I, expr: "U = ε − r · I" }),
                emf: v => ({ value: v.U + v.r * v.I, expr: "ε = U + r · I" }),
                r: v => ({ value: (v.emf - v.U) / v.I, expr: "r = (ε − U) / I" }),
                I: v => ({ value: (v.emf - v.U) / v.r, expr: "I = (ε − U) / r" })
            }
        },
        {
            id: "coulomb",
            area: "Eletrostática",
            name: "Lei de Coulomb",
            expr: "F = k · |q1 · q2| / r²",
            vars: {
                F: { label: "Força elétrica", unit: "N" },
                q1: { label: "Carga q1", unit: "C" },
                q2: { label: "Carga q2", unit: "C" },
                r: { label: "Distância", unit: "m" }
            },
            solve: {
                F: v => ({ value: kC * Math.abs(v.q1 * v.q2) / v.r ** 2, expr: "F = k · |q1 · q2| / r²" }),
                q1: v => ({ value: v.F * v.r ** 2 / (kC * Math.abs(v.q2)), expr: "|q1| = F · r² / (k · |q2|)" }),
                q2: v => ({ value: v.F * v.r ** 2 / (kC * Math.abs(v.q1)), expr: "|q2| = F · r² / (k · |q1|)" }),
                r: v => ({ value: Math.sqrt(kC * Math.abs(v.q1 * v.q2) / v.F), expr: "r = √(k · |q1 · q2| / F)" })
            }
        },
        {
            id: "efield",
            area: "Eletrostática",
            name: "Campo elétrico de uma carga puntiforme",
            expr: "E = k · |Q| / r²",
            vars: {
                E: { label: "Campo elétrico", unit: "N/C" },
                Q: { label: "Carga da fonte", unit: "C" },
                r: { label: "Distância", unit: "m" }
            },
            solve: {
                E: v => ({ value: kC * Math.abs(v.Q) / v.r ** 2, expr: "E = k · |Q| / r²" }),
                Q: v => ({ value: v.E * v.r ** 2 / kC, expr: "|Q| = E · r² / k" }),
                r: v => ({ value: Math.sqrt(kC * Math.abs(v.Q) / v.E), expr: "r = √(k · |Q| / E)" })
            }
        },
        {
            id: "eforce",
            area: "Eletrostática",
            name: "Força sobre carga em campo elétrico",
            expr: "F = |q| · E",
            vars: {
                F: { label: "Força", unit: "N" },
                q: { label: "Carga", unit: "C" },
                E: { label: "Campo elétrico", unit: "N/C" }
            },
            solve: {
                F: v => ({ value: Math.abs(v.q) * v.E, expr: "F = |q| · E" }),
                q: v => ({ value: v.F / v.E, expr: "|q| = F / E" }),
                E: v => ({ value: v.F / Math.abs(v.q), expr: "E = F / |q|" })
            }
        },
        {
            id: "eaccel",
            area: "Eletrostática",
            name: "Aceleração de carga em campo uniforme",
            expr: "a = |q| · E / m",
            vars: {
                a: { label: "Aceleração", unit: "m/s²" },
                q: { label: "Carga", unit: "C" },
                E: { label: "Campo elétrico", unit: "N/C" },
                m: { label: "Massa", unit: "kg", noPrefix: true }
            },
            solve: {
                a: v => ({ value: Math.abs(v.q) * v.E / v.m, expr: "a = |q| · E / m" }),
                q: v => ({ value: v.a * v.m / v.E, expr: "|q| = m · a / E" }),
                E: v => ({ value: v.a * v.m / Math.abs(v.q), expr: "E = m · a / |q|" }),
                m: v => ({ value: Math.abs(v.q) * v.E / v.a, expr: "m = |q| · E / a" })
            }
        },
        {
            id: "eflux",
            area: "Eletrostática",
            name: "Fluxo elétrico (campo uniforme)",
            expr: "Φ = E · A · cos(θ)",
            vars: {
                Phi: { label: "Fluxo Φ", unit: "N·m²/C" },
                E: { label: "Campo elétrico", unit: "N/C" },
                A: { label: "Área", unit: "m²", noPrefix: true },
                theta: { label: "Ângulo θ", unit: "°", angle: true }
            },
            solve: {
                Phi: v => ({ value: v.E * v.A * cos(v.theta), expr: "Φ = E · A · cos(θ)" }),
                E: v => ({ value: v.Phi / (v.A * cos(v.theta)), expr: "E = Φ / (A · cos θ)" }),
                A: v => ({ value: v.Phi / (v.E * cos(v.theta)), expr: "A = Φ / (E · cos θ)" }),
                theta: v => {
                    const ratio = v.Phi / (v.E * v.A);
                    if (Math.abs(ratio) > 1) return { error: "Sem solução: |Φ| é maior que E·A (|cos θ| > 1)." };
                    return { value: Math.acos(ratio) / deg, expr: "θ = arccos(Φ / (E · A))" };
                }
            }
        },
        {
            id: "gauss",
            area: "Eletrostática",
            name: "Lei de Gauss (fluxo total)",
            expr: "Φ = Qint / ε0",
            vars: {
                Phi: { label: "Fluxo total Φ", unit: "N·m²/C" },
                Q: { label: "Carga interna", unit: "C" }
            },
            solve: {
                Phi: v => ({ value: v.Q / eps0, expr: "Φ = Qint / ε0" }),
                Q: v => ({ value: v.Phi * eps0, expr: "Qint = Φ · ε0" })
            }
        },
        {
            id: "gaussline",
            area: "Eletrostática",
            name: "Campo de uma linha infinita carregada",
            expr: "E = λ / (2π · ε0 · r)",
            vars: {
                E: { label: "Campo elétrico", unit: "N/C" },
                lambda: { label: "Densidade linear λ", unit: "C/m" },
                r: { label: "Distância à linha", unit: "m" }
            },
            solve: {
                E: v => ({ value: Math.abs(v.lambda) / (2 * Math.PI * eps0 * v.r), expr: "E = |λ| / (2π · ε0 · r)" }),
                lambda: v => ({ value: v.E * 2 * Math.PI * eps0 * v.r, expr: "|λ| = E · 2π · ε0 · r" }),
                r: v => ({ value: Math.abs(v.lambda) / (2 * Math.PI * eps0 * v.E), expr: "r = |λ| / (2π · ε0 · E)" })
            }
        },
        {
            id: "gaussplane",
            area: "Eletrostática",
            name: "Campo de um plano infinito carregado",
            expr: "E = σ / (2 · ε0)",
            vars: {
                E: { label: "Campo elétrico", unit: "N/C" },
                sigma: { label: "Densidade superficial σ", unit: "C/m²" }
            },
            solve: {
                E: v => ({ value: Math.abs(v.sigma) / (2 * eps0), expr: "E = |σ| / (2 · ε0)" }),
                sigma: v => ({ value: v.E * 2 * eps0, expr: "|σ| = 2 · ε0 · E" })
            }
        },
        {
            id: "potential",
            area: "Eletrostática",
            name: "Potencial de uma carga puntiforme",
            expr: "V = k · Q / r",
            vars: {
                V: { label: "Potencial", unit: "V" },
                Q: { label: "Carga da fonte (com sinal)", unit: "C" },
                r: { label: "Distância", unit: "m" }
            },
            solve: {
                V: v => ({ value: kC * v.Q / v.r, expr: "V = k · Q / r" }),
                Q: v => ({ value: v.V * v.r / kC, expr: "Q = V · r / k" }),
                r: v => {
                    const r = kC * v.Q / v.V;
                    if (r <= 0) return { error: "Sem solução: Q e V precisam ter o mesmo sinal." };
                    return { value: r, expr: "r = k · Q / V" };
                }
            }
        },
        {
            id: "uniformv",
            area: "Eletrostática",
            name: "Campo uniforme e diferença de potencial",
            expr: "U = E · d",
            vars: {
                U: { label: "Diferença de potencial", unit: "V" },
                E: { label: "Campo elétrico", unit: "V/m" },
                d: { label: "Distância ao longo do campo", unit: "m" }
            },
            solve: {
                U: v => ({ value: v.E * v.d, expr: "U = E · d" }),
                E: v => ({ value: v.U / v.d, expr: "E = U / d" }),
                d: v => ({ value: v.U / v.E, expr: "d = U / E" })
            }
        },
        {
            id: "ework",
            area: "Eletrostática",
            name: "Trabalho da força elétrica",
            expr: "W = q · (VA − VB)",
            vars: {
                W: { label: "Trabalho", unit: "J" },
                q: { label: "Carga (com sinal)", unit: "C" },
                dV: { label: "VA − VB", unit: "V" }
            },
            solve: {
                W: v => ({ value: v.q * v.dV, expr: "W = q · (VA − VB)" }),
                q: v => ({ value: v.W / v.dV, expr: "q = W / (VA − VB)" }),
                dV: v => ({ value: v.W / v.q, expr: "VA − VB = W / q" })
            }
        },
        {
            id: "capplate",
            area: "Capacitores",
            name: "Capacitor de placas paralelas",
            expr: "C = κ · ε0 · A / d",
            vars: {
                C: { label: "Capacitância", unit: "F" },
                kappa: { label: "Constante dielétrica κ", unit: "", noPrefix: true },
                A: { label: "Área de cada placa", unit: "m²", noPrefix: true },
                d: { label: "Distância entre as placas", unit: "m" }
            },
            solve: {
                C: v => ({ value: v.kappa * eps0 * v.A / v.d, expr: "C = κ · ε0 · A / d" }),
                kappa: v => ({ value: v.C * v.d / (eps0 * v.A), expr: "κ = C · d / (ε0 · A)" }),
                A: v => ({ value: v.C * v.d / (v.kappa * eps0), expr: "A = C · d / (κ · ε0)" }),
                d: v => ({ value: v.kappa * eps0 * v.A / v.C, expr: "d = κ · ε0 · A / C" })
            }
        },
        {
            id: "capcharge",
            area: "Capacitores",
            name: "Carga de um capacitor",
            expr: "Q = C · V",
            vars: {
                Q: { label: "Carga", unit: "C" },
                C: { label: "Capacitância", unit: "F" },
                V: { label: "Diferença de potencial", unit: "V" }
            },
            solve: {
                Q: v => ({ value: v.C * v.V, expr: "Q = C · V" }),
                C: v => ({ value: v.Q / v.V, expr: "C = Q / V" }),
                V: v => ({ value: v.Q / v.C, expr: "V = Q / C" })
            }
        },
        {
            id: "capenergy",
            area: "Capacitores",
            name: "Energia armazenada",
            expr: "U = ½ · C · V²",
            vars: {
                U: { label: "Energia", unit: "J" },
                C: { label: "Capacitância", unit: "F" },
                V: { label: "Diferença de potencial", unit: "V" }
            },
            solve: {
                U: v => ({ value: 0.5 * v.C * v.V ** 2, expr: "U = ½ · C · V²" }),
                C: v => ({ value: 2 * v.U / v.V ** 2, expr: "C = 2U / V²" }),
                V: v => ({ value: Math.sqrt(2 * v.U / v.C), expr: "V = √(2U / C)" })
            }
        },
        {
            id: "energydensity",
            area: "Capacitores",
            name: "Densidade de energia do campo",
            expr: "u = ½ · ε0 · E²",
            vars: {
                u: { label: "Densidade de energia", unit: "J/m³" },
                E: { label: "Campo elétrico", unit: "V/m" }
            },
            solve: {
                u: v => ({ value: 0.5 * eps0 * v.E ** 2, expr: "u = ½ · ε0 · E²" }),
                E: v => ({ value: Math.sqrt(2 * v.u / eps0), expr: "E = √(2u / ε0)" })
            }
        },
        {
            id: "cseries",
            area: "Capacitores",
            name: "Dois capacitores em série",
            expr: "Ceq = C1·C2 / (C1 + C2)",
            vars: {
                Ceq: { label: "Capacitância equivalente", unit: "F" },
                C1: { label: "Capacitância C1", unit: "F" },
                C2: { label: "Capacitância C2", unit: "F" }
            },
            solve: {
                Ceq: v => ({ value: v.C1 * v.C2 / (v.C1 + v.C2), expr: "Ceq = C1·C2 / (C1 + C2)" }),
                C1: v => ({ value: v.Ceq * v.C2 / (v.C2 - v.Ceq), expr: "C1 = Ceq·C2 / (C2 − Ceq)" }),
                C2: v => ({ value: v.Ceq * v.C1 / (v.C1 - v.Ceq), expr: "C2 = Ceq·C1 / (C1 − Ceq)" })
            }
        },
        {
            id: "cparallel",
            area: "Capacitores",
            name: "Dois capacitores em paralelo",
            expr: "Ceq = C1 + C2",
            vars: {
                Ceq: { label: "Capacitância equivalente", unit: "F" },
                C1: { label: "Capacitância C1", unit: "F" },
                C2: { label: "Capacitância C2", unit: "F" }
            },
            solve: {
                Ceq: v => ({ value: v.C1 + v.C2, expr: "Ceq = C1 + C2" }),
                C1: v => ({ value: v.Ceq - v.C2, expr: "C1 = Ceq − C2" }),
                C2: v => ({ value: v.Ceq - v.C1, expr: "C2 = Ceq − C1" })
            }
        },
        {
            id: "cspherical",
            area: "Capacitores",
            name: "Capacitor esférico",
            expr: "C = 4π · ε0 · ra·rb / (rb − ra)",
            vars: {
                C: { label: "Capacitância", unit: "F" },
                ra: { label: "Raio interno ra", unit: "m" },
                rb: { label: "Raio externo rb", unit: "m" }
            },
            solve: {
                C: v => ({ value: 4 * Math.PI * eps0 * v.ra * v.rb / (v.rb - v.ra), expr: "C = 4π · ε0 · ra·rb / (rb − ra)" }),
                ra: v => ({ value: v.C * v.rb / (4 * Math.PI * eps0 * v.rb + v.C), expr: "ra = C·rb / (4π · ε0 · rb + C)" }),
                rb: v => {
                    const den = v.C - 4 * Math.PI * eps0 * v.ra;
                    if (den <= 0) return { error: "Sem solução: C precisa ser maior que 4π·ε0·ra." };
                    return { value: v.C * v.ra / den, expr: "rb = C·ra / (C − 4π · ε0 · ra)" };
                }
            }
        },
        {
            id: "magforce",
            area: "Magnetismo",
            name: "Força magnética sobre carga",
            expr: "F = |q| · v · B · sen(θ)",
            vars: {
                F: { label: "Força", unit: "N" },
                q: { label: "Carga", unit: "C" },
                v: { label: "Velocidade", unit: "m/s" },
                B: { label: "Campo magnético", unit: "T" },
                theta: { label: "Ângulo θ", unit: "°", angle: true }
            },
            solve: {
                F: v => ({ value: Math.abs(v.q) * v.v * v.B * sin(v.theta), expr: "F = |q| · v · B · sen(θ)" }),
                q: v => ({ value: v.F / (v.v * v.B * sin(v.theta)), expr: "|q| = F / (v · B · sen θ)" }),
                v: v => ({ value: v.F / (Math.abs(v.q) * v.B * sin(v.theta)), expr: "v = F / (|q| · B · sen θ)" }),
                B: v => ({ value: v.F / (Math.abs(v.q) * v.v * sin(v.theta)), expr: "B = F / (|q| · v · sen θ)" }),
                theta: v => {
                    const ratio = v.F / (Math.abs(v.q) * v.v * v.B);
                    if (ratio > 1) return { error: "Sem solução: F é maior que |q|·v·B (sen θ > 1)." };
                    return { value: Math.asin(ratio) / deg, expr: "θ = arcsen(F / (|q| · v · B))", note: "O ângulo suplementar (180° − θ) também é solução." };
                }
            }
        },
        {
            id: "radius",
            area: "Magnetismo",
            name: "Raio da trajetória circular",
            expr: "r = m · v / (|q| · B)",
            vars: {
                r: { label: "Raio", unit: "m" },
                m: { label: "Massa", unit: "kg", noPrefix: true },
                v: { label: "Velocidade", unit: "m/s" },
                q: { label: "Carga", unit: "C" },
                B: { label: "Campo magnético", unit: "T" }
            },
            solve: {
                r: v => ({ value: v.m * v.v / (Math.abs(v.q) * v.B), expr: "r = m · v / (|q| · B)" }),
                m: v => ({ value: v.r * Math.abs(v.q) * v.B / v.v, expr: "m = r · |q| · B / v" }),
                v: v => ({ value: v.r * Math.abs(v.q) * v.B / v.m, expr: "v = r · |q| · B / m" }),
                q: v => ({ value: v.m * v.v / (v.r * v.B), expr: "|q| = m · v / (r · B)" }),
                B: v => ({ value: v.m * v.v / (Math.abs(v.q) * v.r), expr: "B = m · v / (|q| · r)" })
            }
        },
        {
            id: "wire",
            area: "Magnetismo",
            name: "Campo de um fio retilíneo",
            expr: "B = μ0 · I / (2π · d)",
            vars: {
                B: { label: "Campo magnético", unit: "T" },
                I: { label: "Corrente", unit: "A" },
                d: { label: "Distância ao fio", unit: "m" }
            },
            solve: {
                B: v => ({ value: mu0 * v.I / (2 * Math.PI * v.d), expr: "B = μ0 · I / (2π · d)" }),
                I: v => ({ value: v.B * 2 * Math.PI * v.d / mu0, expr: "I = 2π · d · B / μ0" }),
                d: v => ({ value: mu0 * v.I / (2 * Math.PI * v.B), expr: "d = μ0 · I / (2π · B)" })
            }
        },
        {
            id: "solenoid",
            area: "Magnetismo",
            name: "Campo de um solenoide",
            expr: "B = μ0 · (N / L) · I",
            vars: {
                B: { label: "Campo magnético", unit: "T" },
                N: { label: "Número de espiras", unit: "espiras", noPrefix: true },
                L: { label: "Comprimento", unit: "m" },
                I: { label: "Corrente", unit: "A" }
            },
            solve: {
                B: v => ({ value: mu0 * v.N / v.L * v.I, expr: "B = μ0 · (N / L) · I" }),
                N: v => ({ value: v.B * v.L / (mu0 * v.I), expr: "N = B · L / (μ0 · I)" }),
                L: v => ({ value: mu0 * v.N * v.I / v.B, expr: "L = μ0 · N · I / B" }),
                I: v => ({ value: v.B * v.L / (mu0 * v.N), expr: "I = B · L / (μ0 · N)" })
            }
        },
        {
            id: "wireforce",
            area: "Magnetismo",
            name: "Força sobre um condutor",
            expr: "F = B · I · L · sen(θ)",
            vars: {
                F: { label: "Força", unit: "N" },
                B: { label: "Campo magnético", unit: "T" },
                I: { label: "Corrente", unit: "A" },
                L: { label: "Comprimento", unit: "m" },
                theta: { label: "Ângulo θ", unit: "°", angle: true }
            },
            solve: {
                F: v => ({ value: v.B * v.I * v.L * sin(v.theta), expr: "F = B · I · L · sen(θ)" }),
                B: v => ({ value: v.F / (v.I * v.L * sin(v.theta)), expr: "B = F / (I · L · sen θ)" }),
                I: v => ({ value: v.F / (v.B * v.L * sin(v.theta)), expr: "I = F / (B · L · sen θ)" }),
                L: v => ({ value: v.F / (v.B * v.I * sin(v.theta)), expr: "L = F / (B · I · sen θ)" }),
                theta: v => {
                    const ratio = v.F / (v.B * v.I * v.L);
                    if (ratio > 1) return { error: "Sem solução: F é maior que B·I·L (sen θ > 1)." };
                    return { value: Math.asin(ratio) / deg, expr: "θ = arcsen(F / (B · I · L))", note: "O ângulo suplementar (180° − θ) também é solução." };
                }
            }
        },
        {
            id: "loop",
            area: "Magnetismo",
            name: "Campo no centro de uma espira circular",
            expr: "B = μ0 · N · I / (2R)",
            vars: {
                B: { label: "Campo magnético", unit: "T" },
                N: { label: "Número de espiras", unit: "espiras", noPrefix: true },
                I: { label: "Corrente", unit: "A" },
                R: { label: "Raio da espira", unit: "m" }
            },
            solve: {
                B: v => ({ value: mu0 * v.N * v.I / (2 * v.R), expr: "B = μ0 · N · I / (2R)" }),
                N: v => ({ value: 2 * v.R * v.B / (mu0 * v.I), expr: "N = 2R · B / (μ0 · I)" }),
                I: v => ({ value: 2 * v.R * v.B / (mu0 * v.N), expr: "I = 2R · B / (μ0 · N)" }),
                R: v => ({ value: mu0 * v.N * v.I / (2 * v.B), expr: "R = μ0 · N · I / (2B)" })
            }
        },
        {
            id: "parallelwires",
            area: "Magnetismo",
            name: "Força entre dois fios paralelos",
            expr: "F/L = μ0 · I1 · I2 / (2π · d)",
            vars: {
                f: { label: "Força por comprimento F/L", unit: "N/m" },
                I1: { label: "Corrente I1", unit: "A" },
                I2: { label: "Corrente I2", unit: "A" },
                d: { label: "Distância entre os fios", unit: "m" }
            },
            solve: {
                f: v => ({ value: mu0 * v.I1 * v.I2 / (2 * Math.PI * v.d), expr: "F/L = μ0 · I1 · I2 / (2π · d)" }),
                I1: v => ({ value: v.f * 2 * Math.PI * v.d / (mu0 * v.I2), expr: "I1 = (F/L) · 2π · d / (μ0 · I2)" }),
                I2: v => ({ value: v.f * 2 * Math.PI * v.d / (mu0 * v.I1), expr: "I2 = (F/L) · 2π · d / (μ0 · I1)" }),
                d: v => ({ value: mu0 * v.I1 * v.I2 / (2 * Math.PI * v.f), expr: "d = μ0 · I1 · I2 / (2π · F/L)" })
            }
        },
        {
            id: "looptorque",
            area: "Magnetismo",
            name: "Torque sobre uma espira de corrente",
            expr: "τ = N · I · A · B · sen(θ)",
            vars: {
                tau: { label: "Torque", unit: "N·m" },
                N: { label: "Número de espiras", unit: "espiras", noPrefix: true },
                I: { label: "Corrente", unit: "A" },
                A: { label: "Área da espira", unit: "m²", noPrefix: true },
                B: { label: "Campo magnético", unit: "T" },
                theta: { label: "Ângulo θ (normal e B)", unit: "°", angle: true }
            },
            solve: {
                tau: v => ({ value: v.N * v.I * v.A * v.B * sin(v.theta), expr: "τ = N · I · A · B · sen(θ)" }),
                N: v => ({ value: v.tau / (v.I * v.A * v.B * sin(v.theta)), expr: "N = τ / (I · A · B · sen θ)" }),
                I: v => ({ value: v.tau / (v.N * v.A * v.B * sin(v.theta)), expr: "I = τ / (N · A · B · sen θ)" }),
                A: v => ({ value: v.tau / (v.N * v.I * v.B * sin(v.theta)), expr: "A = τ / (N · I · B · sen θ)" }),
                B: v => ({ value: v.tau / (v.N * v.I * v.A * sin(v.theta)), expr: "B = τ / (N · I · A · sen θ)" }),
                theta: v => {
                    const ratio = v.tau / (v.N * v.I * v.A * v.B);
                    if (ratio > 1 || ratio < 0) return { error: "Sem solução: τ precisa estar entre 0 e N·I·A·B." };
                    return { value: Math.asin(ratio) / deg, expr: "θ = arcsen(τ / (N · I · A · B))", note: "O ângulo suplementar (180° − θ) também é solução." };
                }
            }
        },
        {
            id: "flux",
            area: "Indução",
            name: "Fluxo magnético",
            expr: "Φ = B · A · cos(θ)",
            vars: {
                Phi: { label: "Fluxo Φ", unit: "Wb" },
                B: { label: "Campo magnético", unit: "T" },
                A: { label: "Área", unit: "m²", noPrefix: true },
                theta: { label: "Ângulo θ", unit: "°", angle: true }
            },
            solve: {
                Phi: v => ({ value: v.B * v.A * cos(v.theta), expr: "Φ = B · A · cos(θ)" }),
                B: v => ({ value: v.Phi / (v.A * cos(v.theta)), expr: "B = Φ / (A · cos θ)" }),
                A: v => ({ value: v.Phi / (v.B * cos(v.theta)), expr: "A = Φ / (B · cos θ)" }),
                theta: v => {
                    const ratio = v.Phi / (v.B * v.A);
                    if (Math.abs(ratio) > 1) return { error: "Sem solução: |Φ| é maior que B·A (|cos θ| > 1)." };
                    return { value: Math.acos(ratio) / deg, expr: "θ = arccos(Φ / (B · A))" };
                }
            }
        },
        {
            id: "faraday",
            area: "Indução",
            name: "Lei de Faraday (módulo)",
            expr: "ε = N · ΔΦ / Δt",
            vars: {
                emf: { label: "FEM induzida ε", unit: "V" },
                N: { label: "Número de espiras", unit: "espiras", noPrefix: true },
                dPhi: { label: "Variação de fluxo ΔΦ", unit: "Wb" },
                dt: { label: "Intervalo de tempo Δt", unit: "s" }
            },
            solve: {
                emf: v => ({ value: v.N * Math.abs(v.dPhi) / v.dt, expr: "ε = N · |ΔΦ| / Δt" }),
                N: v => ({ value: v.emf * v.dt / Math.abs(v.dPhi), expr: "N = ε · Δt / |ΔΦ|" }),
                dPhi: v => ({ value: v.emf * v.dt / v.N, expr: "|ΔΦ| = ε · Δt / N" }),
                dt: v => ({ value: v.N * Math.abs(v.dPhi) / v.emf, expr: "Δt = N · |ΔΦ| / ε" })
            }
        },
        {
            id: "motional",
            area: "Indução",
            name: "FEM de movimento",
            expr: "ε = B · L · v",
            vars: {
                emf: { label: "FEM induzida ε", unit: "V" },
                B: { label: "Campo magnético", unit: "T" },
                L: { label: "Comprimento da barra", unit: "m" },
                v: { label: "Velocidade", unit: "m/s" }
            },
            solve: {
                emf: v => ({ value: v.B * v.L * v.v, expr: "ε = B · L · v" }),
                B: v => ({ value: v.emf / (v.L * v.v), expr: "B = ε / (L · v)" }),
                L: v => ({ value: v.emf / (v.B * v.v), expr: "L = ε / (B · v)" }),
                v: v => ({ value: v.emf / (v.B * v.L), expr: "v = ε / (B · L)" })
            }
        },
        {
            id: "transformer",
            area: "Indução",
            name: "Transformador ideal",
            expr: "U1 / U2 = N1 / N2",
            vars: {
                U1: { label: "Tensão no primário", unit: "V" },
                U2: { label: "Tensão no secundário", unit: "V" },
                N1: { label: "Espiras do primário", unit: "espiras", noPrefix: true },
                N2: { label: "Espiras do secundário", unit: "espiras", noPrefix: true }
            },
            solve: {
                U1: v => ({ value: v.U2 * v.N1 / v.N2, expr: "U1 = U2 · N1 / N2" }),
                U2: v => ({ value: v.U1 * v.N2 / v.N1, expr: "U2 = U1 · N2 / N1" }),
                N1: v => ({ value: v.N2 * v.U1 / v.U2, expr: "N1 = N2 · U1 / U2" }),
                N2: v => ({ value: v.N1 * v.U2 / v.U1, expr: "N2 = N1 · U2 / U1" })
            }
        },
        {
            id: "generator",
            area: "Indução",
            name: "Gerador: FEM máxima",
            expr: "ε_máx = N · B · A · ω",
            vars: {
                emf: { label: "FEM máxima", unit: "V" },
                N: { label: "Número de espiras", unit: "espiras", noPrefix: true },
                B: { label: "Campo magnético", unit: "T" },
                A: { label: "Área da espira", unit: "m²", noPrefix: true },
                omega: { label: "Velocidade angular ω", unit: "rad/s", noPrefix: true }
            },
            solve: {
                emf: v => ({ value: v.N * v.B * v.A * v.omega, expr: "ε_máx = N · B · A · ω" }),
                N: v => ({ value: v.emf / (v.B * v.A * v.omega), expr: "N = ε_máx / (B · A · ω)" }),
                B: v => ({ value: v.emf / (v.N * v.A * v.omega), expr: "B = ε_máx / (N · A · ω)" }),
                A: v => ({ value: v.emf / (v.N * v.B * v.omega), expr: "A = ε_máx / (N · B · ω)" }),
                omega: v => ({ value: v.emf / (v.N * v.B * v.A), expr: "ω = ε_máx / (N · B · A)" })
            }
        },
        {
            id: "selfinductance",
            area: "Indução",
            name: "Autoindutância: tensão induzida",
            expr: "ε = L · ΔI / Δt",
            vars: {
                emf: { label: "Tensão induzida (módulo)", unit: "V" },
                L: { label: "Indutância L", unit: "H" },
                dI: { label: "Variação da corrente ΔI", unit: "A" },
                dt: { label: "Intervalo de tempo Δt", unit: "s" }
            },
            solve: {
                emf: v => ({ value: Math.abs(v.L * v.dI / v.dt), expr: "|ε| = L · |ΔI| / Δt" }),
                L: v => ({ value: v.emf * v.dt / Math.abs(v.dI), expr: "L = |ε| · Δt / |ΔI|" }),
                dI: v => ({ value: v.emf * v.dt / v.L, expr: "|ΔI| = |ε| · Δt / L" }),
                dt: v => ({ value: v.L * Math.abs(v.dI) / v.emf, expr: "Δt = L · |ΔI| / |ε|" })
            }
        },
        {
            id: "inductorenergy",
            area: "Indução",
            name: "Energia armazenada em um indutor",
            expr: "U = ½ · L · I²",
            vars: {
                U: { label: "Energia", unit: "J" },
                L: { label: "Indutância L", unit: "H" },
                I: { label: "Corrente", unit: "A" }
            },
            solve: {
                U: v => ({ value: 0.5 * v.L * v.I ** 2, expr: "U = ½ · L · I²" }),
                L: v => ({ value: 2 * v.U / v.I ** 2, expr: "L = 2U / I²" }),
                I: v => ({ value: Math.sqrt(2 * v.U / v.L), expr: "I = √(2U / L)" })
            }
        },
        {
            id: "mutualinductance",
            area: "Indução",
            name: "Indutância mútua: tensão no secundário",
            expr: "ε2 = M · ΔI1 / Δt",
            vars: {
                emf: { label: "Tensão induzida no secundário", unit: "V" },
                M: { label: "Indutância mútua M", unit: "H" },
                dI: { label: "Variação de I no primário", unit: "A" },
                dt: { label: "Intervalo de tempo Δt", unit: "s" }
            },
            solve: {
                emf: v => ({ value: Math.abs(v.M * v.dI / v.dt), expr: "|ε2| = M · |ΔI1| / Δt" }),
                M: v => ({ value: v.emf * v.dt / Math.abs(v.dI), expr: "M = |ε2| · Δt / |ΔI1|" }),
                dI: v => ({ value: v.emf * v.dt / v.M, expr: "|ΔI1| = |ε2| · Δt / M" }),
                dt: v => ({ value: v.M * Math.abs(v.dI) / v.emf, expr: "Δt = M · |ΔI1| / |ε2|" })
            }
        },
        {
            id: "coupling",
            area: "Indução",
            name: "Coeficiente de acoplamento",
            expr: "M = k · √(L1 · L2)",
            vars: {
                M: { label: "Indutância mútua M", unit: "H" },
                kc: { label: "Coeficiente k (0 a 1)", unit: "", noPrefix: true },
                L1: { label: "Indutância L1", unit: "H" },
                L2: { label: "Indutância L2", unit: "H" }
            },
            solve: {
                M: v => ({ value: v.kc * Math.sqrt(v.L1 * v.L2), expr: "M = k · √(L1 · L2)" }),
                kc: v => ({ value: v.M / Math.sqrt(v.L1 * v.L2), expr: "k = M / √(L1 · L2)" }),
                L1: v => ({ value: (v.M / v.kc) ** 2 / v.L2, expr: "L1 = (M / k)² / L2" }),
                L2: v => ({ value: (v.M / v.kc) ** 2 / v.L1, expr: "L2 = (M / k)² / L1" })
            }
        }
    ];

    const historyStore = storage("physicslab.calc.history", []);
    let history = historyStore.load();
    let current = formulas[0];
    let target = Object.keys(current.vars)[0];
    const inputValues = {};

    function renderFormulaList() {
        let lastArea = "";
        formulaList.innerHTML = formulas.map(f => {
            const heading = f.area !== lastArea ? `<span class="calc-area-label">${f.area}</span>` : "";
            lastArea = f.area;
            return `
                ${heading}
                <button class="calc-formula-item ${f.id === current.id ? "active" : ""}" data-formula="${f.id}">
                    <strong>${f.name}</strong>
                    <span>${f.expr}</span>
                </button>
            `;
        }).join("");
    }

    function renderTargets() {
        targetContainer.innerHTML = Object.entries(current.vars).map(([key, meta]) => `
            <button class="calc-target ${key === target ? "active" : ""}" data-target="${key}">
                ${meta.label}
            </button>
        `).join("");
    }

    function prefixOptions(meta) {
        if (meta.angle || meta.noPrefix) return "";
        return `
            <select class="calc-prefix" aria-label="Prefixo da unidade">
                ${prefixes.map(p => `
                    <option value="${p.factor}" ${p.factor === 1 ? "selected" : ""}>${p.symbol}${meta.unit}</option>
                `).join("")}
            </select>
        `;
    }

    function renderInputs() {
        inputsContainer.innerHTML = Object.entries(current.vars)
            .filter(([key]) => key !== target)
            .map(([key, meta]) => {
                const saved = inputValues[`${current.id}.${key}`] ?? "";
                const unitBadge = meta.angle || meta.noPrefix
                    ? `<span class="calc-unit">${meta.unit}</span>`
                    : "";
                return `
                    <div class="calc-input" data-var="${key}">
                        <label>${meta.label}</label>
                        <div class="calc-input-row">
                            <input type="text" inputmode="decimal" placeholder="0" value="${escapeHTML(saved)}">
                            ${prefixOptions(meta)}${unitBadge}
                        </div>
                    </div>
                `;
            }).join("");

        formulaTitle.textContent = current.name;
        formulaExpr.textContent = current.expr;
        resultLabel.textContent = `${current.vars[target].label.toUpperCase()} CALCULADO(A)`;
        calculate();
    }

    function renderHistory() {
        if (history.length === 0) {
            historyList.innerHTML = `<li class="calc-history-empty">Nenhum cálculo ainda. Os resultados aparecem aqui.</li>`;
            clearHistoryButton.hidden = true;
            return;
        }

        clearHistoryButton.hidden = false;
        historyList.innerHTML = history.map(item => `
            <li>
                <span>${escapeHTML(item.formula)}</span>
                <strong>${escapeHTML(item.result)}</strong>
            </li>
        `).join("");
    }

    function readValues() {
        const values = {};
        const missing = [];

        inputsContainer.querySelectorAll(".calc-input").forEach(group => {
            const key = group.dataset.var;
            const input = group.querySelector("input");
            const prefix = group.querySelector(".calc-prefix");
            const raw = parseNumber(input.value);

            inputValues[`${current.id}.${key}`] = input.value;
            input.classList.toggle("invalid", input.value.trim() !== "" && Number.isNaN(raw));

            if (Number.isNaN(raw)) {
                missing.push(current.vars[key].label);
                return;
            }

            values[key] = raw * (prefix ? Number(prefix.value) : 1);
        });

        return { values, missing };
    }

    function showMessage(message) {
        resultValue.textContent = "—";
        resultValue.classList.remove("error");
        stepsBox.innerHTML = `<p class="calc-hint">${message}</p>`;
    }

    function calculate() {
        const { values, missing } = readValues();

        if (missing.length > 0) {
            showMessage(`Preencha: ${missing.join(", ")}.`);
            return null;
        }

        const outcome = current.solve[target](values);

        if (outcome.error || !Number.isFinite(outcome.value)) {
            resultValue.textContent = "Indefinido";
            resultValue.classList.add("error");
            stepsBox.innerHTML = `<p class="calc-hint">${outcome.error || "Divisão por zero ou combinação de valores inválida. Verifique os dados."}</p>`;
            return null;
        }

        const meta = current.vars[target];
        const formatted = meta.angle
            ? `${formatNumber(outcome.value, 2)}°`
            : meta.noPrefix
                ? `${formatNumber(outcome.value, 2)} ${meta.unit}`
                : formatSI(outcome.value, meta.unit);

        resultValue.textContent = formatted;
        resultValue.classList.remove("error");

        const given = Object.entries(values).map(([key, value]) => {
            const m = current.vars[key];
            const shown = m.angle ? `${formatNumber(value)}°` : `${formatNumber(value)} ${m.unit}`;
            return `<li><span>${m.label}</span><strong>${shown}</strong></li>`;
        }).join("");

        stepsBox.innerHTML = `
            <div class="calc-step"><span>1</span><div>Dados convertidos para o SI:<ul>${given}</ul></div></div>
            <div class="calc-step"><span>2</span><div>Isolando a incógnita:<div class="formula">${outcome.expr}</div></div></div>
            <div class="calc-step"><span>3</span><div>Resultado: <strong>${formatted}</strong>${outcome.note ? `<p class="calc-note">${outcome.note}</p>` : ""}</div></div>
        `;

        return { formatted };
    }

    function saveToHistory() {
        const result = calculate();
        if (!result) return;

        const entry = {
            formula: `${current.name} · ${current.vars[target].label}`,
            result: result.formatted
        };

        if (history[0] && history[0].formula === entry.formula && history[0].result === entry.result) return;

        history = [entry, ...history].slice(0, 8);
        historyStore.save(history);
        renderHistory();
    }

    formulaList.addEventListener("click", event => {
        const button = event.target.closest("[data-formula]");
        if (!button) return;
        current = formulas.find(f => f.id === button.dataset.formula);
        target = Object.keys(current.vars)[0];
        renderFormulaList();
        renderTargets();
        renderInputs();
    });

    targetContainer.addEventListener("click", event => {
        const button = event.target.closest("[data-target]");
        if (!button) return;
        target = button.dataset.target;
        renderTargets();
        renderInputs();
    });

    inputsContainer.addEventListener("input", calculate);
    inputsContainer.addEventListener("change", calculate);

    document.getElementById("calc-save").addEventListener("click", saveToHistory);

    inputsContainer.addEventListener("keydown", event => {
        if (event.key === "Enter") saveToHistory();
    });

    clearHistoryButton.addEventListener("click", () => {
        history = [];
        historyStore.save(history);
        renderHistory();
    });

    renderFormulaList();
    renderTargets();
    renderInputs();
    renderHistory();
});
