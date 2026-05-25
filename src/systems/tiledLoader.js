import { TILE_SIZE } from "../constants.js";
import { loadImage } from "./assets.js";

const TILED_TILE_SIZE = 16;
const TILED_SCALE = TILE_SIZE / TILED_TILE_SIZE;

const NPC_DEFINITIONS = {
  "coach tim": {
    id: "coach-tim-caldecotte",
    name: "Coach Tim",
    dialogueId: "coachTimCaldecotte",
    color: "npc",
  },
  lesley: {
    id: "lesley-caldecotte",
    name: "Lesley",
    dialogueId: "lesleyCaldecotte",
    color: "npcAlt",
  },
  marcus: {
    id: "marcus-caldecotte",
    name: "Marcus",
    dialogueId: "marcusCaldecotte",
    color: "npcAlt",
  },
  dan: {
    id: "dan-caldecotte",
    name: "Dan",
    dialogueId: "danCaldecotte",
    color: "npcAlt",
  },
  naomi: {
    id: "naomi-caldecotte",
    name: "Naomi",
    dialogueId: "naomiCaldecotte",
    color: "npcAlt",
  },
  "club member": {
    id: "noticeboard-member-caldecotte",
    name: "Club Member",
    dialogueId: "noticeboardMemberCaldecotte",
    color: "npc",
  },
  spectator: {
    id: "spectator-caldecotte",
    name: "Spectator",
    dialogueId: "spectatorCaldecotte",
    color: "npc",
  },
  "junior paddler": {
    id: "junior-paddler-caldecotte",
    name: "Junior Paddler",
    dialogueId: "juniorPaddlerCaldecotte",
    color: "npc",
  },
};

const INTERACTABLE_DEFINITIONS = {
  dock: {
    id: "caldecotte-dock",
    name: "Dock",
    dialogueId: "caldecotteDock",
  },
};

export async function loadTiledMap(mapUrl, mapId, name) {
  const response = await fetch(mapUrl);

  if (!response.ok) {
    throw new Error(`Could not load Tiled map: ${mapUrl}`);
  }

  const tiledMap = await response.json();
  const tileset = tiledMap.tilesets[0];
  const mapBaseUrl = new URL(mapUrl, window.location.href);
  const imageUrl = new URL(tileset.image, mapBaseUrl).href;
  const image = await loadImage(imageUrl);
  const tileLayers = tiledMap.layers.filter((layer) => layer.type === "tilelayer");
  const objectLayers = Object.fromEntries(
    tiledMap.layers.filter((layer) => layer.type === "objectgroup").map((layer) => [layer.name, layer.objects ?? []]),
  );

  return {
    id: mapId,
    name,
    width: tiledMap.width,
    height: tiledMap.height,
    defaultSpawn: "start",
    spawns: createSpawns(objectLayers.spawns ?? []),
    exits: [],
    npcs: createNpcs(objectLayers.npcs ?? []),
    interactables: createInteractables(objectLayers.interactables ?? []),
    collisionShapes: createCollisionShapes(objectLayers.collisions ?? []),
    tiled: {
      image,
      tileWidth: tiledMap.tilewidth,
      tileHeight: tiledMap.tileheight,
      scale: TILED_SCALE,
      columns: tileset.columns,
      firstGid: tileset.firstgid,
      layers: tileLayers,
    },
    tiles: createWalkableTiles(tiledMap.width, tiledMap.height),
    solidTiles: [],
  };
}

function createSpawns(objects) {
  const spawns = {};

  for (const object of objects) {
    spawns[toKey(object.name)] = {
      x: object.x * TILED_SCALE,
      y: object.y * TILED_SCALE,
      direction: "down",
    };
  }

  return spawns;
}

function createNpcs(objects) {
  return objects.map((object) => {
    const definition = NPC_DEFINITIONS[toKey(object.name)] ?? {
      id: toId(object.name),
      name: object.name,
      dialogueId: toId(object.name),
      color: "npc",
    };

    return {
      ...definition,
      x: Math.floor((object.x * TILED_SCALE) / TILE_SIZE),
      y: Math.floor((object.y * TILED_SCALE) / TILE_SIZE),
      width: 1,
      height: 1,
    };
  });
}

function createInteractables(objects) {
  return objects.map((object) => {
    const definition = INTERACTABLE_DEFINITIONS[toKey(object.name)] ?? {
      id: toId(object.name),
      name: object.name,
      dialogueId: toId(object.name),
    };
    const left = Math.floor((object.x * TILED_SCALE) / TILE_SIZE);
    const top = Math.floor((object.y * TILED_SCALE) / TILE_SIZE);
    const right = Math.ceil(((object.x + object.width) * TILED_SCALE) / TILE_SIZE);
    const bottom = Math.ceil(((object.y + object.height) * TILED_SCALE) / TILE_SIZE);

    return {
      ...definition,
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
    };
  });
}

function createCollisionShapes(objects) {
  return objects.map((object) => {
    const points = object.polygon
      ? object.polygon.map((point) => ({
          x: (object.x + point.x) * TILED_SCALE,
          y: (object.y + point.y) * TILED_SCALE,
        }))
      : [
          { x: object.x * TILED_SCALE, y: object.y * TILED_SCALE },
          { x: (object.x + object.width) * TILED_SCALE, y: object.y * TILED_SCALE },
          { x: (object.x + object.width) * TILED_SCALE, y: (object.y + object.height) * TILED_SCALE },
          { x: object.x * TILED_SCALE, y: (object.y + object.height) * TILED_SCALE },
        ];

    return {
      id: toId(object.name),
      points,
    };
  });
}

function createWalkableTiles(width, height) {
  return Array.from({ length: height }, () => "G".repeat(width));
}

function toKey(value) {
  return value.trim().toLowerCase();
}

function toId(value) {
  return toKey(value).replaceAll(" ", "-");
}
