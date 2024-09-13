export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]] as [T, T];
  }
  return shuffled;
}

export function getRandomElement<T>(array: T[]): T | null {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex] ?? null;
}
  