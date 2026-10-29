import type { LocalizedGameTextMap } from "@open-party-lab/game-core";

export const tapRaceText = {
  "de": {
    "displayName": "Tap Race",
    "description": "Tippe schneller als die anderen bis zum Ziel.",
    "visual": {
      "eyebrow": "Tippen"
    }
  },
  "en": {
    "displayName": "Tap Race",
    "description": "Tap faster than the other players to reach the finish first.",
    "visual": {
      "eyebrow": "Mash"
    }
  }
} as const satisfies LocalizedGameTextMap;
