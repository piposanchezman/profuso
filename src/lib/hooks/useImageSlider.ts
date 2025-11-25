import { useEffect } from "react";

/**
 * Hook para slider automático de imágenes
 */
export function useImageSlider(dependencies: any[] = [], interval: number = 5000) {
  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    const sliders = document.querySelectorAll<HTMLElement>("[data-slider]");
    
    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= interval) {
        sliders.forEach((slider) => {
          const imgs = slider.querySelectorAll<HTMLImageElement>("img");
          if (imgs.length > 1) {
            const currentIndex = Array.from(imgs).findIndex(img => img.classList.contains("opacity-100"));
            const nextIndex = (currentIndex + 1) % imgs.length;
            
            requestAnimationFrame(() => {
              imgs[currentIndex]?.classList.replace("opacity-100", "opacity-0");
              imgs[nextIndex]?.classList.replace("opacity-0", "opacity-100");
            });
          }
        });
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(animate);
    };

    if (sliders.length > 0) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, dependencies);
}
