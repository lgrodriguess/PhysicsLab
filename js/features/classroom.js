// Recursos de sala de aula e de estudo:
// - cenários prontos em cada simulador (um clique monta a situação)
// - guia de estudo (aluno) com dicas para o professor
// - modo projetor e tela cheia
document.addEventListener("DOMContentLoaded", () => {

    const { escapeHTML, storage } = window.PhysicsUtils;

    // ------------------------------------------------------------------
    // Conteúdo de cada simulador
    // values: { idDoCampo: valor } aplicados na ordem em que aparecem.
    // circuit: tipo de circuito (só no simulador de circuitos).
    // ------------------------------------------------------------------
    const GUIDES = {

        circuits: {
            title: "Circuitos elétricos",
            goals: [
                "Diferenciar associação em série, em paralelo e mista.",
                "Usar a Lei de Ohm (U = R · I) para achar tensão e corrente em cada resistor.",
                "Entender por que a resistência equivalente aumenta em série e diminui em paralelo."
            ],
            scenarios: [
                {
                    id: "series-equal", label: "Série: resistores iguais", circuit: "series",
                    values: { "circuit-voltage": 12, "resistance-1": 10, "resistance-2": 10 },
                    observe: "A corrente é a mesma nos dois resistores (0,6 A) e a tensão da bateria se divide igualmente: 6 V em cada."
                },
                {
                    id: "series-diff", label: "Série: resistores diferentes", circuit: "series",
                    values: { "circuit-voltage": 12, "resistance-1": 10, "resistance-2": 50 },
                    observe: "A corrente continua igual nos dois (0,2 A), mas o resistor maior fica com a maior tensão (10 V contra 2 V) e dissipa mais potência."
                },
                {
                    id: "parallel-equal", label: "Paralelo: resistores iguais", circuit: "parallel",
                    values: { "circuit-voltage": 12, "resistance-1": 20, "resistance-2": 20 },
                    observe: "Cada resistor recebe os 12 V da bateria. A resistência equivalente (10 Ω) é a metade de cada resistor."
                },
                {
                    id: "parallel-diff", label: "Paralelo: resistores diferentes", circuit: "parallel",
                    values: { "circuit-voltage": 12, "resistance-1": 10, "resistance-2": 60 },
                    observe: "A tensão é igual nos dois, mas passa mais corrente pelo resistor menor (1,2 A contra 0,2 A). A resistência equivalente é menor que o menor resistor."
                },
                {
                    id: "mixed", label: "Misto: R1 + (R2 // R3)", circuit: "mixed",
                    values: { "circuit-voltage": 12, "resistance-1": 10, "resistance-2": 20, "resistance-3": 20 },
                    observe: "R2 e R3 em paralelo equivalem a 10 Ω, somados a R1 dão 20 Ω. Toda a corrente (0,6 A) passa por R1 e depois se divide igualmente: 0,3 A em R2 e 0,3 A em R3."
                },
                {
                    id: "double-voltage", label: "Dobrar a tensão", circuit: "series",
                    values: { "circuit-voltage": 24, "resistance-1": 10, "resistance-2": 10 },
                    observe: "Compare com \"Série: resistores iguais\": a corrente dobrou (1,2 A), mas a potência ficou 4 vezes maior (28,8 W), porque P = R · I²."
                }
            ],
            questions: [
                {
                    q: "Num circuito em série, se um dos resistores queimar (abrir), o que acontece com os outros?",
                    a: "A corrente para em todo o circuito, porque só existe um caminho. É por isso que, em pisca-piscas antigos ligados em série, uma lâmpada queimada apagava todas."
                },
                {
                    q: "Por que as tomadas de uma casa são ligadas em paralelo?",
                    a: "Em paralelo, cada aparelho recebe a mesma tensão da rede e funciona de forma independente: ligar ou desligar um não afeta os outros."
                },
                {
                    q: "Ao acrescentar mais um resistor em paralelo, a resistência equivalente aumenta ou diminui? E a corrente total?",
                    a: "A resistência equivalente diminui, porque surge mais um caminho para a corrente. Com isso, a corrente total fornecida pela bateria aumenta."
                },
                {
                    q: "Em série, com R1 menor que R2, qual resistor dissipa mais potência?",
                    a: "R2. A corrente é a mesma nos dois, e pela relação P = R · I², quem tem mais resistência dissipa mais potência."
                }
            ],
            mistakes: [
                "Achar que a corrente \"se gasta\" ao passar pelos resistores. Em série, a corrente é a mesma em todos os pontos; o que se divide é a tensão.",
                "Somar as resistências em paralelo. Em paralelo, somam-se os inversos: 1/Req = 1/R1 + 1/R2.",
                "Pensar que em paralelo a tensão se divide. Em paralelo, todos os ramos têm a mesma tensão; o que se divide é a corrente."
            ],
            teacher: [
                "Antes de aplicar cada cenário, peça para a turma prever o que vai acontecer (Prever → Observar → Explicar).",
                "Use \"Série: resistores iguais\" e depois \"Dobrar a tensão\" para mostrar que a potência não cresce na mesma proporção da corrente.",
                "Peça que os alunos confiram a tabela de resistores com a Lei de Ohm, calculando uma linha à mão."
            ]
        },

        magnetism: {
            title: "Magnetismo",
            goals: [
                "Entender que a força magnética só existe para cargas em movimento.",
                "Aplicar a regra da mão direita para achar o sentido da força.",
                "Relacionar o ângulo entre v e B com o tipo de movimento: reto, circular ou helicoidal."
            ],
            scenarios: [
                {
                    id: "positive-in", label: "Carga positiva, B entrando",
                    values: { "mag-charge": 0.000005, "mag-velocity": 20, "mag-mass": 0.000001, "mag-field": 0.5, "mag-angle": 90, "mag-field-dir": "in" },
                    observe: "A força (vermelha) aponta sempre para o centro e a velocidade (verde) é tangente: a carga faz um círculo no sentido anti-horário. Pause a animação e confira com a mão direita."
                },
                {
                    id: "negative-in", label: "Carga negativa",
                    values: { "mag-charge": -0.000005, "mag-velocity": 20, "mag-mass": 0.000001, "mag-field": 0.5, "mag-angle": 90, "mag-field-dir": "in" },
                    observe: "Só o sinal da carga mudou e o giro se inverteu (horário). Para carga negativa, a força sai das costas da mão."
                },
                {
                    id: "positive-out", label: "Inverter o campo (B saindo)",
                    values: { "mag-charge": 0.000005, "mag-velocity": 20, "mag-mass": 0.000001, "mag-field": 0.5, "mag-angle": 90, "mag-field-dir": "out" },
                    observe: "Inverter o campo também inverte o giro. Trocar o sinal da carga E o sentido do campo ao mesmo tempo faria o giro voltar ao original."
                },
                {
                    id: "parallel", label: "v paralela a B (0°)",
                    values: { "mag-charge": 0.000005, "mag-velocity": 20, "mag-mass": 0.000001, "mag-field": 0.5, "mag-angle": 0, "mag-field-dir": "in" },
                    observe: "Com v paralela a B, sen(0°) = 0 e a força é nula: a partícula segue em linha reta, como se não houvesse campo."
                },
                {
                    id: "helix", label: "Movimento helicoidal (60°)",
                    values: { "mag-charge": 0.000005, "mag-velocity": 20, "mag-mass": 0.000001, "mag-field": 0.5, "mag-angle": 60, "mag-field-dir": "in" },
                    observe: "A parte da velocidade perpendicular a B faz a carga girar e a parte paralela a faz avançar: o resultado é uma hélice (uma \"mola\")."
                },
                {
                    id: "strong-field", label: "Campo 4× mais forte",
                    values: { "mag-charge": 0.000005, "mag-velocity": 20, "mag-mass": 0.000001, "mag-field": 2, "mag-angle": 90, "mag-field-dir": "in" },
                    observe: "Compare o raio com o do primeiro cenário: o campo ficou 4 vezes maior e o raio ficou 4 vezes menor (de 8 m para 2 m), pois r = m · v / (|q| · B)."
                }
            ],
            questions: [
                {
                    q: "A força magnética muda a rapidez (o módulo da velocidade) da partícula?",
                    a: "Não. A força é sempre perpendicular à velocidade, então não realiza trabalho: ela só muda a direção do movimento, e a rapidez continua constante."
                },
                {
                    q: "Se a velocidade da partícula dobrar, o que acontece com o raio da trajetória?",
                    a: "O raio também dobra, porque r = m · v / (|q| · B) é diretamente proporcional à velocidade."
                },
                {
                    q: "Uma carga parada dentro de um campo magnético sente força magnética?",
                    a: "Não. Com v = 0, F = |q| · v · B · sen(θ) = 0. O campo magnético só age sobre cargas em movimento."
                },
                {
                    q: "Por que, no movimento circular, a força aponta sempre para o centro?",
                    a: "Porque ela é a resultante centrípeta: é ela que curva a trajetória continuamente, mantendo a partícula no círculo."
                }
            ],
            mistakes: [
                "Achar que a força magnética aponta na direção do campo. Ela é perpendicular tanto a v quanto a B.",
                "Esquecer de inverter o sentido para cargas negativas. Com q < 0, a força sai das costas da mão direita.",
                "Confundir a velocidade com a palma: o polegar é a velocidade, os dedos são o campo e a palma é a força."
            ],
            teacher: [
                "Use o botão Pausar para congelar a partícula e aplicar a regra da mão direita junto com a turma, com a mão levantada.",
                "A câmera lenta (0,25×) ajuda a mostrar que a força acompanha a partícula e continua apontando para o centro.",
                "Sequência sugerida: \"Carga positiva\" → \"Carga negativa\" → \"Inverter o campo\", perguntando antes qual será o sentido do giro."
            ]
        },

        induction: {
            title: "Indução eletromagnética",
            goals: [
                "Entender que é a VARIAÇÃO do fluxo magnético que gera força eletromotriz (FEM).",
                "Identificar as três formas de variar o fluxo: mudar B, mudar a área ou mudar o ângulo.",
                "Usar a Lei de Lenz para achar o sentido da corrente induzida."
            ],
            scenarios: [
                {
                    id: "increase", label: "Ímã se aproximando (B aumenta)",
                    values: { "induction-field-initial": 0.2, "induction-field-final": 1, "induction-area": 0.01, "induction-turns": 10, "induction-time": 1, "induction-angle-initial": 0, "induction-angle-final": 0 },
                    observe: "O fluxo aumentou, então o campo induzido (roxo) aponta contra o campo externo, tentando impedir esse aumento. FEM = −0,08 V."
                },
                {
                    id: "decrease", label: "Ímã se afastando (B diminui)",
                    values: { "induction-field-initial": 1, "induction-field-final": 0.2, "induction-area": 0.01, "induction-turns": 10, "induction-time": 1, "induction-angle-initial": 0, "induction-angle-final": 0 },
                    observe: "Agora o fluxo diminuiu: a FEM troca de sinal (+0,08 V), a corrente inverte e o campo induzido passa a reforçar o campo externo."
                },
                {
                    id: "constant", label: "Campo constante",
                    values: { "induction-field-initial": 0.5, "induction-field-final": 0.5, "induction-area": 0.01, "induction-turns": 10, "induction-time": 1, "induction-angle-initial": 0, "induction-angle-final": 0 },
                    observe: "Mesmo com campo forte, sem variação de fluxo não há FEM nem corrente. Um ímã parado perto da espira não gera nada."
                },
                {
                    id: "rotate", label: "Espira girando (0° → 90°)",
                    values: { "induction-field-initial": 0.5, "induction-field-final": 0.5, "induction-area": 0.01, "induction-turns": 10, "induction-time": 1, "induction-angle-initial": 0, "induction-angle-final": 90 },
                    observe: "O campo não mudou, mas a espira girou: em 90° as linhas de campo passam paralelas a ela e o fluxo vai a zero. É assim que funciona um gerador."
                },
                {
                    id: "more-turns", label: "10× mais espiras",
                    values: { "induction-field-initial": 0.2, "induction-field-final": 1, "induction-area": 0.01, "induction-turns": 100, "induction-time": 1, "induction-angle-initial": 0, "induction-angle-final": 0 },
                    observe: "Compare com \"Ímã se aproximando\": com 100 espiras em vez de 10, a FEM fica 10 vezes maior (−0,8 V)."
                },
                {
                    id: "faster", label: "Variação 10× mais rápida",
                    values: { "induction-field-initial": 0.2, "induction-field-final": 1, "induction-area": 0.01, "induction-turns": 10, "induction-time": 0.1, "induction-angle-initial": 0, "induction-angle-final": 0 },
                    observe: "A mesma variação de fluxo em 0,1 s em vez de 1 s: a FEM fica 10 vezes maior. Quanto mais rápida a variação, maior a tensão induzida."
                }
            ],
            questions: [
                {
                    q: "Um ímã muito forte parado dentro de uma bobina gera corrente?",
                    a: "Não. Pela Lei de Faraday, só há FEM quando o fluxo varia. Ímã parado significa fluxo constante, então ε = 0."
                },
                {
                    q: "O que significa o sinal negativo em ε = −N · ΔΦ / Δt?",
                    a: "É a Lei de Lenz: a corrente induzida cria um campo que se opõe à variação do fluxo que a produziu."
                },
                {
                    q: "Cite três maneiras de aumentar a FEM de um gerador.",
                    a: "Usar mais espiras (N), um campo mais forte (B), uma espira de área maior (A) ou girar mais rápido (Δt menor)."
                },
                {
                    q: "Por que o fluxo é zero quando o ângulo entre B e a normal da espira é 90°?",
                    a: "Porque cos(90°) = 0: as linhas de campo passam paralelas ao plano da espira e nenhuma a atravessa."
                }
            ],
            mistakes: [
                "Achar que campo forte gera corrente. O que importa é a variação do fluxo, não o valor do campo.",
                "Pensar que o campo induzido é sempre oposto ao campo externo. Ele é oposto à VARIAÇÃO: se o fluxo diminui, o campo induzido reforça o externo.",
                "Medir o ângulo entre B e o plano da espira. No fluxo Φ = B · A · cos(θ), θ é o ângulo entre B e a normal (perpendicular) da espira."
            ],
            teacher: [
                "Faça os cenários \"aproximando\" e \"afastando\" em sequência e peça que a turma explique por que a corrente inverteu.",
                "O cenário \"Campo constante\" é ótimo para desfazer a ideia de que campo forte sozinho gera corrente.",
                "\"Espira girando\" faz a ponte com geradores de usinas, assunto que estará no próximo módulo."
            ]
        },

        electrostatics: {
            title: "Eletrostática",
            goals: [
                "Ler linhas de campo: saem das cargas positivas e chegam às negativas.",
                "Somar campos como vetores (superposição) e potenciais como números (soma algébrica).",
                "Entender que campo nulo não significa potencial nulo, e vice-versa."
            ],
            scenarios: [
                {
                    id: "dipole", label: "Dipolo elétrico",
                    values: { "es-q1": 0.000000005, "es-q2": -0.000000005, "es-d": 0.4, "es-px": 0.2, "es-py": 0.15 },
                    observe: "As linhas saem da carga positiva e chegam à negativa. Arraste o ponto P e veja o vetor campo mudar de direção, sempre tangente às linhas."
                },
                {
                    id: "dipole-mid", label: "Ponto médio do dipolo",
                    values: { "es-q1": 0.000000005, "es-q2": -0.000000005, "es-d": 0.4, "es-px": 0.2, "es-py": 0 },
                    observe: "No meio do dipolo o potencial é zero (os dois termos se cancelam), mas o campo NÃO é zero: os dois campos apontam para o mesmo lado, da positiva para a negativa."
                },
                {
                    id: "equal-mid", label: "Cargas iguais: ponto médio",
                    values: { "es-q1": 0.000000005, "es-q2": 0.000000005, "es-d": 0.4, "es-px": 0.2, "es-py": 0 },
                    observe: "Com duas cargas iguais, os campos se cancelam no ponto médio (E = 0), mas o potencial NÃO é zero: ele é a soma de dois valores positivos."
                },
                {
                    id: "strong-q1", label: "Uma carga 4× maior",
                    values: { "es-q1": 0.00000002, "es-q2": -0.000000005, "es-d": 0.4, "es-px": 0.2, "es-py": 0.15 },
                    observe: "Saem muito mais linhas de q1 do que chegam em q2: parte das linhas de q1 vai para longe. O número de linhas é proporcional ao valor da carga."
                },
                {
                    id: "far", label: "Ponto P longe das cargas",
                    values: { "es-q1": 0.000000005, "es-q2": -0.000000005, "es-d": 0.4, "es-px": 1, "es-py": 0.3 },
                    observe: "Longe do dipolo os campos das duas cargas quase se cancelam e o campo resultante fica bem fraco."
                }
            ],
            questions: [
                {
                    q: "Se o campo elétrico é zero em um ponto, o potencial também é zero?",
                    a: "Não necessariamente. No cenário \"Cargas iguais: ponto médio\", E = 0 mas V ≠ 0. O campo é um vetor (pode se cancelar) e o potencial é um número (soma algébrica)."
                },
                {
                    q: "Por que duas linhas de campo nunca se cruzam?",
                    a: "Porque em cada ponto o campo elétrico tem uma única direção. Se duas linhas se cruzassem, o campo teria duas direções no mesmo ponto."
                },
                {
                    q: "Qual é o ângulo entre uma linha de campo e uma superfície equipotencial?",
                    a: "90°. As linhas de campo são sempre perpendiculares às equipotenciais. Confira na figura: a curva tracejada cruza as linhas em ângulo reto."
                },
                {
                    q: "Se a carga de prova em P fosse negativa, para onde apontaria a força?",
                    a: "Para o lado oposto ao campo elétrico, porque F = q0 · E e q0 seria negativa."
                }
            ],
            mistakes: [
                "Somar os módulos dos campos sem levar em conta a direção. Campo é vetor: some as componentes x e y.",
                "Esquecer o sinal da carga no potencial. Em V = k · q / r, uma carga negativa dá potencial negativo.",
                "Achar que as linhas de campo são o caminho que uma carga sempre percorre. Elas mostram a direção da força em cada ponto, não a trajetória."
            ],
            teacher: [
                "Os cenários \"Ponto médio do dipolo\" e \"Cargas iguais: ponto médio\" juntos são um ótimo par para discutir a diferença entre E (vetor) e V (escalar).",
                "Peça para um aluno arrastar o ponto P no projetor enquanto a turma diz para onde o vetor vai apontar.",
                "Use \"Uma carga 4× maior\" para mostrar que a densidade de linhas indica a intensidade do campo."
            ]
        },

        capacitors: {
            title: "Capacitores",
            goals: [
                "Entender que a capacitância depende só da geometria (área e distância) e do dielétrico.",
                "Comparar o efeito do dielétrico com a bateria ligada e com a bateria desligada.",
                "Calcular capacitores em série e em paralelo."
            ],
            scenarios: [
                {
                    id: "air", label: "Capacitor com ar",
                    values: { "cap-area": 0.01, "cap-dist": 0.002, "cap-material": "1", "cap-voltage": 12, "cap-mode": "connected" },
                    observe: "Este é o ponto de partida: anote a capacitância, a carga e a energia para comparar com os próximos cenários."
                },
                {
                    id: "glass-connected", label: "Vidro com bateria ligada",
                    values: { "cap-area": 0.01, "cap-dist": 0.002, "cap-material": "5", "cap-voltage": 12, "cap-mode": "connected" },
                    observe: "Com a bateria ligada, a tensão fica fixa em 12 V. A capacitância fica 5 vezes maior e a bateria fornece mais carga: Q e a energia também ficam 5 vezes maiores."
                },
                {
                    id: "glass-disconnected", label: "Vidro com bateria desligada",
                    values: { "cap-area": 0.01, "cap-dist": 0.002, "cap-material": "5", "cap-voltage": 12, "cap-mode": "disconnected" },
                    observe: "Com a bateria desligada, a carga não tem para onde ir e fica constante. A capacitância fica 5 vezes maior, então a tensão, o campo e a energia ficam 5 vezes menores."
                },
                {
                    id: "closer", label: "Aproximar as placas",
                    values: { "cap-area": 0.01, "cap-dist": 0.0005, "cap-material": "1", "cap-voltage": 12, "cap-mode": "connected" },
                    observe: "Com as placas 4 vezes mais próximas, a capacitância fica 4 vezes maior, porque C = ε0 · A / d."
                },
                {
                    id: "bigger", label: "Placas 4× maiores",
                    values: { "cap-area": 0.04, "cap-dist": 0.002, "cap-material": "1", "cap-voltage": 12, "cap-mode": "connected" },
                    observe: "Com área 4 vezes maior, a capacitância também fica 4 vezes maior: cabe mais carga nas placas para a mesma tensão."
                },
                {
                    id: "assoc", label: "Associação do exemplo de aula",
                    values: { "cap-c1": 0.000006, "cap-c2": 0.000003, "cap-assoc-v": 18 },
                    observe: "Em série, a carga é a mesma nos dois e o capacitor MENOR fica com a maior tensão (12 V contra 6 V). Em paralelo, a tensão é a mesma e as capacitâncias se somam (9 µF)."
                }
            ],
            questions: [
                {
                    q: "Se dobrarmos a tensão da bateria, a capacitância muda?",
                    a: "Não. A capacitância depende só da área, da distância e do dielétrico. Dobrar a tensão dobra a carga, mas a razão C = Q / U fica igual."
                },
                {
                    q: "Em dois capacitores em série, qual fica com a maior tensão?",
                    a: "O de menor capacitância. Em série a carga é a mesma, e como U = Q / C, quem tem C menor fica com U maior."
                },
                {
                    q: "Com a bateria desligada, a energia diminui ao inserir o dielétrico. Para onde vai essa energia?",
                    a: "O campo entre as placas puxa o dielétrico para dentro e realiza trabalho sobre ele. A energia que \"sumiu\" do capacitor virou esse trabalho."
                },
                {
                    q: "Por que o dielétrico aumenta a capacitância?",
                    a: "As moléculas do dielétrico se polarizam e criam um campo contrário, que reduz o campo entre as placas. Para a mesma carga, a tensão fica menor, e C = Q / U fica maior."
                }
            ],
            mistakes: [
                "Achar que a capacitância depende da carga ou da tensão. Ela é uma propriedade do capacitor (geometria e dielétrico).",
                "Trocar as regras de associação: capacitores em PARALELO se somam diretamente, ao contrário dos resistores.",
                "Esquecer de verificar se a bateria está ligada ou desligada antes de analisar o efeito do dielétrico."
            ],
            teacher: [
                "Faça \"Vidro com bateria ligada\" e \"Vidro com bateria desligada\" em sequência: é a dúvida mais comum em provas sobre dielétricos.",
                "Peça que a turma monte uma tabela com C, Q, U e energia em cada cenário e descubra o padrão.",
                "Compare as regras de associação de capacitores com as de resistores, que os alunos já viram no módulo de circuitos."
            ]
        }
    };

    window.PhysicsLabGuides = GUIDES;

    // ------------------------------------------------------------------
    // Aplicar um cenário: escreve nos campos e avisa o simulador
    // (dispara os mesmos eventos que o usuário dispararia)
    // ------------------------------------------------------------------
    function applyScenario(pageId, scenario) {
        if (scenario.circuit) {
            const button = document.querySelector(`.circuit-type[data-circuit="${scenario.circuit}"]`);
            if (button) button.click();
        }

        for (const [id, value] of Object.entries(scenario.values)) {
            const field = document.getElementById(id);
            if (!field) continue;
            field.value = value;
            const eventName = field.tagName === "SELECT" ? "change" : "input";
            field.dispatchEvent(new Event(eventName, { bubbles: true }));
        }

        // Marca o cenário ativo e mostra o que observar
        const bar = document.querySelector(`.learn-bar[data-page="${pageId}"]`);
        if (bar) {
            bar.querySelectorAll(".scenario-chip").forEach(chip => {
                const active = chip.dataset.scenario === scenario.id;
                chip.classList.toggle("active", active);
                if (active) chip.title = "Clique de novo para voltar aos valores padrão";
                else chip.removeAttribute("title");
            });
            const observe = bar.querySelector(".scenario-observe");
            observe.innerHTML = `<strong>O que observar:</strong> ${escapeHTML(scenario.observe)}`;
            observe.hidden = false;
        }
    }

    // Volta o simulador aos valores iniciais usando o próprio botão "Restaurar" dele
    const RESET_BUTTONS = {
        circuits: "reset-circuit",
        magnetism: "mag-reset",
        induction: "induction-reset",
        electrostatics: "es-reset",
        capacitors: "cap-reset"
    };

    function resetToDefaults(pageId) {
        // O circuito padrão é em série (o "Restaurar" dele não muda o tipo)
        if (pageId === "circuits") {
            const series = document.querySelector('.circuit-type[data-circuit="series"]');
            if (series) series.click();
        }

        // O clique no "Restaurar" também desmarca o cenário (ver listener abaixo)
        const resetButton = document.getElementById(RESET_BUTTONS[pageId]);
        if (resetButton) resetButton.click();
    }

    // Se o usuário mexer em algum parâmetro, o cenário deixa de valer
    function clearActiveScenario(pageId) {
        const bar = document.querySelector(`.learn-bar[data-page="${pageId}"]`);
        if (!bar) return;
        bar.querySelectorAll(".scenario-chip.active").forEach(chip => {
            chip.classList.remove("active");
            chip.removeAttribute("title");
        });
    }

    // ------------------------------------------------------------------
    // Barra de cenários no topo de cada simulador
    // ------------------------------------------------------------------
    for (const [pageId, guide] of Object.entries(GUIDES)) {
        const page = document.getElementById(pageId);
        const heading = page && page.querySelector(".page-heading");
        if (!heading) continue;

        const bar = document.createElement("div");
        bar.className = "learn-bar";
        bar.dataset.page = pageId;
        bar.innerHTML = `
            <div class="learn-bar-head">
                <div>
                    <span class="eyebrow">CENÁRIOS PRONTOS</span>
                    <p>Escolha uma situação para montar a simulação com um clique.</p>
                </div>
                <button class="guide-button" type="button" data-guide="${pageId}">
                    <span aria-hidden="true">📘</span> Guia de estudo
                </button>
            </div>
            <div class="scenario-chips">
                ${guide.scenarios.map((s, i) => `
                    <button class="scenario-chip" type="button" data-scenario="${s.id}">
                        <span class="scenario-number">${i + 1}</span>${escapeHTML(s.label)}
                    </button>`).join("")}
            </div>
            <p class="scenario-observe" hidden></p>
        `;
        heading.after(bar);

        bar.addEventListener("click", event => {
            const chip = event.target.closest(".scenario-chip");
            if (!chip) return;

            // Clicar de novo no cenário que já está ativo volta aos valores padrão
            if (chip.classList.contains("active")) {
                resetToDefaults(pageId);
                return;
            }

            const scenario = guide.scenarios.find(s => s.id === chip.dataset.scenario);
            if (scenario) applyScenario(pageId, scenario);
        });

        // "Restaurar valores" desmarca o cenário e esconde o "O que observar"
        const resetButton = document.getElementById(RESET_BUTTONS[pageId]);
        if (resetButton) {
            resetButton.addEventListener("click", () => {
                clearActiveScenario(pageId);
                bar.querySelector(".scenario-observe").hidden = true;
            });
        }

        // Mudança feita à mão pelo usuário (evento "confiável") limpa o cenário ativo
        page.addEventListener("input", event => {
            if (event.isTrusted && !bar.contains(event.target)) clearActiveScenario(pageId);
        });
        page.addEventListener("change", event => {
            if (event.isTrusted && !bar.contains(event.target)) clearActiveScenario(pageId);
        });
    }

    // ------------------------------------------------------------------
    // Guia de estudo (painel lateral)
    // ------------------------------------------------------------------
    const overlay = document.createElement("div");
    overlay.className = "guide-overlay";
    overlay.hidden = true;

    const drawer = document.createElement("aside");
    drawer.className = "guide-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-labelledby", "guide-title");
    drawer.hidden = true;

    document.body.append(overlay, drawer);

    let openPage = null;
    let lastFocus = null;

    const list = items => `<ul>${items.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;

    function renderGuide(pageId) {
        const guide = GUIDES[pageId];
        drawer.innerHTML = `
            <header class="guide-header">
                <div>
                    <span class="eyebrow">GUIA DE ESTUDO</span>
                    <h2 id="guide-title">${escapeHTML(guide.title)}</h2>
                </div>
                <button class="guide-close" type="button" aria-label="Fechar guia">✕</button>
            </header>

            <div class="guide-body">
                <section class="guide-section">
                    <h3>🎯 O que você vai aprender</h3>
                    ${list(guide.goals)}
                </section>

                <section class="guide-section">
                    <h3>🧪 Explore passo a passo</h3>
                    <p class="guide-hint">Antes de cada passo, tente <strong>prever</strong> o que vai acontecer. Depois <strong>observe</strong> e tente <strong>explicar</strong>.</p>
                    <ol class="guide-steps">
                        ${guide.scenarios.map(s => `
                            <li>
                                <div>
                                    <strong>${escapeHTML(s.label)}</strong>
                                    <p>${escapeHTML(s.observe)}</p>
                                </div>
                                <button class="guide-apply" type="button" data-scenario="${s.id}">Aplicar</button>
                            </li>`).join("")}
                    </ol>
                </section>

                <section class="guide-section">
                    <h3>💬 Pense e responda</h3>
                    <div class="guide-questions">
                        ${guide.questions.map(item => `
                            <details class="guide-question">
                                <summary>${escapeHTML(item.q)}</summary>
                                <p>${escapeHTML(item.a)}</p>
                            </details>`).join("")}
                    </div>
                </section>

                <section class="guide-section">
                    <h3>⚠️ Erros comuns</h3>
                    ${list(guide.mistakes)}
                </section>

                <details class="guide-section guide-teacher">
                    <summary><h3>👩‍🏫 Dicas para o professor</h3></summary>
                    ${list(guide.teacher)}
                </details>
            </div>
        `;
    }

    function openGuide(pageId) {
        if (!GUIDES[pageId]) return;
        lastFocus = document.activeElement;
        openPage = pageId;
        renderGuide(pageId);
        overlay.hidden = false;
        drawer.hidden = false;
        document.body.classList.add("guide-open");
        drawer.querySelector(".guide-close").focus();
    }

    function closeGuide() {
        if (drawer.hidden) return;
        overlay.hidden = true;
        drawer.hidden = true;
        document.body.classList.remove("guide-open");
        openPage = null;
        if (lastFocus) lastFocus.focus();
    }

    document.addEventListener("click", event => {
        const opener = event.target.closest("[data-guide]");
        if (opener) openGuide(opener.dataset.guide);
    });

    overlay.addEventListener("click", closeGuide);

    drawer.addEventListener("click", event => {
        if (event.target.closest(".guide-close")) {
            closeGuide();
            return;
        }
        const apply = event.target.closest(".guide-apply");
        if (apply && openPage) {
            const pageId = openPage;
            const scenario = GUIDES[pageId].scenarios.find(s => s.id === apply.dataset.scenario);
            closeGuide();
            if (scenario) {
                applyScenario(pageId, scenario);
                const bar = document.querySelector(`.learn-bar[data-page="${pageId}"]`);
                if (bar) bar.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeGuide();
    });

    // Trocar de página fecha o guia
    window.addEventListener("popstate", closeGuide);
    document.addEventListener("click", event => {
        if (event.target.closest(".nav-item[data-page]")) closeGuide();
    });

    // ------------------------------------------------------------------
    // Modo projetor e tela cheia
    // ------------------------------------------------------------------
    const projectorPref = storage("physicslab.projector", false);
    const projectorButton = document.getElementById("projector-toggle");
    const fullscreenButton = document.getElementById("fullscreen-toggle");

    function setProjector(on) {
        document.body.classList.toggle("projector", on);
        if (projectorButton) {
            projectorButton.setAttribute("aria-pressed", String(on));
            projectorButton.classList.toggle("active", on);
        }
        projectorPref.save(on);
    }

    if (projectorButton) {
        projectorButton.addEventListener("click", () => {
            setProjector(!document.body.classList.contains("projector"));
        });
    }
    setProjector(projectorPref.load() === true);

    const canFullscreen = document.fullscreenEnabled && document.documentElement.requestFullscreen;

    if (fullscreenButton) {
        if (!canFullscreen) {
            fullscreenButton.hidden = true;
        } else {
            fullscreenButton.addEventListener("click", () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen().catch(() => {});
                }
            });
            document.addEventListener("fullscreenchange", () => {
                const on = Boolean(document.fullscreenElement);
                fullscreenButton.setAttribute("aria-pressed", String(on));
                fullscreenButton.classList.toggle("active", on);
                fullscreenButton.querySelector(".tool-label").textContent = on ? "Sair da tela cheia" : "Tela cheia";
            });
        }
    }
});
