import { useState, useEffect } from "react";
import IconSearch from "@components/ui/IconSearch";
import ModalWrapper from "@components/ui/ModalWrapper";
import type { ContactInfo } from "@lib/models";

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingItem: ContactInfo | null;
}

export default function ContactInfoModal({
  isOpen,
  onClose,
  onSave,
  editingItem,
}: ContactInfoModalProps) {
  const [formData, setFormData] = useState({
    icon: "",
    title: "",
    content: "",
    order: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        icon: editingItem.icon,
        title: editingItem.title,
        content: editingItem.content,
        order: editingItem.order,
      });
    } else {
      setFormData({ icon: "mdi:phone", title: "", content: "", order: 0 });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingItem
        ? `/api/contact-info/${editingItem._id}`
        : "/api/contact-info";
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
      alert("Error al guardar la información de contacto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`${editingItem ? "Editar" : "Agregar"} Información de Contacto`}
      onSubmit={handleSubmit}
      loading={loading}
    >
      {/* Buscador de Iconos */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Buscar Icono
        </label>
        <IconSearch
          selectedIcon={formData.icon}
          onSelectIcon={(icon) => setFormData({ ...formData, icon })}
          category="contact communication"
          placeholder="Buscar icono (ej: phone, email, location...)"
        />
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Título
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
          placeholder="Ej: Teléfono"
        />
      </div>

      {/* Contenido */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Contenido
        </label>
        <input
          type="text"
          required
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
          placeholder="Ej: 320 855 4400"
        />
      </div>
    </ModalWrapper>
  );
}
