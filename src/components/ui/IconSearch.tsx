import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

interface IconSearchProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
  category?: string;
  placeholder?: string;
}

// Iconos populares por categoría como fallback
const POPULAR_ICONS = {
  social: [
    "mdi:facebook", "mdi:instagram", "mdi:twitter", "mdi:linkedin",
    "mdi:youtube", "mdi:whatsapp", "mdi:telegram", "mdi:tiktok",
    "mdi:github", "mdi:pinterest", "mdi:snapchat", "mdi:discord",
    "mdi:reddit", "mdi:tumblr", "mdi:twitch", "mdi:vimeo",
    "simple-icons:facebook", "simple-icons:instagram", "simple-icons:twitter", "simple-icons:linkedin",
    "simple-icons:youtube", "simple-icons:whatsapp", "simple-icons:telegram", "simple-icons:tiktok",
    "fa-brands:facebook", "fa-brands:instagram", "fa-brands:twitter", "fa-brands:linkedin"
  ],
  contact: [
    "mdi:phone", "mdi:email", "mdi:map-marker", "mdi:web",
    "mdi:cellphone", "mdi:home", "mdi:office-building", "mdi:fax",
    "mdi:message", "mdi:chat", "mdi:email-outline", "mdi:phone-classic",
    "mdi:clock", "mdi:map", "mdi:at", "mdi:domain",
    "mdi:phone-outline", "mdi:map-marker-outline", "mdi:web-box",
    "heroicons:phone", "heroicons:envelope", "heroicons:map-pin",
    "ic:baseline-phone", "ic:baseline-email", "ic:baseline-location-on"
  ],
  default: [
    "mdi:account", "mdi:heart", "mdi:star", "mdi:check",
    "mdi:close", "mdi:menu", "mdi:home", "mdi:search",
    "mdi:settings", "mdi:information", "mdi:help", "mdi:calendar",
    "mdi:shopping", "mdi:cart", "mdi:bookmark", "mdi:tag",
    "mdi:pencil", "mdi:delete", "mdi:plus", "mdi:minus",
    "heroicons:home", "heroicons:user", "heroicons:cog", "heroicons:search"
  ]
};

// Función helper para determinar la categoría basada en el string
function getCategoryFromString(categoryStr: string): keyof typeof POPULAR_ICONS {
  const lower = categoryStr.toLowerCase();
  if (lower.includes('social') || lower.includes('media') || lower.includes('brand')) {
    return 'social';
  }
  if (lower.includes('contact') || lower.includes('communication')) {
    return 'contact';
  }
  return 'default';
}

export default function IconSearch({
  selectedIcon,
  onSelectIcon,
  category = "",
  placeholder = "Buscar icono..."
}: IconSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [icons, setIcons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Mostrar iconos populares cuando no hay búsqueda
  useEffect(() => {
    if (searchTerm.length === 0) {
      const popularCategory = getCategoryFromString(category);
      setIcons(POPULAR_ICONS[popularCategory]);
    }
  }, [searchTerm, category]);

  // Búsqueda de iconos usando la API de Iconify
  useEffect(() => {
    const searchIcons = async () => {
      if (searchTerm.length < 2) {
        return;
      }

      setLoading(true);
      try {
        // Primero intentar búsqueda local en iconos populares
        const allIcons = [...POPULAR_ICONS.social, ...POPULAR_ICONS.contact, ...POPULAR_ICONS.default];
        const localResults = allIcons.filter(icon => 
          icon.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Si hay resultados locales, usarlos primero
        if (localResults.length > 0) {
          setIcons(localResults);
          setLoading(false);
          return;
        }

        // Intentar con la API de Iconify
        const query = category ? `${category} ${searchTerm}` : searchTerm;
        const response = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=48`,
          { signal: AbortSignal.timeout(5000) } // Timeout de 5 segundos
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Respuesta de la API:", data);

        // La API devuelve diferentes formatos dependiendo de la versión
        let iconList: string[] = [];
        
        if (Array.isArray(data.icons)) {
          iconList = data.icons;
        } else if (data.icons && typeof data.icons === 'object') {
          // Si es un objeto, combinar todos los arrays de diferentes colecciones
          iconList = Object.entries(data.icons).flatMap(([prefix, icons]: [string, any]) => {
            if (Array.isArray(icons)) {
              return icons.map(icon => `${prefix}:${icon}`);
            }
            return [];
          });
        } else if (data.iconify) {
          // Formato alternativo de la API
          iconList = Object.entries(data.iconify).flatMap(([prefix, icons]: [string, any]) => {
            if (Array.isArray(icons)) {
              return icons.map(icon => `${prefix}:${icon}`);
            }
            return [];
          });
        }
        
        // Combinar resultados de API con resultados locales
        setIcons([...localResults, ...iconList].slice(0, 48));
      } catch (error) {
        console.error("Error buscando iconos:", error);
        
        // Fallback a búsqueda local más amplia
        const allIcons = [...POPULAR_ICONS.social, ...POPULAR_ICONS.contact, ...POPULAR_ICONS.default];
        const localResults = allIcons.filter(icon => {
          const iconName = icon.split(':')[1] || icon;
          return iconName.toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        setIcons(localResults.length > 0 ? localResults : []);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchIcons, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, category]);

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
        />
        <Icon 
          icon="mdi:magnify" 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Icono seleccionado actual */}
      {selectedIcon && (
        <div className="p-4 bg-gray-900/50 rounded-xl border border-blue-500/50">
          <p className="text-xs text-gray-400 mb-2">Icono seleccionado:</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
              <Icon icon={selectedIcon} className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{selectedIcon}</p>
              <button
                type="button"
                onClick={() => setSearchTerm(selectedIcon)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Buscar similar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de resultados */}
      {icons.length > 0 && (
        <div className="max-h-96 overflow-y-auto p-2 bg-gray-900/50 rounded-xl border border-gray-700">
          <p className="text-xs text-gray-400 mb-3 px-2">
            {icons.length} iconos encontrados
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {icons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => onSelectIcon(icon)}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                  selectedIcon === icon
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-gray-600 hover:border-gray-500 bg-gray-800"
                }`}
                title={icon}
              >
                <Icon icon={icon} className="w-6 h-6 mx-auto text-white" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {searchTerm.length >= 2 && !loading && icons.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Icon icon="mdi:image-search-outline" className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No se encontraron iconos</p>
          <p className="text-sm">Intenta con otro término de búsqueda</p>
        </div>
      )}

      {/* Ayuda */}
      {searchTerm.length === 0 && icons.length > 0 && (
        <div className="text-center py-2 text-gray-500 text-sm">
          <Icon icon="mdi:information-outline" className="w-6 h-6 mx-auto mb-2" />
          <p>Iconos populares o escribe para buscar más</p>
        </div>
      )}
    </div>
  );
}
