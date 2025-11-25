/**
 * Script para galería de imágenes y lightbox
 * Usado en vistas detalladas de proyectos y servicios
 */

interface GalleryElements {
  slider: HTMLElement | null;
  images: NodeListOf<HTMLImageElement>;
  indicators: NodeListOf<HTMLElement>;
  prevBtn: HTMLElement | null;
  nextBtn: HTMLElement | null;
  lightboxTrigger: HTMLElement | null;
  lightboxModal: HTMLElement | null;
  lightboxImage: HTMLImageElement | null;
  lightboxClose: HTMLElement | null;
  lightboxPrev: HTMLElement | null;
  lightboxNext: HTMLElement | null;
  lightboxIndicatorsContainer: HTMLElement | null;
}

interface GalleryState {
  currentIndex: number;
  lightboxIndex: number;
  autoplayInterval: ReturnType<typeof setInterval> | null;
}

// Configuración
const CONFIG = {
  AUTOPLAY_INTERVAL: 5000,
  HASH_SCROLL_DELAY: 100,
};

/**
 * Obtiene todos los elementos necesarios del DOM
 */
function getGalleryElements(sliderSelector: string): GalleryElements {
  const slider = document.querySelector<HTMLElement>(sliderSelector);
  
  return {
    slider,
    images: slider?.querySelectorAll<HTMLImageElement>("img") || document.querySelectorAll("img[data-image-index]"),
    indicators: slider?.querySelectorAll<HTMLElement>("[data-indicator]") || document.querySelectorAll("[data-indicator]"),
    prevBtn: slider?.querySelector<HTMLElement>("[data-prev]") || null,
    nextBtn: slider?.querySelector<HTMLElement>("[data-next]") || null,
    lightboxTrigger: document.querySelector<HTMLElement>("[data-lightbox]"),
    lightboxModal: document.querySelector<HTMLElement>("[data-lightbox-modal]"),
    lightboxImage: document.getElementById("lightbox-image") as HTMLImageElement | null,
    lightboxClose: document.querySelector<HTMLElement>("[data-lightbox-close]"),
    lightboxPrev: document.querySelector<HTMLElement>("[data-lightbox-prev]"),
    lightboxNext: document.querySelector<HTMLElement>("[data-lightbox-next]"),
    lightboxIndicatorsContainer: document.querySelector<HTMLElement>("[data-lightbox-indicators]"),
  };
}

/**
 * Crea los indicadores del lightbox basados en las imágenes
 */
function createLightboxIndicators(
  container: HTMLElement,
  imageCount: number
): void {
  container.innerHTML = "";
  
  for (let i = 0; i < imageCount; i++) {
    const indicator = document.createElement("button");
    indicator.className = `w-2 h-2 rounded-full transition-all ${
      i === 0 ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
    }`;
    indicator.setAttribute("data-lightbox-indicator", String(i));
    indicator.setAttribute("aria-label", `Ir a imagen ${i + 1}`);
    container.appendChild(indicator);
  }
}

/**
 * Actualiza el estado visual de los indicadores del lightbox
 */
function updateLightboxIndicators(activeIndex: number): void {
  const lightboxIndicators = document.querySelectorAll("[data-lightbox-indicator]");
  
  lightboxIndicators.forEach((indicator, i) => {
    if (i === activeIndex) {
      indicator.classList.remove("bg-white/50");
      indicator.classList.add("bg-white", "w-8");
    } else {
      indicator.classList.remove("bg-white", "w-8");
      indicator.classList.add("bg-white/50");
    }
  });
}

/**
 * Abre el lightbox con la imagen actual
 */
