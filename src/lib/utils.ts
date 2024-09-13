import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function formatDuration(milliseconds: number): string {
  const totalSeconds = milliseconds / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds.toFixed(3)}s`);

  return parts.join(' ');
}

export function timeOperation<T>(operation: () => T): [T, string] {
  const start = performance.now();
  const output = operation();
  const end = performance.now();
  const duration = end - start;
  return [output, formatDuration(duration)];
}