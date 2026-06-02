import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, GAME_STATES, TILE_SIZE } from "./constants.js";
import { caldecotteCrewIds, crew } from "./data/crew.js";
import { raceDays } from "./data/raceDays.js";
import { getCrewTotals, getRecruitedCrew } from "./systems/crew.js";
import { getCurrentRace, getRaceDistance } from "./systems/race.js";

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

  if (state.screen === GAME_STATES.RACE_SETUP) {
    renderTestMap(context, state);
    renderRaceSetupScreen(context, state);
    return;
  }

  if (state.screen === GAME_STATES.RACE_READY) {
    renderRaceReadyScreen(context, state);
    return;
  }

  if (state.screen === GAME_STATES.RACE) {
    renderRaceScreen(context, state);
    return;
  }

  if (state.screen === GAME_STATES.RACE_RESULT) {
    renderRaceResultScreen(context, state);
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
  drawCenteredText(context, "Phase 10 Race Prototype", 180, 22, COLORS.text);

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
  const sprite = state.assets.images.player?.[player.direction];
  const x = Math.round(player.x - camera.x);
  const y = Math.round(player.y - camera.y);

  if (sprite) {
    drawPlayerSprite(context, state, sprite, x, y);
    return;
  }

  context.fillStyle = COLORS.player;
  context.fillRect(x, y, player.width, player.height);

  context.fillStyle = COLORS.text;
  const eyeY = player.direction === "up" ? y + 7 : y + 10;
  context.fillRect(x + 5, eyeY, 3, 3);
  context.fillRect(x + player.width - 8, eyeY, 3, 3);
}

function drawPlayerSprite(context, state, sprite, x, y) {
  const frameWidth = 32;
  const frameHeight = 48;
  const frameColumn = getPlayerSpriteColumn(state);
  const drawWidth = 32;
  const drawHeight = Math.round(frameHeight * (drawWidth / frameWidth));
  const drawX = Math.round(x + state.player.width / 2 - drawWidth / 2);
  const drawY = Math.round(y + state.player.height - drawHeight + 2);

  context.drawImage(
    sprite,
    frameColumn * frameWidth,
    0,
    frameWidth,
    frameHeight,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );
}

