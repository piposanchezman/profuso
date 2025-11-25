/**
 * Script de navegación del header
 * Maneja el menú móvil, scroll spy y navegación activa
 */

interface HeaderElements {
  toggle: HTMLElement | null;
  menu: HTMLElement | null;
  overlay: HTMLElement | null;
  header: HTMLElement | null;
  mobileLinks: NodeListOf<Element>;
  navLinks: NodeListOf<Element>;
  sections: NodeListOf<HTMLElement>;
}

interface ScrollSpyState {
  listener: (() => void) | null;
  isInitialized: boolean;
}

const scrollSpyState: ScrollSpyState = {
  listener: null,
  isInitialized: false,
};

// Configuración
const CONFIG = {
  SCROLL_OFFSET: 200,
  SCROLL_SPY_RETRY_INTERVAL: 100,
  MIN_SECTIONS_REQUIRED: 5,
};

/**
 * Obtiene todos los elementos necesarios del DOM
 */
function getHeaderElements(): HeaderElements {
  return {
    toggle: document.getElementById("menu-toggle"),
    menu: document.getElementById("mobile-menu"),
    overlay: document.getElementById("menu-overlay"),
    header: document.getElementById("main-header"),
    mobileLinks: document.querySelectorAll(".mobile-link"),
    navLinks: document.querySelectorAll(".navlink"),
    sections: document.querySelectorAll<HTMLElement>("section[id]"),
  };
}

/**
 * Abre el menú móvil
 */
function openMenu(elements: HeaderElements): void {
  const { menu, overlay, header } = elements;

  if (menu) {
    menu.style.transform = "translateY(0)";
  }

  overlay?.classList.remove("opacity-0", "pointer-events-none");
  overlay?.classList.add("opacity-100");

  header?.classList.remove("bg-gray-900/95");
  header?.classList.add("bg-gray-900");

  // Prevenir scroll del body cuando el menú está abierto
  document.body.style.overflow = "hidden";
}

/**
 * Cierra el menú móvil
 */
function closeMenu(elements: HeaderElements): void {
  const { menu, overlay, header } = elements;

  if (menu) {
    menu.style.transform = "translateY(-100%)";
  }

  overlay?.classList.remove("opacity-100");
  overlay?.classList.add("opacity-0", "pointer-events-none");

  header?.classList.remove("bg-gray-900");
  header?.classList.add("bg-gray-900/95");

  // Restaurar scroll del body
  document.body.style.overflow = "";
}

/**
 * Verifica si el menú móvil está cerrado
 */
function isMenuClosed(menu: HTMLElement | null): boolean {
  if (!menu) return true;
  const transform = menu.style.transform;
  return transform === "translateY(-100%)" || transform === "";
}

/**
 * Clona un elemento para remover todos sus event listeners
 */
function cloneElement(element: Element | null): HTMLElement | null {
  if (!element || !element.parentNode) return null;
  const clone = element.cloneNode(true) as HTMLElement;
  element.parentNode.replaceChild(clone, element);
  return clone;
}

/**
 * Configura los event listeners del menú móvil
 */
function setupMobileMenu(elements: HeaderElements): void {
  // Clonar elementos para remover listeners previos
  const newToggle = cloneElement(elements.toggle);
  const newOverlay = cloneElement(elements.overlay);

  if (!newToggle) return;

  // Actualizar elementos
  const updatedElements = getHeaderElements();

  // Toggle del menú
  newToggle.addEventListener("click", () => {
    if (isMenuClosed(updatedElements.menu)) {
      openMenu(updatedElements);
    } else {
      closeMenu(updatedElements);
    }
  });

  // Cerrar al hacer click en el overlay
  newOverlay?.addEventListener("click", () => {
    closeMenu(updatedElements);
  });

  // Cerrar al hacer click en un link del menú
  updatedElements.mobileLinks.forEach((link) => {
    const newLink = cloneElement(link);
    newLink?.addEventListener("click", () => {
      closeMenu(updatedElements);
    });
  });

  // Cerrar con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !isMenuClosed(updatedElements.menu)) {
      closeMenu(updatedElements);
    }
  });
}

/**
 * Actualiza el link activo basado en la posición del scroll
 */
function updateActiveLink(): void {
  const elements = getHeaderElements();
  const scrollPos = window.scrollY + CONFIG.SCROLL_OFFSET;

  let currentSection = "";

  // Encontrar la sección actual
  elements.sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      currentSection = section.id;
    }
  });

  // Actualizar clases de los links
  elements.navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    // Extraer solo el hash (#section) del href
    const target = href.includes("#") ? href.split("#")[1] : "";
    const isActive = target === currentSection;

    link.classList.toggle("active", isActive);
  });
}

/**
 * Inicializa el scroll spy con reintentos
 */
function initScrollSpy(): void {
  if (scrollSpyState.isInitialized) {
    return;
  }

  const elements = getHeaderElements();

  // Verificar si hay suficientes secciones cargadas
  if (elements.sections.length < CONFIG.MIN_SECTIONS_REQUIRED) {
    setTimeout(initScrollSpy, CONFIG.SCROLL_SPY_RETRY_INTERVAL);
    return;
  }

  // Remover listener anterior si existe
  if (scrollSpyState.listener) {
    window.removeEventListener("scroll", scrollSpyState.listener);
  }

  // Crear y agregar nuevo listener
  scrollSpyState.listener = updateActiveLink;
  window.addEventListener("scroll", scrollSpyState.listener, { passive: true });

  // Actualizar inmediatamente
  updateActiveLink();

  scrollSpyState.isInitialized = true;
}

/**
 * Limpia el estado del scroll spy
 */
function cleanupScrollSpy(): void {
  if (scrollSpyState.listener) {
    window.removeEventListener("scroll", scrollSpyState.listener);
    scrollSpyState.listener = null;
  }
  scrollSpyState.isInitialized = false;
}

/**
 * Inicializa toda la funcionalidad del header
 */
export function setupHeader(): void {
  const elements = getHeaderElements();

  // Limpiar estado previo
  cleanupScrollSpy();

  // Cerrar menú si está abierto (útil en navegación SPA)
  closeMenu(elements);

  // Configurar menú móvil
  setupMobileMenu(elements);

  // Inicializar scroll spy
  initScrollSpy();
}

/**
 * Configura los event listeners globales
 */
export function initHeaderNavigation(): void {
  // Ejecutar en la carga inicial y después de cada transición de página
  document.addEventListener("astro:page-load", setupHeader);

  // Limpiar en navegación
  document.addEventListener("astro:before-preparation", cleanupScrollSpy);
}

// Auto-inicialización
if (typeof window !== "undefined") {
  initHeaderNavigation();
}
