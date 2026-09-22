export const HOUSE_TYPE_IMAGES: Record<string, string> = {
  Piso: "/assets/house-types/piso.jpg",
  "Casa o chalet": "/assets/house-types/chalet.jpg",
  "Casa o chalet independiente": "/assets/house-types/chalet-independiente.jpg",
  Ático: "/assets/house-types/atico.jpg",
  Dúplex: "/assets/house-types/duplex.jpg",
  Estudio: "/assets/house-types/estudio.jpg",
  "Chalet adosado": "/assets/house-types/chalet-adosado.jpg",
  "Chalet pareado": "/assets/house-types/chalet-pareado.jpg",
  "Casa de pueblo": "/assets/house-types/casa-pueblo.jpg",
  "Casa rural": "/assets/house-types/casa-rural.jpg",
  "Finca rústica": "/assets/house-types/finca.jpg",
  Otros: "/assets/house-types/otros.jpg",
};

export function houseTypeImage(houseType: string): string {
  return HOUSE_TYPE_IMAGES[houseType] ?? HOUSE_TYPE_IMAGES.Otros;
}