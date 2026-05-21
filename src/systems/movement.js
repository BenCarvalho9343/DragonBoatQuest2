import { PLAYER_SPEED, TILE_SIZE } from "../constants.js";
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

  checkForMapExit(state);
  updateCamera(state);
}

function getMovementVector(input) {
  const left = input.isDown("ArrowLeft", "KeyA");
  const right = input.isDown("ArrowRight", "KeyD");
  const up = input.isDown("ArrowUp", "KeyW");
  const down = input.isDown("ArrowDown", "KeyS");

  let x = 0;
  let y = 0;
  let direction = "down";

  if (left) {
    x -= 1;
    direction = "left";
  }
  if (right) {
    x += 1;
    direction = "right";
  }
  if (up) {
    y -= 1;
    direction = "up";
  }
  if (down) {
    y += 1;
    direction = "down";
  }

  if (x !== 0 && y !== 0) {
    const diagonal = Math.SQRT1_2;
    x *= diagonal;
    y *= diagonal;
  }

  return { x, y, direction };
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
    isSolidTile(map, right, bottom)
  );
}

function isSolidTile(map, tileX, tileY) {
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return true;
  }

  const tile = map.tiles[tileY][tileX];
  return map.solidTiles.includes(tile);
}
