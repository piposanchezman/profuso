import { useFetchData } from "@lib/hooks/useFetchData";
import { useImageSlider } from "@lib/hooks/useImageSlider";
import SectionHeader from "@components/ui/SectionHeader";
import ImageSlider from "@components/ui/ImageSlider";
import type { Service } from "@lib/models";

export default function Services() {
  const { data: services, error } = useFetchData<Service>("/api/services");
  
  useImageSlider([services]);

  if (error) {
    return (
      <section id="services" className="py-32 text-center text-red-400">
        {error}
      </section>
    );
  }

  const isOdd = services.length % 2 === 1;

  return (
    <section
      id="services"
      className="relative flex flex-col items-center justify-center text-center min-h-dvh py-16 sm:py-20 md:py-24 lg:py-32"
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 space-y-12 sm:space-y-16">
        {/* Título */}
        <SectionHeader title="NUESTROS SERVICIOS" />

        {/* Grid */}
        <div className="grid mx-auto gap-8 sm:gap-10 grid-cols-1 lg:grid-cols-2">
          {services.map((service, index) => {
            const linkHref = `/services/${index}`;
            const isLastAndOdd = isOdd && index === services.length - 1;

            return (
              <div
                key={index}
                data-animate="fade-up"
                className={`flip-container group w-full max-w-lg aspect-4/3 ${
                  isLastAndOdd ? "lg:col-span-2 mx-auto" : "mx-auto"
                }`}
              >
                <div className="flip-inner rounded-2xl shadow-lg border border-gray-700/50 bg-gray-900/40">
                  {/* Cara frontal */}
                  <div className="flip-face flip-front">
                    <div className="relative w-full h-full overflow-hidden">
                      <ImageSlider 
                        images={service.images || []} 
                        alt={service.title} 
                      />

                      {/* Título */}
                      <div className="absolute inset-x-0 bottom-0 bg-black/65 backdrop-blur-sm px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-center">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white text-center uppercase tracking-wide">
                          {service.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Cara trasera */}
                  <div
                    className="flip-face flip-back flex flex-col justify-center items-center p-6 sm:p-8 text-center"
                    style={{
                      backgroundImage: `linear-gradient(145deg, ${service.fromColor}, ${service.toColor})`,
                    }}
                  >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 uppercase tracking-wide text-white">
                      {service.title}
                    </h3>

                    <p className="text-gray-100 text-sm sm:text-base md:text-lg leading-relaxed max-w-md mx-auto mb-6 line-clamp-3">
                      {service.description}
                    </p>

                    <a
                      href={linkHref}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-white bg-black/60 backdrop-blur-sm border border-white/20 hover:bg-black/80 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Ver más información →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
