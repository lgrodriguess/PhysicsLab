document.addEventListener("DOMContentLoaded", () => {

    // Exercícios: questões numéricas sorteadas e questões conceituais
    const card = document.getElementById("exercise-card");
    if (!card) return;

    const { constants, formatNumber, parseNumber, randomInt, pick, shuffle, storage, escapeHTML } = window.PhysicsUtils;

    const topicButtons = document.querySelectorAll(".exercise-topic");
    const tagEl = document.getElementById("exercise-tag");
    const typeEl = document.getElementById("exercise-type");
    const statementEl = document.getElementById("exercise-statement");
    const answerArea = document.getElementById("exercise-answer");
    const feedbackEl = document.getElementById("exercise-feedback");
    const checkButton = document.getElementById("exercise-check");
    const nextButton = document.getElementById("exercise-next");
    const hintButton = document.getElementById("exercise-hint");
    const hintBox = document.getElementById("exercise-hint-box");

    const statCorrect = document.getElementById("stat-correct");
    const statTotal = document.getElementById("stat-total");
    const statAccuracy = document.getElementById("stat-accuracy");
    const statStreak = document.getElementById("stat-streak");
    const statBest = document.getElementById("stat-best");
    const topicStatsEl = document.getElementById("exercise-topic-stats");
    const resetStatsButton = document.getElementById("exercise-reset-stats");

    const topicNames = {
        electrostatics: "Eletrostática",
        capacitors: "Capacitores",
        circuits: "Circuitos",
        magnetism: "Magnetismo",
        induction: "Indução"
    };

    const fmt = (value, decimals = 2) => formatNumber(Number(value.toFixed(decimals)), decimals);
    const kC = constants.k;
    const eps0 = constants.epsilon0;

    // Questões numéricas: cada build() sorteia valores, calcula a resposta e monta a resolução
    const generators = [
        {
            topic: "circuits",
            build() {
                const U = pick([6, 9, 12, 24]);
                const R1 = randomInt(2, 20) * 5;
                const R2 = randomInt(2, 20) * 5;
                const Req = R1 + R2;
                const I = U / Req * 1000;
                return {
                    statement: `Uma bateria de <b>${U} V</b> alimenta dois resistores em série, R1 = <b>${R1} Ω</b> e R2 = <b>${R2} Ω</b>. Qual a corrente no circuito?`,
                    unit: "mA",
                    answer: I,
                    hint: "Em série, some as resistências e aplique a Lei de Ohm.",
                    solution: [
                        `Req = R1 + R2 = ${R1} + ${R2} = ${Req} Ω`,
                        `I = U / Req = ${U} / ${Req} = ${fmt(I / 1000, 4)} A`,
                        `I ≈ <b>${fmt(I)} mA</b>`
                    ]
                };
            }
        },
        {
            topic: "circuits",
            build() {
                const R1 = pick([10, 20, 30, 40, 60, 80, 120]);
                const R2 = pick([10, 20, 30, 40, 60, 80, 120]);
                const Req = R1 * R2 / (R1 + R2);
                return {
                    statement: `Dois resistores, de <b>${R1} Ω</b> e <b>${R2} Ω</b>, estão associados em paralelo. Qual a resistência equivalente?`,
                    unit: "Ω",
                    answer: Req,
                    hint: "Para dois resistores em paralelo: Req = R1·R2 / (R1 + R2).",
                    solution: [
                        `Req = R1·R2 / (R1 + R2)`,
                        `Req = ${R1}·${R2} / (${R1} + ${R2}) = ${R1 * R2} / ${R1 + R2}`,
                        `Req ≈ <b>${fmt(Req)} Ω</b>`
                    ]
                };
            }
        },
        {
            topic: "circuits",
            build() {
                const U = pick([110, 127, 220]);
                const P = pick([60, 100, 500, 1000, 1500, 2200, 4400]);
                const R = U ** 2 / P;
                return {
                    statement: `Um aparelho tem especificação <b>${P} W – ${U} V</b>. Qual a resistência do aparelho em funcionamento normal?`,
                    unit: "Ω",
                    answer: R,
                    hint: "Use P = U² / R e isole R.",
                    solution: [
                        `P = U² / R  ⇒  R = U² / P`,
                        `R = ${U}² / ${P} = ${U ** 2} / ${P}`,
                        `R ≈ <b>${fmt(R)} Ω</b>`
                    ]
                };
            }
        },
        {
            topic: "circuits",
            build() {
                const P = pick([800, 1200, 2000, 4500, 5500]);
                const h = pick([0.25, 0.5, 1, 2, 3]);
                const days = 30;
                const kWh = P / 1000 * h * days;
                return {
                    statement: `Um chuveiro de <b>${P} W</b> é usado <b>${formatNumber(h)} h</b> por dia. Quanta energia ele consome em ${days} dias?`,
                    unit: "kWh",
                    answer: kWh,
                    hint: "E = P · Δt. Converta a potência para kW e o tempo para horas.",
                    solution: [
                        `P = ${P} W = ${formatNumber(P / 1000)} kW`,
                        `Δt = ${formatNumber(h)} h/dia × ${days} dias = ${formatNumber(h * days)} h`,
                        `E = ${formatNumber(P / 1000)} × ${formatNumber(h * days)} = <b>${fmt(kWh)} kWh</b>`
                    ]
                };
            }
        },
        {
            topic: "magnetism",
            build() {
                const q = randomInt(1, 9);
                const v = randomInt(2, 20) * 100;
                const B = pick([0.1, 0.2, 0.25, 0.5, 0.8, 1, 1.5]);
                const theta = pick([30, 45, 60, 90]);
                const F = q * 1e-6 * v * B * Math.sin(theta * Math.PI / 180) * 1000;
                return {
                    statement: `Uma carga de <b>${q} µC</b> se move a <b>${v} m/s</b> em um campo magnético de <b>${formatNumber(B)} T</b>, formando <b>${theta}°</b> com o campo. Qual o módulo da força magnética?`,
                    unit: "mN",
                    answer: F,
                    hint: "F = |q| · v · B · sen θ. Lembre que 1 µC = 10⁻⁶ C.",
                    solution: [
                        `F = |q| · v · B · sen θ`,
                        `F = ${q}×10⁻⁶ × ${v} × ${formatNumber(B)} × sen ${theta}°`,
                        `F ≈ ${fmt(F / 1000, 6)} N = <b>${fmt(F)} mN</b>`
                    ]
                };
            }
        },
        {
            topic: "magnetism",
            build() {
                const I = randomInt(1, 20);
                const dcm = pick([1, 2, 4, 5, 10, 20]);
                const B = constants.mu0 * I / (2 * Math.PI * dcm / 100) * 1e6;
                return {
                    statement: `Um fio retilíneo e longo é percorrido por uma corrente de <b>${I} A</b>. Qual a intensidade do campo magnético a <b>${dcm} cm</b> do fio? (μ0 = 4π × 10⁻⁷ T·m/A)`,
                    unit: "µT",
                    answer: B,
                    hint: "B = μ0 · I / (2π · d). Converta a distância para metros.",
                    solution: [
                        `B = μ0 · I / (2π · d) = (2 × 10⁻⁷) · I / d`,
                        `B = 2×10⁻⁷ × ${I} / ${formatNumber(dcm / 100)}`,
                        `B ≈ ${fmt(B / 1e6, 8)} T = <b>${fmt(B)} µT</b>`
                    ]
                };
            }
        },
        {
            topic: "magnetism",
            build() {
                const v = randomInt(1, 9) * 1e5;
                const B = pick([0.01, 0.02, 0.05, 0.1]);
                const m = 1.67e-27;
                const q = constants.e;
                const r = m * v / (q * B) * 100;
                return {
                    statement: `Um próton (m = 1,67 × 10⁻²⁷ kg, q = 1,6 × 10⁻¹⁹ C) entra perpendicularmente em um campo de <b>${formatNumber(B)} T</b> com velocidade <b>${formatNumber(v / 1e5)} × 10⁵ m/s</b>. Qual o raio da trajetória?`,
                    unit: "cm",
                    answer: r,
                    hint: "Com v ⟂ B, a força magnética é a resultante centrípeta: r = m·v / (|q|·B).",
                    solution: [
                        `r = m · v / (|q| · B)`,
                        `r = 1,67×10⁻²⁷ × ${formatNumber(v / 1e5)}×10⁵ / (1,6×10⁻¹⁹ × ${formatNumber(B)})`,
                        `r ≈ ${fmt(r / 100, 4)} m = <b>${fmt(r)} cm</b>`
                    ],
                    tolerance: 0.03
                };
            }
        },
        {
            topic: "magnetism",
            build() {
                const B = pick([0.2, 0.4, 0.5, 0.8, 1.2]);
                const I = randomInt(2, 15);
                const L = pick([0.1, 0.2, 0.3, 0.5]);
                const F = B * I * L;
                return {
                    statement: `Um fio de <b>${formatNumber(L * 100)} cm</b>, percorrido por <b>${I} A</b>, está perpendicular a um campo de <b>${formatNumber(B)} T</b>. Qual a força magnética no fio?`,
                    unit: "N",
                    answer: F,
                    hint: "F = B · I · L · sen θ, com θ = 90°.",
                    solution: [
                        `F = B · I · L · sen 90°`,
                        `F = ${formatNumber(B)} × ${I} × ${formatNumber(L)} × 1`,
                        `F = <b>${fmt(F, 3)} N</b>`
                    ]
                };
            }
        },
        {
            topic: "induction",
            build() {
                const B = pick([0.2, 0.4, 0.5, 0.8, 1]);
                const Acm = pick([50, 100, 200, 400]);
                const theta = pick([0, 30, 45, 60]);
                const Phi = B * Acm / 1e4 * Math.cos(theta * Math.PI / 180) * 1000;
                return {
                    statement: `Uma espira de área <b>${Acm} cm²</b> está em um campo de <b>${formatNumber(B)} T</b>. O ângulo entre o campo e a normal à espira é <b>${theta}°</b>. Qual o fluxo magnético?`,
                    unit: "mWb",
                    answer: Phi,
                    hint: "Φ = B · A · cos θ. Lembre: 1 cm² = 10⁻⁴ m².",
                    solution: [
                        `A = ${Acm} cm² = ${formatNumber(Acm / 1e4)} m²`,
                        `Φ = ${formatNumber(B)} × ${formatNumber(Acm / 1e4)} × cos ${theta}°`,
                        `Φ ≈ ${fmt(Phi / 1000, 6)} Wb = <b>${fmt(Phi, 3)} mWb</b>`
                    ]
                };
            }
        },
        {
            topic: "induction",
            build() {
                const N = pick([10, 20, 50, 100, 200]);
                const Phi1 = pick([0, 2, 4, 5]);
                const Phi2 = Phi1 + pick([2, 4, 6, 8, 10]);
                const dt = pick([0.1, 0.2, 0.5, 1]);
                const emf = N * (Phi2 - Phi1) / 1000 / dt;
                return {
                    statement: `O fluxo em uma bobina de <b>${N} espiras</b> varia de <b>${Phi1} mWb</b> para <b>${Phi2} mWb</b> em <b>${formatNumber(dt)} s</b>. Qual o módulo da FEM induzida?`,
                    unit: "V",
                    answer: emf,
                    hint: "|ε| = N · |ΔΦ| / Δt. Converta mWb para Wb.",
                    solution: [
                        `ΔΦ = ${Phi2} − ${Phi1} = ${Phi2 - Phi1} mWb = ${formatNumber((Phi2 - Phi1) / 1000)} Wb`,
                        `|ε| = ${N} × ${formatNumber((Phi2 - Phi1) / 1000)} / ${formatNumber(dt)}`,
                        `|ε| = <b>${fmt(emf, 3)} V</b>`
                    ]
                };
            }
        },
        {
            topic: "induction",
            build() {
                const B = pick([0.2, 0.3, 0.5, 0.8]);
                const L = pick([0.2, 0.4, 0.5, 1]);
                const v = randomInt(2, 15);
                const R = pick([2, 4, 5, 10]);
                const emf = B * L * v;
                const I = emf / R;
                return {
                    statement: `Uma barra de <b>${formatNumber(L * 100)} cm</b> desliza a <b>${v} m/s</b> sobre trilhos, perpendicular a um campo de <b>${formatNumber(B)} T</b>. O circuito tem resistência de <b>${R} Ω</b>. Qual a corrente induzida?`,
                    unit: "A",
                    answer: I,
                    hint: "Primeiro calcule ε = B · L · v; depois aplique I = ε / R.",
                    solution: [
                        `ε = B · L · v = ${formatNumber(B)} × ${formatNumber(L)} × ${v} = ${fmt(emf, 3)} V`,
                        `I = ε / R = ${fmt(emf, 3)} / ${R}`,
                        `I = <b>${fmt(I, 3)} A</b>`
                    ]
                };
            }
        },
        {
            topic: "induction",
            build() {
                const U1 = pick([110, 127, 220]);
                const N1 = pick([500, 1000, 1100, 2200]);
                const U2 = pick([6, 9, 12, 24]);
                const N2 = N1 * U2 / U1;
                return {
                    statement: `Um transformador ideal reduz <b>${U1} V</b> para <b>${U2} V</b>. Se o primário tem <b>${N1} espiras</b>, quantas espiras tem o secundário?`,
                    unit: "espiras",
                    answer: N2,
                    hint: "U1 / U2 = N1 / N2.",
                    solution: [
                        `N2 = N1 · U2 / U1`,
                        `N2 = ${N1} × ${U2} / ${U1}`,
                        `N2 ≈ <b>${fmt(N2, 1)} espiras</b>`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const q1 = randomInt(2, 9);
                const q2 = pick([-8, -5, -3, 3, 5, 8]);
                const r = pick([10, 20, 30, 40, 50]);
                const F = kC * Math.abs(q1 * q2) * 1e-12 / (r / 100) ** 2;
                return {
                    statement: `Duas cargas puntiformes, <b>q1 = ${q1} µC</b> e <b>q2 = ${q2} µC</b>, estão no vácuo a <b>${r} cm</b> uma da outra. Qual o módulo da força elétrica entre elas?`,
                    unit: "N",
                    answer: F,
                    hint: "Lei de Coulomb: F = k · |q1 · q2| / r². Converta µC para C e cm para m.",
                    solution: [
                        `q1 = ${q1}×10⁻⁶ C, q2 = ${Math.abs(q2)}×10⁻⁶ C (em módulo), r = ${formatNumber(r / 100)} m`,
                        `F = 8,99×10⁹ × (${q1}×10⁻⁶ × ${Math.abs(q2)}×10⁻⁶) / ${formatNumber(r / 100)}²`,
                        `F ≈ <b>${fmt(F, 3)} N</b> (${q2 < 0 ? "atração, pois os sinais são opostos" : "repulsão, pois os sinais são iguais"})`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const Q = randomInt(2, 20);
                const r = pick([10, 20, 30, 40, 50, 60]);
                const E = kC * Q * 1e-9 / (r / 100) ** 2;
                return {
                    statement: `Uma carga puntiforme de <b>${Q} nC</b> está no vácuo. Qual o módulo do campo elétrico que ela produz a <b>${r} cm</b> de distância?`,
                    unit: "N/C",
                    answer: E,
                    hint: "E = k · |Q| / r². Use r em metros e Q em coulombs.",
                    solution: [
                        `Q = ${Q}×10⁻⁹ C, r = ${formatNumber(r / 100)} m`,
                        `E = 8,99×10⁹ × ${Q}×10⁻⁹ / ${formatNumber(r / 100)}²`,
                        `E ≈ <b>${fmt(E, 2)} N/C</b>`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const E = pick([100, 200, 500, 1000]);
                const Q = pick([5, 10, 20, 40]);
                const r = Math.sqrt(kC * Q * 1e-9 / E);
                return {
                    statement: `Uma carga de <b>${Q} nC</b> cria, em certo ponto, um campo elétrico de módulo <b>${E} N/C</b>. A que distância da carga fica esse ponto?`,
                    unit: "m",
                    answer: r,
                    hint: "Isole r em E = k · Q / r²: r = √(k · Q / E).",
                    solution: [
                        `r² = k · Q / E = 8,99×10⁹ × ${Q}×10⁻⁹ / ${E}`,
                        `r² ≈ ${fmt(r * r, 4)} m²`,
                        `r ≈ <b>${fmt(r, 3)} m</b>`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const E = pick([1.5, 2, 2.75, 4]);
                const t = pick([0.5, 1, 2, 5]);
                const a = constants.e * E * 1e3 / constants.mp;
                const v = a * t * 1e-6 / 1000;
                return {
                    statement: `Um próton é solto do repouso em um campo elétrico uniforme de <b>${formatNumber(E)} × 10³ N/C</b>. Desprezando a gravidade, qual a velocidade dele após <b>${formatNumber(t)} µs</b>? (m<sub>p</sub> = 1,67 × 10⁻²⁷ kg; e = 1,60 × 10⁻¹⁹ C)`,
                    unit: "km/s",
                    answer: v,
                    hint: "Primeiro a = e · E / m. Depois v = a · t, pois parte do repouso.",
                    solution: [
                        `F = e · E = 1,60×10⁻¹⁹ × ${formatNumber(E * 1e3)} ≈ ${formatNumber(Number((constants.e * E * 1e3).toPrecision(3)))} N`,
                        `a = F / m = ${formatNumber(Number(a.toPrecision(3)))} m/s²`,
                        `v = a · t = a × ${formatNumber(t)}×10⁻⁶ s ≈ <b>${fmt(v, 1)} km/s</b>`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const a = randomInt(2, 10);
                const b = randomInt(2, 10);
                const d = pick([20, 30, 40, 60]);
                const r = d / 200;
                const E = kC * (a + b) * 1e-9 / r ** 2;
                return {
                    statement: `Uma carga de <b>+${a} nC</b> e outra de <b>−${b} nC</b> estão separadas por <b>${d} cm</b>. Qual o módulo do campo elétrico resultante no ponto médio entre elas?`,
                    unit: "N/C",
                    answer: E,
                    hint: "No ponto médio, o campo da carga positiva (afastando) e o da negativa (aproximando) têm o mesmo sentido. Os módulos somam.",
                    solution: [
                        `Distância de cada carga ao ponto médio: r = ${formatNumber(r)} m`,
                        `E₁ = k · ${a}×10⁻⁹ / r² e E₂ = k · ${b}×10⁻⁹ / r², com o mesmo sentido`,
                        `E = E₁ + E₂ = 8,99×10⁹ × ${a + b}×10⁻⁹ / ${formatNumber(r)}² ≈ <b>${fmt(E, 1)} N/C</b>`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const E = pick([200, 400, 500, 800, 1500]);
                const A = pick([0.1, 0.25, 0.5, 2]);
                const theta = pick([0, 30, 45, 60]);
                const Phi = E * A * Math.cos(theta * Math.PI / 180);
                return {
                    statement: `Uma superfície plana de <b>${formatNumber(A)} m²</b> está em um campo elétrico uniforme de <b>${E} N/C</b>. O ângulo entre o campo e a normal à superfície é <b>${theta}°</b>. Qual o fluxo elétrico através dela?`,
                    unit: "N·m²/C",
                    answer: Phi,
                    hint: "Φ = E · A · cos θ, com θ medido entre o campo e a normal.",
                    solution: [
                        `Φ = E · A · cos θ = ${E} × ${formatNumber(A)} × cos ${theta}°`,
                        `Φ ≈ <b>${fmt(Phi, 2)} N·m²/C</b>`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const Q = pick([1, 2, 3, 5, 8]);
                const Phi = Q * 1e-6 / eps0 / 1000;
                return {
                    statement: `Uma carga de <b>${Q} µC</b> está dentro de uma superfície fechada de forma qualquer. Qual o fluxo elétrico total que atravessa a superfície? (ε₀ = 8,85 × 10⁻¹² C²/N·m²)`,
                    unit: "kN·m²/C",
                    answer: Phi,
                    hint: "Lei de Gauss: Φ = Qint / ε₀. A forma da superfície não importa.",
                    solution: [
                        `Φ = Qint / ε₀ = ${Q}×10⁻⁶ / 8,85×10⁻¹²`,
                        `Φ ≈ ${formatNumber(Number((Phi * 1000).toPrecision(3)))} N·m²/C = <b>${fmt(Phi, 2)} kN·m²/C</b>`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const P = pick([2, 5, 9]);
                const Q = P * 1e4 * eps0 * 1e9;
                return {
                    statement: `O fluxo elétrico que sai de uma superfície fechada vale <b>${P} × 10⁴ N·m²/C</b>. Qual a carga líquida no interior dessa superfície?`,
                    unit: "nC",
                    answer: Q,
                    hint: "Lei de Gauss: Qint = Φ · ε₀.",
                    solution: [
                        `Qint = Φ · ε₀ = ${P}×10⁴ × 8,85×10⁻¹²`,
                        `Qint ≈ ${formatNumber(Number((Q * 1e-9).toPrecision(3)))} C = <b>${fmt(Q, 1)} nC</b> (positiva, pois o fluxo sai)`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const lambda = pick([2, 5, 10, 20]);
                const r = pick([10, 20, 40, 50]);
                const E = lambda * 1e-9 / (2 * Math.PI * eps0 * r / 100);
                return {
                    statement: `Uma linha reta muito longa tem carga uniforme de <b>${lambda} nC/m</b>. Qual o campo elétrico a <b>${r} cm</b> da linha?`,
                    unit: "N/C",
                    answer: E,
                    hint: "Pela Lei de Gauss com superfície cilíndrica: E = λ / (2π · ε₀ · r).",
                    solution: [
                        `E = λ / (2π · ε₀ · r) = ${lambda}×10⁻⁹ / (2π × 8,85×10⁻¹² × ${formatNumber(r / 100)})`,
                        `E ≈ <b>${fmt(E, 1)} N/C</b>`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const sigma = pick([5, 10, 20, 50]);
                const E = sigma * 1e-9 / (2 * eps0);
                return {
                    statement: `Um plano infinito tem densidade superficial de carga <b>σ = ${sigma} nC/m²</b>. Qual o módulo do campo elétrico perto dele?`,
                    unit: "N/C",
                    answer: E,
                    hint: "Para um plano infinito, E = σ / (2 · ε₀), e o campo não depende da distância.",
                    solution: [
                        `E = σ / (2 · ε₀) = ${sigma}×10⁻⁹ / (2 × 8,85×10⁻¹²)`,
                        `E ≈ <b>${fmt(E, 1)} N/C</b>`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const Q = pick([2, 5, 8, 12]) * pick([1, -1]);
                const r = pick([5, 10, 20, 30]);
                const V = kC * Q * 1e-9 / (r / 100);
                return {
                    statement: `Qual o potencial elétrico, em relação ao infinito, a <b>${r} cm</b> de uma carga puntiforme de <b>${Q} nC</b>?`,
                    unit: "V",
                    answer: V,
                    hint: "V = k · Q / r. O sinal da carga entra no resultado, pois o potencial é escalar.",
                    solution: [
                        `V = k · Q / r = 8,99×10⁹ × (${Q}×10⁻⁹) / ${formatNumber(r / 100)}`,
                        `V ≈ <b>${fmt(V, 1)} V</b>`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const V = pick([100, 200, 360, 500, 1000]);
                const d = pick([2, 5, 10, 20]);
                const E = V / (d / 1000);
                return {
                    statement: `Duas placas metálicas paralelas, separadas por <b>${d} mm</b>, têm entre si uma diferença de potencial de <b>${V} V</b>. Supondo o campo uniforme, qual o módulo do campo entre elas?`,
                    unit: "V/m",
                    answer: E,
                    hint: "Em campo uniforme, U = E · d.",
                    solution: [
                        `d = ${d} mm = ${formatNumber(d / 1000)} m`,
                        `E = U / d = ${V} / ${formatNumber(d / 1000)}`,
                        `E = <b>${fmt(E, 1)} V/m</b>`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const V = pick([50, 100, 200, 500, 1000]);
                const v = Math.sqrt(2 * constants.e * V / constants.me) / 1e6;
                return {
                    statement: `Um elétron parte do repouso e é acelerado por uma diferença de potencial de <b>${V} V</b>. Qual sua velocidade final? (e = 1,60 × 10⁻¹⁹ C; mₑ = 9,11 × 10⁻³¹ kg)`,
                    unit: "Mm/s",
                    answer: v,
                    hint: "A energia potencial elétrica se converte em cinética: e · V = ½ · m · v². (1 Mm/s = 10⁶ m/s)",
                    solution: [
                        `e · V = ½ · m · v²  ⇒  v = √(2 · e · V / m)`,
                        `v = √(2 × 1,60×10⁻¹⁹ × ${V} / 9,11×10⁻³¹)`,
                        `v ≈ <b>${fmt(v, 2)} Mm/s</b> (${fmt(v * 1e6, 0)} m/s)`
                    ]
                };
            }
        },
        {
            topic: "electrostatics",
            build() {
                const q = pick([2, 5, 10]);
                const dV = pick([20, 50, 100, 300]);
                const W = q * dV / 1000;
                return {
                    statement: `Uma carga de <b>+${q} µC</b> vai de um ponto A, com potencial <b>${dV} V</b> acima do de um ponto B, até B. Qual o trabalho realizado pela força elétrica?`,
                    unit: "mJ",
                    answer: W,
                    hint: "W = q · (VA − VB). Positivo quando a força elétrica ajuda o deslocamento.",
                    solution: [
                        `W = q · (VA − VB) = ${q}×10⁻⁶ × ${dV}`,
                        `W = ${formatNumber(q * dV)}×10⁻⁶ J = <b>${fmt(W, 3)} mJ</b>`
                    ]
                };
            }
        },
        {
            topic: "capacitors",
            build() {
                const A = pick([100, 200, 400, 500, 1000]);
                const d = pick([0.5, 1, 2, 5]);
                const C = eps0 * A / 1e4 / (d / 1000) * 1e12;
                return {
                    statement: `Um capacitor de placas paralelas no vácuo tem placas de <b>${A} cm²</b> separadas por <b>${formatNumber(d)} mm</b>. Qual a capacitância?`,
                    unit: "pF",
                    answer: C,
                    hint: "C = ε₀ · A / d. Converta cm² para m² (1 cm² = 10⁻⁴ m²) e mm para m.",
                    solution: [
                        `A = ${formatNumber(A / 1e4)} m², d = ${formatNumber(d / 1000)} m`,
                        `C = 8,85×10⁻¹² × ${formatNumber(A / 1e4)} / ${formatNumber(d / 1000)}`,
                        `C ≈ <b>${fmt(C, 1)} pF</b>`
                    ]
                };
            }
        },
        {
            topic: "capacitors",
            build() {
                const C = pick([2, 4, 10, 22, 47]);
                const V = pick([5, 9, 12, 24, 50]);
                const Q = C * V;
                return {
                    statement: `Um capacitor de <b>${C} µF</b> é ligado a uma fonte de <b>${V} V</b>. Qual a carga acumulada em cada placa?`,
                    unit: "µC",
                    answer: Q,
                    hint: "Q = C · V. Com C em µF, a carga sai em µC.",
                    solution: [
                        `Q = C · V = ${C} µF × ${V} V`,
                        `Q = <b>${fmt(Q, 1)} µC</b>`
                    ]
                };
            }
        },
        {
            topic: "capacitors",
            build() {
                const vals = [2, 3, 4, 6, 12];
                const C1 = pick(vals);
                const C2 = pick(vals);
                const Ceq = C1 * C2 / (C1 + C2);
                return {
                    statement: `Dois capacitores, de <b>${C1} µF</b> e <b>${C2} µF</b>, estão ligados em série. Qual a capacitância equivalente?`,
                    unit: "µF",
                    answer: Ceq,
                    hint: "Em série: 1/Ceq = 1/C1 + 1/C2, ou Ceq = C1·C2 / (C1 + C2).",
                    solution: [
                        `Ceq = C1·C2 / (C1 + C2) = ${C1}·${C2} / (${C1} + ${C2})`,
                        `Ceq = ${C1 * C2} / ${C1 + C2} ≈ <b>${fmt(Ceq, 3)} µF</b>`
                    ]
                };
            }
        },
        {
            topic: "capacitors",
            build() {
                const C1 = pick([2, 4, 6]);
                const C2 = pick([2, 3, 6]);
                const C3 = pick([3, 6, 12]);
                const Cp = C1 + C2;
                const Ceq = Cp * C3 / (Cp + C3);
                return {
                    statement: `Os capacitores de <b>${C1} µF</b> e <b>${C2} µF</b> estão em paralelo entre si, e esse conjunto está em série com um de <b>${C3} µF</b>. Qual a capacitância equivalente?`,
                    unit: "µF",
                    answer: Ceq,
                    hint: "Some os dois em paralelo primeiro. Depois combine o resultado com o terceiro em série.",
                    solution: [
                        `Paralelo: C12 = ${C1} + ${C2} = ${Cp} µF`,
                        `Série: Ceq = C12·C3 / (C12 + C3) = ${Cp}·${C3} / (${Cp} + ${C3})`,
                        `Ceq ≈ <b>${fmt(Ceq, 3)} µF</b>`
                    ]
                };
            }
        },
        {
            topic: "capacitors",
            build() {
                const C = pick([2, 5, 10, 22]);
                const V = pick([5, 9, 12, 24]);
                const U = 0.5 * C * V * V / 1000;
                return {
                    statement: `Qual a energia armazenada em um capacitor de <b>${C} µF</b> carregado com <b>${V} V</b>?`,
                    unit: "mJ",
                    answer: U,
                    hint: "U = ½ · C · V². (1 µF · 1 V² = 1 µJ)",
                    solution: [
                        `U = ½ · C · V² = ½ × ${C}×10⁻⁶ × ${V}²`,
                        `U = ${fmt(U * 1000, 1)} µJ = <b>${fmt(U, 3)} mJ</b>`
                    ]
                };
            }
        },
        {
            topic: "capacitors",
            build() {
                const C0 = pick([50, 100, 200, 470]);
                const kappa = pick([2, 3, 4.7, 6]);
                const C = C0 * kappa;
                return {
                    statement: `Um capacitor com ar entre as placas tem <b>${C0} pF</b>. O espaço entre as placas é totalmente preenchido por um dielétrico de constante <b>κ = ${formatNumber(kappa)}</b>. Qual a nova capacitância?`,
                    unit: "pF",
                    answer: C,
                    hint: "C = κ · C₀.",
                    solution: [
                        `C = κ · C₀ = ${formatNumber(kappa)} × ${C0} pF`,
                        `C = <b>${fmt(C, 1)} pF</b>`
                    ]
                };
            }
        },
        {
            topic: "capacitors",
            build() {
                const V0 = pick([10, 20, 50, 120]);
                const kappa = pick([2, 4, 5, 10]);
                const V = V0 / kappa;
                return {
                    statement: `Um capacitor carregado a <b>${V0} V</b> é desligado da fonte. Em seguida, um dielétrico de <b>κ = ${kappa}</b> preenche todo o espaço entre as placas. Qual a nova diferença de potencial?`,
                    unit: "V",
                    answer: V,
                    hint: "Desligado da fonte, a carga Q fica constante. Como C aumenta por κ, V = Q / C diminui pelo mesmo fator.",
                    solution: [
                        `Q constante e C = κ · C₀  ⇒  V = V₀ / κ`,
                        `V = ${V0} / ${kappa} = <b>${fmt(V, 2)} V</b>`
                    ]
                };
            }
        },
        {
            topic: "capacitors",
            build() {
                const C1 = pick([2, 3, 4, 6]);
                const C2 = pick([3, 6, 12]);
                const V = pick([12, 24, 36, 48]);
                const V1 = V * C2 / (C1 + C2);
                return {
                    statement: `Dois capacitores, <b>C1 = ${C1} µF</b> e <b>C2 = ${C2} µF</b>, estão em série com uma fonte de <b>${V} V</b>. Qual a diferença de potencial sobre C1?`,
                    unit: "V",
                    answer: V1,
                    hint: "Em série a carga é a mesma: Q = Ceq · V. Depois V1 = Q / C1.",
                    solution: [
                        `Ceq = ${C1}·${C2} / (${C1} + ${C2}) = ${fmt(C1 * C2 / (C1 + C2), 3)} µF`,
                        `Q = Ceq · V = ${fmt(C1 * C2 / (C1 + C2) * V, 2)} µC`,
                        `V1 = Q / C1 = <b>${fmt(V1, 2)} V</b>`
                    ]
                };
            }
        },
        {
            topic: "capacitors",
            build() {
                const E = pick([300, 500, 800, 1000]);
                const u = 0.5 * eps0 * (E * 1e3) ** 2;
                return {
                    statement: `Entre as placas de um capacitor a vácuo há um campo elétrico de <b>${E} kV/m</b>. Qual a densidade de energia armazenada no campo?`,
                    unit: "J/m³",
                    answer: u,
                    hint: "u = ½ · ε₀ · E². Converta kV/m para V/m.",
                    solution: [
                        `E = ${E}×10³ V/m`,
                        `u = ½ × 8,85×10⁻¹² × (${E}×10³)²`,
                        `u ≈ <b>${fmt(u, 3)} J/m³</b>`
                    ]
                };
            }
        },
        {
            topic: "circuits",
            build() {
                const I = pick([100, 250, 500, 1000]);
                const h = pick([2, 4, 6]);
                const Q = I / 1000 * h * 3600;
                return {
                    statement: `Um aparelho consome corrente constante de <b>${I} mA</b> durante <b>${h} horas</b>. Qual a carga elétrica total que atravessa o circuito?`,
                    unit: "C",
                    answer: Q,
                    hint: "ΔQ = I · Δt, com I em ampères e Δt em segundos (1 h = 3600 s).",
                    solution: [
                        `I = ${formatNumber(I / 1000)} A, Δt = ${h} × 3600 = ${h * 3600} s`,
                        `ΔQ = I · Δt = ${formatNumber(I / 1000)} × ${h * 3600}`,
                        `ΔQ = <b>${fmt(Q, 1)} C</b>`
                    ]
                };
            }
        },
        {
            topic: "circuits",
            build() {
                const mat = pick([
                    { name: "cobre", rho: 1.68 },
                    { name: "alumínio", rho: 2.65 },
                    { name: "ouro", rho: 2.44 }
                ]);
                const L = pick([5, 10, 20, 50]);
                const d = pick([0.5, 1, 1.5, 2]);
                const A = Math.PI * (d / 2000) ** 2;
                const R = mat.rho * 1e-8 * L / A * 1000;
                return {
                    statement: `Um fio de <b>${mat.name}</b> (ρ = ${formatNumber(mat.rho)} × 10⁻⁸ Ω·m) tem <b>${L} m</b> de comprimento e <b>${formatNumber(d)} mm</b> de diâmetro. Qual a resistência do fio?`,
                    unit: "mΩ",
                    answer: R,
                    hint: "R = ρ · L / A, com A = π · (d/2)². Use o diâmetro em metros.",
                    solution: [
                        `A = π · (${formatNumber(d / 2000)} m)² ≈ ${formatNumber(Number(A.toPrecision(3)))} m²`,
                        `R = ρ · L / A = ${formatNumber(mat.rho)}×10⁻⁸ × ${L} / ${formatNumber(Number(A.toPrecision(3)))}`,
                        `R ≈ ${fmt(R / 1000, 4)} Ω = <b>${fmt(R, 1)} mΩ</b>`
                    ]
                };
            }
        },
        {
            topic: "circuits",
            build() {
                const emf = pick([6, 9, 12]);
                const r = pick([0.2, 0.5, 1]);
                const R = pick([4, 8, 10, 20]);
                const I = emf / (R + r);
                const U = emf - r * I;
                return {
                    statement: `Uma bateria de <b>ε = ${emf} V</b> e resistência interna <b>r = ${formatNumber(r)} Ω</b> alimenta um resistor de <b>${R} Ω</b>. Qual a tensão nos terminais da bateria?`,
                    unit: "V",
                    answer: U,
                    hint: "Primeiro a corrente: I = ε / (R + r). Depois U = ε − r · I.",
                    solution: [
                        `I = ε / (R + r) = ${emf} / (${R} + ${formatNumber(r)}) ≈ ${fmt(I, 4)} A`,
                        `U = ε − r · I = ${emf} − ${formatNumber(r)} × ${fmt(I, 4)}`,
                        `U ≈ <b>${fmt(U, 3)} V</b>`
                    ]
                };
            }
        },
        {
            topic: "circuits",
            build() {
                const R = pick([10, 47, 100, 220]);
                const C = pick([1, 2.2, 4.7, 10]);
                const tau = R * C;
                return {
                    statement: `Um capacitor de <b>${formatNumber(C)} µF</b> é carregado através de um resistor de <b>${R} kΩ</b>. Qual a constante de tempo do circuito R-C?`,
                    unit: "ms",
                    answer: tau,
                    hint: "τ = R · C. Lembre que 1 kΩ × 1 µF = 1 ms.",
                    solution: [
                        `τ = R · C = ${R}×10³ Ω × ${formatNumber(C)}×10⁻⁶ F`,
                        `τ = <b>${fmt(tau, 2)} ms</b>`
                    ]
                };
            }
        },
        {
            topic: "magnetism",
            build() {
                const N = pick([1, 5, 10, 20]);
                const I = pick([1, 2, 5]);
                const R = pick([2, 5, 10]);
                const B = constants.mu0 * N * I / (2 * R / 100) * 1e6;
                return {
                    statement: `Uma bobina circular de <b>${N} ${N === 1 ? "espira" : "espiras"}</b> e raio <b>${R} cm</b> é percorrida por uma corrente de <b>${I} A</b>. Qual o campo magnético no centro dela?`,
                    unit: "µT",
                    answer: B,
                    hint: "B = μ₀ · N · I / (2R), com μ₀ = 4π × 10⁻⁷ T·m/A.",
                    solution: [
                        `B = μ₀ · N · I / (2R) = 4π×10⁻⁷ × ${N} × ${I} / (2 × ${formatNumber(R / 100)})`,
                        `B ≈ ${formatNumber(Number((B * 1e-6).toPrecision(3)))} T = <b>${fmt(B, 2)} µT</b>`
                    ]
                };
            }
        },
        {
            topic: "magnetism",
            build() {
                const N = pick([20, 50, 100]);
                const I = pick([0.5, 1, 2]);
                const Acm = pick([20, 50, 100]);
                const B = pick([0.1, 0.2, 0.5]);
                const theta = pick([30, 45, 60, 90]);
                const tau = N * I * Acm / 1e4 * B * Math.sin(theta * Math.PI / 180) * 1000;
                return {
                    statement: `Uma bobina de <b>${N} espiras</b>, área <b>${Acm} cm²</b>, conduz <b>${formatNumber(I)} A</b> em um campo uniforme de <b>${formatNumber(B)} T</b>. A normal à bobina forma <b>${theta}°</b> com o campo. Qual o torque sobre ela?`,
                    unit: "mN·m",
                    answer: tau,
                    hint: "τ = N · I · A · B · sen θ, com A em m².",
                    solution: [
                        `A = ${Acm} cm² = ${formatNumber(Acm / 1e4)} m²`,
                        `τ = ${N} × ${formatNumber(I)} × ${formatNumber(Acm / 1e4)} × ${formatNumber(B)} × sen ${theta}°`,
                        `τ ≈ ${fmt(tau / 1000, 5)} N·m = <b>${fmt(tau, 2)} mN·m</b>`
                    ]
                };
            }
        },
        {
            topic: "magnetism",
            build() {
                const I1 = pick([5, 10, 20, 50]);
                const I2 = pick([5, 10, 20, 50]);
                const d = pick([2, 5, 10]);
                const f = constants.mu0 * I1 * I2 / (2 * Math.PI * d / 100) * 1e6;
                return {
                    statement: `Dois fios longos e paralelos, a <b>${d} cm</b> um do outro, conduzem <b>${I1} A</b> e <b>${I2} A</b> no mesmo sentido. Qual a força por metro de comprimento entre eles?`,
                    unit: "µN/m",
                    answer: f,
                    hint: "F/L = μ₀ · I1 · I2 / (2π · d). Correntes no mesmo sentido se atraem.",
                    solution: [
                        `F/L = 4π×10⁻⁷ × ${I1} × ${I2} / (2π × ${formatNumber(d / 100)})`,
                        `F/L ≈ <b>${fmt(f, 1)} µN/m</b> (atração)`
                    ]
                };
            }
        },
        {
            topic: "induction",
            build() {
                const L = pick([10, 50, 100, 200]);
                const dI = pick([0.5, 1, 2, 5]);
                const dt = pick([1, 2, 5, 10]);
                const emf = L / 1000 * dI / (dt / 1000);
                return {
                    statement: `A corrente em um indutor de <b>${L} mH</b> varia <b>${formatNumber(dI)} A</b> em <b>${dt} ms</b>, de modo uniforme. Qual o módulo da tensão autoinduzida?`,
                    unit: "V",
                    answer: emf,
                    hint: "|ε| = L · |ΔI| / Δt, com L em henrys e Δt em segundos.",
                    solution: [
                        `L = ${formatNumber(L / 1000)} H, Δt = ${formatNumber(dt / 1000)} s`,
                        `|ε| = ${formatNumber(L / 1000)} × ${formatNumber(dI)} / ${formatNumber(dt / 1000)}`,
                        `|ε| = <b>${fmt(emf, 2)} V</b>`
                    ]
                };
            }
        },
        {
            topic: "induction",
            build() {
                const L = pick([10, 50, 100, 500]);
                const I = pick([0.5, 1, 2, 3]);
                const U = L * I * I / 2;
                return {
                    statement: `Qual a energia armazenada em um indutor de <b>${L} mH</b> percorrido por <b>${formatNumber(I)} A</b>?`,
                    unit: "mJ",
                    answer: U,
                    hint: "U = ½ · L · I². Com L em mH, o resultado sai em mJ.",
                    solution: [
                        `U = ½ · L · I² = ½ × ${formatNumber(L / 1000)} × ${formatNumber(I)}²`,
                        `U = <b>${fmt(U, 2)} mJ</b>`
                    ]
                };
            }
        },
        {
            topic: "induction",
            build() {
                const N = pick([100, 200, 500]);
                const B = pick([0.05, 0.1, 0.2]);
                const Acm = pick([50, 100, 200]);
                const f = pick([30, 50, 60]);
                const w = 2 * Math.PI * f;
                const emf = N * B * Acm / 1e4 * w;
                return {
                    statement: `Uma bobina de <b>${N} espiras</b> e <b>${Acm} cm²</b> gira a <b>${f} Hz</b> em um campo uniforme de <b>${formatNumber(B)} T</b>. Qual a FEM máxima gerada?`,
                    unit: "V",
                    answer: emf,
                    hint: "ε_máx = N · B · A · ω, com ω = 2π · f.",
                    solution: [
                        `ω = 2π × ${f} ≈ ${fmt(w, 2)} rad/s e A = ${formatNumber(Acm / 1e4)} m²`,
                        `ε_máx = ${N} × ${formatNumber(B)} × ${formatNumber(Acm / 1e4)} × ${fmt(w, 2)}`,
                        `ε_máx ≈ <b>${fmt(emf, 2)} V</b>`
                    ]
                };
            }
        },
        {
            topic: "induction",
            build() {
                const M = pick([5, 10, 20, 50]);
                const dI = pick([1, 2, 4]);
                const dt = pick([0.5, 1, 2, 5]);
                const emf = M / 1000 * dI / (dt / 1000);
                return {
                    statement: `A corrente na bobina primária varia <b>${dI} A</b> em <b>${formatNumber(dt)} ms</b>. A indutância mútua com a bobina secundária é <b>${M} mH</b>. Qual a tensão induzida no secundário?`,
                    unit: "V",
                    answer: emf,
                    hint: "|ε2| = M · |ΔI1| / Δt.",
                    solution: [
                        `M = ${formatNumber(M / 1000)} H, Δt = ${formatNumber(dt / 1000)} s`,
                        `|ε2| = ${formatNumber(M / 1000)} × ${dI} / ${formatNumber(dt / 1000)}`,
                        `|ε2| = <b>${fmt(emf, 2)} V</b>`
                    ]
                };
            }
        }
    ];

    // Questões conceituais (múltipla escolha). "correct" é o índice da alternativa certa
    const conceptual = [
        {
            topic: "circuits",
            statement: "Ao adicionar mais um resistor em paralelo a um circuito alimentado por uma fonte ideal, a corrente total fornecida pela fonte:",
            options: ["Aumenta", "Diminui", "Permanece igual", "Se anula"],
            correct: 0,
            explanation: "Cada resistor a mais em paralelo diminui a resistência equivalente. Com a mesma tensão, a corrente total I = U / Req aumenta."
        },
        {
            topic: "circuits",
            statement: "Em uma associação em série, qual grandeza é a mesma para todos os resistores?",
            options: ["Tensão", "Potência", "Corrente", "Resistência"],
            correct: 2,
            explanation: "Em série há um único caminho para as cargas, então a corrente é a mesma em todos os resistores. A tensão se divide entre eles."
        },
        {
            topic: "circuits",
            statement: "Duas lâmpadas de 60 W e 100 W (ambas para 220 V) são ligadas em série a 220 V. Qual brilha mais?",
            options: ["A de 100 W", "A de 60 W", "Brilham igualmente", "Nenhuma acende"],
            correct: 1,
            explanation: "A lâmpada de 60 W tem maior resistência (R = U²/P). Em série a corrente é a mesma, então dissipa mais quem tem maior R (P = R·I²): a de 60 W."
        },
        {
            topic: "magnetism",
            statement: "Uma partícula carregada entra em um campo magnético uniforme com velocidade paralela às linhas de campo. O que acontece?",
            options: ["Descreve um círculo", "Segue em linha reta", "Para", "Descreve uma hélice"],
            correct: 1,
            explanation: "Com θ = 0°, sen θ = 0 e a força magnética é nula. A partícula mantém a velocidade e segue em linha reta."
        },
        {
            topic: "magnetism",
            statement: "Por que a força magnética não altera a energia cinética de uma carga?",
            options: [
                "Porque é sempre muito pequena",
                "Porque é sempre perpendicular à velocidade",
                "Porque só atua em cargas paradas",
                "Porque se anula com a força elétrica"
            ],
            correct: 1,
            explanation: "A força magnética é perpendicular à velocidade, então não realiza trabalho. Ela muda a direção do movimento, mas não o módulo da velocidade."
        },
        {
            topic: "magnetism",
            statement: "Dois fios paralelos conduzem correntes no mesmo sentido. Os fios:",
            options: ["Se atraem", "Se repelem", "Não interagem", "Giram"],
            correct: 0,
            explanation: "Cada fio cria um campo que exerce força sobre o outro. Para correntes no mesmo sentido, pela regra da mão direita, a força é de atração."
        },
        {
            topic: "magnetism",
            statement: "Se a velocidade de uma partícula em MCU dentro de um campo magnético dobrar, o raio da trajetória:",
            options: ["Dobra", "Cai pela metade", "Quadruplica", "Não muda"],
            correct: 0,
            explanation: "r = m·v / (|q|·B) é diretamente proporcional a v. Dobrando v, o raio dobra (o período, porém, não muda)."
        },
        {
            topic: "induction",
            statement: "Um ímã está parado dentro de uma bobina ligada a um amperímetro. O amperímetro indica:",
            options: ["Corrente máxima", "Corrente alternada", "Corrente nula", "Corrente constante não nula"],
            correct: 2,
            explanation: "Sem movimento, o fluxo magnético não varia. Pela Lei de Faraday, sem variação de fluxo não há FEM induzida, e portanto não há corrente."
        },
        {
            topic: "induction",
            statement: "O sinal negativo na Lei de Faraday (ε = −N·ΔΦ/Δt) representa:",
            options: [
                "Que a FEM é sempre negativa",
                "A Lei de Lenz: a corrente induzida se opõe à variação de fluxo",
                "Que o fluxo diminui com o tempo",
                "A perda de energia por calor"
            ],
            correct: 1,
            explanation: "É a Lei de Lenz: o campo da corrente induzida se opõe à variação de fluxo que a gerou, o que garante a conservação da energia."
        },
        {
            topic: "induction",
            statement: "Por que transformadores não funcionam com corrente contínua constante?",
            options: [
                "Porque esquentam demais",
                "Porque o fluxo no núcleo não varia",
                "Porque a tensão é muito baixa",
                "Porque o núcleo perde a magnetização"
            ],
            correct: 1,
            explanation: "Com corrente contínua constante, o fluxo no núcleo é constante. Sem variação de fluxo, não há FEM induzida no secundário."
        },
        {
            topic: "induction",
            statement: "Uma espira gira em um campo uniforme. Em qual posição o fluxo através dela é máximo?",
            options: [
                "Plano da espira paralelo a B",
                "Plano da espira perpendicular a B",
                "Plano a 45° de B",
                "O fluxo é sempre o mesmo"
            ],
            correct: 1,
            explanation: "Φ = B·A·cos θ, com θ medido entre B e a normal. O plano perpendicular a B significa normal paralela a B (θ = 0°), o que dá fluxo máximo."
        },
        {
            topic: "electrostatics",
            statement: "Uma carga puntiforme positiva está no centro de uma esfera imaginária. Se o raio dessa esfera dobrar, o fluxo elétrico total através dela:",
            options: ["Quadruplica", "Dobra", "Permanece o mesmo", "Cai pela metade"],
            correct: 2,
            explanation: "Pela Lei de Gauss, o fluxo total depende só da carga no interior (Φ = Q/ε₀), não do tamanho da superfície. O campo cai com o quadrado do raio, mas a área cresce na mesma proporção."
        },
        {
            topic: "electrostatics",
            statement: "Uma carga positiva está do lado de fora de uma superfície fechada. O fluxo elétrico líquido através da superfície é:",
            options: ["Positivo", "Negativo", "Zero", "Depende do formato da superfície"],
            correct: 2,
            explanation: "As linhas de campo que entram na superfície também saem dela. O fluxo líquido só depende da carga que está dentro."
        },
        {
            topic: "electrostatics",
            statement: "Dobrando a distância entre duas cargas puntiformes, a força de Coulomb entre elas:",
            options: ["Fica pela metade", "Fica um quarto do valor", "Dobra", "Quadruplica"],
            correct: 1,
            explanation: "F é proporcional a 1/r². Com r dobrado, F fica 1/2² = 1/4 do valor inicial."
        },
        {
            topic: "electrostatics",
            statement: "Duas cargas positivas iguais estão separadas por uma distância d. No ponto médio entre elas, o campo elétrico resultante é:",
            options: ["Nulo", "O dobro do campo de uma delas", "Igual ao campo de uma delas", "Perpendicular à reta que une as cargas"],
            correct: 0,
            explanation: "Os dois campos têm o mesmo módulo e sentidos opostos nesse ponto, então a soma vetorial é zero."
        },
        {
            topic: "electrostatics",
            statement: "Um próton é solto do repouso em um campo elétrico uniforme. Ele passa a se mover:",
            options: ["No sentido do campo", "No sentido oposto ao campo", "Perpendicularmente ao campo", "Fica parado"],
            correct: 0,
            explanation: "A força sobre uma carga positiva tem o mesmo sentido do campo. Um elétron, de carga negativa, iria no sentido contrário."
        },
        {
            topic: "electrostatics",
            statement: "Ao se deslocar no mesmo sentido do campo elétrico, o potencial elétrico:",
            options: ["Aumenta", "Diminui", "Permanece constante", "Depende do sinal da carga que se desloca"],
            correct: 1,
            explanation: "O campo elétrico aponta no sentido em que o potencial diminui. O potencial é uma propriedade do ponto e não depende da carga de prova."
        },
        {
            topic: "electrostatics",
            statement: "Qual é a relação entre as linhas de campo elétrico e as superfícies equipotenciais?",
            options: ["São perpendiculares", "São paralelas", "Formam 45°", "Não têm relação"],
            correct: 0,
            explanation: "Ao longo de uma equipotencial o potencial não varia, então não há componente do campo nessa direção: o campo é perpendicular a ela."
        },
        {
            topic: "electrostatics",
            statement: "O potencial elétrico em um ponto devido a várias cargas puntiformes é obtido:",
            options: ["Somando algebricamente os potenciais de cada carga", "Somando vetorialmente os potenciais", "Multiplicando os potenciais", "Usando só a carga mais próxima"],
            correct: 0,
            explanation: "O potencial é escalar, então basta somar os valores com seus sinais. Já o campo elétrico exige soma vetorial."
        },
        {
            topic: "capacitors",
            statement: "Ao aproximar as placas de um capacitor de placas paralelas, sem mudar a área, a capacitância:",
            options: ["Aumenta", "Diminui", "Permanece a mesma", "Se anula"],
            correct: 0,
            explanation: "C = ε₀·A/d: diminuir d aumenta C."
        },
        {
            topic: "capacitors",
            statement: "Dois capacitores ligados em série a uma fonte têm sempre:",
            options: ["A mesma carga", "A mesma tensão", "A mesma energia", "A mesma capacitância"],
            correct: 0,
            explanation: "Em série, a carga que sai de uma placa vai para a vizinha, então ambos acumulam a mesma carga Q. A tensão se divide de acordo com as capacitâncias."
        },
        {
            topic: "capacitors",
            statement: "Um capacitor carregado é desligado da bateria e, depois, um dielétrico preenche o espaço entre as placas. A tensão entre as placas:",
            options: ["Aumenta", "Diminui", "Não muda", "Muda de sinal"],
            correct: 1,
            explanation: "Sem a bateria, a carga Q se mantém. O dielétrico aumenta C por κ, e V = Q/C diminui pelo mesmo fator."
        },
        {
            topic: "capacitors",
            statement: "Se a tensão sobre um capacitor triplica, a energia armazenada:",
            options: ["Triplica", "Fica 6 vezes maior", "Fica 9 vezes maior", "Não muda"],
            correct: 2,
            explanation: "U = ½·C·V². A energia é proporcional a V², então com 3V ela vira 3² = 9 vezes maior."
        },
        {
            topic: "capacitors",
            statement: "Qual associação de capacitores resulta em capacitância equivalente maior que a de qualquer um deles?",
            options: ["Em paralelo", "Em série", "Nenhuma", "As duas"],
            correct: 0,
            explanation: "Em paralelo, as capacitâncias se somam. Em série, o equivalente é menor que o menor deles."
        },
        {
            topic: "circuits",
            statement: "Para medir a corrente que passa por um resistor, o amperímetro deve ser ligado:",
            options: ["Em série com o resistor", "Em paralelo com o resistor", "Em qualquer posição", "Em curto-circuito"],
            correct: 0,
            explanation: "A corrente precisa passar pelo instrumento. Por isso o amperímetro entra em série e tem resistência interna muito baixa."
        },
        {
            topic: "circuits",
            statement: "Em uma bateria real que fornece corrente, a tensão entre os terminais é:",
            options: ["Menor que a FEM", "Igual à FEM", "Maior que a FEM", "Sempre zero"],
            correct: 0,
            explanation: "Parte da energia é dissipada na resistência interna: U = ε − r·I. Só sem corrente a tensão nos terminais iguala a FEM."
        },
        {
            topic: "circuits",
            statement: "Em um circuito R-C, muito tempo depois de o capacitor começar a carregar (t ≫ RC), a corrente no circuito é:",
            options: ["Praticamente nula", "Máxima", "Constante e diferente de zero", "Negativa"],
            correct: 0,
            explanation: "O capacitor carregado atinge a tensão da fonte e deixa de aceitar carga, então a corrente cai a zero."
        },
        {
            topic: "magnetism",
            statement: "Se um ímã em barra for partido ao meio, o resultado é:",
            options: [
                "Dois ímãs completos, cada um com polo norte e polo sul",
                "Um pedaço só com polo norte e outro só com polo sul",
                "Dois pedaços sem magnetização",
                "Um ímã e um pedaço de ferro comum"
            ],
            correct: 0,
            explanation: "Não existem monopolos magnéticos. Cada pedaço ganha os dois polos, o que se expressa na Lei de Gauss do magnetismo."
        },
        {
            topic: "magnetism",
            statement: "O fluxo magnético total através de qualquer superfície fechada é:",
            options: ["Sempre zero", "Igual à corrente no interior", "Proporcional à carga no interior", "Sempre positivo"],
            correct: 0,
            explanation: "Como as linhas de B são fechadas, toda linha que entra na superfície também sai: ∮B·dA = 0."
        },
        {
            topic: "magnetism",
            statement: "Dois fios longos e paralelos conduzem correntes no mesmo sentido. Entre eles há:",
            options: ["Atração", "Repulsão", "Nenhuma força", "Um torque, mas nenhuma força"],
            correct: 0,
            explanation: "O campo de cada fio, no lugar do outro, produz uma força que os aproxima quando as correntes têm o mesmo sentido."
        },
        {
            topic: "induction",
            statement: "A tensão autoinduzida em um indutor depende principalmente:",
            options: [
                "Da taxa de variação da corrente",
                "Do valor da corrente quando ela é constante",
                "Só da tensão da fonte",
                "Só da resistência do fio"
            ],
            correct: 0,
            explanation: "ε = −L·dI/dt. Com corrente constante, a tensão induzida é nula, por maior que seja a corrente."
        },
        {
            topic: "induction",
            statement: "Qual é a unidade de indutância no Sistema Internacional?",
            options: ["Henry (H)", "Weber (Wb)", "Tesla (T)", "Farad (F)"],
            correct: 0,
            explanation: "A unidade é o henry: 1 H = 1 V·s/A. Weber é do fluxo magnético, tesla do campo e farad da capacitância."
        },
        {
            topic: "induction",
            statement: "Por que o fundo metálico de uma panela esquenta em um fogão de indução?",
            options: [
                "Porque o campo magnético variável induz correntes no metal, que o aquecem por efeito Joule",
                "Porque a chama fica escondida sob a panela",
                "Porque o ímã do fogão atrai os átomos do metal",
                "Porque o campo magnético constante aquece qualquer material"
            ],
            correct: 0,
            explanation: "A bobina do fogão produz um campo variável. Pela Lei de Faraday, ele induz correntes no fundo da panela, que o aquecem."
        }
    ];

    // Estatísticas salvas no navegador (acertos, total, sequência e por tema)
    const statsStore = storage("physicslab.exercises.stats", null);
    const emptyStats = () => ({
        correct: 0,
        total: 0,
        streak: 0,
        best: 0,
        byTopic: {
            electrostatics: { correct: 0, total: 0 },
            capacitors: { correct: 0, total: 0 },
            circuits: { correct: 0, total: 0 },
            magnetism: { correct: 0, total: 0 },
            induction: { correct: 0, total: 0 }
        }
    });

    let stats = (() => {
        const saved = statsStore.load();
        if (!saved) return emptyStats();
        const fresh = emptyStats();
        return { ...fresh, ...saved, byTopic: { ...fresh.byTopic, ...saved.byTopic } };
    })();
    let activeTopic = "all";
    let question = null;
    let answered = false;
    let lastKey = "";

    // Atualiza os números e as barrinhas de desempenho por tema
    function updateStats() {
        statCorrect.textContent = stats.correct;
        statTotal.textContent = stats.total;
        statAccuracy.textContent = stats.total ? `${Math.round(stats.correct / stats.total * 100)}%` : "—";
        statStreak.textContent = stats.streak;
        statBest.textContent = stats.best;

        topicStatsEl.innerHTML = Object.entries(stats.byTopic).map(([topic, s]) => {
            const pct = s.total ? Math.round(s.correct / s.total * 100) : 0;
            return `
                <div class="topic-stat">
                    <div class="topic-stat-head">
                        <span>${topicNames[topic]}</span>
                        <strong>${s.correct}/${s.total}</strong>
                    </div>
                    <div class="topic-stat-bar"><i class="${topic}" style="width:${pct}%"></i></div>
                </div>
            `;
        }).join("");
    }

    // Sorteia uma questão do tema escolhido (60% numérica, 40% conceitual), sem repetir a anterior
    function newQuestion() {
        const numeric = generators.filter(g => activeTopic === "all" || g.topic === activeTopic);
        const concepts = conceptual.filter(c => activeTopic === "all" || c.topic === activeTopic);

        let candidate;
        let key;
        let attempts = 0;

        do {
            if (Math.random() < 0.6) {
                const gen = pick(numeric);
                candidate = { kind: "numeric", topic: gen.topic, ...gen.build() };
                key = "";
            } else {
                const item = pick(concepts);
                const order = shuffle(item.options.map((_, i) => i));
                candidate = {
                    kind: "choice",
                    ...item,
                    options: order.map(i => item.options[i]),
                    correct: order.indexOf(item.correct)
                };
                key = item.statement;
            }
            attempts++;
        } while (key && key === lastKey && attempts < 5);

        lastKey = key;
        question = candidate;
        answered = false;
        renderQuestion();
    }

    // Mostra a questão: campo de resposta (numérica) ou alternativas embaralhadas (conceitual)
    function renderQuestion() {
        tagEl.textContent = topicNames[question.topic];
        tagEl.className = `theory-area ${{ electrostatics: "green", capacitors: "teal", circuits: "blue", magnetism: "purple", induction: "orange" }[question.topic]}`;
        typeEl.textContent = question.kind === "numeric" ? "Questão numérica" : "Questão conceitual";
        statementEl.innerHTML = question.statement;
        feedbackEl.hidden = true;
        feedbackEl.className = "exercise-feedback";
        hintBox.hidden = true;
        hintButton.hidden = question.kind !== "numeric";
        checkButton.hidden = false;
        checkButton.disabled = false;

        if (question.kind === "numeric") {
            hintBox.textContent = question.hint;
            answerArea.innerHTML = `
                <label class="exercise-input">
                    <span>Sua resposta</span>
                    <div class="calc-input-row">
                        <input type="text" inputmode="decimal" id="exercise-value" placeholder="Ex.: 12,5" autocomplete="off">
                        <span class="calc-unit">${question.unit}</span>
                    </div>
                </label>
            `;
            const input = document.getElementById("exercise-value");
            input.addEventListener("keydown", event => {
                if (event.key === "Enter") {
                    answered ? newQuestion() : checkAnswer();
                }
            });
            input.focus({ preventScroll: true });
        } else {
            answerArea.innerHTML = `
                <div class="exercise-options">
                    ${question.options.map((opt, i) => `
                        <button class="exercise-option" data-option="${i}">
                            <span>${String.fromCharCode(65 + i)}</span>${escapeHTML(opt)}
                        </button>
                    `).join("")}
                </div>
            `;
        }
    }

    // Conta o acerto/erro e atualiza a sequência
    function register(isCorrect) {
        stats.total++;
        stats.byTopic[question.topic].total++;

        if (isCorrect) {
            stats.correct++;
            stats.byTopic[question.topic].correct++;
            stats.streak++;
            stats.best = Math.max(stats.best, stats.streak);
        } else {
            stats.streak = 0;
        }

        statsStore.save(stats);
        updateStats();
    }

    // Mostra se acertou e a resolução
    function showFeedback(isCorrect, bodyHTML) {
        feedbackEl.hidden = false;
        feedbackEl.classList.add(isCorrect ? "correct" : "wrong");
        feedbackEl.innerHTML = `
            <strong>${isCorrect ? "✓ Resposta correta!" : "✗ Não foi dessa vez."}</strong>
            ${bodyHTML}
        `;
        checkButton.hidden = true;
        hintButton.hidden = true;
        answered = true;
    }

    // Corrige a questão numérica aceitando uma margem de ±2%
    function checkAnswer() {
        if (answered || !question) return;

        if (question.kind === "numeric") {
            const input = document.getElementById("exercise-value");
            const value = parseNumber(input.value);

            if (Number.isNaN(value)) {
                input.classList.add("invalid");
                input.focus();
                return;
            }

            input.classList.remove("invalid");
            input.disabled = true;

            const tolerance = question.tolerance ?? 0.02;
            const isCorrect = Math.abs(value - question.answer) <= Math.abs(question.answer) * tolerance + 1e-9;

            register(isCorrect);
            showFeedback(isCorrect, `
                <p>Resposta esperada: <b>${fmt(question.answer, 3)} ${question.unit}</b> (tolerância de ±${Math.round(tolerance * 100)}%).</p>
                <ol class="exercise-solution">${question.solution.map(step => `<li>${step}</li>`).join("")}</ol>
            `);
        }
    }

    // Corrige a questão conceitual quando clica numa alternativa
    answerArea.addEventListener("click", event => {
        const option = event.target.closest("[data-option]");
        if (!option || answered || question.kind !== "choice") return;

        const chosen = Number(option.dataset.option);
        const isCorrect = chosen === question.correct;

        answerArea.querySelectorAll(".exercise-option").forEach((button, i) => {
            button.disabled = true;
            if (i === question.correct) button.classList.add("correct");
            if (i === chosen && !isCorrect) button.classList.add("wrong");
        });

        register(isCorrect);
        showFeedback(isCorrect, `<p>${escapeHTML(question.explanation)}</p>`);
    });

    checkButton.addEventListener("click", checkAnswer);
    nextButton.addEventListener("click", newQuestion);
    hintButton.addEventListener("click", () => {
        hintBox.hidden = !hintBox.hidden;
    });

    // Filtro por tema
    topicButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeTopic = button.dataset.topic;
            topicButtons.forEach(b => b.classList.toggle("active", b === button));
            newQuestion();
        });
    });

    // Zerar estatísticas (pede pra clicar duas vezes pra confirmar)
    resetStatsButton.addEventListener("click", () => {
        if (resetStatsButton.dataset.confirm !== "1") {
            resetStatsButton.dataset.confirm = "1";
            resetStatsButton.textContent = "Clique de novo para confirmar";
            setTimeout(() => {
                resetStatsButton.dataset.confirm = "";
                resetStatsButton.textContent = "↻ Zerar estatísticas";
            }, 3000);
            return;
        }
        resetStatsButton.dataset.confirm = "";
        resetStatsButton.textContent = "↻ Zerar estatísticas";
        stats = emptyStats();
        statsStore.save(stats);
        updateStats();
    });

    updateStats();
    newQuestion();
});