function openLightbox(
  elements: GalleryElements,
  state: GalleryState
): void {
  const { lightboxImage, lightboxModal, images } = elements;
  
  if (!lightboxImage || !lightboxModal || images.length === 0) return;

  state.lightboxIndex = state.currentIndex;
  lightboxImage.src = images[state.lightboxIndex].src;
  lightboxImage.alt = images[state.lightboxIndex].alt;
  
  updateLightboxIndicators(state.lightboxIndex);
  
  lightboxModal.classList.remove("hidden");
  lightboxModal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

/**
 * Cierra el lightbox
 */
function closeLightbox(elements: GalleryElements): void {
  const { lightboxModal } = elements;
  
  if (!lightboxModal) return;

  lightboxModal.classList.add("hidden");
  lightboxModal.classList.remove("flex");
  document.body.style.overflow = "";
}

/**
 * Navega a la imagen anterior en el lightbox
 */
function navigateLightboxPrev(
  elements: GalleryElements,
  state: GalleryState
): void {
  const { lightboxImage, images } = elements;
  
  if (!lightboxImage || images.length === 0) return;

  state.lightboxIndex = (state.lightboxIndex - 1 + images.length) % images.length;
  lightboxImage.src = images[state.lightboxIndex].src;
  lightboxImage.alt = images[state.lightboxIndex].alt;
  
  updateLightboxIndicators(state.lightboxIndex);
}

/**
 * Navega a la imagen siguiente en el lightbox
 */
function navigateLightboxNext(
  elements: GalleryElements,
  state: GalleryState
): void {
  const { lightboxImage, images } = elements;
  
  if (!lightboxImage || images.length === 0) return;

  state.lightboxIndex = (state.lightboxIndex + 1) % images.length;
  lightboxImage.src = images[state.lightboxIndex].src;
  lightboxImage.alt = images[state.lightboxIndex].alt;
  
  updateLightboxIndicators(state.lightboxIndex);
}

/**
 * Navega a una imagen específica en el lightbox
 */
function navigateToLightboxImage(
  elements: GalleryElements,
  state: GalleryState,
  index: number
): void {
  const { lightboxImage, images } = elements;
  
  if (!lightboxImage || images.length === 0 || index < 0 || index >= images.length) {
    return;
  }

  state.lightboxIndex = index;
  lightboxImage.src = images[state.lightboxIndex].src;
  lightboxImage.alt = images[state.lightboxIndex].alt;
  
  updateLightboxIndicators(state.lightboxIndex);
}

/**
 * Configura los event listeners del lightbox
 */
function setupLightbox(elements: GalleryElements, state: GalleryState): void {
  const {
    lightboxTrigger,
    lightboxClose,
    lightboxModal,
    lightboxPrev,
    lightboxNext,
    lightboxIndicatorsContainer,
    images,
  } = elements;

  // Crear indicadores
  if (lightboxIndicatorsContainer && images.length > 0) {
    createLightboxIndicators(lightboxIndicatorsContainer, images.length);
  }

  // Abrir lightbox
  lightboxTrigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    openLightbox(elements, state);
  });

  // Cerrar lightbox con botón
  lightboxClose?.addEventListener("click", () => {
    closeLightbox(elements);
  });

  // Cerrar lightbox al hacer click en el fondo
  lightboxModal?.addEventListener("click", (e) => {
    if (e.target === lightboxModal) {
      closeLightbox(elements);
    }
  });

  // Navegación en lightbox
  lightboxPrev?.addEventListener("click", () => {
    navigateLightboxPrev(elements, state);
  });

  lightboxNext?.addEventListener("click", () => {
    navigateLightboxNext(elements, state);
  });

  // Click en indicadores del lightbox
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const indicatorIndex = target.getAttribute("data-lightbox-indicator");
    
    if (indicatorIndex !== null) {
      navigateToLightboxImage(elements, state, parseInt(indicatorIndex));
    }
  });

  // Cerrar con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightboxModal?.classList.contains("flex")) {
      closeLightbox(elements);
    }
  });

  // Navegación con flechas en lightbox
  document.addEventListener("keydown", (e) => {
    if (!lightboxModal?.classList.contains("flex")) return;

    if (e.key === "ArrowLeft") {
      navigateLightboxPrev(elements, state);
    } else if (e.key === "ArrowRight") {
      navigateLightboxNext(elements, state);
    }
  });
}

/**
 * Navega a un slide específico del carrusel
 */
function goToSlide(
  elements: GalleryElements,
  state: GalleryState,
  index: number
): void {
  const { images, indicators } = elements;

  if (images.length === 0) return;

  // Ocultar slide actual
  images[state.currentIndex]?.classList.remove("opacity-100");
  images[state.currentIndex]?.classList.add("opacity-0");
  indicators[state.currentIndex]?.classList.remove("bg-white", "w-8");
  indicators[state.currentIndex]?.classList.add("bg-white/50");

  // Mostrar nuevo slide
  state.currentIndex = index;
  images[state.currentIndex]?.classList.remove("opacity-0");
  images[state.currentIndex]?.classList.add("opacity-100");
  indicators[state.currentIndex]?.classList.remove("bg-white/50");
  indicators[state.currentIndex]?.classList.add("bg-white", "w-8");
}

