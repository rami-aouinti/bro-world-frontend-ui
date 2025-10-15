const GTM_ID = "GTM-N632XHTD";
const GTM_SCRIPT_ID = "gtm-script";
const GTM_NOSCRIPT_ID = "gtm-noscript";

function appendNoscript(): void {
  if (document.getElementById(GTM_NOSCRIPT_ID)) {
    return;
  }

  const noscript = document.createElement("noscript");
  noscript.id = GTM_NOSCRIPT_ID;
  noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.appendChild(noscript);
}

export default defineNuxtPlugin(() => {
  if (import.meta.dev || !import.meta.client) {
    return;
  }

  if (!document.getElementById(GTM_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = GTM_SCRIPT_ID;
    script.type = "text/javascript";
    script.innerHTML = `(
      function(w,d,s,l,i){
        w[l]=w[l]||[];
        w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
        var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
        j.async=true;
        j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
        f.parentNode?.insertBefore(j,f);
      }
    )(window,document,'script','dataLayer','${GTM_ID}');`;
    document.head.appendChild(script);
  }

  if (document.readyState === "complete") {
    appendNoscript();
    return;
  }

  if (document.body) {
    appendNoscript();
    return;
  }

  window.addEventListener(
    "DOMContentLoaded",
    () => {
      appendNoscript();
    },
    { once: true },
  );
});
