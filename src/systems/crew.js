import { caldecotteCrewIds, crew } from "../data/crew.js";

export function recruitCrewMember(state, crewId) {
  if (!crew[crewId] || isCrewMemberRecruited(state, crewId)) {
    return false;
  }

  state.progress.recruitedCrew.push(crewId);
  state.progress.flags[`recruited_${crewId}`] = true;

  if (caldecotteCrewIds.every((id) => isCrewMemberRecruited(state, id))) {
    state.progress.flags.caldecotte_crew_ready = true;
  }

  return true;
}

export function isCrewMemberRecruited(state, crewId) {
  return state.progress.recruitedCrew.includes(crewId);
}

export function getRecruitedCrew(state) {
  return state.progress.recruitedCrew.map((crewId) => crew[crewId]).filter(Boolean);
}

export function getCrewTotals(state) {
  return getRecruitedCrew(state).reduce(
    (totals, member) => {
      totals.power += member.stats.power;
      totals.timing += member.stats.timing;
      totals.stamina += member.stats.stamina;
      return totals;
    },
    {
      power: 0,
      timing: 0,
      stamina: 0,
    },
  );
}
