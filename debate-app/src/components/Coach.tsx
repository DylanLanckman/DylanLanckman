import React from 'react';
import { UserProfile } from '../types';
import { getRole, ROLES, LEVEL_THRESHOLDS, getLevel } from '../utils/storage';
import { lessons } from '../data/lessons';
import { exercises } from '../data/exercises';
import { User, TrendingUp, Target, Award } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

export const Coach: React.FC<Props> = ({ profile }) => {
  const role = getRole(profile.xp);
  const level = getLevel(profile.xp);

  const completedLessons = lessons.filter((l) => profile.completedLessons.includes(l.id));
  const completedExercises = exercises.filter((e) => profile.completedExercises.includes(e.id));

  // Analysis
  const categoryProgress: Record<string, { done: number; total: number }> = {};
  lessons.forEach((l) => {
    if (!categoryProgress[l.category]) categoryProgress[l.category] = { done: 0, total: 0 };
    categoryProgress[l.category].total++;
    if (profile.completedLessons.includes(l.id)) categoryProgress[l.category].done++;
  });

  const categoryLabels: Record<string, string> = {
    kernwaarden: 'Kernwaarden',
    economie: 'Economie',
    retoriek: 'Retoriek',
    strategie: 'Strategie',
    ethiek: 'Ethiek',
  };

  const nextRole = ROLES.find((r) => r.minXP > profile.xp);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <User size={20} className="text-emerald-400" />
          <h2 className="text-white text-xl font-bold">Persoonlijke Coach</h2>
        </div>
        <p className="text-slate-400 text-sm">Jouw voortgang en aanbevelingen.</p>
      </div>

      {/* Current status */}
      <div className="bg-gradient-to-br from-emerald-900/30 to-slate-800 rounded-xl p-5 border border-emerald-800/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{role.icon}</span>
          <div>
            <h3 className="text-white font-bold text-lg">{role.name}</h3>
            <p className="text-slate-400 text-sm">Niveau {level} · {profile.xp} XP</p>
          </div>
        </div>
        {nextRole && (
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1.5">
              Volgende rol: <span className="text-white">{nextRole.icon} {nextRole.name}</span> bij {nextRole.minXP} XP
            </p>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(((profile.xp - role.minXP) / (nextRole.minXP - role.minXP)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-slate-500 text-xs mt-1">{nextRole.minXP - profile.xp} XP te gaan</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-400" />
          Statistieken
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Streak', value: `${profile.streak} dagen`, color: 'text-orange-400' },
            { label: 'Debatten', value: profile.totalDebates, color: 'text-blue-400' },
            { label: 'Oefeningen', value: profile.totalExercises, color: 'text-purple-400' },
            { label: 'Arsenaal', value: profile.archive.length, color: 'text-yellow-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">{label}</p>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category progress */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Target size={16} className="text-blue-400" />
          Voortgang per categorie
        </h3>
        <div className="space-y-3">
          {Object.entries(categoryProgress).map(([cat, { done, total }]) => (
            <div key={cat}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{categoryLabels[cat] ?? cat}</span>
                <span className="text-slate-400">{done}/{total}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Award size={16} className="text-yellow-400" />
          Behaalde rollen
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => {
            const unlocked = profile.xp >= r.minXP;
            return (
              <div
                key={r.name}
                className={`rounded-lg p-3 border ${unlocked ? 'bg-emerald-900/20 border-emerald-800/40' : 'bg-slate-700/30 border-slate-700 opacity-50'}`}
              >
                <p className="text-lg">{r.icon}</p>
                <p className={`text-xs font-medium mt-1 ${unlocked ? 'text-white' : 'text-slate-500'}`}>{r.name}</p>
                {!unlocked && <p className="text-xs text-slate-600">{r.minXP} XP</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Aanbevelingen */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h3 className="text-white font-semibold text-sm mb-3">Aanbevelingen</h3>
        <div className="space-y-2">
          {lessons.filter((l) => !profile.completedLessons.includes(l.id)).slice(0, 2).map((l) => (
            <div key={l.id} className="flex items-center gap-2 text-sm text-slate-300">
              <span className="text-blue-400">📚</span>
              <span>Voltooi les: <span className="text-white">{l.title}</span></span>
            </div>
          ))}
          {exercises.filter((e) => !profile.completedExercises.includes(e.id)).slice(0, 2).map((e) => (
            <div key={e.id} className="flex items-center gap-2 text-sm text-slate-300">
              <span className="text-purple-400">⚔️</span>
              <span>Oefen: <span className="text-white">{e.title}</span></span>
            </div>
          ))}
          {profile.streak < 3 && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="text-orange-400">🔥</span>
              <span>Bouw je streak op: studeer dagelijks</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
