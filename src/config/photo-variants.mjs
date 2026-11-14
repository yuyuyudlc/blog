export const photoVariantDirectory = '/photo-variants';
export const photoVariantSizes = { thumbnail: 640, display: 1920 };

export function photoVariantPath(hash, size) {
  return `${photoVariantDirectory}/${hash}-v1-${size}.webp`;
}
