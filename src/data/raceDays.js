export const raceDays = {
  caldecotte: {
    id: "caldecotte",
    venue: "Caldecotte Lake",
    rival: "Soaring Dragons",
    briefingSpeaker: "Coach Tim",
    briefing: [
      "Right. Three races today. 200, 500, and 2000.",
      "Win all three and Soaring Dragons go home empty handed.",
      "Lose any one of them and we start the day again. Simple.",
    ],
    races: [
      {
        id: "caldecotte-200m",
        distance: "200m",
        bpm: 120,
        bends: 0,
        difficulty: "Easy",
      },
      {
        id: "caldecotte-500m",
        distance: "500m",
        bpm: 100,
        bends: 0,
        difficulty: "Easy",
      },
      {
        id: "caldecotte-2000m",
        distance: "2000m",
        bpm: 90,
        bends: 3,
        difficulty: "Tutorial Hard",
      },
    ],
  },
};
