document.addEventListener("DOMContentLoaded", () => {

    const navItems = document.querySelectorAll(".nav-item");
    const pages = document.querySelectorAll(".page");
    const currentPage = document.getElementById("current-page");

    // Nome que aparece no topo pra cada página
    const pageNames = {
        home: "Início",
        electrostatics: "Eletrostática",
        capacitors: "Capacitores",
        circuits: "Circuitos elétricos",
        magnetism: "Magnetismo",
        induction: "Indução eletromagnética",
        calculator: "Calculadora",
        exercises: "Exercícios",
        theory: "Referencial teórico"
    };

    // Troca a página visível (esconde as outras) e atualiza o menu e a URL
    function navigateTo(pageId, { updateHash = true } = {}) {

        const targetPage = document.getElementById(pageId);

        if (!targetPage || !targetPage.classList.contains("page")) return;

        pages.forEach(page => {
            page.classList.remove("active");
        });

        targetPage.classList.add("active");

        navItems.forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.page === pageId
            );
        });

        currentPage.textContent = pageNames[pageId] || "PHYSICS LAB";

        if (updateHash && location.hash !== `#${pageId}`) {
            history.pushState(null, "", `#${pageId}`);
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    window.navigateTo = navigateTo;

    // Qualquer clique em item do menu (data-page) ou botão com data-go troca de página
    document.addEventListener("click", event => {

        const navItem = event.target.closest(".nav-item[data-page]");
        if (navItem) {
            navigateTo(navItem.dataset.page);
            return;
        }

        const goElement = event.target.closest("[data-go]");
        if (goElement) {
            navigateTo(goElement.dataset.go);
        }

    });

    // Faz o botão "voltar" do navegador funcionar, lendo o # da URL
    function syncWithHash() {
        const pageId = location.hash.slice(1) || "home";
        navigateTo(pageId, { updateHash: false });
    }

    window.addEventListener("popstate", syncWithHash);

    if (location.hash) syncWithHash();

});
