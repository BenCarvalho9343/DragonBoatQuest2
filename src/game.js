import { GAME_STATES } from "./constants.js";
import { createInitialState } from "./state.js";
import { render } from "./renderer.js";
import { advanceDialogue, startSystemDialogue, tryStartDialogue } from "./systems/dialogue.js";
import { updateMapTransition } from "./systems/mapManager.js";
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
      this.state.screen = GAME_STATES.NAME_ENTRY;
      return;
    }

    if (this.state.screen === GAME_STATES.NAME_ENTRY) {
      this.updateNameEntry();
      return;
    }

    if (this.state.screen === GAME_STATES.TEST_MAP) {
      updateMapTransition(this.state, delta);
      if (this.state.dialogue.active) {
        if (this.input.wasPressed("Space", "Enter")) {
          advanceDialogue(this.state);
        }

        return;
      }

      if (this.input.wasPressed("Space")) {
        tryStartDialogue(this.state);
      }

      updatePlayerMovement(this.state, this.input, delta);
    }
  }

  updateNameEntry() {
    const entry = this.state.nameEntry;

    for (const character of this.input.consumeTypedCharacters()) {
      if (/^[a-z0-9 ]$/i.test(character) && entry.value.length < entry.maxLength) {
        entry.value += character;
      }
    }

    if (this.input.wasPressed("Backspace")) {
      entry.value = entry.value.slice(0, -1);
    }

    if (this.input.wasPressed("Enter") && entry.value.trim()) {
      this.state.playerName = entry.value.trim();
      this.state.screen = GAME_STATES.TEST_MAP;
      startSystemDialogue(this.state, "Coach Tim", [
        "Welcome to Secklow Hundred, [name].",
        "This is still a test field, but the game now knows your name.",
        "When this dialogue closes, you can move again.",
      ], [
        {
          type: "setFlag",
          flag: "opening_scene_complete",
        },
      ]);
    }
  }
}
