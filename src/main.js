import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants.js";
import { Game } from "./game.js";
import { Input } from "./input.js";
import { registerMap } from "./maps/index.js";
import { loadGameAssets } from "./systems/assets.js";
import { loadTiledMap } from "./systems/tiledLoader.js";

const canvas = document.querySelector("#game");

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.focus();
canvas.addEventListener("click", () => canvas.focus());

const input = new Input();

Promise.all([
  loadTiledMap("./assets/maps/caldecotte-lake.json", "caldecotte-lake", "Caldecotte Lake"),
  loadGameAssets(),
])
  .then(([map, assets]) => {
    registerMap(map);
    const game = new Game(canvas, input, assets);
    game.start();
  })
  .catch((error) => {
    console.error(error);
    const game = new Game(canvas, input);
    game.start();
  });
