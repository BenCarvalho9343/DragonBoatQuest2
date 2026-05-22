import { recruitCrewMember } from "./crew.js";

export function createProgressState() {
  return {
    flags: {},
    recruitedCrew: [],
    inventory: [],
    trophies: [],
  };
}

export function hasFlag(state, flag) {
  return Boolean(state.progress.flags[flag]);
}

export function setFlag(state, flag, value = true) {
  state.progress.flags[flag] = value;
}

export function applyEvents(state, events = []) {
  for (const event of events) {
    if (event.type === "setFlag") {
      setFlag(state, event.flag, event.value ?? true);
    } else if (event.type === "addCrew") {
      recruitCrewMember(state, event.crewId);
    }
  }
}
