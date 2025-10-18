import { defineNuxtPlugin, useNuxtApp } from "#app";

const CDN_URL = "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";
let loaderPromise: Promise<typeof window.html2pdf | null> | null = null;

function loadHtml2Pdf(): Promise<typeof window.html2pdf | null> {
  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    if (window.html2pdf) {
      resolve(window.html2pdf);
      return;
    }

    const script = document.createElement("script");
    script.src = CDN_URL;
    script.async = true;
    script.onload = () => resolve(window.html2pdf ?? null);
    script.onerror = () => reject(new Error("Failed to load html2pdf.js"));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      html2pdf: loadHtml2Pdf,
    },
  };
});

export function useHtml2Pdf() {
  const nuxtApp = useNuxtApp();

  const load = () => nuxtApp.$html2pdf?.() ?? Promise.resolve(null);

  const download = async (
    element: HTMLElement | null,
    fileName: string,
    options?: Record<string, unknown>,
  ) => {
    if (!element) {
      return;
    }

    try {
      const instance = await load();
      if (!instance) {
        window.print();
        return;
      }

      const worker = instance().from(element);
      if (options && typeof worker.set === "function") {
        worker.set(options);
      }
      if (typeof worker.save === "function") {
        worker.save(fileName);
      }
    } catch {
      window.print();
    }
  };

  return { load, download };
}
