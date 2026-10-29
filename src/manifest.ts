import { tapRaceText } from "./catalogText.js";
﻿import type { GameManifest } from "@open-party-lab/game-core";

export const tapRaceManifest = {
  id: "tap-race",
  translations: tapRaceText,
  displayName: "Tap Race",
  description: "Tippe schneller als die anderen bis zum Ziel.",
  minPlayers: 1,
  maxPlayers: 8,
  hostView: "TapRaceHostScene",
  controllerView: "tap-race",
  controllerLayout: "tap_mash",
  supportsTeams: false,
  estimatedRoundDurationMs: 10_000,

  ownsScreens: ["round_intro", "result"],
  visual: { accent: "#5b8f7d", icon: "hand", eyebrow: "Mash" },
  audio: { track: { profile: "arcade", bpm: 148, rootMidi: 65, masterGain: 0.16 } },
} as const satisfies GameManifest;

export const manifest = tapRaceManifest;
