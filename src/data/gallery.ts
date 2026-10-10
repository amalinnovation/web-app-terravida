type Media = {
  id: string;
  alt: string;
  orientation: "portrait" | "landscape";
  /** Aparece en el carrusel de la portada. */
  featured?: boolean;
};

export type GalleryImage = Media & { type: "image"; src: string };
/** `poster` es el primer fotograma del video, guardado como imagen. */
export type GalleryVideo = Media & { type: "video"; src: string; poster: string };
export type GalleryItem = GalleryImage | GalleryVideo;

type Options = Pick<Media, "featured"> & { landscape?: boolean };

function photo(number: string, alt: string, { featured, landscape }: Options = {}): GalleryImage {
  return {
    id: `foto-${number}`,
    type: "image",
    src: `/assets/foto-${number}.jpeg`,
    alt,
    orientation: landscape ? "landscape" : "portrait",
    featured,
  };
}

function video(number: string, alt: string, { featured }: Options = {}): GalleryVideo {
  return {
    id: `video-${number}`,
    type: "video",
    src: `/assets/video-${number}.mp4`,
    poster: `/assets/posters/video-${number}.jpg`,
    alt,
    orientation: "portrait",
    featured,
  };
}

/** Máximo de fotos y videos que muestra el carrusel de la portada. */
export const carouselLimit = 6;

// El orden de esta lista es el orden en que se ven en el carrusel y en la galería.
export const gallery: GalleryItem[] = [
  video("01", "Video de bienvenida a El Convento, Santo Domingo, al atardecer", { featured: true }),
  photo("01", "Portón de acceso a Refugio El Convento iluminado al anochecer", { featured: true, landscape: true }),
  photo("02", "Camino interior con vista al valle y al mar al atardecer", { featured: true }),
  video("02", "Recorrido por la pradera con el sol sobre el horizonte", { featured: true }),
  photo("04", "Camino interior con estacas de deslinde y el mar al fondo", { featured: true }),
  photo("09", "Puesta de sol detrás de un pino joven", { featured: true }),
  photo("03", "Pradera verde con el sol bajando sobre el valle"),
  video("08", "Pradera con un pino solitario y el sol poniéndose"),
  photo("05", "Vista al océano desde el terreno al atardecer"),
  video("03", "Puesta de sol sobre el valle vista desde la pradera"),
  photo("06", "Estaca que marca el deslinde entre los lotes 34 y 33"),
  photo("07", "Sol ocultándose sobre el valle"),
  video("11", "Camino interior junto a la pradera con el mar al fondo"),
  photo("08", "Atardecer entre los árboles del terreno"),
  video("04", "Cielo anaranjado sobre el valle al atardecer"),
  photo("10", "Sol anaranjado junto a un pino al atardecer"),
  video("05", "Atardecer entre árboles nativos"),
  photo("11", "Pradera y árboles con los últimos rayos de sol"),
  video("06", "Sol tocando el horizonte sobre la pradera"),
  photo("12", "Atardecer sobre la pradera con árboles a contraluz"),
  video("07", "Sol sobre el valle visto desde la vegetación nativa"),
  photo("13", "Últimas luces del día sobre la pradera"),
  video("09", "Vista panorámica del valle al atardecer"),
  photo("14", "Estacas de deslinde en la pradera al atardecer"),
  video("10", "Vista despejada hacia el mar desde la altura"),
  video("12", "Pradera con el sol bajo sobre el horizonte"),
];

export const carouselItems = gallery.filter((item) => item.featured).slice(0, carouselLimit);
