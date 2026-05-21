import { GAME_STATES } from "./constants.js";
import { createDialogueState } from "./systems/dialogue.js";
import { createProgressState } from "./systems/flags.js";
import { createMapState } from "./systems/mapManager.js";

export function createInitialState() {
  return {
    screen: GAME_STATES.TITLE,
    elapsed: 0,
    playerName: "",
    nameEntry: {
      value: "",
      maxLength: 12,
    },
    progress: createProgressState(),
    dialogue: createDialogueState(),
    ...createMapState("test-field"),
  };
}
