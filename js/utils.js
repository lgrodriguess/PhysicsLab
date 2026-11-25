window.PhysicsUtils = (() => {

    const constants = {
        mu0: 4 * Math.PI * 1e-7,
        k: 8.9875e9,
        e: 1.602e-19,
        epsilon0: 8.854e-12,
        mp: 1.673e-27,
        me: 9.109e-31,
        g: 9.8
    };

    const prefixes = [
        { symbol: "G", factor: 1e9 },
        { symbol: "M", factor: 1e6 },
        { symbol: "k", factor: 1e3 },
        { symbol: "", factor: 1 },
        { symbol: "m", factor: 1e-3 },
        { symbol: "µ", factor: 1e-6 },
        { symbol: "n", factor: 1e-9 },
        { symbol: "p", factor: 1e-12 }
    ];

    function formatNumber(value, maxDecimals = 4) {
        if (!Number.isFinite(value)) return "—";

        if (value !== 0 && (Math.abs(value) < 1e-3 || Math.abs(value) >= 1e7)) {
            const [mantissa, exponent] = value.toExponential(3).split("e");
            return `${mantissa.replace(".", ",")} × 10^${Number(exponent)}`;
        }

        return value.toLocaleString("pt-BR", { maximumFractionDigits: maxDecimals });
    }

    function formatSI(value, unit) {
        if (!Number.isFinite(value)) return "—";
        if (!unit || unit === "°" || unit === "espiras" || value === 0) {
            return `${formatNumber(value)} ${unit}`.trim();
        }

        const abs = Math.abs(value);
        if (abs < 1e-12 || abs >= 1e12) return `${formatNumber(value)} ${unit}`;
        const prefix = prefixes.find(p => abs >= p.factor) || prefixes[prefixes.length - 1];
        return `${formatNumber(value / prefix.factor, 3)} ${prefix.symbol}${unit}`;
    }

    function parseNumber(text) {
        if (typeof text !== "string") return NaN;
        const cleaned = text.trim().replace(/\s/g, "").replace(",", ".");
        if (cleaned === "") return NaN;
        return Number(cleaned);
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function pick(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function shuffle(list) {
        const copy = [...list];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function storage(key, fallback) {
        return {
            load() {
                try {
                    const raw = localStorage.getItem(key);
                    return raw ? JSON.parse(raw) : fallback;
                } catch {
                    return fallback;
                }
            },
            save(value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch {
                }
            }
        };
    }

    function escapeHTML(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    return {
        constants,
        prefixes,
        formatNumber,
        formatSI,
        parseNumber,
        randomInt,
        pick,
        shuffle,
        storage,
        escapeHTML
    };

})();
