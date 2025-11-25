interface DeleteButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

export function DeleteButton({ onClick }: DeleteButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute top-2 right-2 bg-red-600 text-white rounded-md px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
      aria-label="Eliminar"
    >
      ✕
    </button>
  );
}

interface EntityCardProps {
  onClick: () => void;
  onDelete: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function EntityCard({
  onClick,
  onDelete,
  className = "",
  style,
  children,
}: EntityCardProps) {
  return (
    <div
      className={`relative group p-4 rounded-lg border border-gray-700 space-y-3 cursor-pointer hover:scale-[1.02] transition transform ${className}`}
      style={style}
      onClick={onClick}
    >
      <DeleteButton
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      />
      {children}
    </div>
  );
}

interface SectionProps {
  title: string;
  buttonLabel: string;
  onNew: () => void;
  children: React.ReactNode;
}

export function Section({
  title,
  buttonLabel,
  onNew,
  children,
}: SectionProps) {
  return (
    <section className="mb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">{title}</h2>
          <div className="h-1 w-full bg-linear-to-r from-blue-500 to-teal-500 rounded-full"></div>
        </div>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {buttonLabel}
        </button>
      </div>
      {children}
    </section>
  );
}
