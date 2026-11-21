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
  },
  "es": { "displayName": "Tap Race", "description": "Toca más rápido que los demás para llegar primero a la meta.", "visual": { "eyebrow": "Toques" } },
  "fr": { "displayName": "Tap Race", "description": "Tapez plus vite que les autres pour franchir la ligne d’arrivée en premier.", "visual": { "eyebrow": "Tapotement" } },
  "pt-BR": { "displayName": "Tap Race", "description": "Toque mais rápido que os outros para chegar primeiro à linha de chegada.", "visual": { "eyebrow": "Toques" } }
} as const satisfies LocalizedGameTextMap;
