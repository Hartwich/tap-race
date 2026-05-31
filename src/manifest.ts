import type { GameManifest } from "@open-party-lab/game-core";

export const tapRaceManifest = {
  id: "tap-race",
  displayName: "Tap Race",
  description: "Tippe schneller als die anderen bis zum Ziel.",
  minPlayers: 1,
  maxPlayers: 8,
  hostView: "TapRaceHostScene",
  controllerView: "tap-race",
  controllerLayout: "tap_mash",
  supportsTeams: false,
  estimatedRoundDurationMs: 10_000
} as const satisfies GameManifest;

export const manifest = tapRaceManifest;
