export const dialogue = {
  coachTimCaldecotte: {
    speaker: "Coach Tim",
    variants: [
      {
        requires: ["caldecotte_crew_ready"],
        lines: [
          "That's the Caldecotte crew gathered.",
          "Lesley, Marcus, Dan, Naomi. Nobody has run away yet.",
          "Next we make this mean something on race day.",
        ],
      },
    ],
    lines: [
      "This is Caldecotte Lake.",
      "Boathouse to the west. Dock to the south-east. Car park up north.",
      "At some point all of that will matter terribly.",
    ],
  },
  lesleyCaldecotte: {
    speaker: "Lesley",
    variants: [
      {
        requires: ["recruited_lesley"],
        lines: [
          "I'm with you already.",
          "Seven years at Secklow, and somehow this still feels like the sensible choice.",
        ],
      },
    ],
    lines: [
      "Oh, a new face! Tim said you'd be coming.",
      "I've been with Secklow seven years. Don't let the others intimidate you.",
      "Right, let's get to the dock.",
    ],
    events: [
      {
        type: "addCrew",
        crewId: "lesley",
      },
    ],
  },
  marcusCaldecotte: {
    speaker: "Marcus",
    variants: [
      {
        requires: ["recruited_marcus"],
        lines: [
          "Already signed up.",
          "I'll keep an eye on the race order. Somebody has to.",
        ],
      },
    ],
    lines: [
      "You must be the new recruit. Good timing.",
      "Soaring Dragons are coming today for a friendly. They won't be taking it easy on us.",
      "I'm in.",
    ],
    events: [
      {
        type: "addCrew",
        crewId: "marcus",
      },
    ],
  },
  danCaldecotte: {
    speaker: "Dan",
    variants: [
      {
        requires: ["recruited_dan"],
        lines: [
          "I'm ready when you are.",
          "Still a nice lake. Still not a rest day, apparently.",
        ],
      },
    ],
    lines: [
      "Nice lake, isn't it? I come here even on rest days.",
      "Tim's been talking about this season for months. Says we've got a real shot.",
      "Count me in.",
    ],
    events: [
      {
        type: "addCrew",
        crewId: "dan",
      },
    ],
  },
  naomiCaldecotte: {
    speaker: "Naomi",
    variants: [
      {
        requires: ["recruited_naomi"],
        lines: [
          "I'm in.",
          "And for the record, I still want the 2000m.",
        ],
      },
    ],
    lines: [
      "Finally! I've been waiting by these cars for ages.",
      "Tell Tim I want to race the 2000m today. He always tries to stick me in the 200.",
      "Let's go.",
    ],
    events: [
      {
        type: "addCrew",
        crewId: "naomi",
      },
    ],
  },
  noticeboardMemberCaldecotte: {
    speaker: "Club Member",
    lines: [
      "The fixture list just went up. Seven venues this season.",
      "Loughborough, Nottingham, St Neots, Middlesbrough, Liverpool...",
      "and then the Nationals at the Royal Albert Dock in London.",
    ],
  },
  spectatorCaldecotte: {
    speaker: "Spectator",
    lines: [
      "Soaring Dragons are on their way apparently.",
      "Came third at Nationals last year.",
      "Don't be put off. This is home water.",
    ],
  },
  juniorPaddlerCaldecotte: {
    speaker: "Junior Paddler",
    lines: [
      "I heard the 2000m is the hardest race.",
      "The bends are the tricky bit. Press Z at exactly the right moment.",
    ],
  },
  caldecotteDock: {
    speaker: "Coach Tim",
    variants: [
      {
        requires: ["caldecotte_race_day_ready"],
        lines: [
          "Race day is ready.",
          "Let's go through the briefing before Soaring Dragons start looking organised.",
        ],
        events: [
          {
            type: "openRaceSetup",
            raceDayId: "caldecotte",
          },
        ],
      },
      {
        requires: ["caldecotte_crew_ready"],
        lines: [
          "Right. That's the Caldecotte crew gathered.",
          "Lesley, Marcus, Dan, Naomi. Enough to make this look intentional.",
          "Race day setup is unlocked. Try to look ready.",
        ],
        events: [
          {
            type: "setFlag",
            flag: "caldecotte_race_day_ready",
          },
          {
            type: "openRaceSetup",
            raceDayId: "caldecotte",
          },
        ],
      },
    ],
    lines: [
      "We're not racing with half a crew.",
      "Find Lesley, Marcus, Dan, and Naomi around the lake.",
      "Then come back to the dock.",
    ],
  },
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
