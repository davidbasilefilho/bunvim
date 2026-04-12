const LABEL_CHARS = "asdfghjklqwertyuiopzxcvbnm";

export function generateLabels(count: number): string[] {
  const labels: string[] = [];

  for (let i = 0; i < Math.min(count, LABEL_CHARS.length); i++) {
    const char = LABEL_CHARS[i];
    if (char !== undefined) {
      labels.push(char);
    }
  }

  if (count > LABEL_CHARS.length) {
    for (let i = 0; i < LABEL_CHARS.length && labels.length < count; i++) {
      for (let j = 0; j < LABEL_CHARS.length && labels.length < count; j++) {
        const char1 = LABEL_CHARS[i];
        const char2 = LABEL_CHARS[j];
        if (char1 !== undefined && char2 !== undefined) {
          labels.push(char1 + char2);
        }
      }
    }
  }

  return labels;
}
