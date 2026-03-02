export const CONFETTI_DURATION_MS = 7000;

const CONFETTI_COLORS = ["#38bdf8", "#60a5fa", "#22d3ee", "#34d399", "#fbbf24", "#fb7185", "#c084fc", "#f97316", "#fde047", "#fca5a5"];
const CONFETTI_COUNT = 96;
const CONFETTI_EMITTERS = [22, 50, 78];

export const CONFETTI_PIECES = Array.from({ length: CONFETTI_COUNT }, (_, idx) => {
  const emitter = CONFETTI_EMITTERS[idx % CONFETTI_EMITTERS.length];
  const theta = (((idx * 137) % 360) * Math.PI) / 180;
  const spread = 90 + (idx % 9) * 15;

  return {
    left: emitter + ((idx % 5) - 2) * 1.1,
    top: 7 + (idx % 6) * 0.45,
    tx: Math.cos(theta) * spread,
    ty: Math.abs(Math.sin(theta)) * (spread + 90) + 90,
    rotate: 120 + ((idx * 53) % 720),
    width: 6 + (idx % 4) * 2,
    height: 10 + (idx % 5) * 2,
    delay: (idx % 8) * 0.04,
    duration: 6 + (idx % 6) * 0.2,
    color: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
  };
});
