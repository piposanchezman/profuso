import { useFetchData } from "@lib/hooks/useFetchData";
import { useImageSlider } from "@lib/hooks/useImageSlider";
import SectionHeader from "@components/ui/SectionHeader";
import ImageSlider from "@components/ui/ImageSlider";

interface Project {
  title: string;
  description?: string;
  images?: string[];
}

export default function Projects() {
  const { data: projects, error } = useFetchData<Project>("/api/projects");
  
  useImageSlider([projects]);

  if (error)
    return <section className="py-32 text-center text-red-400">{error}</section>;

  const remainder = projects.length % 3;

  return (
    <section
      id="projects"
      className="relative flex flex-col items-center py-16 sm:py-20 md:py-24 lg:py-32"
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 space-y-12 sm:space-y-16">

        {/* TÍTULO */}
        <SectionHeader title="PROYECTOS REALIZADOS" />

        {/* GRID DE TARJETAS */}
        <div
          className="
            grid
            grid-cols-1 lg:grid-cols-3 
            gap-8 sm:gap-10
            place-items-center
          "
        >
          {projects.map((project, index) => {
            const linkHref = `/projects/${index}`;
            const isFirstOfLastTwo = remainder === 2 && index === projects.length - 2;
            
            // Si es el primero de los últimos 2, renderiza ambos en un wrapper
            if (isFirstOfLastTwo) {
              return (
                <div key={`wrapper-${index}`} className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:px-[16.66%] w-full">
                  {[projects[index], projects[index + 1]].map((proj, i) => {
                    const cardHref = `/projects/${index + i}`;
                    return (
                    <div
                      key={index + i}
                      data-animate="zoom-in"
                      className="
                        relative group 
                        w-full max-w-lg mx-auto
                        rounded-xl overflow-hidden 
                        border border-gray-700/40 
                        bg-gray-800/40 shadow-lg 
                        backdrop-blur-sm
                        hover:shadow-xl
                        transition-all
                      "
                    >
                      {/* Contenido del proyecto */}
                      <div className="relative w-full aspect-4/3 overflow-hidden">
                        <ImageSlider 
                          images={proj.images || []} 
                          alt={proj.title} 
                        />
                        <div
                          className="
                            absolute bottom-0 left-0 w-full
                            bg-black/55 backdrop-blur-md
                            px-4 py-3
                            transition-opacity
                            group-hover:opacity-0
                          "
                        >
                          <h3 className="text-white text-lg font-semibold uppercase">{proj.title}</h3>
                        </div>
                      </div>
                      <div
                        className="
                          absolute inset-0
                          flex flex-col justify-between items-center text-center
                          px-6 py-6
                          bg-black/80 
                          opacity-0 group-hover:opacity-100
                          transition-all duration-500
                        "
                      >
                        <h3 className="text-white text-xl font-bold uppercase">{proj.title}</h3>
                        <p className="text-gray-200 text-sm leading-relaxed mt-3 line-clamp-5">
                          {proj.description ?? "Proyecto sin descripción registrada"}
                        </p>
                        <div className="mt-6 w-full">
                          <a
                            href={cardHref}
                            className="
                              block w-full px-6 py-2.5 
                              rounded-lg 
                              bg-white/10 backdrop-blur-sm
                              border border-white/30
                              text-white font-bold
                              hover:bg-white/20 hover:border-white/50
                              hover:scale-105
                              transition-all duration-300
                              shadow-lg
                            "
                          >
                            Ver más información →
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              );
            }
            
            // Omitir el último si ya se renderizó en el wrapper
            if (remainder === 2 && index === projects.length - 1) {
              return null;
            }
            
            const isSingleLast = remainder === 1 && index === projects.length - 1;
            
            return (
              <div
                key={index}
                data-animate="zoom-in"
                className="
                  relative group 
                  w-full max-w-lg 
                  rounded-xl overflow-hidden 
                  border border-gray-700/40 
                  bg-gray-800/40 shadow-lg 
                  backdrop-blur-sm
                  hover:shadow-xl
                  transition-all
                "
                style={isSingleLast ? { gridColumn: '2 / 3' } : {}}
              >
              {/* --- Cara frontal (IMAGEN + TÍTULO) --- */}
              <div className="relative w-full aspect-4/3 overflow-hidden">

                {/* Slider de imágenes */}
                <ImageSlider 
                  images={project.images || []} 
                  alt={project.title} 
                />

                {/* TÍTULO (mismo estilo que antes) */}
                <div
                  className="
                    absolute bottom-0 left-0 w-full
                    bg-black/55 backdrop-blur-md
                    px-4 py-3
                    transition-opacity
                    group-hover:opacity-0
                  "
                >
                  <h3 className="text-white text-lg font-semibold uppercase">{project.title}</h3>
                </div>
              </div>

              {/* --- Cara trasera (DESCRIPCIÓN + BOTÓN) --- */}
              <div
                className="
                  absolute inset-0
                  flex flex-col justify-between items-center text-center
                  px-6 py-6
                  bg-black/80 
                  opacity-0 group-hover:opacity-100
                  transition-all duration-500
                "
              >
                {/* TÍTULO atrás */}
                <h3 className="text-white text-xl font-bold uppercase">{project.title}</h3>

                {/* Descripción */}
                <p className="text-gray-200 text-sm leading-relaxed mt-3 line-clamp-4">
                  {project.description ?? "Proyecto sin descripción registrada"}
                </p>

                {/* BOTÓN */}
                <div className="mt-6 w-full">
                  <a
                    href={linkHref}
                    className="
                      block w-full px-6 py-2.5 
                      rounded-lg 
                      bg-white/10 backdrop-blur-sm
                      border border-white/30
                      text-white font-bold
                      hover:bg-white/20 hover:border-white/50
                      hover:scale-105
                      transition-all duration-300
                      shadow-lg
                    "
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
