import type { ComponentProps } from "react";

type Variant = "gold" | "outline";
type Size = "sm" | "md";
type StyleProps = { variant?: Variant; size?: Size };

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const variants: Record<Variant, string> = {
  gold: "gold-btn shadow-gold-glow",
  outline: "border border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10",
};
const sizes: Record<Size, string> = {
  sm: "rounded-full px-4 text-xs",
  md: "rounded-xl px-6 py-3 text-sm",
};

function classes({ variant = "gold", size = "md" }: StyleProps, className = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={classes({ variant, size }, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<"a"> & StyleProps) {
  return <a className={classes({ variant, size }, className)} {...props} />;
}
