"use client";

import Image from "next/image";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "@/data/gallery";

type Props = {
  items: GalleryItem[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
};

const controlClasses =
  "glass-card flex size-11 items-center justify-center rounded-full text-brand-gold transition-colors hover:text-white";

/** Visor a pantalla completa. Se monta abierto; Escape y el botón cerrar lo desmontan vía onClose. */
export function Lightbox({ items, index, onChange, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const item = items[index];

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const step = (delta: number) => onChange((index + delta + items.length) % items.length);

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  }

  return (
    <dialog
      ref={ref}
      aria-label="Visor de la galería"
      onClose={onClose}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-brand-black/95 p-0 text-brand-ivory backdrop:bg-black"
    >
      <div
        className="flex size-full flex-col items-center justify-center gap-4 px-4 py-16"
        onClick={(event) => {
          if (event.target === event.currentTarget) ref.current?.close();
        }}
      >
        {item.type === "video" ? (
          <video
            key={item.src}
            src={item.src}
            poster={item.poster}
            controls
            autoPlay
            playsInline
            aria-label={item.alt}
            className="max-h-[74dvh] max-w-full rounded-xl"
          />
        ) : (
          <div className="pointer-events-none relative h-[74dvh] w-full max-w-5xl">
            <Image key={item.src} src={item.src} alt={item.alt} fill sizes="(min-width: 1024px) 1024px, 100vw" className="object-contain" />
          </div>
        )}
        <p className="max-w-xl text-center text-sm text-brand-linen">
          {item.alt}
          <span className="ml-2 text-brand-muted">
            {index + 1} / {items.length}
          </span>
        </p>
      </div>

      <button type="button" aria-label="Cerrar" onClick={() => ref.current?.close()} className={`${controlClasses} absolute right-4 top-4`}>
        <X aria-hidden="true" className="size-5" />
      </button>
      <button type="button" aria-label="Anterior" onClick={() => step(-1)} className={`${controlClasses} absolute bottom-4 left-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2`}>
        <ChevronLeft aria-hidden="true" className="size-5" />
      </button>
      <button type="button" aria-label="Siguiente" onClick={() => step(1)} className={`${controlClasses} absolute bottom-4 right-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2`}>
        <ChevronRight aria-hidden="true" className="size-5" />
      </button>
    </dialog>
  );
}
