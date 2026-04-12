export function fuzzyMatch(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  if (t.includes(q)) return 100;

  let score = 0;
  let lastIndex = -1;
  for (const char of q) {
    const index = t.indexOf(char, lastIndex + 1);
    if (index === -1) return 0;
    score += 1;
    if (index === lastIndex + 1) score += 5;
    lastIndex = index;
  }
  return score;
}
