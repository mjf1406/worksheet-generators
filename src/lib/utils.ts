import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { conversationStarters } from '~/lib/constants';

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

export const getFirstName = (fullName: string | null | undefined): string => {
  if (!fullName?.trim()) return "Student";
  const nameParts = fullName.trim().split(" ");
  return nameParts[1] ?? "Student";
};

export const getRandomConversationStarter = (): string => {
  const randomIndex = Math.floor(Math.random() * conversationStarters.length);
  return conversationStarters[randomIndex]?.text ?? "";
};

export function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}