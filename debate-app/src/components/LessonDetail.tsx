import React from 'react';
import { View, UserProfile } from '../types';
import { lessons } from '../data/lessons';
import { exercises } from '../data/exercises';
import { markLessonComplete, saveProfile } from '../utils/storage';
import { ArrowLeft, CheckCircle, Lightbulb, AlertTriangle, BookOpen, Scale, ChevronRight } from 'lucide-react';

interface Props {
  lessonId: string;
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
  onNavigate: (view: View, id?: string) => void;
}

export const LessonDetail: React.FC<Props> = ({ lessonId, profile, onProfileChange, onNavigate }) => {
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) return <div className="text-white">Les niet gevonden.</div>;

  const isDone = profile.completedLessons.includes(lessonId);
  const lessonExercises = exercises.filter((e) => e.lessonIds.includes(lessonId));

  const handleComplete = () => {
    if (isDone) return;
    const updated = markLessonComplete(profile, lessonId);
    saveProfile(updated);
    onProfileChange(updated);
  };

  const categoryColors: Record<string, string> = {
    kernwaarden: 'text-emerald-400',
    economie: 'text-blue-400',
    retoriek: 'text-purple-400',
    strategie: 'text-orange-400',
    ethiek: 'text-yellow-400',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <button
        onClick={() => onNavigate('theorie')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Terug naar bibliotheek
      </button>

      <div>
        <span className={`text-xs font-semibold uppercase tracking-wide ${categoryColors[lesson.category] ?? 'text-slate-400'}`}>
          {lesson.category}
        </span>
        <h1 className="text-white text-2xl font-bold mt-1">{lesson.title}</h1>
      </div>

      {/* Core Idea */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-emerald-400" />
          <h3 className="text-emerald-400 font-semibold text-sm">Kernidee</h3>
        </div>
        <p className="text-slate-200 leading-relaxed text-sm">{lesson.coreIdea}</p>
      </div>

      {/* Key Points */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-white font-semibold text-sm mb-3">Kernpunten</h3>
        <ul className="space-y-2">
          {lesson.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Practical Example */}
      <div className="bg-emerald-900/20 rounded-xl p-5 border border-emerald-800/40">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} className="text-yellow-400" />
          <h3 className="text-yellow-400 font-semibold text-sm">Praktisch voorbeeld</h3>
        </div>
        <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">{lesson.practicalExample}</div>
      </div>

      {/* Pitfall */}
      <div className="bg-red-900/20 rounded-xl p-5 border border-red-800/40">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-red-400" />
          <h3 className="text-red-400 font-semibold text-sm">Valkuil</h3>
        </div>
        <p className="text-slate-200 text-sm leading-relaxed">{lesson.pitfall}</p>
      </div>

      {/* Debate Rule */}
      <div className="bg-blue-900/20 rounded-xl p-5 border border-blue-800/40">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={18} className="text-blue-400" />
          <h3 className="text-blue-400 font-semibold text-sm">Debatregel</h3>
        </div>
        <p className="text-slate-200 text-sm leading-relaxed italic">"{lesson.debateRule}"</p>
      </div>

      {/* Related exercises */}
      {lessonExercises.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-white font-semibold text-sm mb-3">Bijbehorende oefeningen</h3>
          <div className="space-y-2">
            {lessonExercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onNavigate('labo-oefening', ex.id)}
                className="w-full flex items-center justify-between bg-slate-700/50 hover:bg-slate-700 rounded-lg px-3 py-2.5 transition-colors text-left"
              >
                <div>
                  <p className="text-white text-sm font-medium">{ex.title}</p>
                  <p className="text-slate-400 text-xs capitalize">{ex.type}</p>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Complete button */}
      {isDone ? (
        <div className="flex items-center justify-center gap-2 py-4 text-emerald-400">
          <CheckCircle size={20} />
          <span className="font-semibold">Les voltooid — +50 XP</span>
        </div>
      ) : (
        <button
          onClick={handleComplete}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Les voltooien (+50 XP)
        </button>
      )}
    </div>
  );
};