/**
 * Navega al siguiente slide
 */
function nextSlide(elements: GalleryElements, state: GalleryState): void {
  const nextIndex = (state.currentIndex + 1) % elements.images.length;
  goToSlide(elements, state, nextIndex);
}

/**
 * Navega al slide anterior
 */
function prevSlide(elements: GalleryElements, state: GalleryState): void {
  const prevIndex = (state.currentIndex - 1 + elements.images.length) % elements.images.length;
  goToSlide(elements, state, prevIndex);
}

/**
 * Inicia el autoplay del carrusel
 */
function startAutoplay(elements: GalleryElements, state: GalleryState): void {
  if (elements.images.length <= 1) return;

  state.autoplayInterval = setInterval(() => {
    nextSlide(elements, state);
  }, CONFIG.AUTOPLAY_INTERVAL);
}

/**
 * Detiene el autoplay del carrusel
 */
function stopAutoplay(state: GalleryState): void {
  if (state.autoplayInterval) {
    clearInterval(state.autoplayInterval);
    state.autoplayInterval = null;
  }
}

/**
 * Configura los controles del carrusel
 */
function setupCarousel(elements: GalleryElements, state: GalleryState): void {
  const { prevBtn, nextBtn, indicators } = elements;

  // Botón anterior
  prevBtn?.addEventListener("click", () => {
    stopAutoplay(state);
    prevSlide(elements, state);
    startAutoplay(elements, state);
  });

  // Botón siguiente
  nextBtn?.addEventListener("click", () => {
    stopAutoplay(state);
    nextSlide(elements, state);
    startAutoplay(elements, state);
  });

  // Indicadores
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      stopAutoplay(state);
      goToSlide(elements, state, index);
      startAutoplay(elements, state);
    });
  });

  // Iniciar autoplay
  startAutoplay(elements, state);
}

/**
 * Maneja la navegación con hash después de View Transitions
 */
function handleHashNavigation(): void {
  const hash = window.location.hash;
  
  if (hash) {
    setTimeout(() => {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, CONFIG.HASH_SCROLL_DELAY);
  }
}

/**
 * Inicializa la galería de imágenes y el lightbox
 */
export function initImageGallery(sliderSelector: string): void {
  const elements = getGalleryElements(sliderSelector);

  if (!elements.slider || elements.images.length === 0) {
    console.warn(`No se encontró galería con selector: ${sliderSelector}`);
    return;
  }

  const state: GalleryState = {
    currentIndex: 0,
    lightboxIndex: 0,
    autoplayInterval: null,
  };

  // Configurar lightbox
  setupLightbox(elements, state);

  // Configurar carrusel
  setupCarousel(elements, state);

  // Limpiar autoplay al salir de la página
  document.addEventListener("astro:before-preparation", () => {
    stopAutoplay(state);
  });
}

/**
 * Inicialización automática
 */
function autoInit(): void {
  document.addEventListener("DOMContentLoaded", () => {
    // Detectar tipo de página y selector apropiado
    const projectSlider = document.querySelector("[data-slider='project-slider']");
    const serviceSlider = document.querySelector("[data-slider='detail-slider']");

    if (projectSlider) {
      initImageGallery("[data-slider='project-slider']");
    } else if (serviceSlider) {
      initImageGallery("[data-slider='detail-slider']");
    }

    // Manejar navegación con hash
    handleHashNavigation();
  });

  // Re-ejecutar después de View Transitions
  document.addEventListener("astro:page-load", () => {
    const projectSlider = document.querySelector("[data-slider='project-slider']");
    const serviceSlider = document.querySelector("[data-slider='detail-slider']");

    if (projectSlider) {
      initImageGallery("[data-slider='project-slider']");
    } else if (serviceSlider) {
      initImageGallery("[data-slider='detail-slider']");
    }

    handleHashNavigation();
  });
}

// Auto-inicialización
if (typeof window !== "undefined") {
  autoInit();
}
