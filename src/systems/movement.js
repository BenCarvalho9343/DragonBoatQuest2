import { CANVAS_HEIGHT, CANVAS_WIDTH, PLAYER_SPEED, TILE_SIZE } from "../constants.js";

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

function updateCamera(state) {
  const mapPixelWidth = state.map.width * TILE_SIZE;
  const mapPixelHeight = state.map.height * TILE_SIZE;
  const targetX = state.player.x + state.player.width / 2 - CANVAS_WIDTH / 2;
  const targetY = state.player.y + state.player.height / 2 - CANVAS_HEIGHT / 2;

  state.camera.x = clamp(targetX, 0, Math.max(0, mapPixelWidth - CANVAS_WIDTH));
  state.camera.y = clamp(targetY, 0, Math.max(0, mapPixelHeight - CANVAS_HEIGHT));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
