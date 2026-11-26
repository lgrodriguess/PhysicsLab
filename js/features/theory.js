document.addEventListener("DOMContentLoaded", () => {

    // Referencial teórico: lista de conceitos com busca e filtro
    const list = document.getElementById("theory-list");
    if (!list) return;

    const { escapeHTML } = window.PhysicsUtils;

    const searchInput = document.getElementById("theory-search");
    const filterButtons = document.querySelectorAll(".theory-filter");
    const emptyState = document.getElementById("theory-empty");
    const counter = document.getElementById("theory-count");

    // Nome, cor e página do simulador de cada área
    const areas = {
        electrostatics: { label: "Eletrostática", color: "green", page: "electrostatics" },
        capacitors: { label: "Capacitores", color: "teal", page: "capacitors" },
        circuits: { label: "Circuitos", color: "blue", page: "circuits" },
        magnetism: { label: "Magnetismo", color: "purple", page: "magnetism" },
        induction: { label: "Indução", color: "orange", page: "induction" }
    };

    // Conteúdo teórico: resumo, fórmulas e uma dica de cada assunto
    const topics = [
        {
            area: "electrostatics",
            title: "Lei de Coulomb",
            summary: "Duas cargas puntiformes se atraem (sinais opostos) ou se repelem (sinais iguais) com uma força que cresce com o produto das cargas e diminui com o quadrado da distância. A constante k vale cerca de 9 × 10^9 N·m²/C² no vácuo.",
            formulas: [
                { expr: "F = k · |q1 · q2| / r²", vars: "F: força (N) · q1, q2: cargas (C) · r: distância (m)" },
                { expr: "k = 1 / (4π · ε0)", vars: "ε0 = 8,85 × 10^-12 C²/(N·m²): permissividade do vácuo" }
            ],
            tip: "Dobrar a distância entre as cargas reduz a força a um quarto. Essa lei do inverso do quadrado se repete no campo, no fluxo e no potencial."
        },
        {
            area: "electrostatics",
            title: "Campo elétrico de cargas puntiformes",
            summary: "O campo elétrico é a força por unidade de carga de prova positiva em cada ponto do espaço. Ele aponta para fora de cargas positivas e para dentro de cargas negativas. Com várias cargas, soma-se o campo de cada uma como vetores (princípio da superposição).",
            formulas: [
                { expr: "E = F / q0", vars: "Definição: força sobre a carga de prova q0" },
                { expr: "E = k · |Q| / r²", vars: "Módulo do campo de uma carga puntiforme Q a uma distância r" },
                { expr: "E⃗ = E⃗1 + E⃗2 + … + E⃗n", vars: "Superposição: soma vetorial, não soma dos módulos" }
            ],
            tip: "No ponto médio entre duas cargas de sinais opostos, os campos têm o mesmo sentido e somam. Entre cargas de mesmo sinal e módulo, eles se anulam."
        },
        {
            area: "electrostatics",
            title: "Carga em campo elétrico uniforme",
            summary: "Uma partícula carregada em um campo uniforme sofre uma força constante. Com massa m, ela ganha aceleração constante e o movimento é uniformemente variado. Em carga positiva, a força tem o sentido do campo; em carga negativa, o oposto.",
            formulas: [
                { expr: "F = |q| · E", vars: "Força sobre a carga q em um campo E" },
                { expr: "a = |q| · E / m", vars: "Aceleração da partícula de massa m" },
                { expr: "v = v0 + a · t", vars: "Velocidade após um tempo t" }
            ],
            tip: "Para prótons e elétrons, o peso é desprezível diante da força elétrica, então costuma-se ignorar a gravidade."
        },
        {
            area: "electrostatics",
            title: "Fluxo elétrico",
            summary: "O fluxo elétrico mede quanto campo atravessa uma superfície, como um fluido que escoa por ela. Depende do campo, da área e do ângulo entre o campo e a normal da superfície. Em superfícies fechadas, a normal aponta sempre para fora.",
            formulas: [
                { expr: "Φ = E · A · cos(θ)", vars: "Campo uniforme · A: área (m²) · θ: ângulo entre E e a normal" },
                { expr: "Φ = ∫ E⃗ · dA⃗", vars: "Campo não uniforme: soma sobre pequenos elementos de área" }
            ],
            tip: "Unidade: N·m²/C. Cargas fora da superfície fechada não geram fluxo líquido: o que entra por um lado sai pelo outro."
        },
        {
            area: "electrostatics",
            title: "Lei de Gauss",
            summary: "O fluxo elétrico total através de qualquer superfície fechada depende só da carga líquida no seu interior, dividida por ε0. Não importa a forma nem o tamanho da superfície. Por isso, ao dobrar o raio de uma esfera em torno de uma carga, o fluxo não muda.",
            formulas: [
                { expr: "Φ = ∮ E⃗ · dA⃗ = Qint / ε0", vars: "Qint: carga líquida dentro da superfície fechada (C)" }
            ],
            tip: "Fluxo positivo indica carga líquida positiva dentro; fluxo nulo indica carga líquida nula, como em um dipolo."
        },
        {
            area: "electrostatics",
            title: "Aplicações da Lei de Gauss",
            summary: "Quando a distribuição de cargas tem simetria (esférica, cilíndrica ou plana), escolhe-se uma superfície gaussiana na qual o campo é constante e o cálculo vira álgebra. Isso substitui integrais difíceis, como as do anel, do disco ou da linha de cargas.",
            formulas: [
                { expr: "E = k · Q / r²", vars: "Fora de uma esfera carregada: igual ao de uma carga puntiforme no centro" },
                { expr: "E = λ / (2π · ε0 · r)", vars: "Linha infinita · λ: carga por comprimento (C/m)" },
                { expr: "E = σ / (2 · ε0)", vars: "Plano infinito · σ: carga por área (C/m²), campo independente da distância" }
            ],
            tip: "A simetria é a ferramenta central: antes de aplicar Gauss, pergunte em que direção o campo pode apontar."
        },
        {
            area: "electrostatics",
            title: "Energia potencial e potencial elétrico",
            summary: "O potencial elétrico V é a energia potencial por unidade de carga. É uma grandeza escalar, então o potencial de várias cargas é a soma algébrica dos potenciais de cada uma. A força elétrica realiza trabalho quando a carga passa por pontos de potenciais diferentes, independentemente do caminho.",
            formulas: [
                { expr: "V = k · Q / r", vars: "Potencial de uma carga puntiforme (zero no infinito)" },
                { expr: "W(A→B) = q · (VA − VB)", vars: "Trabalho da força elétrica" },
                { expr: "U = q · V", vars: "Energia potencial de uma carga q em um ponto de potencial V" }
            ],
            tip: "Unidade: 1 V = 1 J/C. Perto de cargas positivas o potencial é alto; perto de negativas é baixo."
        },
        {
            area: "electrostatics",
            title: "Diferença de potencial e campo uniforme",
            summary: "Em um campo uniforme, a ddp entre dois pontos separados por uma distância d ao longo do campo é E · d. O campo aponta no sentido em que o potencial diminui. Superfícies equipotenciais são sempre perpendiculares às linhas de campo, e nenhum trabalho é feito ao deslocar uma carga sobre uma delas.",
            formulas: [
                { expr: "U = E · d", vars: "Campo uniforme · d: distância medida ao longo do campo" },
                { expr: "E = −dV/dr", vars: "O campo é o gradiente (negativo) do potencial" },
                { expr: "VA − VB = ∫ E⃗ · dl⃗", vars: "Integral de linha do campo entre A e B" }
            ],
            tip: "Em um condutor em equilíbrio, todo o volume e a superfície estão no mesmo potencial."
        },
        {
            area: "capacitors",
            title: "Capacitância e capacitor de placas paralelas",
            summary: "Um capacitor armazena cargas opostas em dois condutores. A capacitância mede quanta carga ele guarda por volt aplicado. Em placas paralelas, ela cresce com a área e diminui com a distância entre as placas.",
            formulas: [
                { expr: "C = Q / V", vars: "C: capacitância (F) · Q: carga de cada placa (C) · V: ddp (V)" },
                { expr: "C = ε0 · A / d", vars: "Placas paralelas no vácuo · A: área (m²) · d: distância (m)" }
            ],
            tip: "1 F é uma capacitância enorme; capacitores reais têm microfarads (µF), nanofarads (nF) ou picofarads (pF)."
        },
        {
            area: "capacitors",
            title: "Associação de capacitores",
            summary: "A associação de capacitores segue regras opostas às dos resistores. Em paralelo, a ddp é a mesma e as capacitâncias se somam. Em série, a carga é a mesma e a ddp se divide entre eles.",
            formulas: [
                { expr: "Ceq = C1 + C2 + … + Cn", vars: "Paralelo: mesma tensão em todos" },
                { expr: "1/Ceq = 1/C1 + 1/C2 + … + 1/Cn", vars: "Série: mesma carga em todos" },
                { expr: "Ceq = C1·C2 / (C1 + C2)", vars: "Atalho para dois capacitores em série" }
            ],
            tip: "Em série, a capacitância equivalente é menor que a menor das capacitâncias. Em paralelo, é maior que todas."
        },
        {
            area: "capacitors",
            title: "Energia armazenada em um capacitor",
            summary: "Carregar um capacitor exige trabalho, que fica armazenado como energia no campo elétrico entre as placas. A energia por unidade de volume depende apenas do campo, o que vale para qualquer região com campo elétrico.",
            formulas: [
                { expr: "U = Q² / (2C) = ½ · C · V² = ½ · Q · V", vars: "Três formas equivalentes da energia (J)" },
                { expr: "u = ½ · ε0 · E²", vars: "Densidade de energia do campo (J/m³)" }
            ],
            tip: "Dobrar a tensão em um capacitor quadruplica a energia armazenada."
        },
        {
            area: "capacitors",
            title: "Dielétricos",
            summary: "Um dielétrico é um isolante colocado entre as placas. Ele permite placas mais próximas sem contato, aumenta a capacitância e a tensão máxima suportada. Com o capacitor desligado da fonte (carga constante), inserir o dielétrico reduz a ddp pelo fator κ.",
            formulas: [
                { expr: "C = κ · C0", vars: "κ: constante dielétrica (κ ≥ 1) · C0: capacitância sem dielétrico" },
                { expr: "V = V0 / κ", vars: "Com carga constante" },
                { expr: "ε = κ · ε0", vars: "Permissividade do meio" }
            ],
            tip: "Com a bateria ligada, a tensão é mantida e a carga aumenta por κ. Com a bateria desligada, a carga é mantida e a tensão cai."
        },
        {
            area: "capacitors",
            title: "Capacitores esférico e cilíndrico",
            summary: "A geometria dos condutores define a capacitância. Em um capacitor esférico, duas cascas concêntricas de raios ra e rb; no cilíndrico, dois cilindros coaxiais de raios a e b e comprimento L.",
            formulas: [
                { expr: "C = 4π · ε0 · ra · rb / (rb − ra)", vars: "Esférico: ra raio interno, rb raio externo" },
                { expr: "C = 2π · ε0 · L / ln(b/a)", vars: "Cilíndrico: L comprimento, a raio interno, b raio externo" }
            ],
            tip: "Um cabo coaxial é um capacitor cilíndrico; por isso tem capacitância por metro de cabo."
        },
        {
            area: "circuits",
            title: "Corrente elétrica",
            summary: "Corrente é a quantidade de carga que atravessa uma seção do condutor por unidade de tempo. Por convenção, o sentido da corrente é o do movimento das cargas positivas, ou seja, do polo + para o polo − no circuito externo.",
            formulas: [
                { expr: "I = ΔQ / Δt", vars: "I: corrente (A) · ΔQ: carga (C) · Δt: tempo (s)" }
            ],
            tip: "1 A equivale a 1 coulomb por segundo, cerca de 6,24 × 10^18 elétrons por segundo."
        },
        {
            area: "circuits",
            title: "Lei de Ohm",
            summary: "Em condutores ôhmicos, a tensão aplicada é diretamente proporcional à corrente que os percorre. A constante de proporcionalidade é a resistência elétrica, que depende do material e da geometria do condutor.",
            formulas: [
                { expr: "U = R · I", vars: "U: tensão (V) · R: resistência (Ω) · I: corrente (A)" },
                { expr: "R = ρ · L / A", vars: "ρ: resistividade (Ω·m) · L: comprimento (m) · A: área da seção (m²)" }
            ],
            tip: "Dobrar o comprimento de um fio dobra sua resistência; dobrar a área da seção a reduz pela metade."
        },
        {
            area: "circuits",
            title: "Associação de resistores",
            summary: "Em série, todos os resistores são percorridos pela mesma corrente e a tensão se divide entre eles. Em paralelo, todos ficam submetidos à mesma tensão e a corrente se divide entre os ramos.",
            formulas: [
                { expr: "Req = R1 + R2 + … + Rn", vars: "Associação em série" },
                { expr: "1/Req = 1/R1 + 1/R2 + … + 1/Rn", vars: "Associação em paralelo" },
                { expr: "Req = R1·R2 / (R1 + R2)", vars: "Atalho para dois resistores em paralelo" }
            ],
            tip: "Em paralelo, a resistência equivalente é sempre menor que a menor das resistências."
        },
        {
            area: "circuits",
            title: "Potência e efeito Joule",
            summary: "A potência elétrica mede a taxa com que a energia é transferida. Em um resistor, essa energia é convertida em calor (efeito Joule).",
            formulas: [
                { expr: "P = U · I", vars: "P: potência (W)" },
                { expr: "P = R · I² = U² / R", vars: "Formas equivalentes usando a Lei de Ohm" },
                { expr: "E = P · Δt", vars: "E: energia (J) · Δt: tempo (s)" }
            ],
            tip: "1 kWh = 3,6 × 10^6 J, que é a unidade usada na conta de luz."
        },
        {
            area: "circuits",
            title: "Leis de Kirchhoff",
            summary: "A lei dos nós diz que a soma das correntes que chegam a um nó é igual à soma das que saem (conservação da carga). A lei das malhas diz que a soma das tensões ao percorrer uma malha fechada é zero (conservação da energia).",
            formulas: [
                { expr: "Σ I entrando = Σ I saindo", vars: "Lei dos nós" },
                { expr: "Σ U = 0", vars: "Lei das malhas" }
            ],
            tip: "Escolha um sentido para cada corrente; se o resultado der negativo, o sentido real é o oposto."
        },
        {
            area: "circuits",
            title: "Fonte real e resistência interna",
            summary: "Uma bateria real tem resistência interna r. Parte da tensão se perde dentro da própria fonte quando ela fornece corrente, então a tensão nos terminais fica menor que a FEM. Sem corrente, a tensão nos terminais é igual à FEM.",
            formulas: [
                { expr: "U = ε − r · I", vars: "U: tensão nos terminais · ε: FEM · r: resistência interna · I: corrente" },
                { expr: "I = ε / (R + r)", vars: "Corrente em um circuito simples com resistor externo R" }
            ],
            tip: "Quanto maior a corrente pedida, mais a tensão nos terminais cai. É por isso que uma bateria fraca não aguenta cargas pesadas."
        },
        {
            area: "circuits",
            title: "Instrumentos de medida elétrica",
            summary: "O amperímetro mede corrente e é ligado em série, por isso precisa ter resistência muito baixa. O voltímetro mede tensão e é ligado em paralelo ao elemento, por isso precisa ter resistência muito alta. O ohmímetro mede resistência com o componente fora do circuito.",
            formulas: [
                { expr: "Amperímetro em série", vars: "Resistência interna ideal: zero" },
                { expr: "Voltímetro em paralelo", vars: "Resistência interna ideal: infinita" }
            ],
            tip: "Ligar o amperímetro em paralelo equivale a um curto-circuito e pode queimá-lo."
        },
        {
            area: "circuits",
            title: "Circuito R-C",
            summary: "Ao carregar um capacitor por um resistor, a corrente começa alta e diminui exponencialmente, enquanto a tensão no capacitor sobe até a da fonte. A rapidez é medida pela constante de tempo τ = R · C.",
            formulas: [
                { expr: "τ = R · C", vars: "Constante de tempo (s)" },
                { expr: "q(t) = Q · (1 − e^(−t/τ))", vars: "Carga durante o carregamento" },
                { expr: "q(t) = Q0 · e^(−t/τ)", vars: "Carga durante a descarga" }
            ],
            tip: "Após um tempo τ, o capacitor atinge cerca de 63% da carga final; após 5τ, mais de 99%."
        },
        {
            area: "magnetism",
            title: "Campo magnético",
            summary: "O campo magnético B é produzido por ímãs e por cargas em movimento (correntes). Suas linhas saem do polo norte e entram no polo sul, sempre formando curvas fechadas: não existem monopolos magnéticos.",
            formulas: [
                { expr: "B = μ0 · I / (2π · d)", vars: "Fio retilíneo longo · d: distância ao fio (m)" },
                { expr: "B = μ0 · N · I / (2R)", vars: "Centro de uma espira circular de raio R" },
                { expr: "B = μ0 · (N / L) · I", vars: "Interior de um solenoide de comprimento L" }
            ],
            tip: "Regra da mão direita: o polegar aponta no sentido da corrente e os dedos curvados indicam o sentido das linhas de B."
        },
        {
            area: "magnetism",
            title: "Força magnética sobre cargas",
            summary: "Uma carga em movimento dentro de um campo magnético sofre uma força perpendicular tanto à velocidade quanto ao campo. Por isso a força magnética não realiza trabalho: altera a direção, mas não o módulo da velocidade.",
            formulas: [
                { expr: "F = |q| · v · B · sen(θ)", vars: "θ: ângulo entre v e B" },
                { expr: "F⃗ = q · (v⃗ × B⃗)", vars: "Forma vetorial (produto vetorial)" }
            ],
            tip: "Para θ = 0° ou 180° (v paralela a B), a força é nula e a partícula segue em linha reta."
        },
        {
            area: "magnetism",
            title: "Movimento circular em campo uniforme",
            summary: "Quando a velocidade é perpendicular a B, a força magnética atua como resultante centrípeta e a partícula descreve um movimento circular uniforme. Para ângulos intermediários, a trajetória é uma hélice.",
            formulas: [
                { expr: "r = m · v / (|q| · B)", vars: "r: raio da trajetória (m)" },
                { expr: "T = 2π · m / (|q| · B)", vars: "Período: não depende da velocidade" }
            ],
            tip: "Esse é o princípio do espectrômetro de massa e do cíclotron."
        },
        {
            area: "magnetism",
            title: "Força sobre um condutor",
            summary: "Um fio percorrido por corrente dentro de um campo magnético sofre força, pois a corrente é um conjunto de cargas em movimento. É o princípio de funcionamento dos motores elétricos.",
            formulas: [
                { expr: "F = B · I · L · sen(θ)", vars: "L: comprimento do fio no campo (m) · θ: ângulo entre o fio e B" },
                { expr: "F/L = μ0 · I1 · I2 / (2π · d)", vars: "Força entre dois fios paralelos" }
            ],
            tip: "Fios com correntes no mesmo sentido se atraem; com correntes em sentidos opostos, se repelem."
        },
        {
            area: "magnetism",
            title: "Fontes de campo magnético: carga em movimento e elemento de corrente",
            summary: "Cargas em movimento criam campo magnético. O campo de um pequeno trecho de fio com corrente (lei de Biot–Savart) é perpendicular ao plano formado pelo trecho e pelo ponto considerado. Somando todos os trechos, obtêm-se os campos do fio retilíneo e da espira.",
            formulas: [
                { expr: "B = μ0 · |q| · v · sen(θ) / (4π · r²)", vars: "Carga puntiforme q com velocidade v" },
                { expr: "dB = μ0 · I · dL · sen(θ) / (4π · r²)", vars: "Elemento de corrente I·dL (Biot–Savart)" }
            ],
            tip: "Use a regra da mão direita para o sentido: o polegar segue a corrente e os dedos mostram como o campo circula em torno do fio."
        },
        {
            area: "magnetism",
            title: "Lei de Gauss para o magnetismo",
            summary: "O fluxo magnético total através de qualquer superfície fechada é sempre zero, pois não existem monopolos magnéticos: as linhas de campo são fechadas e toda linha que entra também sai. Ao partir um ímã ao meio, cada pedaço ganha seus dois polos.",
            formulas: [
                { expr: "ΦB = ∮ B⃗ · dA⃗ = 0", vars: "Para qualquer superfície fechada" }
            ],
            tip: "Compare com a Lei de Gauss elétrica: lá o fluxo depende da carga interna; aqui não há 'carga magnética' que o gere."
        },
        {
            area: "magnetism",
            title: "Força e torque sobre uma espira",
            summary: "Em campo uniforme, a força líquida sobre uma espira com corrente é nula, mas surge um torque que gira a espira até seu plano ficar perpendicular ao campo. É o princípio dos motores elétricos.",
            formulas: [
                { expr: "τ = N · I · A · B · sen(θ)", vars: "N: espiras · A: área · θ: ângulo entre a normal da espira e B" },
                { expr: "μ = N · I · A", vars: "Momento de dipolo magnético da espira" }
            ],
            tip: "O torque é máximo quando o plano da espira é paralelo a B (θ = 90°) e nulo quando é perpendicular (θ = 0°)."
        },
        {
            area: "induction",
            title: "Fluxo magnético",
            summary: "O fluxo magnético mede quantas linhas de campo atravessam uma superfície. Depende da intensidade do campo, da área e da orientação da superfície em relação ao campo.",
            formulas: [
                { expr: "Φ = B · A · cos(θ)", vars: "Φ: fluxo (Wb) · θ: ângulo entre B e a normal à superfície" }
            ],
            tip: "1 Wb = 1 T·m². O fluxo é máximo quando B é perpendicular à superfície (θ = 0°)."
        },
        {
            area: "induction",
            title: "Lei de Faraday",
            summary: "Toda variação de fluxo magnético através de um circuito induz nele uma força eletromotriz. A variação pode vir de mudanças em B, na área ou no ângulo.",
            formulas: [
                { expr: "ε = −N · ΔΦ / Δt", vars: "ε: FEM induzida (V) · N: número de espiras" },
                { expr: "I = ε / R", vars: "Corrente induzida em um circuito de resistência R" }
            ],
            tip: "Um fluxo constante, por mais intenso que seja, não induz FEM alguma."
        },
        {
            area: "induction",
            title: "Lei de Lenz",
            summary: "O sentido da corrente induzida é tal que o campo magnético criado por ela se opõe à variação de fluxo que a originou. É o sinal negativo na Lei de Faraday e uma consequência da conservação da energia.",
            formulas: [
                { expr: "ε = −dΦ/dt", vars: "O sinal negativo expressa a oposição à variação" }
            ],
            tip: "Ao aproximar um ímã de uma espira, a corrente induzida cria um polo de mesmo nome, que repele o ímã."
        },
        {
            area: "induction",
            title: "FEM de movimento",
            summary: "Uma barra condutora que se move dentro de um campo magnético tem suas cargas separadas pela força magnética, surgindo uma diferença de potencial entre suas extremidades.",
            formulas: [
                { expr: "ε = B · L · v", vars: "L: comprimento da barra (m) · v: velocidade (m/s)" }
            ],
            tip: "Geradores e dínamos convertem energia mecânica em elétrica a partir desse princípio."
        },
        {
            area: "induction",
            title: "Transformadores",
            summary: "Um transformador usa a indução mútua entre duas bobinas enroladas em um mesmo núcleo para elevar ou reduzir tensões alternadas. Só funciona com corrente alternada, que produz fluxo variável.",
            formulas: [
                { expr: "U1 / U2 = N1 / N2", vars: "Relação de tensões e número de espiras" },
                { expr: "U1 · I1 = U2 · I2", vars: "Transformador ideal: a potência se conserva" }
            ],
            tip: "Linhas de transmissão usam tensões altas para reduzir a corrente e, com isso, as perdas por efeito Joule."
        },
        {
            area: "induction",
            title: "Gerador de corrente alternada",
            summary: "Quando uma bobina gira com velocidade angular constante em um campo magnético uniforme, o fluxo através dela varia senoidalmente, e a Lei de Faraday gera uma FEM alternada. É o princípio dos geradores de usinas e dínamos.",
            formulas: [
                { expr: "ε(t) = N · B · A · ω · sen(ω · t)", vars: "ω: velocidade angular (rad/s)" },
                { expr: "ε_máx = N · B · A · ω", vars: "Valor máximo da FEM" }
            ],
            tip: "Dobrar a velocidade de rotação dobra a FEM máxima e também a frequência."
        },
        {
            area: "induction",
            title: "Autoindutância",
            summary: "Uma bobina resiste a variações bruscas da corrente que a percorre: se a corrente varia, o fluxo próprio varia e induz uma tensão que se opõe à variação (Lei de Lenz). A autoindutância L mede essa propriedade e depende da geometria e do núcleo.",
            formulas: [
                { expr: "ε = −L · dI/dt", vars: "L: indutância (H) · dI/dt: taxa de variação da corrente" },
                { expr: "L = N · Φ / I", vars: "Definição pelo fluxo próprio" }
            ],
            tip: "Unidade: 1 H = 1 V·s/A. A indutância é uma espécie de 'inércia elétrica': ela atrasa mudanças de corrente."
        },
        {
            area: "induction",
            title: "Energia em um indutor",
            summary: "Estabelecer uma corrente em um indutor exige trabalho contra a tensão induzida, e essa energia fica armazenada no campo magnético da bobina. Ela é devolvida ao circuito quando a corrente diminui.",
            formulas: [
                { expr: "U = ½ · L · I²", vars: "U: energia (J) · L: indutância (H) · I: corrente (A)" }
            ],
            tip: "Analogia: ½ L I² (indutor) corresponde a ½ m v² (energia cinética) e ½ C V² (capacitor)."
        },
        {
            area: "induction",
            title: "Indutância mútua",
            summary: "Quando duas bobinas estão próximas, a variação da corrente em uma induz tensão na outra. A indutância mútua M mede esse acoplamento. O coeficiente k vai de 0 (sem acoplamento) a 1 (todo o fluxo de uma atravessa a outra). É a base dos transformadores.",
            formulas: [
                { expr: "ε2 = −M · dI1/dt", vars: "Tensão induzida no secundário" },
                { expr: "M = k · √(L1 · L2)", vars: "k: coeficiente de acoplamento (0 ≤ k ≤ 1)" }
            ],
            tip: "Fogões de indução usam esse efeito: a bobina do fogão induz correntes no fundo metálico da panela, que se aquece."
        }
    ];

    let activeFilter = "all";

    // Tira acentos e deixa minúsculo, pra busca achar "indução" digitando "inducao"
    function normalize(text) {
        return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    }

    // Filtra os tópicos pela área e pelo texto da busca e mostra na tela
    function render() {
        const query = normalize(searchInput.value);

        const visible = topics.filter(topic => {
            const matchesArea = activeFilter === "all" || topic.area === activeFilter;
            const haystack = normalize([
                topic.title,
                topic.summary,
                topic.tip,
                ...topic.formulas.map(f => `${f.expr} ${f.vars}`)
            ].join(" "));
            return matchesArea && haystack.includes(query);
        });

        list.innerHTML = visible.map(topic => {
            const area = areas[topic.area];
            return `
                <article class="theory-topic">
                    <div class="theory-topic-header">
                        <span class="theory-area ${area.color}">${area.label}</span>
                        <button class="theory-link" data-go="${area.page}">Abrir simulador →</button>
                    </div>
                    <h4>${escapeHTML(topic.title)}</h4>
                    <p>${escapeHTML(topic.summary)}</p>
                    <div class="theory-formulas">
                        ${topic.formulas.map(f => `
                            <div class="theory-formula">
                                <span class="formula">${escapeHTML(f.expr)}</span>
                                <small>${escapeHTML(f.vars)}</small>
                            </div>
                        `).join("")}
                    </div>
                    <div class="theory-tip"><strong>Dica:</strong> ${escapeHTML(topic.tip)}</div>
                </article>
            `;
        }).join("");

        emptyState.hidden = visible.length > 0;
        counter.textContent = `${visible.length} ${visible.length === 1 ? "tópico" : "tópicos"}`;
    }

    // Botões de filtro por área
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter;
            filterButtons.forEach(b => b.classList.toggle("active", b === button));
            render();
        });
    });

    searchInput.addEventListener("input", render);

    render();
});