function getPlayerSpriteColumn(state) {
  if (!state.player.moving) {
    return 0;
  }

  return Math.floor(state.elapsed * 8) % 4;
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

function renderRaceSetupScreen(context, state) {
  const raceDay = raceDays[state.raceSetup.raceDayId];

  if (!raceDay) {
    return;
  }

  const boxX = 64;
  const boxY = 38;
  const boxWidth = CANVAS_WIDTH - 128;
  const boxHeight = CANVAS_HEIGHT - 76;

  context.fillStyle = "rgba(15, 23, 42, 0.96)";
  context.fillRect(boxX, boxY, boxWidth, boxHeight);
  context.strokeStyle = COLORS.gold;
  context.lineWidth = 3;
  context.strokeRect(boxX + 1.5, boxY + 1.5, boxWidth - 3, boxHeight - 3);

  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = COLORS.gold;
  context.font = "28px monospace";
  context.fillText("Race Day", boxX + 28, boxY + 24);

  context.fillStyle = COLORS.text;
  context.font = "22px monospace";
  context.fillText(`${raceDay.venue} vs ${raceDay.rival}`, boxX + 28, boxY + 64);

  context.fillStyle = COLORS.mutedText;
  context.font = "16px monospace";
  context.fillText("Press Enter or Space to continue. Escape returns to the map.", boxX + 28, boxY + 96);

  context.fillStyle = "rgba(250, 204, 21, 0.12)";
  context.fillRect(boxX + 28, boxY + 132, boxWidth - 56, 120);
  context.strokeStyle = "rgba(250, 204, 21, 0.45)";
  context.lineWidth = 2;
  context.strokeRect(boxX + 29, boxY + 133, boxWidth - 58, 118);

  context.fillStyle = COLORS.gold;
  context.font = "18px monospace";
  context.fillText(raceDay.briefingSpeaker, boxX + 48, boxY + 150);

  context.fillStyle = COLORS.text;
  context.font = "16px monospace";
  let briefingY = boxY + 178;
  for (const line of raceDay.briefing) {
    briefingY = wrapText(context, line, boxX + 48, briefingY, boxWidth - 96, 21);
  }

  context.fillStyle = COLORS.text;
  context.font = "20px monospace";
  context.fillText("Race Order", boxX + 28, boxY + 282);

  let raceY = boxY + 316;
  for (const race of raceDay.races) {
    context.fillStyle = "rgba(56, 189, 248, 0.12)";
    context.fillRect(boxX + 28, raceY, boxWidth - 56, 44);
    context.strokeStyle = "rgba(56, 189, 248, 0.38)";
    context.lineWidth = 2;
    context.strokeRect(boxX + 29, raceY + 1, boxWidth - 58, 42);

    context.fillStyle = COLORS.text;
    context.font = "18px monospace";
    context.fillText(race.distance, boxX + 48, raceY + 14);

    context.fillStyle = COLORS.mutedText;
    context.font = "16px monospace";
    context.fillText(`BPM ${race.bpm}`, boxX + 200, raceY + 16);
    context.fillText(`Bends ${race.bends}`, boxX + 330, raceY + 16);
    context.fillText(race.difficulty, boxX + 480, raceY + 16);

    raceY += 52;
  }
}

function renderRaceScreen(context, state) {
  const race = getCurrentRace(state);
  const distance = getRaceDistance(race);
  const progressRatio = Math.min(1, state.race.progress / distance);
  const rivalRatio = Math.min(1, state.race.rivalProgress / distance);
  const waterX = 0;
  const waterY = 0;
  const waterWidth = CANVAS_WIDTH;
  const waterHeight = 418;
  const raceStartX = 92;
  const raceEndX = CANVAS_WIDTH - 86;
  const boatX = raceStartX + progressRatio * (raceEndX - raceStartX - 58);
  const rivalX = raceStartX + rivalRatio * (raceEndX - raceStartX - 58);

  context.fillStyle = "#10233d";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = "rgba(40, 122, 155, 0.95)";
  context.fillRect(waterX, waterY, waterWidth, waterHeight);

  context.fillStyle = "rgba(248, 250, 252, 0.28)";
  for (let x = 28; x < CANVAS_WIDTH; x += 58) {
    context.fillRect(x, 42, 22, 3);
    context.fillRect(x + 18, 172, 22, 3);
    context.fillRect(x + 8, 320, 22, 3);
  }

  drawLaneLine(context, 112);
  drawLaneLine(context, 218);
  drawLaneLine(context, 324);
  drawRaceBoat(context, state, rivalX, 104, COLORS.npc, "SOA");
  drawRaceBoat(context, state, boatX, 210, COLORS.player, "SH");
  drawRaceBoat(context, state, raceStartX + 28 + Math.sin(state.race.elapsed * 1.6) * 8, 316, COLORS.npcAlt, "LANE");

  context.fillStyle = COLORS.gold;
  context.fillRect(raceEndX, 54, 6, 320);

  context.fillStyle = "rgba(15, 23, 42, 0.84)";
  context.fillRect(18, 18, 238, 74);
  context.fillStyle = COLORS.text;
  context.font = "18px monospace";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(`${race.distance}`, 36, 34);
  context.fillText(`${Math.floor(state.race.progress)} / ${distance}m`, 36, 62);

  context.textAlign = "right";
  context.fillText(`P ${state.race.perfect}  G ${state.race.good}  M ${state.race.misses}`, CANVAS_WIDTH - 28, 22);

  if (state.race.feedbackTimer > 0) {
    context.fillStyle = getFeedbackColor(state.race.feedback);
    context.font = "38px monospace";
    context.textAlign = "center";
    context.fillText(state.race.feedback, CANVAS_WIDTH / 2, 374);
  }

  drawNoteHighway(context, state, 64, 438, CANVAS_WIDTH - 128);
}

function renderRaceReadyScreen(context, state) {
  const race = getCurrentRace(state);
  const boxX = 124;
  const boxY = 80;
  const boxWidth = CANVAS_WIDTH - 248;
  const boxHeight = CANVAS_HEIGHT - 160;

  context.fillStyle = "#10233d";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = "rgba(40, 122, 155, 0.95)";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = "rgba(15, 23, 42, 0.94)";
  context.fillRect(boxX, boxY, boxWidth, boxHeight);
  context.strokeStyle = COLORS.gold;
  context.lineWidth = 3;
  context.strokeRect(boxX + 1.5, boxY + 1.5, boxWidth - 3, boxHeight - 3);

  context.textAlign = "center";
  context.textBaseline = "top";
  context.fillStyle = COLORS.gold;
  context.font = "30px monospace";
  context.fillText(`${race.distance} Start`, CANVAS_WIDTH / 2, boxY + 34);

  context.fillStyle = COLORS.text;
  context.font = "22px monospace";
  context.fillText("Boxes will move toward the gold hit bar.", CANVAS_WIDTH / 2, boxY + 104);
  context.fillText("Tap Space as each box crosses it.", CANVAS_WIDTH / 2, boxY + 142);
  context.fillText("Perfect and Good hits move the boat forward.", CANVAS_WIDTH / 2, boxY + 180);

  context.fillStyle = COLORS.mutedText;
  context.font = "18px monospace";
  context.fillText("Press Enter or Space to start", CANVAS_WIDTH / 2, boxY + 268);
  context.fillText("Escape returns to the briefing", CANVAS_WIDTH / 2, boxY + 304);
}

function drawLaneLine(context, y) {
  context.strokeStyle = "rgba(248, 250, 252, 0.25)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(70, y + 44);
  context.lineTo(CANVAS_WIDTH - 70, y + 44);
  context.stroke();
}

function drawRaceBoat(context, state, x, y, color, label) {
  const roundedX = Math.round(x);
  const sprite = state.assets.images.boat;

  if (sprite) {
    const sourceWidth = 640;
    const sourceHeight = 320;
    const frameCount = Math.max(1, Math.floor(sprite.width / sourceWidth));
    const frame = Math.floor(state.race.elapsed * 8) % frameCount;
    const drawWidth = 112;
    const drawHeight = Math.round(sourceHeight * (drawWidth / sourceWidth));

    context.drawImage(
      sprite,
      frame * sourceWidth,
      0,
      sourceWidth,
      sourceHeight,
      roundedX,
      y + 2,
      drawWidth,
      drawHeight,
    );
    return;
  }

  context.fillStyle = "rgba(15, 23, 42, 0.28)";
  context.fillRect(roundedX + 4, y + 38, 58, 7);
  context.fillStyle = COLORS.dock;
  context.fillRect(roundedX, y + 20, 64, 28);
  context.fillStyle = color;
  context.fillRect(roundedX + 8, y + 14, 48, 10);
  context.fillStyle = COLORS.text;
  context.font = "12px monospace";
  context.textAlign = "center";
  context.textBaseline = "top";
  context.fillText(label, roundedX + 32, y - 2);
}

function drawNoteHighway(context, state, x, y, width) {
  const hitX = x + 108;
  const laneHeight = 64;
  const travelTime = 2.1;
  const noteSpeed = (width - 140) / travelTime;
  const perfectWidth = 18;
  const goodWidth = 52;

  context.fillStyle = "rgba(15, 23, 42, 0.86)";
  context.fillRect(x, y, width, laneHeight);
  context.strokeStyle = "rgba(248, 250, 252, 0.35)";
  context.lineWidth = 2;
  context.strokeRect(x + 1, y + 1, width - 2, laneHeight - 2);

  context.fillStyle = "rgba(56, 189, 248, 0.18)";
  context.fillRect(hitX - goodWidth / 2, y + 6, goodWidth, laneHeight - 12);
  context.fillStyle = "rgba(250, 204, 21, 0.3)";
  context.fillRect(hitX - perfectWidth / 2, y + 4, perfectWidth, laneHeight - 8);

  context.fillStyle = COLORS.gold;
  context.fillRect(hitX - 3, y - 10, 6, laneHeight + 20);

  context.fillStyle = COLORS.mutedText;
  context.font = "14px monospace";
  context.textAlign = "center";
  context.textBaseline = "top";
  context.fillText("HIT", hitX, y + laneHeight - 18);

  for (const note of state.race.notes) {
    if (note.judged) {
      continue;
    }

    const noteX = hitX + (note.time - state.race.elapsed) * noteSpeed;

    if (noteX < x - 32 || noteX > x + width + 32) {
      continue;
    }

    context.fillStyle = COLORS.player;
    context.fillRect(Math.round(noteX) - 13, y + 15, 26, 28);
    context.strokeStyle = COLORS.text;
    context.lineWidth = 2;
    context.strokeRect(Math.round(noteX) - 12, y + 16, 24, 26);
  }
}

function getFeedbackColor(feedback) {
  if (feedback === "Perfect") {
    return COLORS.gold;
  }
  if (feedback === "Good") {
    return COLORS.npc;
  }
  if (feedback === "Miss") {
    return COLORS.player;
  }
  return COLORS.text;
}

function renderRaceResultScreen(context, state) {
  const race = getCurrentRace(state);
  const won = state.race.result === "win";

  context.fillStyle = "#10233d";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawCenteredText(context, won ? "Race Complete" : "Race Lost", 92, 36, won ? COLORS.gold : COLORS.player);
  drawCenteredText(context, `${race.distance} vs Soaring Dragons`, 142, 22, COLORS.text);

  const boxX = CANVAS_WIDTH / 2 - 260;
  const boxY = 190;
  const boxWidth = 520;
  const boxHeight = 190;

  context.fillStyle = COLORS.panel;
  context.fillRect(boxX, boxY, boxWidth, boxHeight);
  context.strokeStyle = COLORS.gold;
  context.lineWidth = 3;
  context.strokeRect(boxX + 1.5, boxY + 1.5, boxWidth - 3, boxHeight - 3);

  context.fillStyle = COLORS.text;
  context.font = "22px monospace";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(`Perfect: ${state.race.perfect}`, boxX + 48, boxY + 42);
  context.fillText(`Good:    ${state.race.good}`, boxX + 48, boxY + 78);
  context.fillText(`Miss:    ${state.race.misses}`, boxX + 48, boxY + 114);

  context.fillStyle = COLORS.mutedText;
  context.font = "18px monospace";
  context.textAlign = "center";
  context.fillText("Press Enter, Space, or Escape", CANVAS_WIDTH / 2, 420);
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
    lineY += lineHeight;
  }

  return lineY;
}

function drawCenteredText(context, text, y, size, color) {
  context.fillStyle = color;
  context.font = `${size}px monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, CANVAS_WIDTH / 2, y);
}
