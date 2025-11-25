import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import IconSearch from "@components/ui/IconSearch";
import ModalWrapper from "@components/ui/ModalWrapper";
import { getSocialColor, getSocialName, getSocialUrlPlaceholder } from "@lib/utils/socialColors";
import type { SocialLink } from "@lib/models";

interface SocialLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingItem: SocialLink | null;
}

export default function SocialLinkModal({
  isOpen,
  onClose,
  onSave,
  editingItem,
}: SocialLinkModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    url: "",
    color: "hover:bg-gray-600",
    order: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        icon: editingItem.icon,
        url: editingItem.url,
        color: editingItem.color,
        order: editingItem.order,
      });
    } else {
      setFormData({
        name: "",
        icon: "mdi:web",
        url: "",
        color: "hover:bg-gray-600",
        order: 0,
      });
    }
  }, [editingItem, isOpen]);

  const handleIconSelect = (icon: string) => {
    const name = getSocialName(icon);
    const color = getSocialColor(icon);
    const urlPlaceholder = getSocialUrlPlaceholder(icon);
    
    setFormData({
      ...formData,
      icon,
      name: formData.name || name,
      color,
      url: formData.url || urlPlaceholder,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingItem
        ? `/api/social-links/${editingItem._id}`
        : "/api/social-links";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al guardar");

      onSave();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar la red social");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`${editingItem ? "Editar" : "Agregar"} Red Social`}
      onSubmit={handleSubmit}
      loading={loading}
    >
      {/* Buscador de Iconos */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Buscar Icono de Red Social
        </label>
        <IconSearch
          selectedIcon={formData.icon}
          onSelectIcon={handleIconSelect}
          category="social media brand"
          placeholder="Buscar icono (ej: facebook, instagram, tiktok...)"
        />
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Nombre
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
          placeholder="Ej: Facebook"
        />
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          URL
        </label>
        <input
          type="url"
          required
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
          placeholder={getSocialUrlPlaceholder(formData.icon)}
        />
        <p className="text-xs text-gray-400 mt-1">
          URL completa de tu perfil o página
        </p>
      </div>

      {/* Vista previa */}
      <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700">
        <p className="text-sm text-gray-400 mb-3">Vista previa:</p>
        <a
          href={formData.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gray-700 ${formData.color} text-white transition-colors`}
        >
          <Icon icon={formData.icon} className="w-6 h-6" />
          <span className="font-medium">{formData.name || "Red Social"}</span>
        </a>
        <p className="text-xs text-gray-500 mt-2">
          Color auto-detectado: {formData.color}
        </p>
      </div>
    </ModalWrapper>
  );
}
