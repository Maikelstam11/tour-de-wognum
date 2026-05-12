import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatDistance(km: number): string {
  return `${km} km`;
}

export function formatElevation(m: number): string {
  return `${m.toLocaleString('nl-NL')} hm`;
}

export function getCountdownData(targetDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
} {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isOver: false,
  };
}

export function adminAuth(request: Request): boolean {
  const auth = request.headers.get('Authorization');
  if (!auth) return false;
  const [, token] = auth.split(' ');
  return token === process.env.ADMIN_PASSWORD;
}
