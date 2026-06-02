import { PLAYER_SPEED, TILE_SIZE } from "../constants.js";
import { startSystemDialogue } from "./dialogue.js";
import { checkForMapExit, updateCamera } from "./mapManager.js";

export function updatePlayerMovement(state, input, delta) {
  const player = state.player;
  const move = getMovementVector(input);

  player.moving = move.x !== 0 || move.y !== 0;

  if (!player.moving) {
    updateCamera(state);
    return;
  }

  player.direction = move.direction;

  const distance = PLAYER_SPEED * delta;
  const nextX = player.x + move.x * distance;
  const nextY = player.y + move.y * distance;

  if (!collidesWithMap(state.map, nextX, player.y, player.width, player.height)) {
    player.x = nextX;
  }

  if (!collidesWithMap(state.map, player.x, nextY, player.width, player.height)) {
    player.y = nextY;
  }

  const exitResult = checkForMapExit(state);
  if (exitResult?.blocked) {
    startSystemDialogue(state, "Route Closed", [exitResult.message]);
  }

  updateCamera(state);
}

function getMovementVector(input) {
  const left = input.isDown("ArrowLeft", "KeyA");
  const right = input.isDown("ArrowRight", "KeyD");
  const up = input.isDown("ArrowUp", "KeyW");
  const down = input.isDown("ArrowDown", "KeyS");

  if (left && !right) {
    return { x: -1, y: 0, direction: "left" };
  }

  if (right && !left) {
    return { x: 1, y: 0, direction: "right" };
  }

  if (up && !down) {
    return { x: 0, y: -1, direction: "up" };
  }

  if (down && !up) {
    return { x: 0, y: 1, direction: "down" };
  }

  return { x: 0, y: 0, direction: "down" };
}

function collidesWithMap(map, x, y, width, height) {
  const left = Math.floor(x / TILE_SIZE);
  const right = Math.floor((x + width - 1) / TILE_SIZE);
  const top = Math.floor(y / TILE_SIZE);
  const bottom = Math.floor((y + height - 1) / TILE_SIZE);

  return (
    isSolidTile(map, left, top) ||
    isSolidTile(map, right, top) ||
    isSolidTile(map, left, bottom) ||
    isSolidTile(map, right, bottom) ||
    collidesWithCollisionShapes(map, x, y, width, height) ||
    collidesWithNpc(map, x, y, width, height)
  );
}

function isSolidTile(map, tileX, tileY) {
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return true;
  }

  const tile = map.tiles[tileY][tileX];
  return map.solidTiles.includes(tile);
}

function collidesWithCollisionShapes(map, x, y, width, height) {
  return (map.collisionShapes ?? []).some((shape) => rectIntersectsPolygon(x, y, width, height, shape.points));
}

function collidesWithNpc(map, x, y, width, height) {
  return (map.npcs ?? []).some((npc) => {
    const npcX = npc.x * TILE_SIZE;
    const npcY = npc.y * TILE_SIZE;
    const npcWidth = npc.width * TILE_SIZE;
    const npcHeight = npc.height * TILE_SIZE;

    return x < npcX + npcWidth && x + width > npcX && y < npcY + npcHeight && y + height > npcY;
  });
}

function rectIntersectsPolygon(x, y, width, height, points) {
  const rectPoints = [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];

  if (rectPoints.some((point) => pointInPolygon(point, points))) {
    return true;
  }

  if (points.some((point) => point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height)) {
    return true;
  }

  const rectEdges = getEdges(rectPoints);
  const polygonEdges = getEdges(points);

  return rectEdges.some((rectEdge) => {
    return polygonEdges.some((polygonEdge) => segmentsIntersect(rectEdge.start, rectEdge.end, polygonEdge.start, polygonEdge.end));
  });
}

function pointInPolygon(point, polygon) {
  let inside = false;

  for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index, index += 1) {
    const current = polygon[index];
    const previous = polygon[previousIndex];
    const crossesY = current.y > point.y !== previous.y > point.y;
    const intersectX = ((previous.x - current.x) * (point.y - current.y)) / (previous.y - current.y) + current.x;

    if (crossesY && point.x < intersectX) {
      inside = !inside;
    }
  }

  return inside;
}

function getEdges(points) {
  return points.map((start, index) => {
    return {
      start,
      end: points[(index + 1) % points.length],
    };
  });
}

function segmentsIntersect(a, b, c, d) {
  const denominator = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y);

  if (denominator === 0) {
    return false;
  }

  const ua = ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) / denominator;
  const ub = ((b.x - a.x) * (a.y - c.y) - (b.y - a.y) * (a.x - c.x)) / denominator;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}
