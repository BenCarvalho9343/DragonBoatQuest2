import { GAME_STATES } from "../constants.js";
import { raceDays } from "../data/raceDays.js";
import { setFlag } from "./flags.js";

const PERFECT_WINDOW = 0.08;
const GOOD_WINDOW = 0.17;
const BASE_SPEED = 9;
const PERFECT_BOOST = 18;
const GOOD_BOOST = 10;
const MISS_PENALTY = 5;

export function startRace(state, raceDayId, raceId) {
  const race = getRace(raceDayId, raceId);
  const beatInterval = 60 / race.bpm;

  state.race = {
    raceDayId,
    raceId,
    elapsed: 0,
    progress: 0,
    beatTimer: 0,
    beatInterval,
    feedback: "Ready",
    feedbackTimer: 0.8,
    perfect: 0,
    good: 0,
    misses: 0,
    taps: 0,
    result: "",
  };
  state.screen = GAME_STATES.RACE;
}

export function updateRace(state, input, delta) {
  const race = getCurrentRace(state);
  state.race.elapsed += delta;
  state.race.beatTimer = (state.race.beatTimer + delta) % state.race.beatInterval;
  state.race.progress += BASE_SPEED * delta;
  state.race.feedbackTimer = Math.max(0, state.race.feedbackTimer - delta);

  if (input.wasPressed("Space")) {
    judgeTap(state);
  }

  if (state.race.progress >= getRaceDistance(race)) {
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
  const beatOffset = getBeatOffset(state.race);
  state.race.taps += 1;

  if (beatOffset <= PERFECT_WINDOW) {
    state.race.perfect += 1;
    state.race.progress += PERFECT_BOOST;
    setFeedback(state, "Perfect");
    return;
  }

  if (beatOffset <= GOOD_WINDOW) {
    state.race.good += 1;
    state.race.progress += GOOD_BOOST;
    setFeedback(state, "Good");
    return;
  }

  state.race.misses += 1;
  state.race.progress = Math.max(0, state.race.progress - MISS_PENALTY);
  setFeedback(state, "Miss");
}

function getBeatOffset(raceState) {
  return Math.min(raceState.beatTimer, raceState.beatInterval - raceState.beatTimer);
}

function setFeedback(state, feedback) {
  state.race.feedback = feedback;
  state.race.feedbackTimer = 0.55;
}

function finishRace(state) {
  const score = state.race.perfect * 2 + state.race.good - state.race.misses;
  const won = score >= 8;

  state.race.progress = getRaceDistance(getCurrentRace(state));
  state.race.result = won ? "win" : "loss";
  state.screen = GAME_STATES.RACE_RESULT;

  if (won) {
    setFlag(state, "caldecotte_200m_complete");
  }
}

function getRace(raceDayId, raceId) {
  const raceDay = raceDays[raceDayId];
  const race = raceDay?.races.find((candidate) => candidate.id === raceId);

  if (!race) {
    throw new Error(`Unknown race: ${raceDayId}/${raceId}`);
  }

  return race;
}
