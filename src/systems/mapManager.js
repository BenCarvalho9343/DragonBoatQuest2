import { CANVAS_HEIGHT, CANVAS_WIDTH, TILE_SIZE } from "../constants.js";
import { getMap } from "../maps/index.js";

export function createMapState(mapId, spawnId) {
  const map = getMap(mapId);
  const spawn = getSpawn(map, spawnId);

  const state = {
    map,
    currentMapId: map.id,
    player: {
      x: spawn.x,
      y: spawn.y,
      width: 22,
      height: 28,
      direction: spawn.direction,
      moving: false,
    },
    camera: {
      x: 0,
      y: 0,
    },
    transition: {
      message: "",
      timer: 0,
    },
  };

  updateCamera(state);
  return state;
}

export function changeMap(state, mapId, spawnId) {
  const map = getMap(mapId);
  const spawn = getSpawn(map, spawnId);

  state.map = map;
  state.currentMapId = map.id;
  state.player.x = spawn.x;
  state.player.y = spawn.y;
  state.player.direction = spawn.direction;
  state.player.moving = false;
  state.transition.message = map.name;
  state.transition.timer = 1.4;

  updateCamera(state);
}

export function updateMapTransition(state, delta) {
  if (state.transition.timer > 0) {
    state.transition.timer = Math.max(0, state.transition.timer - delta);
  }
}

export function checkForMapExit(state) {
  const centerTileX = Math.floor((state.player.x + state.player.width / 2) / TILE_SIZE);
  const centerTileY = Math.floor((state.player.y + state.player.height / 2) / TILE_SIZE);
  const exit = state.map.exits.find((candidate) => isInsideExit(candidate, centerTileX, centerTileY));

  if (exit) {
    changeMap(state, exit.targetMap, exit.targetSpawn);
  }
}

export function updateCamera(state) {
  const mapPixelWidth = state.map.width * TILE_SIZE;
  const mapPixelHeight = state.map.height * TILE_SIZE;
  const targetX = state.player.x + state.player.width / 2 - CANVAS_WIDTH / 2;
  const targetY = state.player.y + state.player.height / 2 - CANVAS_HEIGHT / 2;

  state.camera.x = clamp(targetX, 0, Math.max(0, mapPixelWidth - CANVAS_WIDTH));
  state.camera.y = clamp(targetY, 0, Math.max(0, mapPixelHeight - CANVAS_HEIGHT));
}

function getSpawn(map, spawnId) {
  const resolvedSpawnId = spawnId ?? map.defaultSpawn;
  const spawn = map.spawns[resolvedSpawnId];

  if (!spawn) {
    throw new Error(`Unknown spawn "${resolvedSpawnId}" for map "${map.id}"`);
  }

  return spawn;
}

function isInsideExit(exit, tileX, tileY) {
  return (
    tileX >= exit.x &&
    tileX < exit.x + exit.width &&
    tileY >= exit.y &&
    tileY < exit.y + exit.height
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
