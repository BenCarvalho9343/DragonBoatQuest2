import { caldecotte } from "./caldecotte.js";
import { testMap } from "./testMap.js";
import { trainingYard } from "./trainingYard.js";

export const maps = {
  [caldecotte.id]: caldecotte,
  [testMap.id]: testMap,
  [trainingYard.id]: trainingYard,
};

export function registerMap(map) {
  maps[map.id] = map;
}

export function getMap(mapId) {
  const map = maps[mapId];

  if (!map) {
    throw new Error(`Unknown map: ${mapId}`);
  }

  return map;
}
