"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = { label: string; heading: ReactNode; children: ReactNode };

const arrowClasses =
  "flex size-11 items-center justify-center rounded-full border border-brand-gold/40 text-brand-gold transition-colors hover:bg-brand-gold/10 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent";

/** Tira horizontal con scroll-snap nativo; las flechas avanzan casi un ancho visible. */
export function CarouselTrack({ label, heading, children }: Props) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    const update = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      setEdges({ atStart: track.scrollLeft <= 4, atEnd: track.scrollLeft >= maxScroll - 4 });
    };
    // ResizeObserver avisa al empezar a observar, así que también fija el estado inicial.
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(track);
    track.addEventListener("scroll", update, { passive: true });
    return () => {
      resizeObserver.disconnect();
      track.removeEventListener("scroll", update);
    };
  }, []);

  function scroll(direction: 1 | -1) {
    const track = ref.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.8 });
  }

  return (
    <>
      <div className="flex items-end justify-between gap-6">
        {heading}
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button type="button" aria-label="Anteriores" disabled={edges.atStart} onClick={() => scroll(-1)} className={arrowClasses}>
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button type="button" aria-label="Siguientes" disabled={edges.atEnd} onClick={() => scroll(1)} className={arrowClasses}>
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>

      <ul
        ref={ref}
        aria-label={label}
        className="-mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] motion-reduce:scroll-auto sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:mt-12 lg:scroll-px-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
    </>
  );
}
