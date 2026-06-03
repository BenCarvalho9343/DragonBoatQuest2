import { GAME_STATES } from "../constants.js";
import { raceDays } from "../data/raceDays.js";
import { setFlag } from "./flags.js";

const PERFECT_WINDOW = 0.08;
const GOOD_WINDOW = 0.16;
const NOTE_LEAD_IN = 1.6;
const NOTE_COUNT = 32;
const COUNTDOWN_DURATION = 3;

export function startRaceDay(state, raceDayId) {
  const raceDay = getRaceDay(raceDayId);

  state.raceDay = {
    raceDayId,
    active: true,
    completedRaceIds: [],
    message: "",
  };

  prepareRace(state, raceDayId, raceDay.races[0].id);
}

export function prepareRace(state, raceDayId, raceId) {
  const race = getRace(raceDayId, raceId);
  const beatInterval = 60 / race.bpm;
  const distance = getRaceDistance(race);
  const plannedDuration = getPlannedRaceDuration(beatInterval);
  const racePace = distance / plannedDuration;

  state.race = {
    raceDayId,
    raceId,
    elapsed: 0,
    progress: 0,
    rivalProgress: 0,
    speedBoost: 0,
    baseSpeed: racePace * 0.68,
    rivalSpeed: racePace * 0.78,
    perfectSpeedBoost: racePace * 0.18,
    goodSpeedBoost: racePace * 0.1,
    speedBoostDecay: racePace * 0.45,
    beatTimer: 0,
    beatInterval,
    notes: createNotes(beatInterval),
    feedback: "Ready",
    feedbackTimer: 0.8,
    countdown: 0,
    hitPulse: 0,
    effects: [],
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
  state.race.speedBoost = 0;
  state.race.beatTimer = 0;
  state.race.countdown = COUNTDOWN_DURATION;
  state.race.hitPulse = 0;
  state.race.effects = [];
  state.race.feedback = "Ready";
  state.race.feedbackTimer = 0;
  state.screen = GAME_STATES.RACE;
}

export function updateRace(state, input, delta) {
  const race = getCurrentRace(state);
  const distance = getRaceDistance(race);

  updateRaceEffects(state, delta);

  if (state.race.countdown > 0) {
    state.race.countdown = Math.max(0, state.race.countdown - delta);

    if (state.race.countdown === 0) {
      setFeedback(state, "Go", 0.75);
    }

    return;
  }

  state.race.elapsed += delta;
  state.race.beatTimer = (state.race.beatTimer + delta) % state.race.beatInterval;
  state.race.progress = Math.min(distance, state.race.progress + (state.race.baseSpeed + state.race.speedBoost) * delta);
  state.race.rivalProgress = Math.min(distance, state.race.rivalProgress + state.race.rivalSpeed * delta);
  state.race.speedBoost = Math.max(0, state.race.speedBoost - state.race.speedBoostDecay * delta);
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
    addRaceEffect(state, "miss");
    setFeedback(state, "Miss");
    return;
  }

  const offset = Math.abs(note.time - state.race.elapsed);

  if (offset <= PERFECT_WINDOW) {
    note.judged = true;
    note.result = "perfect";
    state.race.perfect += 1;
    state.race.speedBoost += state.race.perfectSpeedBoost;
    state.race.hitPulse = 1;
    addRaceEffect(state, "perfect");
    setFeedback(state, "Perfect");
    return;
  }

  if (offset <= GOOD_WINDOW) {
    note.judged = true;
    note.result = "good";
    state.race.good += 1;
    state.race.speedBoost += state.race.goodSpeedBoost;
    state.race.hitPulse = 0.65;
    addRaceEffect(state, "good");
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
      addRaceEffect(state, "miss");
      setFeedback(state, "Miss");
    }
  }
}

function setFeedback(state, feedback, duration = 0.55) {
  state.race.feedback = feedback;
  state.race.feedbackTimer = duration;
}

function addRaceEffect(state, type) {
  state.race.effects.push({
    id: state.race.effects.length + state.race.elapsed,
    type,
    age: 0,
    duration: type === "miss" ? 0.48 : 0.62,
  });
}

