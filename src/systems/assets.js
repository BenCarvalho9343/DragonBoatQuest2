export function createAssetState() {
  return {
    images: {},
  };
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener("error", () => reject(new Error(`Could not load image: ${src}`)), { once: true });
    image.src = src;
  });
}

export async function loadGameAssets() {
  return {
    images: {
      characters: await loadImage("./assets/sprites/characters.png"),
    },
  };
}
