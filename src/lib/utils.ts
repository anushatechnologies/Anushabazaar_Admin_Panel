import { clsx, type ClassValue } from 'clsx';

/** Merge class names (shadcn-compatible cn() without tailwind-merge) */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
