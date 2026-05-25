import { GAME_STATES } from "./constants.js";
import { createAssetState } from "./systems/assets.js";
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
    assets: createAssetState(),
    progress: createProgressState(),
    dialogue: createDialogueState(),
    raceSetup: {
      raceDayId: "",
    },
    race: {
      raceDayId: "",
      raceId: "",
      elapsed: 0,
      progress: 0,
      rivalProgress: 0,
      speedBoost: 0,
      beatTimer: 0,
      beatInterval: 0,
      notes: [],
      feedback: "",
      feedbackTimer: 0,
      perfect: 0,
      good: 0,
      misses: 0,
      taps: 0,
      result: "",
    },
    ...createMapState("caldecotte-lake"),
  };
}
