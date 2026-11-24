export const hostStyle = `
.tr-stage {
  --tr-ink: #18243c;
  --tr-paper: #ffefd5;
  --tr-lanes: 1;
  --tr-labels-width: 90%;
  position: absolute;
  inset: 0;
  isolation: isolate;
  overflow: hidden;
  color: var(--tr-ink);
  background: url('/tap-race/alpine-sunrise.jpg') center / cover no-repeat,
    linear-gradient(153deg, #ffdbab 0%, #f5e4d5 27%, #b4cddd 55%, #65878c 100%);
  font: 650 1rem/1.28 'Trebuchet MS', 'Segoe UI', sans-serif;
}
.tr-stage *, .tr-stage *::before, .tr-stage *::after { box-sizing: border-box; }
.tr-stage [hidden] { display: none; }
.tr-canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.tr-stage:not([data-renderer='3d']) .tr-canvas { visibility: hidden; }
.tr-stage[data-renderer='3d'] .tr-fallback { display: none; }
.tr-heading { position: absolute; inset: clamp(10px, 1.7vh, 28px) 5% auto; text-align: center; }
.tr-heading h1, .tr-heading p, .tr-result h2, .tr-result h3, .tr-result p { margin: 0; }
.tr-heading h1 {
  overflow-wrap: anywhere;
  font: 900 clamp(29px, min(6.15vw, 9.5vh), 116px)/0.99 system-ui, sans-serif;
  letter-spacing: -0.069em;
  text-wrap: balance;
  text-shadow: 0 2px 10px #fff2d9aa;
}
.tr-heading p {
  margin-top: clamp(3px, 0.65vh, 10px);
  font-size: clamp(13px, min(2.25vw, 3.65vh), 42px);
  font-weight: 800;
  text-shadow: 0 1px 7px #fff0d8, 0 0 16px #fff8ed;
}
.tr-labels, .tr-fallback-lanes {
  position: absolute;
  left: 50%;
  width: var(--tr-labels-width);
  transform: translateX(-50%);
  display: grid;
  grid-template-columns: repeat(var(--tr-lanes), minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}
.tr-labels { bottom: clamp(9px, 3.05vh, 36px); }
.tr-label {
  justify-self: center;
  min-width: 0;
  max-width: calc(100% - 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(4px, 0.6vw, 11px);
  padding: clamp(6px, 1.25vh, 14px) clamp(7px, 1.05vw, 20px);
  border: 1px solid #fff6e2;
  border-radius: clamp(8px, 1vw, 18px);
  background: var(--tr-paper);
  box-shadow: 0 4px 1px #4a35234a, 0 9px 18px #30231944;
  font-size: clamp(12px, min(1.55vw, 2.8vh), 30px);
  white-space: nowrap;
}
.tr-label::before {
  content: '';
  flex: none;
  width: 0.76em;
  height: 0.76em;
  border-radius: 50%;
  background: var(--tr-color);
  box-shadow: inset 0 -1px 2px #2b20382b;
}
.tr-label strong, .tr-result-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tr-count { flex: none; color: #58463b; font-weight: 800; font-variant-numeric: tabular-nums; }
.tr-label[data-winner='true'] { outline: 3px solid var(--tr-color); outline-offset: 2px; }

.tr-fallback {
  position: absolute;
  inset: 24% 0 13%;
  border-radius: 24px 42px 12px 14px;
  background: repeating-linear-gradient(6deg, #9f6a46, #b77b52 12%, #c58a61 16%, #bc8058 30%);
  box-shadow: 0 12px 0 #8b773e, 0 24px 0 #845837;
}
.tr-fallback::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: clamp(9px, 2.4vh, 26px);
  border-radius: inherit;
  background: repeating-conic-gradient(#fff2d1 0% 25%, #d86e34 0% 50%) 50% / 28px 100%;
}
.tr-fallback-lanes { inset-block: 0; }
.tr-fallback-lane {
  position: relative;
  justify-self: center;
  height: 100%;
  width: min(48%, 82px);
  border-inline: clamp(4px, 0.7vw, 11px) solid #d8984d;
  border-radius: 4px;
  background: repeating-linear-gradient(transparent 0 7%, #e1a25d 7% 9%);
  box-shadow: 2px 0 5px #573217a6, inset 2px 0 5px #57321770;
}
.tr-fallback-racer {
  position: absolute;
  bottom: var(--tr-progress);
  left: 50%;
  width: clamp(12px, 3vw, 48px);
  aspect-ratio: 1;
  transform: translate(-50%, 20%);
  border: 3px solid #fff4dc;
  border-radius: 50%;
  background: var(--tr-color);
  box-shadow: 2px 4px 8px #4b292f83;
  transition: bottom 110ms ease-out;
}

.tr-results {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 14px;
  background: #36272054;
}
.tr-result {
  width: min(100%, 36rem);
  max-height: 100%;
  overflow: auto;
  padding: clamp(16px, 3.5vh, 38px) clamp(18px, 3.7vw, 42px);
  border: 1px solid #fff6e2;
  border-radius: clamp(14px, 2vw, 28px);
  background: #fff1dbf5;
  box-shadow: 0 14px 60px #39281870;
}
.tr-result h2 { font: 900 clamp(24px, 5vh, 52px)/1.05 system-ui, sans-serif; letter-spacing: -0.055em; }
.tr-result p { margin-top: 7px; }
.tr-result h3 { margin-top: clamp(11px, 2.3vh, 24px); font-size: clamp(12px, 2.4vh, 20px); }
.tr-result ol { margin: 4px 0 10px; padding: 0; list-style: none; }
.tr-result li {
  display: grid;
  grid-template-columns: 1.6rem minmax(0, 1fr) 3rem 3rem;
  align-items: baseline;
  gap: 0.35rem;
  padding-block: clamp(3px, 0.72vh, 9px);
  border-bottom: 1px solid #7453302e;
  font-variant-numeric: tabular-nums;
}
.tr-result-rank, .tr-result-delta, .tr-result-next { color: #715637; }
.tr-result-delta, .tr-result-total { text-align: right; }
.tr-result-next { font-size: 0.91em; }
@media (max-width: 720px) {
  .tr-label { column-gap: 3px; row-gap: 1px; flex-wrap: wrap; padding-inline: 4px; }
  .tr-label strong { max-width: calc(100% - 14px); }
  .tr-count { font-size: 0.88em; }
}
@media (prefers-reduced-motion: reduce) { .tr-fallback-racer { transition: none; } }
`;
