export const releaseFeatures = {
  compatibility: true,
  natalChart: true,
  mobileChat: true,
  combinedInsight: false,
  personalityTest: false,
  tarot: false,
  numerology: false,
  archetype: false,
  soulmate: false,
} as const;

export const releasedToolIds = new Set([
  "compat",
  "natal",
  "qa",
]);
