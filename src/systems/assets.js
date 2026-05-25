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
  const [playerDown, playerLeft, playerRight, playerUp] = await Promise.all([
    loadImage("./assets/sprites/character_down.png"),
    loadImage("./assets/sprites/character_left.png"),
    loadImage("./assets/sprites/character_right.png"),
    loadImage("./assets/sprites/character_up.png"),
  ]);

  return {
    images: {
      player: {
        down: playerDown,
        left: playerLeft,
        right: playerRight,
        up: playerUp,
      },
    },
  };
}
