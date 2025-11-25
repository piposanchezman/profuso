import { useState } from "react";
import { Icon } from "@iconify/react";

interface SortableItem {
  _id?: any;
  order: number;
}

interface SortableListProps<T extends SortableItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  className?: string;
}

export default function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
  onEdit,
  onDelete,
  className = "grid sm:grid-cols-2 lg:grid-cols-4 gap-6",
}: SortableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    // Actualizar el orden
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    setDraggedIndex(index);
    onReorder(reorderedItems);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    onReorder(reorderedItems);
  };

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={item._id?.toString() || index}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`relative group cursor-grab active:cursor-grabbing transition-all duration-200 ${
            draggedIndex === index ? "opacity-50 scale-95" : "hover:scale-[1.01]"
          }`}
        >
          {/* Controles de orden */}
          <div className="absolute -bottom-3 -left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveItem(index, "up");
              }}
              disabled={index === 0}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full shadow-lg transition"
              title="Mover a la izquierda"
            >
              <Icon icon="mdi:chevron-left" className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute -bottom-3 -right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveItem(index, "down");
              }}
              disabled={index === items.length - 1}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full shadow-lg transition"
              title="Mover a la derecha"
            >
              <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            </button>
          </div>

          {/* Indicador de orden */}
          <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
            {index + 1}
          </div>

          {/* Contenido del item */}
          <div
            onClick={() => onEdit?.(item)}
            className="h-full"
          >
            {renderItem(item, index)}
          </div>

          {/* Botón eliminar */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-md px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              title="Eliminar"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
