import { GAME_STATES } from "../constants.js";
import { raceDays } from "../data/raceDays.js";
import { setFlag } from "./flags.js";

const PERFECT_WINDOW = 0.08;
const GOOD_WINDOW = 0.16;
const NOTE_LEAD_IN = 1.6;
const NOTE_COUNT = 32;
const BASE_SPEED = 3;
const RIVAL_SPEED = 10.4;

export function prepareRace(state, raceDayId, raceId) {
  const race = getRace(raceDayId, raceId);
  const beatInterval = 60 / race.bpm;
  const distance = getRaceDistance(race);

  state.race = {
    raceDayId,
    raceId,
    elapsed: 0,
    progress: 0,
    rivalProgress: 0,
    beatTimer: 0,
    beatInterval,
    notes: createNotes(beatInterval),
    perfectBoost: distance / NOTE_COUNT,
    goodBoost: distance / NOTE_COUNT * 0.68,
    feedback: "Ready",
    feedbackTimer: 0.8,
    perfect: 0,
    good: 0,
    misses: 0,
    taps: 0,
    result: "",
  };
  state.screen = GAME_STATES.RACE_READY;
}

export function startRace(state) {
  state.race.elapsed = 0;
  state.race.progress = 0;
  state.race.rivalProgress = 0;
  state.race.beatTimer = 0;
  state.race.feedback = "Go";
  state.race.feedbackTimer = 0.8;
  state.screen = GAME_STATES.RACE;
}

export function updateRace(state, input, delta) {
  const race = getCurrentRace(state);
  const distance = getRaceDistance(race);

  state.race.elapsed += delta;
  state.race.beatTimer = (state.race.beatTimer + delta) % state.race.beatInterval;
  state.race.progress = Math.min(distance, state.race.progress + BASE_SPEED * delta);
  state.race.rivalProgress = Math.min(distance, state.race.rivalProgress + RIVAL_SPEED * delta);
  state.race.feedbackTimer = Math.max(0, state.race.feedbackTimer - delta);

  if (input.wasPressed("Space")) {
    judgeTap(state);
  }

  markPassedNotesAsMissed(state);

  if (isRaceFinished(state)) {
    finishRace(state);
  }
}

export function getCurrentRace(state) {
  return getRace(state.race.raceDayId, state.race.raceId);
}

export function getRaceDistance(race) {
  return Number.parseInt(race.distance, 10);
}

function judgeTap(state) {
  const note = getClosestActiveNote(state.race);
  state.race.taps += 1;

  if (!note) {
    state.race.misses += 1;
    setFeedback(state, "Miss");
    return;
  }

  const offset = Math.abs(note.time - state.race.elapsed);

  if (offset <= PERFECT_WINDOW) {
    note.judged = true;
    note.result = "perfect";
    state.race.perfect += 1;
    state.race.progress += state.race.perfectBoost;
    setFeedback(state, "Perfect");
    return;
  }

  if (offset <= GOOD_WINDOW) {
    note.judged = true;
    note.result = "good";
    state.race.good += 1;
    state.race.progress += state.race.goodBoost;
    setFeedback(state, "Good");
  }
}

function getClosestActiveNote(raceState) {
  const candidates = raceState.notes.filter((note) => !note.judged);
  let closest = null;
  let closestOffset = Number.POSITIVE_INFINITY;

  for (const note of candidates) {
    const offset = Math.abs(note.time - raceState.elapsed);

    if (offset < closestOffset) {
      closest = note;
      closestOffset = offset;
    }
  }

  return closestOffset <= GOOD_WINDOW ? closest : null;
}

function markPassedNotesAsMissed(state) {
  for (const note of state.race.notes) {
    if (!note.judged && state.race.elapsed - note.time > GOOD_WINDOW) {
      note.judged = true;
      note.result = "miss";
      state.race.misses += 1;
      setFeedback(state, "Miss");
    }
  }
}

function setFeedback(state, feedback) {
  state.race.feedback = feedback;
  state.race.feedbackTimer = 0.55;
}

function finishRace(state) {
  const distance = getRaceDistance(getCurrentRace(state));
  const won = state.race.progress >= distance * 0.85;

  state.race.progress = Math.min(distance, state.race.progress);
  state.race.result = won ? "win" : "loss";
  state.screen = GAME_STATES.RACE_RESULT;

  if (won) {
    setFlag(state, "caldecotte_200m_complete");
  }
}

function createNotes(beatInterval) {
  return Array.from({ length: NOTE_COUNT }, (_, index) => {
    return {
      id: index,
      time: NOTE_LEAD_IN + index * beatInterval,
      judged: false,
      result: "",
    };
  });
}

function isRaceFinished(state) {
  const race = getCurrentRace(state);
  const distance = getRaceDistance(race);
  const allNotesJudged = state.race.notes.every((note) => note.judged);
  const lastNote = state.race.notes[state.race.notes.length - 1];

  return state.race.progress >= distance || (allNotesJudged && state.race.elapsed > lastNote.time + 0.5);
}

function getRace(raceDayId, raceId) {
  const raceDay = raceDays[raceDayId];
  const race = raceDay?.races.find((candidate) => candidate.id === raceId);

  if (!race) {
    throw new Error(`Unknown race: ${raceDayId}/${raceId}`);
  }

  return race;
}
