import type { ControllerLayoutKey, SupportedLanguage } from "@open-party-lab/game-core";
import { tapRaceManifest } from "../manifest.js";

interface ControllerGameRenderContext {
  state: {
    preferredLanguage?: SupportedLanguage;
    room?: {
      language?: SupportedLanguage;
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

function formatPhase(phase: string | undefined, language: SupportedLanguage | undefined): string {
  const words = {
    de: ["Rundenstart", "Countdown", "Läuft", "Gesperrt", "Beendet", "Warten"],
    en: ["Round intro", "Countdown", "Playing", "Locked", "Finished", "Waiting"],
    es: ["Inicio de ronda", "Cuenta atrás", "En juego", "Bloqueado", "Finalizado", "Esperando"],
    fr: ["Début de manche", "Compte à rebours", "En jeu", "Verrouillé", "Terminé", "En attente"],
    "pt-BR": ["Início da rodada", "Contagem regressiva", "Em jogo", "Bloqueado", "Finalizado", "Aguardando"]
  }[language ?? "de"];
  switch (phase) {
    case "round_intro": return words[0];
    case "countdown": return words[1];
    case "playing": return words[2];
    case "locked": return words[3];
    case "finished": return words[4];
    default: return words[5];
  }
}

export const controllerGame = {
  id: tapRaceManifest.id,
  layoutKey: "tap_mash" as ControllerLayoutKey,
  buildLayout({ state, onInput }: ControllerGameRenderContext) {
    const language = state.room?.language ?? state.preferredLanguage;
    const words = {
      de: { oneTap: "Klick", taps: "Klicks", button: "TIPPEN", helper: "Tippe so schnell du kannst." },
      en: { oneTap: "tap", taps: "taps", button: "TAP", helper: "Tap as fast as you can." },
      es: { oneTap: "toque", taps: "toques", button: "TOCAR", helper: "Toca tan rápido como puedas." },
      fr: { oneTap: "tape", taps: "tapes", button: "TAPER", helper: "Tapez aussi vite que possible." },
      "pt-BR": { oneTap: "toque", taps: "toques", button: "TOCAR", helper: "Toque o mais rápido que puder." }
    }[language ?? "de"];
    const playerId = state.player?.id ?? "";
    const tapRaceState = (state.game?.state ?? {}) as {
      targetTaps?: number;
      tapsByPlayer?: Record<string, number>;
    };
    const currentTaps = tapRaceState.tapsByPlayer?.[playerId] ?? 0;
    const maxTaps = tapRaceState.targetTaps ?? 50;
    const rows = (state.room?.players ?? []).map((player) => ({
      label: player.name,
      value: `${tapRaceState.tapsByPlayer?.[player.id] ?? 0} ${(tapRaceState.tapsByPlayer?.[player.id] ?? 0) === 1 ? words.oneTap : words.taps}`,
      highlighted: player.id === state.player?.id
    }));

    return {
      kind: "tap_mash",
      title: tapRaceManifest.translations[language ?? "de"].displayName,
      subtitle: formatPhase(state.game?.phase, language),
      buttonLabel: words.button,
      helperText: state.game?.message ?? words.helper,
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
