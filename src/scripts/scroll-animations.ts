declare global {
  interface Window {
    scrollObserver?: IntersectionObserver;
  }
}

export function initScrollAnimations() {
  // Desconectamos cualquier observer previo para evitar duplicados
  if (window.scrollObserver) {
    window.scrollObserver.disconnect();
  }

  // Creamos un nuevo IntersectionObserver
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;

        if (entry.isIntersecting) {
          // Usar requestAnimationFrame para evitar conflictos con React
          requestAnimationFrame(() => {
            el.classList.remove("animate-out");
            el.classList.add("animate-in");
          });
        } else {
          requestAnimationFrame(() => {
            el.classList.remove("animate-in");
            el.classList.add("animate-out");
          });
        }
      });
    },
    { threshold: 0.2 }
  );

  // Guardamos el observer globalmente
  window.scrollObserver = observer;

  // Esperar a que React termine de hidratar antes de manipular el DOM
  requestAnimationFrame(() => {
    // Aplicamos el observer a todos los elementos animables
    const elements = document.querySelectorAll<HTMLElement>("[data-animate]");
    
    elements.forEach((el) => {
      // Inicializar con animate-out si no tiene ninguna clase de animación
      if (!el.classList.contains("animate-in") && !el.classList.contains("animate-out")) {
        el.classList.add("animate-out");
      }
      
      observer.observe(el);
    });

    // Animar los elementos que ya están visibles al cargar
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        el.classList.add("animate-in");
        el.classList.remove("animate-out");
      }
    });
  });

  // Observar nuevos elementos que aparezcan dinámicamente (con debounce)
  let mutationTimeout: number;
  const mutationObserver = new MutationObserver(() => {
    clearTimeout(mutationTimeout);
    mutationTimeout = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>("[data-animate]:not(.animate-in):not(.animate-out)")
        .forEach((el) => {
          requestAnimationFrame(() => {
            el.classList.add("animate-out");
            observer.observe(el);
          });
        });
    }, 100); // Debounce de 100ms
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

// Ejecutar al cargar por primera vez
document.addEventListener("DOMContentLoaded", initScrollAnimations);

// Re-ejecutar cuando Astro cambia de página (SPA)
document.addEventListener("astro:page-load", initScrollAnimations);
