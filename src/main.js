import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants.js";
import { Game } from "./game.js";
import { Input } from "./input.js";

const canvas = document.querySelector("#game");

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const input = new Input();
const game = new Game(canvas, input);

game.start();
