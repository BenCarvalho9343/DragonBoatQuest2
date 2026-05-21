import { GAME_STATES } from "./constants.js";
import { testMap } from "./maps/testMap.js";

export function createInitialState() {
  return {
    screen: GAME_STATES.TITLE,
    elapsed: 0,
    map: testMap,
    player: {
      x: testMap.start.x,
      y: testMap.start.y,
      width: 22,
      height: 28,
      direction: "down",
      moving: false,
    },
    camera: {
      x: 0,
      y: 0,
    },
  };
}
