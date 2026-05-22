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
  const target = getInteractionTarget(state);

  if (!target) {
    return false;
  }

  const script = dialogue[target.dialogueId];

  if (!script) {
    throw new Error(`Missing dialogue script: ${target.dialogueId}`);
  }

  state.dialogue.active = true;
  const variant = resolveDialogueVariant(state, script);

  state.dialogue.speaker = variant.speaker ?? script.speaker ?? target.name;
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

function getInteractionTarget(state) {
  return getFacingNpc(state) ?? getFacingInteractable(state);
}

function getFacingNpc(state) {
  const tile = getFacingTile(state.player);
  return (state.map.npcs ?? []).find((npc) => isTileInsideNpc(npc, tile.x, tile.y));
}

function getFacingInteractable(state) {
  const facingTile = getFacingTile(state.player);
  const currentTile = getCurrentTile(state.player);

  return (state.map.interactables ?? []).find((interactable) => {
    return (
      isTileInsideTarget(interactable, facingTile.x, facingTile.y) ||
      isTileInsideTarget(interactable, currentTile.x, currentTile.y)
    );
  });
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

function getCurrentTile(player) {
  return {
    x: Math.floor((player.x + player.width / 2) / TILE_SIZE),
    y: Math.floor((player.y + player.height / 2) / TILE_SIZE),
  };
}

function isTileInsideNpc(npc, tileX, tileY) {
  return isTileInsideTarget(npc, tileX, tileY);
}

function isTileInsideTarget(target, tileX, tileY) {
  return tileX >= target.x && tileX < target.x + target.width && tileY >= target.y && tileY < target.y + target.height;
}
