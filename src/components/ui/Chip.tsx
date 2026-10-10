import type { ComponentProps } from "react";

type Props = ComponentProps<"button"> & { selected: boolean };

export function Chip({ selected, className = "", ...props }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`min-h-11 whitespace-nowrap rounded-xl px-4 text-sm font-bold uppercase tracking-wider transition-colors ${
        selected ? "gold-btn" : "border border-brand-gold/25 text-brand-linen hover:border-brand-gold hover:text-white"
      } ${className}`}
      {...props}
    />
  );
}
