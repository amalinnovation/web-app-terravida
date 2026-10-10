import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { carouselItems, carouselLimit, gallery } from "./gallery";

const publicDir = fileURLToPath(new URL("../../public", import.meta.url));

describe("galería", () => {
  it("cada foto, video y portada existe en public/", () => {
    const paths = gallery.flatMap((item) => (item.type === "video" ? [item.src, item.poster] : [item.src]));
    const missing = paths.filter((path) => !existsSync(`${publicDir}${path}`));

    expect(missing).toEqual([]);
  });

  it("no repite ítems", () => {
    const ids = gallery.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("el carrusel muestra entre 5 y 6 ítems, con fotos y videos", () => {
    expect(carouselItems.length).toBeGreaterThanOrEqual(5);
    expect(carouselItems.length).toBeLessThanOrEqual(carouselLimit);
    expect(carouselItems.some((item) => item.type === "image")).toBe(true);
    expect(carouselItems.some((item) => item.type === "video")).toBe(true);
  });

  it("la galería tiene más contenido que el carrusel", () => {
    expect(gallery.length).toBeGreaterThan(carouselItems.length);
  });
});
