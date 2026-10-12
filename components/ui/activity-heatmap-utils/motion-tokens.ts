/** Shared timing for the supplied heatmap's tooltip and rolling numbers. */
export const motionTokens = {
  ease: {
    enter: [0.16, 1, 0.3, 1],
    standard: [0.22, 1, 0.36, 1],
  },
  duration: { fast: 0.16 },
  blur: { soft: 4, subtle: 2 },
  spring: {
    snappy: { type: "spring", stiffness: 480, damping: 38, mass: 0.7 },
    morph: { type: "spring", stiffness: 380, damping: 36, mass: 0.8 },
  },
} as const;
