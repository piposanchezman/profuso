/**
 * Script de navegación para vistas detalladas (projects/services)
 * Maneja la navegación con hash hacia la página principal
 */

/**
 * Maneja los clics en enlaces que apuntan a la página principal con hash
 */
function handleHashLinks(): void {
  // Seleccionar todos los enlaces que apuntan a la página principal con hash
  const hashLinks = document.querySelectorAll<HTMLAnchorElement>('a[href^="/#"]');
  
  hashLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Extraer el hash del href
      const hash = href.substring(1); // Elimina el / inicial, deja solo #section
      
      // Navegar a la página principal
      window.location.href = `/${hash}`;
    });
  });
}

/**
 * Inicializa el sistema de navegación para vistas detalladas
 */
function initDetailNavigation(): void {
  handleHashLinks();
}

// Auto-inicialización
if (typeof window !== 'undefined') {
  // Ejecutar al cargar la página
  document.addEventListener('astro:page-load', () => {
    initDetailNavigation();
  });
  
  // También ejecutar inmediatamente si la página ya está cargada
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetailNavigation);
  } else {
    initDetailNavigation();
  }
}
