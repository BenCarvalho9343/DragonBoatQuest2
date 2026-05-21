import { GAME_STATES } from "./constants.js";

export function createInitialState() {
  return {
    screen: GAME_STATES.TITLE,
    elapsed: 0,
  };
}
