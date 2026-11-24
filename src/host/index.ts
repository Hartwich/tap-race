import type { HostGame, HostGameStateSource, SupportedLanguage } from "@open-party-lab/game-core";
import { tapRaceManifest } from "../manifest.js";
import type { TapRaceState } from "../protocol.js";
import { RaceStage, lanePalette, layoutCourse } from "./RaceStage.js";
import { hostStyle } from "./hostStyle.js";
import { hostText } from "./hostText.js";

interface RoundSummary {
  roundNumber?: number;
  phase?: string;
  message?: string;
}

interface HostState {
  preferredLanguage?: SupportedLanguage;
  room?: {
    language?: SupportedLanguage;
    players?: Array<{ id: string; name: string }>;
    currentRound?: RoundSummary | null;
  } | null;
  game?: (RoundSummary & { gameId?: string; state?: Partial<TapRaceState> }) | null;
  scoreboard?: { entries: Array<{ playerId: string; delta: number; total: number }> } | null;
}

const introPhases = new Set(["round_intro", "countdown"]);
const resultPhases = new Set(["result", "scoreboard", "finished"]);

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setText(node: HTMLElement, text: string): void {
  if (node.textContent !== text) node.textContent = text;
}

function mountTapRace(root: unknown, source: HostGameStateSource): () => void {
  if (!(root instanceof HTMLElement)) return () => undefined;

  const view = element("section", "tr-stage");
  view.dataset.renderer = "fallback";
  const style = element("style", "", hostStyle);
  const heading = element("header", "tr-heading");
  const title = element("h1", "");
  const subtitle = element("p", "");
  subtitle.setAttribute("role", "status");
  heading.append(title, subtitle);

  const labels = element("ul", "tr-labels");
  const fallback = element("div", "tr-fallback");
  fallback.setAttribute("aria-hidden", "true");
  const fallbackLanes = element("div", "tr-fallback-lanes");
  fallback.append(fallbackLanes);

  const results = element("div", "tr-results");
  const result = element("section", "tr-result");
  const resultHeading = element("h2", "");
  const resultMessage = element("p", "");
  const standings = element("h3", "");
  const scores = element("ol", "");
  const noPoints = element("p", "");
  const nextRound = element("p", "tr-result-next");
  result.append(resultHeading, resultMessage, standings, scores, noPoints, nextRound);
  results.append(result);
  results.hidden = true;
  view.append(style, fallback, heading, labels, results);
  root.append(view);

  const stage = RaceStage.mount(view);
  let ids: string[] = [];
  let lanes: Array<{ label: HTMLLIElement; name: HTMLElement; count: HTMLElement; marker: HTMLElement }> = [];
  let layout = layoutCourse(1280, 720, 0);

  function resize(): void {
    const { clientWidth: width, clientHeight: height } = view;
    if (!width || !height) return;
    layout = layoutCourse(width, height, ids.length);
    view.style.setProperty("--tr-labels-width", `${layout.labelsWidth}%`);
    stage?.resize(width, height, layout);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(view);

  const unsubscribe = source.subscribe((input) => {
    const state = (input ?? {}) as HostState;
    const language = state.room?.language ?? state.preferredLanguage ?? "de";
    const copy = hostText[language];
    const round = state.room?.currentRound;
    const game = state.game?.gameId === tapRaceManifest.id && (!round || state.game.roundNumber === round.roundNumber)
      ? state.game : undefined;
    const phase = round?.phase ?? game?.phase ?? "";
    const race = game?.state;
    const target = Math.max(1, race?.targetTaps ?? 50);
    const players = state.room?.players ?? [];
    const names = new Map(players.map(({ id, name }) => [id, name]));
    const taps = race?.tapsByPlayer;
    const racers = (taps ? Object.keys(taps) : players.map(({ id }) => id)).map((id) => {
      const count = taps?.[id] ?? 0;
      return { id, count, progress: Math.max(0, Math.min(count / target, 1)) };
    });
    const rosterChanged = ids.length !== racers.length || racers.some(({ id }, index) => id !== ids[index]);
    if (rosterChanged) {
      ids = racers.map(({ id }) => id);
      view.style.setProperty("--tr-lanes", String(Math.max(1, ids.length)));
      labels.replaceChildren();
      fallbackLanes.replaceChildren();
      lanes = racers.map((_, index) => {
        const color = lanePalette[index % lanePalette.length];
        const label = element("li", "tr-label");
        label.style.setProperty("--tr-color", color);
        const name = element("strong", "");
        const count = element("span", "tr-count");
        label.append(name, count);
        labels.append(label);

        const ladder = element("div", "tr-fallback-lane");
        const marker = element("span", "tr-fallback-racer");
        marker.style.setProperty("--tr-color", color);
        ladder.append(marker);
        fallbackLanes.append(ladder);
        return { label, name, count, marker };
      });
      // The host router reveals its game container after mounting the game.
      // Lane positions also work before the first measurable resize.
      layout = layoutCourse(view.clientWidth || 1280, view.clientHeight || 720, ids.length);
      resize();
    }

    const showResult = resultPhases.has(phase);
    const winner = race?.winnerName;
    heading.hidden = showResult;
    results.hidden = !showResult;
    if (showResult) {
      const entries = state.scoreboard?.entries ?? [];
      setText(resultHeading, winner ? copy.wins(winner) : copy.over);
      setText(resultMessage, winner ? `${race.winningTapCount ?? 0} / ${target} ${copy.taps}` : game?.message ?? round?.message ?? "");
      setText(standings, copy.standings);
      setText(noPoints, copy.noPoints);
      setText(nextRound, copy.next);
      noPoints.hidden = entries.length > 0;
      scores.replaceChildren(...entries.map((entry, index) => {
        const row = element("li", "");
        row.append(
          element("span", "tr-result-rank", String(index + 1)),
          element("strong", "tr-result-name", names.get(entry.playerId) ?? entry.playerId),
          element("span", "tr-result-delta", `${entry.delta >= 0 ? "+" : ""}${entry.delta}`),
          element("strong", "tr-result-total", String(entry.total))
        );
        return row;
      }));
    } else {
      setText(title, winner ? copy.wins(winner) : copy.title);
      const status = introPhases.has(phase)
        ? game?.message ?? round?.message ?? copy.ready
        : phase === "locked"
          ? winner ? `${race.winningTapCount ?? 0} / ${target} ${copy.taps}` : game?.message ?? round?.message
          : undefined;
      setText(subtitle, status ?? (racers.length ? `${copy.target} · ${target} ${copy.taps}` : copy.waiting));
    }

    racers.forEach(({ id, count, progress }, index) => {
      const lane = lanes[index];
      setText(lane.name, names.get(id) ?? id);
      setText(lane.count, `${count} / ${target}`);
      lane.label.dataset.winner = String(race?.winnerPlayerId === id);
      lane.marker.style.setProperty("--tr-progress", `${progress * 100}%`);
    });
    stage?.update(racers, layout, rosterChanged);
  });

  return () => {
    unsubscribe();
    observer.disconnect();
    stage?.dispose();
    view.remove();
  };
}

export const hostGame: HostGame = {
  id: tapRaceManifest.id,
  displayName: tapRaceManifest.displayName,
  mountDom: mountTapRace
};
