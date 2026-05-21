import { GAME_STATES } from "./constants.js";
import { createMapState } from "./systems/mapManager.js";

export function createInitialState() {
  return {
    screen: GAME_STATES.TITLE,
    elapsed: 0,
    ...createMapState("test-field"),
  };
}
