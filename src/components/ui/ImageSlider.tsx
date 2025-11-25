interface ImageSliderProps {
  images: string[];
  alt: string;
}

export default function ImageSlider({ images, alt }: ImageSliderProps) {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
        <span className="text-gray-500 text-sm">Sin imagen</span>
      </div>
    );
  }

  return (
    <div data-slider className="relative w-full h-full overflow-hidden rounded-lg">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${alt} - ${idx + 1}`}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            idx === 0 ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
