interface SectionHeaderProps {
  title: string;
  animate?: boolean;
}

export default function SectionHeader({ title, animate = true }: SectionHeaderProps) {
  return (
    <h2
      data-animate={animate ? "fade-up" : undefined}
      className="text-center text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-teal-400"
    >
      {title}
    </h2>
  );
}