function updateRaceEffects(state, delta) {
  state.race.hitPulse = Math.max(0, state.race.hitPulse - delta * 2.8);

  state.race.effects = state.race.effects
    .map((effect) => ({
      ...effect,
      age: effect.age + delta,
    }))
    .filter((effect) => effect.age < effect.duration);
}

function finishRace(state) {
  const distance = getRaceDistance(getCurrentRace(state));
  const won = state.race.progress >= distance * 0.85;

  state.race.progress = Math.min(distance, state.race.progress);
  state.race.result = won ? "win" : "loss";
  state.screen = GAME_STATES.RACE_RESULT;
}

export function resolveRaceResult(state) {
  if (state.race.result !== "win") {
    resetRaceDay(state);
    return {
      outcome: "loss",
      lines: [
        "Not today. Walk it off, talk to the crew, and come back when you're ready.",
        "Soaring Dragons aren't going anywhere.",
      ],
    };
  }

  const raceDay = getRaceDay(state.race.raceDayId);
  const currentRace = getCurrentRace(state);
  const completedRaceIds = new Set(state.raceDay.completedRaceIds);
  completedRaceIds.add(currentRace.id);
  state.raceDay.completedRaceIds = [...completedRaceIds];
  setFlag(state, `${currentRace.id}_complete`);
  setRaceCompletionFlag(state, currentRace.id);

  const nextRace = raceDay.races.find((race) => !completedRaceIds.has(race.id));

  if (nextRace) {
    state.raceDay.message = getBetweenRaceMessage(currentRace.id);
    prepareRace(state, raceDay.id, nextRace.id);
    return {
      outcome: "next",
      nextRaceId: nextRace.id,
    };
  }

  state.raceDay.active = false;
  state.raceDay.message = "";
  setFlag(state, `${raceDay.id}_complete`);
  setFlag(state, "caldecotte_complete");

  return {
    outcome: "complete",
    lines: [
      "Three for three. Soaring Dragons won't forget that in a hurry.",
      "Right. Next stop is the River Soar in Loughborough. Their home water.",
      "It'll be a different race on an open river. We'll need more of the crew.",
    ],
  };
}

function resetRaceDay(state) {
  state.raceDay = {
    raceDayId: "",
    active: false,
    completedRaceIds: [],
    message: "",
  };
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

function getPlannedRaceDuration(beatInterval) {
  return NOTE_LEAD_IN + (NOTE_COUNT - 1) * beatInterval + 1.4;
}

function isRaceFinished(state) {
  const race = getCurrentRace(state);
  const distance = getRaceDistance(race);
  const allNotesJudged = state.race.notes.every((note) => note.judged);
  const lastNote = state.race.notes[state.race.notes.length - 1];

  return state.race.progress >= distance || (allNotesJudged && state.race.elapsed > lastNote.time + 0.5);
}

function getRace(raceDayId, raceId) {
  const raceDay = getRaceDay(raceDayId);
  const race = raceDay?.races.find((candidate) => candidate.id === raceId);

  if (!race) {
    throw new Error(`Unknown race: ${raceDayId}/${raceId}`);
  }

  return race;
}

function getRaceDay(raceDayId) {
  const raceDay = raceDays[raceDayId];

  if (!raceDay) {
    throw new Error(`Unknown race day: ${raceDayId}`);
  }

  return raceDay;
}

function getBetweenRaceMessage(raceId) {
  if (raceId === "caldecotte-200m") {
    return "Good start. 200m down, two to go. Don't get cocky.";
  }

  if (raceId === "caldecotte-500m") {
    return "Two down. The 2000m is where races are actually won and lost. Watch the bend markers. Don't rush them.";
  }

  return "";
}

function setRaceCompletionFlag(state, raceId) {
  if (raceId === "caldecotte-200m") {
    setFlag(state, "caldecotte_200m_complete");
  } else if (raceId === "caldecotte-500m") {
    setFlag(state, "caldecotte_500m_complete");
  } else if (raceId === "caldecotte-2000m") {
    setFlag(state, "caldecotte_2000m_complete");
  }
}
