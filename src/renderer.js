import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, GAME_STATES } from "./constants.js";

export function render(context, state) {
  context.imageSmoothingEnabled = false;
  clear(context);

  if (state.screen === GAME_STATES.TITLE) {
    renderTitle(context, state);
    return;
  }

  renderTestMap(context);
}

function clear(context) {
  context.fillStyle = COLORS.background;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function renderTitle(context, state) {
  drawCenteredText(context, "DRAGON BOAT QUEST 2", 120, 44, COLORS.gold);
  drawCenteredText(context, "Phase 0 Project Shell", 180, 22, COLORS.text);

  const pulse = Math.sin(state.elapsed * 4) * 0.5 + 0.5;
  context.globalAlpha = 0.55 + pulse * 0.45;
  drawCenteredText(context, "Press Enter or Space", 320, 24, COLORS.text);
  context.globalAlpha = 1;

  drawCenteredText(context, "The season starts here.", 380, 18, COLORS.mutedText);
}

function renderTestMap(context) {
  context.fillStyle = COLORS.grass;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = COLORS.water;
  context.fillRect(0, 300, CANVAS_WIDTH, 160);

  context.fillStyle = COLORS.panel;
  context.fillRect(72, 64, 280, 120);

  context.fillStyle = COLORS.text;
  context.font = "22px monospace";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText("Blank Test Map", 96, 88);

  context.font = "16px monospace";
  context.fillStyle = COLORS.mutedText;
  context.fillText("Phase 1 will add movement here.", 96, 126);
}

function drawCenteredText(context, text, y, size, color) {
  context.fillStyle = color;
  context.font = `${size}px monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, CANVAS_WIDTH / 2, y);
}
