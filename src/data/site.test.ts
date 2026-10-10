import { describe, expect, it } from "vitest";
import { site } from "./site";

describe("datos de contacto", () => {
  it("publica los dos números de Terravida", () => {
    expect(site.phones).toEqual(["+56 9 3372 2243", "+56 9 3377 3996"]);
    expect(site.whatsappNumber).toBe("56933722243");
  });

  it("enlaza TikTok y la ubicación exacta del proyecto", () => {
    expect(site.tiktok.url).toBe("https://www.tiktok.com/@terravida.parcelas");
    expect(site.mapsUrl).toBe("https://maps.google.com/?q=-33.788109,-71.603867");
  });
});
