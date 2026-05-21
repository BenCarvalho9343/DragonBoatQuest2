export const dialogue = {
  coachTimTest: {
    speaker: "Coach Tim",
    variants: [
      {
        requires: ["met_coach_tim_test"],
        lines: [
          "Still here?",
          "Good. The game now remembers that we have spoken.",
          "That will become dangerously useful later.",
        ],
      },
    ],
    lines: [
      "Phase 4. Story flags.",
      "The game needs to remember what you've done.",
      "Talk to me once, and a flag gets set.",
    ],
    events: [
      {
        type: "setFlag",
        flag: "met_coach_tim_test",
      },
      {
        type: "setFlag",
        flag: "training_yard_unlocked",
      },
    ],
  },
  clubMemberTest: {
    speaker: "Club Member",
    variants: [
      {
        requires: ["met_coach_tim_test"],
        lines: [
          "Tim spoke to you then?",
          "That yellow exit on the right should work now.",
          "Story flags: tiny switches, enormous consequences.",
        ],
      },
    ],
    lines: [
      "You should talk to Tim first.",
      "He's the blue one nearby, radiating helpful pessimism.",
    ],
  },
  trainingPaddlerTest: {
    speaker: "Training Paddler",
    lines: [
      "You found the second map.",
      "The yellow tiles are exits. Very subtle. Very tasteful.",
    ],
  },
};
