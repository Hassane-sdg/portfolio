(() => {
    const siteCode = window.PORTFOLIO_ANALYTICS?.goatCounterSiteCode;

    if (siteCode === "") return;

    if (typeof siteCode !== "string" || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(siteCode)) {
        console.error("Analytics désactivé : le code de site GoatCounter configuré est invalide.");
        return;
    }

    if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl === true) {
        return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://gc.zgo.at/count.js";
    script.dataset.goatcounter = `https://${siteCode}.goatcounter.com/count`;
    script.onerror = () => console.error("Impossible de charger GoatCounter.");
    document.head.append(script);
})();
