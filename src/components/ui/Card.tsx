import type { ComponentProps } from "react";

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`reticle-corner rounded-2xl border border-brand-gold/25 bg-brand-card shadow-dark-card transition-colors hover:border-brand-gold/50 ${className}`}
      {...props}
    />
  );
}
