import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { config } from '../config';
import type { SessionType } from '../types/f1.types';

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatSessionDate(date: Date): string {
  return dayjs(date).tz(config.TIMEZONE).format('DD/MM (ddd)');
}

export function formatSessionTime(date: Date): string {
  return dayjs(date).tz(config.TIMEZONE).format('HH:mm');
}

export function formatSessionDateTime(date: Date): string {
  return dayjs(date).tz(config.TIMEZONE).format('DD/MM [às] HH:mm');
}

export function formatCountdown(date: Date): string {
  const diff = dayjs(date).diff(dayjs(), 'minute');
  if (diff <= 0) return 'Encerrado!';
  if (diff < 60) return `${diff} min`;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}

export const SESSION_NAME_PT: Record<SessionType, string> = {
  'Practice 1': 'Treino Livre 1 🔧',
  'Practice 2': 'Treino Livre 2 🔧',
  'Practice 3': 'Treino Livre 3 🔧',
  'Sprint Qualifying': 'Classificação Sprint ⚡',
  'Sprint': 'Sprint 💨',
  'Qualifying': 'Classificação 🏁',
  'Race': 'Corrida 🏆',
};

export const SESSION_COLOR: Record<SessionType, number> = {
  'Practice 1': 0x3498db,
  'Practice 2': 0x3498db,
  'Practice 3': 0x3498db,
  'Sprint Qualifying': 0x9b59b6,
  'Sprint': 0xe74c3c,
  'Qualifying': 0xf39c12,
  'Race': 0xe8010d,
};

export function getTeamEmoji(teamName: string): string {
  const map: Record<string, string> = {
    'Red Bull Racing': '🐂',
    'Ferrari': '🐎',
    'Mercedes': '⭐',
    'McLaren': '🧡',
    'Aston Martin': '🟢',
    'Alpine': '🔵',
    'Williams': '🔷',
    'RB': '🔴',
    'Kick Sauber': '🍀',
    'Haas F1 Team': '🇺🇸',
  };
  return map[teamName] ?? '🏎️';
}

export function getMedalEmoji(position: number): string {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return `**${position}.**`;
}
