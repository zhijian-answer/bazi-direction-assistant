export function formatZodiacDegree(value: number) {
  const normalized = ((value % 30) + 30) % 30;
  const totalMinutes = Math.round(normalized * 60);
  const degree = Math.floor(totalMinutes / 60) % 30;
  const minute = totalMinutes % 60;
  return `${degree}°${String(minute).padStart(2, "0")}′`;
}
