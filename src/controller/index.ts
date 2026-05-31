import type { ControllerLayoutKey } from "@open-party-lab/game-core";
import { tapRaceManifest } from "../manifest.js";

interface ControllerGameRenderContext {
  state: {
    preferredLanguage?: "de" | "en";
    room?: {
      language?: "de" | "en";
      players?: Array<{ id: string; name: string }>;
    } | null;
    player?: {
      id: string;
    } | null;
    game?: {
      phase?: string;
      message?: string;
      state?: unknown;
    } | null;
  };
  onInput(input: unknown): void;
}

function createTapRaceInput(playerId: string) {
  const now = Date.now();

  return {
    type: "tap",
    playerId,
    sentAt: now,
    pressedAt: now
  };
}

function formatPhase(phase: string | undefined, language: "de" | "en" | undefined): string {
  const en = language === "en";

  switch (phase) {
    case "round_intro":
      return en ? "Round intro" : "Rundenstart";
    case "countdown":
      return en ? "Countdown" : "Countdown";
    case "playing":
      return en ? "Playing" : "Laeuft";
    case "locked":
      return en ? "Locked" : "Gesperrt";
    case "finished":
      return en ? "Finished" : "Beendet";
    default:
      return en ? "Waiting" : "Warten";
  }
}

export const controllerGame = {
  id: tapRaceManifest.id,
  layoutKey: "tap_mash" as ControllerLayoutKey,
  buildLayout({ state, onInput }: ControllerGameRenderContext) {
    const language = state.room?.language ?? state.preferredLanguage;
    const en = language === "en";
    const playerId = state.player?.id ?? "";
    const tapRaceState = (state.game?.state ?? {}) as {
      targetTaps?: number;
      tapsByPlayer?: Record<string, number>;
    };
    const currentTaps = tapRaceState.tapsByPlayer?.[playerId] ?? 0;
    const maxTaps = tapRaceState.targetTaps ?? 50;
    const rows = (state.room?.players ?? []).map((player) => ({
      label: player.name,
      value: `${tapRaceState.tapsByPlayer?.[player.id] ?? 0} Taps`,
      highlighted: player.id === state.player?.id
    }));

    return {
      kind: "tap_mash",
      title: tapRaceManifest.displayName,
      subtitle: formatPhase(state.game?.phase, language),
      buttonLabel: "TAP",
      helperText: state.game?.message ?? (en ? "Tap as fast as you can." : "Tippe so schnell du kannst."),
      disabled: state.game?.phase !== "playing",
      progress: {
        current: currentTaps,
        max: maxTaps
      },
      rows,
      onPress: () => onInput(createTapRaceInput(playerId))
    };
  }
} as const;
