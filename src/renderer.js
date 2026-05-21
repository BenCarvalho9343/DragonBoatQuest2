import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, GAME_STATES, TILE_SIZE } from "./constants.js";

export function render(context, state) {
  context.imageSmoothingEnabled = false;
  clear(context);

  if (state.screen === GAME_STATES.TITLE) {
    renderTitle(context, state);
    return;
  }

  renderTestMap(context, state);
}

function clear(context) {
  context.fillStyle = COLORS.background;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function renderTitle(context, state) {
  drawCenteredText(context, "DRAGON BOAT QUEST 2", 120, 44, COLORS.gold);
  drawCenteredText(context, "Phase 2 Map Loading Test", 180, 22, COLORS.text);

  const pulse = Math.sin(state.elapsed * 4) * 0.5 + 0.5;
  context.globalAlpha = 0.55 + pulse * 0.45;
  drawCenteredText(context, "Press Enter or Space", 320, 24, COLORS.text);
  context.globalAlpha = 1;

  drawCenteredText(context, "The season starts here.", 380, 18, COLORS.mutedText);
}

function drawMap(context, map, camera) {
  if (!map || !camera) {
    return;
  }

  const startCol = Math.floor(camera.x / TILE_SIZE);
  const endCol = Math.min(map.width, Math.ceil((camera.x + CANVAS_WIDTH) / TILE_SIZE));
  const startRow = Math.floor(camera.y / TILE_SIZE);
  const endRow = Math.min(map.height, Math.ceil((camera.y + CANVAS_HEIGHT) / TILE_SIZE));

  for (let row = startRow; row < endRow; row += 1) {
    for (let col = startCol; col < endCol; col += 1) {
      drawTile(context, map.tiles[row][col], col * TILE_SIZE - camera.x, row * TILE_SIZE - camera.y);
    }
  }
}

function drawTile(context, tile, x, y) {
  context.fillStyle = getTileColor(tile);
  context.fillRect(Math.round(x), Math.round(y), TILE_SIZE, TILE_SIZE);

  if (tile === "P" || tile === "D") {
    context.strokeStyle = "rgba(15, 23, 42, 0.2)";
    context.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
  }
}

function getTileColor(tile) {
  if (tile === "W") {
    return COLORS.water;
  }
  if (tile === "P") {
    return COLORS.path;
  }
  if (tile === "D") {
    return COLORS.dock;
  }
  if (tile === "T") {
    return COLORS.tree;
  }
  return COLORS.grass;
}

function renderTestMap(context, state) {
  drawMap(context, state.map, state.camera);
  drawExits(context, state);
  drawPlayer(context, state);
  drawHud(context, state);
  drawTransitionMessage(context, state);
}

function drawExits(context, state) {
  const { map, camera } = state;

  for (const exit of map.exits) {
    context.fillStyle = "rgba(250, 204, 21, 0.5)";
    context.fillRect(
      Math.round(exit.x * TILE_SIZE - camera.x),
      Math.round(exit.y * TILE_SIZE - camera.y),
      exit.width * TILE_SIZE,
      exit.height * TILE_SIZE,
    );
  }
}

function drawPlayer(context, state) {
  const { player, camera } = state;
  const x = Math.round(player.x - camera.x);
  const y = Math.round(player.y - camera.y);

  context.fillStyle = COLORS.playerShadow;
  context.fillRect(x + 2, y + player.height - 4, player.width, 6);

  context.fillStyle = COLORS.player;
  context.fillRect(x, y, player.width, player.height);

  context.fillStyle = COLORS.text;
  const eyeY = player.direction === "up" ? y + 7 : y + 10;
  context.fillRect(x + 5, eyeY, 3, 3);
  context.fillRect(x + player.width - 8, eyeY, 3, 3);
}

function drawHud(context, state) {
  context.fillStyle = COLORS.panel;
  context.fillRect(24, 24, 350, 134);

  context.fillStyle = COLORS.text;
  context.textAlign = "left";
  context.textBaseline = "top";
  context.font = "22px monospace";
  context.fillText("Phase 2 Map Test", 48, 48);

  context.font = "16px monospace";
  context.fillStyle = COLORS.mutedText;
  context.fillText(state.map.name, 48, 76);
  context.fillText("Arrow keys / WASD to move", 48, 102);
  context.fillText(`Position: ${Math.round(state.player.x)}, ${Math.round(state.player.y)}`, 48, 128);
}

function drawTransitionMessage(context, state) {
  if (state.transition.timer <= 0) {
    return;
  }

  const alpha = Math.min(1, state.transition.timer);
  context.globalAlpha = alpha;
  context.fillStyle = "rgba(15, 23, 42, 0.84)";
  context.fillRect(CANVAS_WIDTH / 2 - 180, CANVAS_HEIGHT - 96, 360, 56);
  drawCenteredText(context, state.transition.message, CANVAS_HEIGHT - 68, 20, COLORS.text);
  context.globalAlpha = 1;
}

function drawCenteredText(context, text, y, size, color) {
  context.fillStyle = color;
  context.font = `${size}px monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, CANVAS_WIDTH / 2, y);
}
