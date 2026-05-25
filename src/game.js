import { GAME_STATES } from "./constants.js";
import { createInitialState } from "./state.js";
import { render } from "./renderer.js";
import { advanceDialogue, startSystemDialogue, tryStartDialogue } from "./systems/dialogue.js";
import { setFlag } from "./systems/flags.js";
import { updateMapTransition } from "./systems/mapManager.js";
import { updatePlayerMovement } from "./systems/movement.js";
import { startRace, updateRace } from "./systems/race.js";

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

    if (this.state.screen === GAME_STATES.CREW) {
      if (this.input.wasPressed("KeyC", "Escape")) {
        this.state.screen = GAME_STATES.TEST_MAP;
      }

      return;
    }

    if (this.state.screen === GAME_STATES.RACE_SETUP) {
      if (this.input.wasPressed("Escape")) {
        this.state.screen = GAME_STATES.TEST_MAP;
      }

      if (this.input.wasPressed("Space", "Enter")) {
        setFlag(this.state, "caldecotte_race_briefing_seen");
        startRace(this.state, "caldecotte", "caldecotte-200m");
      }

      return;
    }

    if (this.state.screen === GAME_STATES.RACE) {
      updateRace(this.state, this.input, delta);
      return;
    }

    if (this.state.screen === GAME_STATES.RACE_RESULT) {
      if (this.input.wasPressed("Space", "Enter", "Escape")) {
        this.state.screen = GAME_STATES.TEST_MAP;
        startSystemDialogue(this.state, "Coach Tim", [
          this.state.race.result === "win" ? "That will do for a first run." : "Not clean enough yet.",
          "For now, we'll head back to the lake while the race system gets built properly.",
        ]);
      }

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

      if (this.input.wasPressed("KeyC")) {
        this.state.screen = GAME_STATES.CREW;
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
        "This is Caldecotte Lake. Prototype version, naturally.",
        "The crew are scattered around the lake. Go have a look before we even think about racing.",
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
