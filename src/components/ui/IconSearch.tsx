import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

interface IconSearchProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
  category?: string;
  placeholder?: string;
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

  // Búsqueda de iconos usando la API de Iconify
  useEffect(() => {
    const searchIcons = async () => {
      if (searchTerm.length < 2) {
        setIcons([]);
        return;
      }

      setLoading(true);
      try {
        // Usar la API de Iconify para buscar iconos
        const query = category ? `${category} ${searchTerm}` : searchTerm;
        const response = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=48`
        );
        const data = await response.json();

        if (data.icons) {
          // Formatear los iconos como "prefix:name"
          const iconList = data.icons.map((icon: string) => icon);
          setIcons(iconList);
        }
      } catch (error) {
        console.error("Error buscando iconos:", error);
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
      {searchTerm.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          <Icon icon="mdi:information-outline" className="w-8 h-8 mx-auto mb-2" />
          <p>Escribe para buscar iconos</p>
          <p className="text-xs mt-1">Ejemplo: "facebook", "email", "phone"</p>
        </div>
      )}
    </div>
  );
}
