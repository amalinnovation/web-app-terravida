"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import { Lightbox } from "@/components/gallery/Lightbox";
import { Chip } from "@/components/ui/Chip";
import type { GalleryItem } from "@/data/gallery";

type Filter = "all" | GalleryItem["type"];

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: "image", label: "Fotos" },
  { value: "video", label: "Videos" },
];

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visible = filter === "all" ? items : items.filter((item) => item.type === filter);

  return (
    <>
      <div role="group" aria-label="Filtrar galería" className="flex flex-wrap justify-center gap-2.5">
        {filters.map(({ value, label }) => {
          const count = value === "all" ? items.length : items.filter((item) => item.type === value).length;
          return (
            <Chip key={value} selected={filter === value} onClick={() => setFilter(value)}>
              {label} <span className="font-medium opacity-70">({count})</span>
            </Chip>
          );
        })}
      </div>

      <ul className="mt-8 grid grid-flow-dense grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {visible.map((item, index) => (
          <li key={item.id} className={item.orientation === "landscape" ? "col-span-2" : ""}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Ampliar ${item.type === "video" ? "video" : "foto"}: ${item.alt}`}
              className={`group relative block size-full overflow-hidden rounded-xl border border-brand-gold/20 bg-brand-card transition-colors hover:border-brand-gold/60 ${
                item.orientation === "landscape" ? "aspect-[3/2]" : "aspect-[3/4]"
              }`}
            >
              <Image
                src={item.type === "video" ? item.poster : item.src}
                alt=""
                fill
                sizes={
                  item.orientation === "landscape"
                    ? "(min-width: 1024px) 580px, (min-width: 640px) 66vw, 100vw"
                    : "(min-width: 1024px) 290px, (min-width: 640px) 33vw, 50vw"
                }
                className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
              />
              {item.type === "video" && (
                <span className="glass-card absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-brand-gold">
                  <Play aria-hidden="true" className="size-5 translate-x-0.5 fill-current" />
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && (
        <Lightbox items={visible} index={openIndex} onChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
      )}
    </>
  );
}
