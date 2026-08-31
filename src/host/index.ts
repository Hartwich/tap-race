import Phaser from "phaser";
import { tapRaceManifest } from "../manifest.js";
import { renderTapRaceState } from "./TapRaceRenderer.js";
import { renderRoundScreens } from "./roundScreens.js";
import { bindPlatformTheme, tokens } from "./platformTheme.js";

interface HostClientLike {
  subscribe(callback: (state: HostAppStateLike) => void): () => void;
}

interface HostAppStateLike {
  game?: {
    state?: unknown;
  } | null;
  room?: {
    language?: "de" | "en";
    players?: Array<{ id: string; name: string }>;
  } | null;
}

export class TapRaceHostScene extends Phaser.Scene {
  private unsubscribe?: () => void;

  constructor() {
    super(tapRaceManifest.hostView);
  }

  create(): void {
    bindPlatformTheme(this.registry);
    const client = this.registry.get("hostClient") as HostClientLike;

    this.unsubscribe = client.subscribe((state) => {
      // Intro and result screens belong to this game, not the platform.
      if (renderRoundScreens(this, state)) {
        return;
      }

      const gameState = state.game?.state as
        | {
            targetTaps?: number;
            tapsByPlayer?: Record<string, number>;
            winnerName?: string;
            winningTapCount?: number;
            message?: string;
          }
        | undefined;

      const playerNames = Object.fromEntries(
        (state.room?.players ?? []).map((player) => [player.id, player.name])
      );

      this.children.removeAll(true);
      this.cameras.main.setBackgroundColor(tokens().color.surface);
      renderTapRaceState(this, gameState ?? {}, playerNames, state.room?.language);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribe?.();
      this.unsubscribe = undefined;
    });
  }
}

export const hostGame = {
  id: tapRaceManifest.id,
  displayName: tapRaceManifest.displayName,
  sceneKey: tapRaceManifest.hostView,
  scene: TapRaceHostScene
} as const;
