import React, { useState, useEffect } from 'react';
import { UserProfile, View } from '../types';
import { getRole, getXPForNextLevel, getLevel, addXP, saveProfile } from '../utils/storage';
import { lessons } from '../data/lessons';
import { exercises } from '../data/exercises';
import { getPersonalizedTip } from '../utils/claude';
import { loadApiKey } from '../utils/storage';
import { Flame, Trophy, Target, TrendingUp, BookOpen, Zap, ChevronRight, Star } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
  onNavigate: (view: View, id?: string) => void;
}

export const Dashboard: React.FC<Props> = ({ profile, onProfileChange, onNavigate }) => {
  const role = getRole(profile.xp);
  const xpInfo = getXPForNextLevel(profile.xp);
  const [tip, setTip] = useState('');
  const [loadingTip, setLoadingTip] = useState(false);

  const completedPercent = lessons.length > 0
    ? Math.round((profile.completedLessons.length / lessons.length) * 100)
    : 0;

  const nextLesson = lessons.find((l) => !profile.completedLessons.includes(l.id));
  const nextExercise = exercises.find((e) => !profile.completedExercises.includes(e.id));

  const dailyGoal = 100;
  const dailyProgress = Math.min(profile.dailyXP, dailyGoal);

  useEffect(() => {
    const apiKey = loadApiKey();
    if (!apiKey) return;
    setLoadingTip(true);
    let text = '';
    getPersonalizedTip(
      apiKey,
      profile.weakTopics,
      profile.totalExercises > 0 ? 70 : 0,
      (chunk) => { text += chunk; setTip(text); }
    )
      .catch(() => setTip('Oefen vandaag met een repliek-oefening om je reactiesnelheid te verbeteren.'))
      .finally(() => setLoadingTip(false));
  }, []);

  const stats = [
    { label: 'Streak', value: profile.streak, icon: '🔥', color: 'text-orange-400' },
    { label: 'Lessen', value: `${profile.completedLessons.length}/${lessons.length}`, icon: '📚', color: 'text-blue-400' },
    { label: 'Oefeningen', value: profile.totalExercises, icon: '⚔️', color: 'text-purple-400' },
    { label: 'Debatten', value: profile.totalDebates, icon: '🎯', color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-900/50 to-slate-800 rounded-2xl p-6 border border-emerald-800/30">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{role.icon}</span>
              <span className="text-emerald-400 font-semibold">{role.name}</span>
            </div>
            <h2 className="text-white text-2xl font-bold">Niveau {getLevel(profile.xp)}</h2>
            <p className="text-slate-400 text-sm">{profile.xp} XP totaal</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-orange-400 font-bold text-lg">
              <Flame size={20} />
              {profile.streak}
            </div>
            <p className="text-slate-400 text-xs">dag streak</p>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mb-1 flex justify-between text-xs text-slate-400">
          <span>Voortgang naar niveau {getLevel(profile.xp) + 1}</span>
          <span>{xpInfo.current}/{xpInfo.needed} XP</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${xpInfo.progress}%` }}
          />
        </div>
      </div>

      {/* Daily Goal */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-yellow-400" />
            <span className="text-white font-semibold text-sm">Dagelijkse opdracht</span>
          </div>
          <span className="text-yellow-400 text-sm font-bold">{dailyProgress}/{dailyGoal} XP</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${dailyProgress >= dailyGoal ? 'bg-yellow-400' : 'bg-yellow-600'}`}
            style={{ width: `${Math.min((dailyProgress / dailyGoal) * 100, 100)}%` }}
          />
        </div>
        {dailyProgress >= dailyGoal && (
          <p className="text-yellow-400 text-xs mt-2">🎉 Dagelijkse opdracht voltooid!</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <span>{stat.icon}</span>
              <span className="text-slate-400 text-xs">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* AI Coach Tip */}
      <div className="bg-slate-800 rounded-xl p-4 border border-emerald-800/40">
        <div className="flex items-center gap-2 mb-2">
          <Star size={16} className="text-emerald-400" />
          <span className="text-emerald-400 text-sm font-semibold">Coach Tip</span>
        </div>
        {loadingTip ? (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : (
          <p className="text-slate-300 text-sm leading-relaxed">{tip || 'Start een les om gepersonaliseerde tips te ontvangen.'}</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          Snel starten
        </h3>

        {nextLesson && (
          <button
            onClick={() => onNavigate('les', nextLesson.id)}
            className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-700 rounded-xl p-4 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <BookOpen size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Volgende les</p>
                  <p className="text-slate-400 text-xs">{nextLesson.title}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
          </button>
        )}

        {nextExercise && (
          <button
            onClick={() => onNavigate('labo-oefening', nextExercise.id)}
            className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-700 rounded-xl p-4 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <Zap size={18} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Volgende oefening</p>
                  <p className="text-slate-400 text-xs">{nextExercise.title}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>
          </button>
        )}

        <button
          onClick={() => onNavigate('arena')}
          className="w-full bg-gradient-to-r from-red-900/30 to-orange-900/30 hover:from-red-900/50 hover:to-orange-900/50 border border-red-800/30 rounded-xl p-4 text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚔️</span>
              <div>
                <p className="text-white text-sm font-medium">Debat Arena</p>
                <p className="text-slate-400 text-xs">Debatteer live met een AI-tegenstander</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-red-400 transition-colors" />
          </div>
        </button>
      </div>

      {/* Progress Overview */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400" />
            Voortgang
          </h3>
          <span className="text-slate-400 text-xs">{completedPercent}% lessen voltooid</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-2 rounded-full"
            style={{ width: `${completedPercent}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-white font-semibold">{profile.completedLessons.length}</p>
            <p className="text-slate-500">Lessen</p>
          </div>
          <div>
            <p className="text-white font-semibold">{profile.completedExercises.length}</p>
            <p className="text-slate-500">Oefeningen</p>
          </div>
          <div>
            <p className="text-white font-semibold">{profile.archive.length}</p>
            <p className="text-slate-500">Arsenaal</p>
          </div>
        </div>
      </div>
    </div>
  );
};
