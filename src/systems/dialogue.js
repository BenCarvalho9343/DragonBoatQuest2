import { TILE_SIZE } from "../constants.js";
import { dialogue } from "../data/dialogue.js";
import { applyEvents, hasFlag } from "./flags.js";

export function createDialogueState() {
  return {
    active: false,
    speaker: "",
    lines: [],
    lineIndex: 0,
    events: [],
  };
}

export function tryStartDialogue(state) {
  const npc = getFacingNpc(state);

  if (!npc) {
    return false;
  }

  const script = dialogue[npc.dialogueId];

  if (!script) {
    throw new Error(`Missing dialogue script: ${npc.dialogueId}`);
  }

  state.dialogue.active = true;
  const variant = resolveDialogueVariant(state, script);

  state.dialogue.speaker = variant.speaker ?? script.speaker ?? npc.name;
  state.dialogue.lines = formatLines(state, variant.lines);
  state.dialogue.lineIndex = 0;
  state.dialogue.events = variant.events ?? [];
  state.player.moving = false;

  return true;
}

export function advanceDialogue(state) {
  if (!state.dialogue.active) {
    return;
  }

  if (state.dialogue.lineIndex < state.dialogue.lines.length - 1) {
    state.dialogue.lineIndex += 1;
    return;
  }

  state.dialogue.active = false;
  applyEvents(state, state.dialogue.events);
  state.dialogue.speaker = "";
  state.dialogue.lines = [];
  state.dialogue.lineIndex = 0;
  state.dialogue.events = [];
}

export function startSystemDialogue(state, speaker, lines, events = []) {
  state.dialogue.active = true;
  state.dialogue.speaker = speaker;
  state.dialogue.lines = formatLines(state, lines);
  state.dialogue.lineIndex = 0;
  state.dialogue.events = events;
  state.player.moving = false;
}

function resolveDialogueVariant(state, script) {
  const variant = script.variants?.find((candidate) => {
    return (candidate.requires ?? []).every((flag) => hasFlag(state, flag));
  });

  return variant ?? script;
}

function formatLines(state, lines) {
  const playerName = state.playerName || "Paddler";
  return lines.map((line) => line.replaceAll("[name]", playerName));
}

function getFacingNpc(state) {
  const tile = getFacingTile(state.player);
  return (state.map.npcs ?? []).find((npc) => isTileInsideNpc(npc, tile.x, tile.y));
}

function getFacingTile(player) {
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  let tileX = Math.floor(centerX / TILE_SIZE);
  let tileY = Math.floor(centerY / TILE_SIZE);

  if (player.direction === "left") {
    tileX -= 1;
  } else if (player.direction === "right") {
    tileX += 1;
  } else if (player.direction === "up") {
    tileY -= 1;
  } else {
    tileY += 1;
  }

  return { x: tileX, y: tileY };
}

function isTileInsideNpc(npc, tileX, tileY) {
  return tileX >= npc.x && tileX < npc.x + npc.width && tileY >= npc.y && tileY < npc.y + npc.height;
}
