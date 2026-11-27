# ⚡ PHYSICS LAB

**Laboratório Interativo de Física III**: um laboratório virtual feito em HTML, CSS e JavaScript puro para explorar eletrostática, capacitores, circuitos elétricos, magnetismo e indução eletromagnética com simulações, uma calculadora de fórmulas, exercícios gerados automaticamente e um referencial teórico.

> Explore a Física. Entenda o universo.

---

## 📚 Sumário

- [Funcionalidades](#-funcionalidades)
- [Como executar](#-como-executar)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Arquitetura](#-arquitetura)
- [Fórmulas utilizadas](#-fórmulas-utilizadas)
- [Tecnologias](#-tecnologias)

---

## ✨ Funcionalidades

### 🏫 Recursos de sala de aula e estudo
Pensados para o professor usar em sala e para o aluno estudar sozinho.
- **Cenários prontos:** cada simulador tem situações montadas com um clique (ex.: "Carga negativa", "Vidro com bateria desligada"), cada uma com um texto "O que observar"
- **Guia de estudo:** objetivos, roteiro passo a passo (Prever → Observar → Explicar), perguntas com resposta escondida, erros comuns e dicas para o professor
- **Modo projetor:** menu só com ícones, textos e figuras maiores e mais contraste (fica salvo no navegador)
- **Tela cheia** com um clique
- **Pausar e câmera lenta** (0,25×, 0,5×, 1×) na animação do magnetismo; a barra de espaço pausa e continua
- **Funciona offline:** depois do primeiro acesso (por http/https), o site fica salvo no navegador

### ± Módulo 04: Eletrostática
Duas cargas puntiformes sobre o eixo x, com carga (C) e distância (m) ajustáveis.
- Linhas de campo elétrico desenhadas a partir das cargas
- Ponto P que pode ser **arrastado** na figura ou digitado
- Campo elétrico resultante em P (módulo, direção e componentes), potencial elétrico e força sobre uma carga de prova de +1×10⁻⁹ C
- Curva equipotencial que passa por P
- Explicação do resultado: superposição vetorial do campo e soma algébrica do potencial

### ⫴ Módulo 05: Capacitores
- Capacitor de placas paralelas com área (m²), distância (m), tensão e dielétrico (materiais pré-definidos ou κ livre)
- Bateria **ligada** (tensão constante) ou **desligada** (carga constante) ao inserir o dielétrico
- Capacitância, carga, tensão, campo elétrico e energia armazenada
- Associação de dois capacitores em série e em paralelo, com carga e tensão de cada um

### ϟ Módulo 01: Circuitos elétricos
Simulador de circuitos com três resistores e uma fonte DC.
- Associação em **série**, **paralelo** ou **mista**
- Sliders para a tensão da bateria (1–48 V) e para R1, R2 e R3 (1–100 Ω)
- Diagrama elétrico em SVG que muda conforme o tipo de circuito
- Resistência equivalente, corrente total, tensão e potência atualizadas em tempo real
- Tabela com tensão, corrente e potência de cada resistor

### ◎ Módulo 02: Magnetismo
Movimento de uma partícula carregada dentro de um campo magnético.
- Parâmetros: carga (C), velocidade (m/s), massa (kg), campo (T) e ângulo entre **v** e **B**
- Visualização da trajetória com o campo entrando na tela (⊗)
- Cálculo da força magnética, do raio da trajetória e da componente perpendicular da velocidade
- Seção "Entenda o resultado" com a interpretação física

### ↝ Módulo 03: Indução eletromagnética
Lei de Faraday-Lenz aplicada a uma espira (ou bobina).
- Campo inicial e final, área da espira (m²), número de espiras, intervalo de tempo e ângulos inicial e final
- Visualização da espira dentro do campo
- Fluxo inicial e final, variação do fluxo e FEM induzida

### ∑ Calculadora de fórmulas
Escolha uma fórmula e calcule **qualquer variável** a partir das outras, com passo a passo.
- Corrente, 2ª Lei de Ohm, fonte real, Lei de Ohm, potência elétrica, efeito Joule, resistores em paralelo
- Lei de Coulomb, campo elétrico, força e aceleração de cargas, fluxo, Lei de Gauss (esfera, linha e plano), potencial e diferença de potencial
- Capacitores: placas paralelas com dielétrico, carga, energia, densidade de energia, série, paralelo e capacitor esférico
- Força magnética sobre carga, raio da trajetória, campo de fio retilíneo, campo de solenoide, força sobre condutor
- Fluxo magnético, Lei de Faraday, FEM de movimento, transformador ideal
- Campo de espira, força entre fios paralelos, torque em espira, gerador, autoindutância, energia em indutor, indutância mútua e acoplamento
- Suporte a prefixos do SI (G, M, k, m, µ, n, p)
- Histórico de cálculos salvo no navegador

### ✎ Exercícios
- Questões **numéricas** geradas aleatoriamente e questões **conceituais**
- Filtro por tema: Eletrostática, Capacitores, Circuitos, Magnetismo, Indução ou todos
- 46 geradores de questões numéricas (valores sorteados) e 33 questões conceituais, escritos a partir da ementa de Física III
- Dicas e resolução passo a passo
- Correção com tolerância (±2% por padrão)
- Estatísticas de desempenho: acertos, total, aproveitamento, sequência atual, melhor sequência e resultado por tema, salvas no navegador

### ◫ Referencial teórico
- Conceitos, equações e significado de cada variável
- Busca por texto e filtro por área
- Atalhos para o módulo de simulação correspondente

---

## 🚀 Como executar

O projeto não tem dependências nem etapa de build.

**Opção 1: abrir direto**

Abra o arquivo `index.html` no navegador.

**Opção 2: servidor local (recomendado)**

```bash
# Python
python3 -m http.server 8000

# ou Node.js
npx serve .
```

Depois acesse `http://localhost:8000`.

> A fonte **Inter** é carregada do Google Fonts e fica salva para uso offline depois do primeiro acesso.
>
> O modo offline só funciona pelo servidor (opção 2) ou publicado na web. Abrindo o arquivo direto, todo o resto funciona normalmente. Ao alterar arquivos do site, aumente `CACHE_VERSION` no `sw.js`.

---

## 📁 Estrutura do projeto

```
PhysicsLab/
├── index.html              # Página única com todas as seções
├── style.css               # Estilos globais e de cada módulo
├── sw.js                   # Service worker (modo offline)
├── ROADMAP.md              # Planejamento da iniciação científica
└── js/
    ├── main.js             # Inicialização
    ├── navigation.js       # Navegação entre páginas (SPA com hash)
    ├── utils.js            # Constantes, paleta de cores e funções compartilhadas
    ├── data/
    │   └── guides.js       # Textos dos guias de estudo e cenários prontos
    ├── physics/
    │   ├── electrostatics.js # Cargas, campo e potencial
    │   ├── capacitors.js   # Capacitores e dielétricos
    │   ├── circuits.js     # Simulador de circuitos + diagrama SVG
    │   ├── magnetism.js    # Partícula em campo magnético
    │   └── induction.js    # Indução eletromagnética
    └── features/
        ├── calculator.js   # Calculadora de fórmulas
        ├── exercises.js    # Gerador e corretor de exercícios
        ├── theory.js       # Referencial teórico com busca
        └── classroom.js    # Cenários prontos, guia de estudo e modo projetor
```

---

## 🧩 Arquitetura

- **SPA sem framework:** todas as páginas ficam no `index.html` como elementos `.page`. O `navigation.js` mostra a página ativa, atualiza o menu e sincroniza com a URL (`#circuits`, `#magnetism`, …), então o botão "voltar" do navegador funciona.
- **Navegação declarativa:** qualquer elemento com `data-page` (menu) ou `data-go` (botões e cards) leva à página indicada, inclusive elementos criados dinamicamente (delegação de eventos).
- **`PhysicsUtils`** (`utils.js`): módulo global com:
  - constantes físicas (`μ₀`, `k`, `e`)
  - paleta de cores dos desenhos (`colors`), usada por todos os simuladores
  - formatação numérica no padrão pt-BR e com prefixos do SI
  - `parseNumber`, que aceita vírgula decimal
  - helpers de aleatoriedade (`randomInt`, `pick`, `shuffle`)
  - wrapper seguro para `localStorage`
  - `escapeHTML`
- **Classes compartilhadas:** os simuladores de indução, eletrostática e capacitores usam o mesmo layout (`sim-layout`, `sim-card`, `sim-input`, `sim-result`…).
- **Conteúdo separado da lógica:** os textos dos guias ficam em `js/data/guides.js` e o `classroom.js` só monta a interface.
- **Padrão de arquivos:** `.editorconfig` e `.gitattributes` mantêm UTF-8, quebra de linha LF e indentação de 4 espaços.
- **Persistência:** o histórico da calculadora (`physicslab.calc.history`) e as estatísticas dos exercícios (`physicslab.exercises.stats`) ficam salvos no `localStorage`.

---

## 📐 Fórmulas utilizadas

| Área | Grandeza | Fórmula |
|---|---|---|
| Circuitos | Lei de Ohm | `U = R · I` |
| Circuitos | Potência elétrica | `P = U · I` |
| Circuitos | Efeito Joule | `P = R · I²` |
| Circuitos | Associação em série | `Req = R1 + R2 + R3` |
| Circuitos | Associação em paralelo | `1/Req = 1/R1 + 1/R2 + 1/R3` |
| Magnetismo | Força magnética | `F = \|q\| · v · B · sen(θ)` |
| Magnetismo | Raio da trajetória | `r = m · v · sen(θ) / (\|q\| · B)` |
| Magnetismo | Componente perpendicular | `v⊥ = v · sen(θ)` |
| Magnetismo | Campo de fio retilíneo | `B = μ₀ · I / (2π · d)` |
| Magnetismo | Campo de solenoide | `B = μ₀ · N · I / L` |
| Magnetismo | Força sobre condutor | `F = B · I · L · sen(θ)` |
| Indução | Fluxo magnético | `Φ = B · A · cos(θ)` |
| Indução | Variação do fluxo | `ΔΦ = Φfinal − Φinicial` |
| Indução | Lei de Faraday-Lenz | `ε = −N · ΔΦ / Δt` |
| Indução | FEM de movimento | `ε = B · L · v` |
| Indução | Transformador ideal | `U1 / U2 = N1 / N2` |

---

## 🛠 Tecnologias

- **HTML5** (estrutura e SVG)
- **CSS3** (layout, tema e responsividade)
- **JavaScript (ES6+)** puro, sem bibliotecas
- **Google Fonts:** Inter

---

Projeto desenvolvido para a disciplina de **Física III**.
