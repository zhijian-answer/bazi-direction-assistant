export function readPositiveInt(name: string, fallback: number) {
  const raw = Number(process.env[name]);
  if (!Number.isFinite(raw) || raw <= 0) {
    return fallback;
  }
  return Math.floor(raw);
}

export const appLimits = {
  dailyQuestionLimit: readPositiveInt("DAILY_QUESTION_LIMIT", 5),
  maxProfilesPerUser: readPositiveInt("MAX_PROFILES_PER_USER", 3),
  maxQuestionChars: readPositiveInt("MAX_QUESTION_CHARS", 500),
  maxCheckinActionChars: readPositiveInt("MAX_CHECKIN_ACTION_CHARS", 160),
  maxCheckinNoteChars: readPositiveInt("MAX_CHECKIN_NOTE_CHARS", 240),
  maxProfileNameChars: readPositiveInt("MAX_PROFILE_NAME_CHARS", 40),
  maxBirthPlaceChars: readPositiveInt("MAX_BIRTH_PLACE_CHARS", 80),
  rateLimitWindowMs: readPositiveInt("RATE_LIMIT_WINDOW_MS", 60_000),
  rateLimitRegister: readPositiveInt("RATE_LIMIT_REGISTER", 10),
  rateLimitLogin: readPositiveInt("RATE_LIMIT_LOGIN", 20),
  rateLimitProfileWrite: readPositiveInt("RATE_LIMIT_PROFILE_WRITE", 20),
  rateLimitQuestionWrite: readPositiveInt("RATE_LIMIT_QUESTION_WRITE", 30),
  rateLimitCheckinWrite: readPositiveInt("RATE_LIMIT_CHECKIN_WRITE", 40),
};

export function trimToLimit(value: string, limit: number) {
  return value.trim().slice(0, limit);
}
