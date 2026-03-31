import React, { useState } from 'react';
import { View, UserProfile } from '../types';
import { lessons } from '../data/lessons';
import { BookOpen, Lock, CheckCircle, Clock, ChevronRight, Filter } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onNavigate: (view: View, id?: string) => void;
}

const CATEGORIES = ['allemaal', 'kernwaarden', 'economie', 'retoriek', 'strategie', 'ethiek'] as const;

const categoryLabels: Record<string, string> = {
  allemaal: 'Allemaal',
  kernwaarden: 'Kernwaarden',
  economie: 'Economie',
  retoriek: 'Retoriek',
  strategie: 'Strategie',
  ethiek: 'Ethiek',
};

const categoryColors: Record<string, string> = {
  kernwaarden: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50',
  economie: 'bg-blue-900/40 text-blue-400 border-blue-800/50',
  retoriek: 'bg-purple-900/40 text-purple-400 border-purple-800/50',
  strategie: 'bg-orange-900/40 text-orange-400 border-orange-800/50',
  ethiek: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/50',
};

const difficultyLabel = ['', 'Basis', 'Gevorderd', 'Expert'];
const difficultyColor = ['', 'text-green-400', 'text-yellow-400', 'text-red-400'];

export const TheoryLibrary: React.FC<Props> = ({ profile, onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('allemaal');

  const filtered = activeCategory === 'allemaal'
    ? lessons
    : lessons.filter((l) => l.category === activeCategory);

  const completed = profile.completedLessons;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-white text-xl font-bold">Theoriebibliotheek</h2>
        <p className="text-slate-400 text-sm mt-1">
          {completed.length}/{lessons.length} lessen voltooid
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Lessons */}
      <div className="space-y-3">
        {filtered.map((lesson, idx) => {
          const isDone = completed.includes(lesson.id);
          const isLocked = idx > 0 && !completed.includes(filtered[idx - 1]?.id ?? '') && !isDone;

          return (
            <button
              key={lesson.id}
              onClick={() => !isLocked && onNavigate('les', lesson.id)}
              className={`w-full bg-slate-800 rounded-xl p-4 text-left border transition-all ${
                isDone
                  ? 'border-emerald-800/50 opacity-80'
                  : isLocked
                  ? 'border-slate-700 opacity-50 cursor-not-allowed'
                  : 'border-slate-700 hover:border-emerald-700 hover:bg-slate-750'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDone ? 'bg-emerald-900/50' : isLocked ? 'bg-slate-700' : 'bg-slate-700'
                }`}>
                  {isDone ? (
                    <CheckCircle size={20} className="text-emerald-400" />
                  ) : isLocked ? (
                    <Lock size={18} className="text-slate-500" />
                  ) : (
                    <BookOpen size={18} className="text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold text-sm leading-tight ${isDone ? 'text-emerald-300' : 'text-white'}`}>
                      {lesson.title}
                    </h3>
                    {!isLocked && <ChevronRight size={16} className="text-slate-500 flex-shrink-0 mt-0.5" />}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded border ${categoryColors[lesson.category]}`}>
                      {categoryLabels[lesson.category]}
                    </span>
                    <span className={`text-xs font-medium ${difficultyColor[lesson.difficulty]}`}>
                      {difficultyLabel[lesson.difficulty]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={11} />
                      {lesson.durationMin} min
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs mt-2 line-clamp-2">{lesson.coreIdea}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
