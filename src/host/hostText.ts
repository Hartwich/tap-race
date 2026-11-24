import type { SupportedLanguage } from "@open-party-lab/game-core";

export const hostText = {
  de: {
    title: "Leiter-Rennen", target: "Ziel", taps: "Klicks", ready: "Gleich geht es los",
    waiting: "Warte auf Spieler …", over: "Runde vorbei", standings: "Punktestand",
    noPoints: "Noch keine Punkte.", next: "Meldet euch für die nächste Runde bereit.",
    wins: (name: string) => `${name} gewinnt!`
  },
  en: {
    title: "Ladder Race", target: "Target", taps: "taps", ready: "Starting shortly",
    waiting: "Waiting for players …", over: "Round over", standings: "Standings",
    noPoints: "No points yet.", next: "Ready up for the next round.",
    wins: (name: string) => `${name} wins!`
  },
  es: {
    title: "Carrera de escalera", target: "Meta", taps: "toques", ready: "La partida está por comenzar",
    waiting: "Esperando jugadores …", over: "Fin de la ronda", standings: "Clasificación",
    noPoints: "Aún no hay puntos.", next: "Prepárate para la siguiente ronda.",
    wins: (name: string) => `¡${name} gana!`
  },
  fr: {
    title: "Course à l’échelle", target: "Objectif", taps: "tapes", ready: "La partie commence bientôt",
    waiting: "En attente des joueurs …", over: "Manche terminée", standings: "Classement",
    noPoints: "Aucun point pour le moment.", next: "Préparez-vous pour la prochaine manche.",
    wins: (name: string) => `${name} gagne !`
  },
  "pt-BR": {
    title: "Corrida da escada", target: "Meta", taps: "toques", ready: "A partida vai começar",
    waiting: "Aguardando jogadores …", over: "Fim da rodada", standings: "Classificação",
    noPoints: "Ainda não há pontos.", next: "Prepare-se para a próxima rodada.",
    wins: (name: string) => `${name} venceu!`
  }
} satisfies Record<SupportedLanguage, {
  title: string;
  target: string;
  taps: string;
  ready: string;
  waiting: string;
  over: string;
  standings: string;
  noPoints: string;
  next: string;
  wins: (name: string) => string;
}>;
