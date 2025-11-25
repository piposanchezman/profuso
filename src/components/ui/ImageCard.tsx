import { useEffect, useState, useRef } from "react";

interface ImageCardProps {
  images: string[];
  alt?: string;
}

export default function ImageCard({ images, alt = "" }: ImageCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - lastUpdateRef.current;

      if (elapsed >= 5000) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        lastUpdateRef.current = now;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-4/3 overflow-hidden rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
        <span className="text-gray-500">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className="w-full aspect-4/3 overflow-hidden rounded-lg bg-gray-800 border border-gray-700 relative">
      {images.map((url, idx) => (
        <img
          key={idx}
          src={url}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            idx === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
      ))}
    </div>
  );
}
