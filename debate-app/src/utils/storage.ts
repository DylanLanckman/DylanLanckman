import { UserProfile } from '../types';

const PROFILE_KEY = 'debat_academie_profile';
const API_KEY = 'debat_academie_api_key';

export const ROLES = [
  { minXP: 0, name: 'Leerling van Daens', icon: '📚' },
  { minXP: 200, name: 'Framebreker', icon: '🔍' },
  { minXP: 500, name: 'Waardigheidsverdediger', icon: '⚖️' },
  { minXP: 1000, name: 'Sociaal Strateeg', icon: '🎯' },
  { minXP: 2000, name: 'Debatmeester', icon: '🏆' },
];

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2700, 3500, 4500, 6000];

export function getLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPForNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return { current, needed, progress: Math.round((current / needed) * 100) };
}

export function getRole(xp: number): typeof ROLES[0] {
  for (let i = ROLES.length - 1; i >= 0; i--) {
    if (xp >= ROLES[i].minXP) return ROLES[i];
  }
  return ROLES[0];
}

const DEFAULT_PROFILE: UserProfile = {
  level: 1,
  xp: 0,
  streak: 0,
  lastStudied: '',
  completedLessons: [],
  completedExercises: [],
  weakTopics: [],
  strongTopics: [],
  archive: [],
  dailyXP: 0,
  lastXPDate: '',
  totalDebates: 0,
  totalExercises: 0,
  role: 'Leerling van Daens',
};

export function loadProfile(): UserProfile {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function addXP(profile: UserProfile, amount: number): UserProfile {
  const today = new Date().toISOString().split('T')[0];
  const isNewDay = profile.lastXPDate !== today;

  const newXP = profile.xp + amount;
  const newDailyXP = isNewDay ? amount : profile.dailyXP + amount;
  const newLevel = getLevel(newXP);
  const role = getRole(newXP);

  // Streak logic
  let newStreak = profile.streak;
  if (isNewDay) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (profile.lastStudied === yesterdayStr) {
      newStreak = profile.streak + 1;
    } else if (profile.lastStudied !== today) {
      newStreak = 1;
    }
  }

  return {
    ...profile,
    xp: newXP,
    level: newLevel,
    dailyXP: newDailyXP,
    lastXPDate: today,
    lastStudied: today,
    streak: newStreak,
    role: role.name,
  };
}

export function markLessonComplete(profile: UserProfile, lessonId: string): UserProfile {
  if (profile.completedLessons.includes(lessonId)) return profile;
  return addXP(
    { ...profile, completedLessons: [...profile.completedLessons, lessonId] },
    50
  );
}

export function markExerciseComplete(profile: UserProfile, exerciseId: string): UserProfile {
  const updated = profile.completedExercises.includes(exerciseId)
    ? profile
    : { ...profile, completedExercises: [...profile.completedExercises, exerciseId], totalExercises: profile.totalExercises + 1 };
  return addXP(updated, 30);
}

export function addToArchive(
  profile: UserProfile,
  item: Omit<UserProfile['archive'][0], 'id' | 'date'>
): UserProfile {
  const newItem = {
    ...item,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
  };
  return { ...profile, archive: [newItem, ...profile.archive].slice(0, 100) };
}

export function loadApiKey(): string {
  return localStorage.getItem(API_KEY) ?? '';
}

export function saveApiKey(key: string): void {
  localStorage.setItem(API_KEY, key);
}
