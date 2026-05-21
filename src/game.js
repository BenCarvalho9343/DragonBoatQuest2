import { GAME_STATES } from "./constants.js";
import { createInitialState } from "./state.js";
import { render } from "./renderer.js";
import { updatePlayerMovement } from "./systems/movement.js";

export class Game {
  constructor(canvas, input) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.input = input;
    this.state = createInitialState();
    this.lastTime = 0;
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    requestAnimationFrame((time) => this.loop(time));
  }

  loop(time) {
    if (!this.isRunning) {
      return;
    }

    const delta = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    this.update(delta);
    render(this.context, this.state);
    this.input.finishFrame();

    requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  update(delta) {
    this.state.elapsed += delta;

    if (this.state.screen === GAME_STATES.TITLE && this.input.wasPressed("Enter", "Space")) {
      this.state.screen = GAME_STATES.TEST_MAP;
    }

    if (this.state.screen === GAME_STATES.TEST_MAP) {
      updatePlayerMovement(this.state, this.input, delta);
    }
  }
}
