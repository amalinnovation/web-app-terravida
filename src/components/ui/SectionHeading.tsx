type Props = { eyebrow: string; title: string; align?: "left" | "center" };

export function SectionHeading({ eyebrow, title, align = "center" }: Props) {
  return (
    <div className={align === "center" ? "mx-auto max-w-xl text-center" : ""}>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">{eyebrow}</p>
      <h2 className="font-serif text-3xl text-brand-ivory sm:text-4xl lg:text-[2.75rem] lg:leading-tight">{title}</h2>
    </div>
  );
}
