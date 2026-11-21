import Phaser from "phaser";
import type { SupportedLanguage } from "@open-party-lab/game-core";
import { tokens } from "./platformTheme.js";

interface TapRaceRenderState {
  targetTaps?: number;
  tapsByPlayer?: Record<string, number>;
  winnerName?: string;
  winningTapCount?: number;
  message?: string;
}

const hostTheme = {
  titleFont: "Trebuchet MS, Arial, sans-serif",
  bodyFont: "Trebuchet MS, Arial, sans-serif",
  get text() {
    return tokens().color.text;
  }
};

const lanePalette = ["#38bdf8", "#f97316", "#a78bfa", "#34d399", "#facc15", "#fb7185"];

function clampProgress(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

export function renderTapRaceState(
  scene: Phaser.Scene,
  state: TapRaceRenderState,
  playerNames: Record<string, string>,
  language?: SupportedLanguage
): void {
  const words = {
    de: { wins: "gewinnt!", title: "Leiter-Rennen", reached: "Klicks erreicht", subtitle: "Klickt schnell, um die Leiter hochzuklettern.", wait: "Warte auf Spieler ...", target: "Ziel", taps: "Klicks" },
    en: { wins: "wins!", title: "Ladder Race", reached: "taps reached", subtitle: "Tap quickly to climb the ladder.", wait: "Waiting for players ...", target: "Target", taps: "taps" },
    es: { wins: "¡gana!", title: "Carrera de escalera", reached: "toques alcanzados", subtitle: "Toca rápido para subir la escalera.", wait: "Esperando jugadores...", target: "Meta", taps: "toques" },
    fr: { wins: "gagne !", title: "Course à l’échelle", reached: "tapes atteintes", subtitle: "Tapez vite pour grimper à l’échelle.", wait: "En attente des joueurs...", target: "Objectif", taps: "tapes" },
    "pt-BR": { wins: "venceu!", title: "Corrida da escada", reached: "toques alcançados", subtitle: "Toque rápido para subir a escada.", wait: "Aguardando jogadores...", target: "Meta", taps: "toques" }
  }[language ?? "de"];
  const targetTaps = state.targetTaps ?? 50;
  const tapsByPlayer = state.tapsByPlayer ?? {};
  const playerIds = Object.keys(tapsByPlayer);
  const hasPlayers = playerIds.length > 0;

  const title = state.winnerName
    ? `${state.winnerName} ${words.wins}`
    : words.title;

  const subtitle = state.winnerName
    ? `${state.winningTapCount ?? 0}/${targetTaps} ${words.reached}`
    : state.message ?? words.subtitle;

  scene.add
    .text(scene.scale.width / 2, 60, title, {
      fontFamily: hostTheme.titleFont,
      fontSize: "56px",
      color: hostTheme.text,
      align: "center"
    })
    .setOrigin(0.5, 0);

  scene.add
    .text(scene.scale.width / 2, 128, subtitle, {
      fontFamily: hostTheme.bodyFont,
      fontSize: "30px",
      color: tokens().color.textSoft,
      align: "center"
    })
    .setOrigin(0.5, 0);

  if (!hasPlayers) {
    scene.add
      .text(scene.scale.width / 2, scene.scale.height / 2, words.wait, {
        fontFamily: hostTheme.bodyFont,
        fontSize: "34px",
        color: hostTheme.text
      })
      .setOrigin(0.5);
    return;
  }

  const left = 120;
  const right = scene.scale.width - 120;
  const top = 230;
  const bottom = scene.scale.height - 120;
  const laneWidth = (right - left) / playerIds.length;

  scene.add
    .text(scene.scale.width / 2, bottom + 30, `${words.target}: ${targetTaps} ${words.taps}`, {
      fontFamily: hostTheme.bodyFont,
      fontSize: "26px",
      color: tokens().color.muted
    })
    .setOrigin(0.5, 0.5);

  playerIds.forEach((playerId, index) => {
    const taps = tapsByPlayer[playerId] ?? 0;
    const progress = clampProgress(taps / targetTaps);
    const laneX = left + index * laneWidth + laneWidth / 2;
    const laneColor = lanePalette[index % lanePalette.length];
    const ladderHeight = bottom - top;

    const ladder = scene.add.graphics();
    ladder.lineStyle(6, 0xe2e8f0, 0.9);
    ladder.beginPath();
    ladder.moveTo(laneX - 24, top);
    ladder.lineTo(laneX - 24, bottom);
    ladder.moveTo(laneX + 24, top);
    ladder.lineTo(laneX + 24, bottom);

    const rungs = 10;
    for (let rungIndex = 0; rungIndex <= rungs; rungIndex += 1) {
      const y = bottom - (ladderHeight / rungs) * rungIndex;
      ladder.moveTo(laneX - 24, y);
      ladder.lineTo(laneX + 24, y);
    }
    ladder.strokePath();

    const playerY = bottom - progress * ladderHeight;
    const token = scene.add.circle(laneX, playerY, 16, Number.parseInt(laneColor.slice(1), 16), 1);
    token.setStrokeStyle(4, 0x0f172a, 1);

    scene.add
      .text(laneX, bottom + 8, playerNames[playerId] ?? playerId, {
        fontFamily: hostTheme.bodyFont,
        fontSize: "22px",
        color: hostTheme.text,
        align: "center"
      })
      .setOrigin(0.5, 0);

    scene.add
      .text(laneX, playerY - 26, `${taps}`, {
        fontFamily: hostTheme.bodyFont,
        fontSize: "20px",
        color: laneColor
      })
      .setOrigin(0.5, 1);
  });
}
