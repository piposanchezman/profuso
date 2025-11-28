/**
 * Script de gestión de carga de página y navegación con hash
 * Maneja el loader inicial y el scroll suave a secciones con hash
 */

interface PageLoaderState {
  savedHash: string;
  preventAutoScroll: boolean;
  isInitialized: boolean;
}

const state: PageLoaderState = {
  savedHash: '',
  preventAutoScroll: false,
  isInitialized: false,
};

// Configuración
const CONFIG = {
  MAX_LOAD_ATTEMPTS: 15,
  ATTEMPT_INTERVAL: 200,
  LOADER_FADE_DURATION: 300,
  SCROLL_DELAY_DEFAULT: 300,
  SCROLL_DELAY_CONTACT: 500,
};

/**
 * Guarda el hash de la URL y previene el scroll automático del navegador
 */
function saveHashFromURL(): void {
  if (window.location.hash) {
    state.savedHash = window.location.hash;
    state.preventAutoScroll = true;
    // Eliminar hash temporalmente de la URL
    history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    );
  }
}

/**
 * Maneja la navegación con hash desde otras páginas
 */
function handleHashNavigation(event: CustomEvent): void {
  const targetUrl = new URL(
    event.detail?.newUrl || event.detail?.to || window.location.href
  );
  
  if (targetUrl.hash && targetUrl.pathname === '/') {
    state.savedHash = targetUrl.hash;
    state.preventAutoScroll = true;
  }
}

/**
 * Verifica si todos los componentes React críticos están cargados
 */
function areReactComponentsLoaded(): boolean {
  const servicesSection = document.querySelector('#services');
  const projectsSection = document.querySelector('#projects');
  const contactSection = document.querySelector('#contact');
  const pqrsSection = document.querySelector('#pqrs');

  if (!servicesSection || !projectsSection || !contactSection || !pqrsSection) {
    return false;
  }

  // Verificar que los componentes tengan contenido renderizado
  // Usar try-catch para evitar errores durante la hidratación
  try {
    const servicesHasCards = servicesSection.querySelector('.flip-container') !== null;
    const projectsHasCards = projectsSection.querySelector('[data-animate="zoom-in"]') !== null;
    const contactHasForm = contactSection.querySelector('form') !== null;
    const pqrsHasForm = pqrsSection.querySelector('form') !== null;

    return servicesHasCards && projectsHasCards && contactHasForm && pqrsHasForm;
  } catch (error) {
    // Si hay un error durante la verificación, asumir que aún no está listo
    return false;
  }
}

/**
 * Realiza scroll suave a una sección específica
 */
function scrollToSection(hash: string): void {
  const target = document.querySelector(hash);
  
  if (!target) {
    console.warn(`No se encontró el elemento con el hash: ${hash}`);
    return;
  }

  // Delay adicional para Contact y PQRs para asegurar altura final
  const scrollDelay = (hash === '#contact' || hash === '#pqrs')
    ? CONFIG.SCROLL_DELAY_CONTACT 
    : CONFIG.SCROLL_DELAY_DEFAULT;

  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Restaurar el hash en la URL
    history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search + hash
    );
    
    // Limpiar estado
    resetState();
  }, scrollDelay);
}

/**
 * Oculta el loader con animación
 */
function hideLoader(): Promise<void> {
  const loader = document.getElementById('page-loader');
  
  if (!loader) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    loader.style.opacity = '0';
    
    setTimeout(() => {
      loader.style.display = 'none';
      resolve();
    }, CONFIG.LOADER_FADE_DURATION);
  });
}

/**
 * Resetea el estado del loader
 */
function resetState(): void {
  state.savedHash = '';
  state.preventAutoScroll = false;
}

/**
 * Intenta ocultar el loader y hacer scroll si es necesario
 */
async function attemptHideLoader(): Promise<boolean> {
  if (!areReactComponentsLoaded()) {
    return false;
  }

  await hideLoader();
  
  const hash = state.savedHash || window.location.hash;
  if (hash) {
    scrollToSection(hash);
  } else {
    resetState();
  }

  return true;
}

/**
 * Ejecuta intentos de ocultar el loader hasta que tenga éxito o alcance el máximo
 */
async function tryHideLoaderWithRetries(): Promise<void> {
  let attempts = 0;

  const attempt = async (): Promise<void> => {
    const success = await attemptHideLoader();
    
    if (success) {
      return;
    }

    attempts++;
    
    if (attempts >= CONFIG.MAX_LOAD_ATTEMPTS) {
      console.warn('Alcanzado el máximo de intentos para cargar componentes');
      await hideLoader();
      resetState();
      return;
    }

    setTimeout(attempt, CONFIG.ATTEMPT_INTERVAL);
  };

  await attempt();
}

/**
 * Inicializa la página: oculta el loader y maneja el scroll al hash
 */
export function initPageLoader(): void {
  if (state.isInitialized) {
    return;
  }

  state.isInitialized = true;
  tryHideLoaderWithRetries();
}

/**
 * Configuración de eventos para la navegación
 */
export function setupPageNavigation(): void {
  // Guardar hash inicial
  saveHashFromURL();

  // Manejar navegación con hash desde otras páginas (Astro View Transitions)
  document.addEventListener('astro:before-preparation', ((event: CustomEvent) => {
    handleHashNavigation(event);
  }) as EventListener);

  // Prevenir scroll automático después del swap de Astro
  document.addEventListener('astro:after-swap', () => {
    if (state.preventAutoScroll && window.location.hash) {
      const currentHash = window.location.hash;
      if (!state.savedHash) {
        state.savedHash = currentHash;
      }
      history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  });

  // Ejecutar después de que Astro cargue la página
  document.addEventListener('astro:page-load', () => {
    state.isInitialized = false;
    initPageLoader();
  });
}

// Auto-inicialización
if (typeof window !== 'undefined') {
  setupPageNavigation();
}
