import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, GAME_STATES, TILE_SIZE } from "./constants.js";
import { caldecotteCrewIds, crew } from "./data/crew.js";
import { getCrewTotals, getRecruitedCrew } from "./systems/crew.js";

export function render(context, state) {
  context.imageSmoothingEnabled = false;
  clear(context);

  if (state.screen === GAME_STATES.TITLE) {
    renderTitle(context, state);
    return;
  }

  if (state.screen === GAME_STATES.NAME_ENTRY) {
    renderNameEntry(context, state);
    return;
  }

  if (state.screen === GAME_STATES.CREW) {
    renderTestMap(context, state);
    renderCrewScreen(context, state);
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
  drawCenteredText(context, "Phase 8 Race-Day Gate", 180, 22, COLORS.text);

  const pulse = Math.sin(state.elapsed * 4) * 0.5 + 0.5;
  context.globalAlpha = 0.55 + pulse * 0.45;
  drawCenteredText(context, "Press Enter or Space", 320, 24, COLORS.text);
  context.globalAlpha = 1;

  drawCenteredText(context, "The season starts here.", 380, 18, COLORS.mutedText);
}

function renderNameEntry(context, state) {
  drawCenteredText(context, "Coach Tim", 96, 28, COLORS.gold);
  drawCenteredText(context, "Before we start — what do you call yourself?", 150, 22, COLORS.text);

  const boxWidth = 420;
  const boxHeight = 72;
  const boxX = CANVAS_WIDTH / 2 - boxWidth / 2;
  const boxY = 230;

  context.fillStyle = COLORS.panel;
  context.fillRect(boxX, boxY, boxWidth, boxHeight);
  context.strokeStyle = COLORS.gold;
  context.lineWidth = 3;
  context.strokeRect(boxX + 1.5, boxY + 1.5, boxWidth - 3, boxHeight - 3);

  context.fillStyle = COLORS.text;
  context.font = "30px monospace";
  context.textAlign = "left";
  context.textBaseline = "middle";

  const cursorVisible = Math.floor(state.elapsed * 2) % 2 === 0;
  const cursor = cursorVisible ? "_" : " ";
  context.fillText(`${state.nameEntry.value}${cursor}`, boxX + 24, boxY + boxHeight / 2);

  drawCenteredText(context, "Type your name, then press Enter", 344, 18, COLORS.mutedText);
  drawCenteredText(context, "Backspace deletes", 378, 16, COLORS.mutedText);
}

function drawMap(context, map, camera) {
  if (!map || !camera) {
    return;
  }

  if (map.tiled) {
    drawTiledMap(context, map, camera);
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

function drawTiledMap(context, map, camera) {
  const { columns, firstGid, image, layers, scale, tileHeight, tileWidth } = map.tiled;
  const drawWidth = tileWidth * scale;
  const drawHeight = tileHeight * scale;

  for (const layer of layers) {
    for (let index = 0; index < layer.data.length; index += 1) {
      const gid = layer.data[index];

      if (gid === 0) {
        continue;
      }

      const tileIndex = gid - firstGid;
      const sourceX = (tileIndex % columns) * tileWidth;
      const sourceY = Math.floor(tileIndex / columns) * tileHeight;
      const column = index % layer.width;
      const row = Math.floor(index / layer.width);
      const destinationX = Math.round(column * drawWidth - camera.x);
      const destinationY = Math.round(row * drawHeight - camera.y);

      context.drawImage(
        image,
        sourceX,
        sourceY,
        tileWidth,
        tileHeight,
        destinationX,
        destinationY,
        drawWidth,
        drawHeight,
      );
    }
  }
}

function drawTile(context, tile, x, y) {
  context.fillStyle = getTileColor(tile);
  context.fillRect(Math.round(x), Math.round(y), TILE_SIZE, TILE_SIZE);

  if (["P", "D", "K", "B", "C", "S", "R"].includes(tile)) {
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
  if (tile === "D" || tile === "K") {
    return COLORS.dock;
  }
  if (tile === "B") {
    return COLORS.boathouse;
  }
  if (tile === "C") {
    return COLORS.carPark;
  }
  if (tile === "S") {
    return COLORS.noticeboard;
  }
  if (tile === "R") {
    return COLORS.bench;
  }
  if (tile === "T") {
    return COLORS.tree;
  }
  return COLORS.grass;
}

function renderTestMap(context, state) {
  drawMap(context, state.map, state.camera);
  drawExits(context, state);
  drawNpcs(context, state);
  drawPlayer(context, state);
  drawTransitionMessage(context, state);
  drawDialogueBox(context, state);
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

function drawNpcs(context, state) {
  const { map, camera } = state;

  for (const npc of map.npcs ?? []) {
    const x = Math.round(npc.x * TILE_SIZE - camera.x + 5);
    const y = Math.round(npc.y * TILE_SIZE - camera.y + 3);

    context.fillStyle = COLORS.playerShadow;
    context.fillRect(x + 1, y + 24, 22, 5);

    context.fillStyle = COLORS[npc.color] ?? COLORS.npc;
    context.fillRect(x, y, 22, 28);

    context.fillStyle = COLORS.text;
    context.fillRect(x + 5, y + 10, 3, 3);
    context.fillRect(x + 14, y + 10, 3, 3);
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

function drawDialogueBox(context, state) {
  if (!state.dialogue.active) {
    return;
  }

  const boxX = 32;
  const boxY = CANVAS_HEIGHT - 156;
  const boxWidth = CANVAS_WIDTH - 64;
  const boxHeight = 124;
  const currentLine = state.dialogue.lines[state.dialogue.lineIndex];

  context.fillStyle = "rgba(15, 23, 42, 0.94)";
  context.fillRect(boxX, boxY, boxWidth, boxHeight);
  context.strokeStyle = COLORS.gold;
  context.lineWidth = 3;
  context.strokeRect(boxX + 1.5, boxY + 1.5, boxWidth - 3, boxHeight - 3);

  context.fillStyle = COLORS.gold;
  context.font = "18px monospace";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(state.dialogue.speaker, boxX + 24, boxY + 18);

  context.fillStyle = COLORS.text;
  context.font = "20px monospace";
  wrapText(context, currentLine, boxX + 24, boxY + 52, boxWidth - 48, 26);

  context.fillStyle = COLORS.mutedText;
  context.font = "14px monospace";
  context.textAlign = "right";
  context.fillText("Space", boxX + boxWidth - 24, boxY + boxHeight - 28);
}

function renderCrewScreen(context, state) {
  const recruitedCrew = getRecruitedCrew(state);
  const totals = getCrewTotals(state);
  const boxX = 64;
  const boxY = 42;
  const boxWidth = CANVAS_WIDTH - 128;
  const boxHeight = CANVAS_HEIGHT - 84;

  context.fillStyle = "rgba(15, 23, 42, 0.96)";
  context.fillRect(boxX, boxY, boxWidth, boxHeight);
  context.strokeStyle = COLORS.gold;
  context.lineWidth = 3;
  context.strokeRect(boxX + 1.5, boxY + 1.5, boxWidth - 3, boxHeight - 3);

  context.fillStyle = COLORS.gold;
  context.font = "28px monospace";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText("Crew", boxX + 28, boxY + 24);

  context.fillStyle = COLORS.mutedText;
  context.font = "16px monospace";
  context.fillText("Press C or Escape to return", boxX + boxWidth - 300, boxY + 32);

  context.fillStyle = COLORS.text;
  context.font = "18px monospace";
  context.fillText(`Recruited: ${recruitedCrew.length}/${caldecotteCrewIds.length}`, boxX + 28, boxY + 70);
  context.fillText(`Power ${totals.power}   Timing ${totals.timing}   Stamina ${totals.stamina}`, boxX + 240, boxY + 70);

  const slotX = boxX + 28;
  let slotY = boxY + 116;

  for (const crewId of caldecotteCrewIds) {
    const member = crew[crewId];
    const isRecruited = state.progress.recruitedCrew.includes(crewId);

    context.fillStyle = isRecruited ? "rgba(56, 189, 248, 0.16)" : "rgba(148, 163, 184, 0.12)";
    context.fillRect(slotX, slotY, boxWidth - 56, 66);

    context.strokeStyle = isRecruited ? "rgba(56, 189, 248, 0.7)" : "rgba(148, 163, 184, 0.35)";
    context.lineWidth = 2;
    context.strokeRect(slotX + 1, slotY + 1, boxWidth - 58, 64);

    context.fillStyle = isRecruited ? COLORS.text : COLORS.mutedText;
    context.font = "20px monospace";
    context.fillText(isRecruited ? member.name : "???", slotX + 18, slotY + 12);

    context.font = "15px monospace";
    const detail = isRecruited
      ? `${member.role} | ${member.homeVenue}`
      : "Find and speak to this crew member at Caldecotte.";
    context.fillText(detail, slotX + 18, slotY + 38);

    if (isRecruited) {
      context.textAlign = "right";
      context.fillText(
        `P${member.stats.power} T${member.stats.timing} S${member.stats.stamina}`,
        slotX + boxWidth - 78,
        slotY + 38,
      );
      context.textAlign = "left";
    }

    slotY += 78;
  }
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width <= maxWidth) {
      line = testLine;
      continue;
    }

    context.fillText(line, x, lineY);
    line = word;
    lineY += lineHeight;
  }

  if (line) {
    context.fillText(line, x, lineY);
  }
}

function drawCenteredText(context, text, y, size, color) {
  context.fillStyle = color;
  context.font = `${size}px monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, CANVAS_WIDTH / 2, y);
}
