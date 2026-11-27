document.addEventListener("DOMContentLoaded", () => {

    // Só mostra uma mensagem no console quando o site carrega
    console.log("--------------------------------");
    console.log("PHYSICS LAB");
    console.log("Laboratório Interativo de Física III");
    console.log("--------------------------------");

    console.log("Sistema iniciado com sucesso!");

    // Guarda o site no navegador para funcionar sem internet (precisa de http/https)
    const offlineStatus = document.getElementById("offline-status");

    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
        navigator.serviceWorker.register("sw.js")
            .then(() => navigator.serviceWorker.ready)
            .then(() => {
                if (offlineStatus) offlineStatus.textContent = "Disponível offline";
            })
            .catch(error => console.warn("Modo offline indisponível:", error));
    }

    // Avisa quando a internet cai ou volta
    function updateConnection() {
        if (!offlineStatus) return;
        if (!navigator.onLine) offlineStatus.textContent = "Sem internet (modo offline)";
        else if (navigator.serviceWorker && navigator.serviceWorker.controller) offlineStatus.textContent = "Disponível offline";
    }

    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    updateConnection();

});
