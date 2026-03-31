import React, { useState, useRef } from 'react';
import { View, UserProfile, Exercise, ExerciseResult } from '../types';
import { exercises } from '../data/exercises';
import { evaluateAnswer } from '../utils/claude';
import { markExerciseComplete, saveProfile, addToArchive, loadApiKey } from '../utils/storage';
import {
  ArrowLeft, Sword, CheckCircle, Lightbulb, Star, Save,
  ChevronRight, MessageSquare, Zap, Target, AlignLeft, Sparkles, LucideIcon
} from 'lucide-react';

interface Props {
  exerciseId?: string;
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
  onNavigate: (view: View, id?: string) => void;
}

const typeIcons: Record<string, LucideIcon> = {
  repliek: MessageSquare,
  argument: AlignLeft,
  frame: Target,
  punchline: Zap,
  structuur: AlignLeft,
};

const typeLabels: Record<string, string> = {
  repliek: 'Repliek',
  argument: 'Argument',
  frame: 'Frame-detectie',
  punchline: 'Punchline',
  structuur: 'Structuur',
};

const scenarioColors: Record<string, string> = {
  cafe: 'bg-amber-900/30 text-amber-400',
  politiek: 'bg-blue-900/30 text-blue-400',
  online: 'bg-purple-900/30 text-purple-400',
  vijandig: 'bg-red-900/30 text-red-400',
  familie: 'bg-green-900/30 text-green-400',
};

const scenarioLabels: Record<string, string> = {
  cafe: '☕ Café',
  politiek: '🏛️ Politiek',
  online: '💬 Online',
  vijandig: '⚡ Vijandig',
  familie: '🏠 Familie',
};

const difficultyColors = ['', 'text-green-400', 'text-yellow-400', 'text-red-400'];
const difficultyLabels = ['', 'Basis', 'Gevorderd', 'Expert'];

// Exercise list
const ExerciseList: React.FC<{ profile: UserProfile; onSelect: (id: string) => void }> = ({ profile, onSelect }) => {
  const [filter, setFilter] = useState<'alle' | 'todo' | 'gedaan'>('alle');
  const [typeFilter, setTypeFilter] = useState<string>('alle');

  const types = ['alle', 'repliek', 'argument', 'frame', 'punchline', 'structuur'];

  let filtered = exercises;
  if (filter === 'todo') filtered = filtered.filter((e) => !profile.completedExercises.includes(e.id));
  if (filter === 'gedaan') filtered = filtered.filter((e) => profile.completedExercises.includes(e.id));
  if (typeFilter !== 'alle') filtered = filtered.filter((e) => e.type === typeFilter);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-white text-xl font-bold">Debatlabo</h2>
        <p className="text-slate-400 text-sm mt-1">
          {profile.completedExercises.length}/{exercises.length} oefeningen voltooid
        </p>
      </div>

      <div className="flex gap-2">
        {(['alle', 'todo', 'gedaan'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f === 'alle' ? 'Allemaal' : f === 'todo' ? 'Te doen' : 'Gedaan'}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
              typeFilter === t ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t === 'alle' ? 'Alle types' : typeLabels[t]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((ex) => {
          const isDone = profile.completedExercises.includes(ex.id);
          const Icon = typeIcons[ex.type] ?? MessageSquare;
          return (
            <button
              key={ex.id}
              onClick={() => onSelect(ex.id)}
              className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-700 rounded-xl p-4 text-left transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-emerald-900/50' : 'bg-slate-700'}`}>
                  {isDone ? <CheckCircle size={18} className="text-emerald-400" /> : <Icon size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold text-sm ${isDone ? 'text-emerald-300' : 'text-white'}`}>{ex.title}</h3>
                    <ChevronRight size={16} className="text-slate-500 flex-shrink-0" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${scenarioColors[ex.scenario] ?? ''}`}>
                      {scenarioLabels[ex.scenario]}
                    </span>
                    <span className={`text-xs ${difficultyColors[ex.difficulty]}`}>{difficultyLabels[ex.difficulty]}</span>
                    <span className="text-xs text-slate-500 capitalize">{typeLabels[ex.type]}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-1">{ex.prompt}</p>
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">Geen oefeningen gevonden.</p>
        )}
      </div>
    </div>
  );
};

// Single Exercise
const ExerciseView: React.FC<{
  exercise: Exercise;
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
  onBack: () => void;
}> = ({ exercise, profile, onProfileChange, onBack }) => {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDone = profile.completedExercises.includes(exercise.id);
  const Icon = typeIcons[exercise.type] ?? MessageSquare;

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    const apiKey = loadApiKey();
    if (!apiKey) {
      setError('Voer eerst je API-sleutel in bij Instellingen.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await evaluateAnswer(apiKey, exercise, answer);
      setResult(res);
      // Mark complete and add XP
      const updated = markExerciseComplete(profile, exercise.id);
      saveProfile(updated);
      onProfileChange(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fout bij evaluatie.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!answer.trim()) return;
    const content = result?.verbeterd || answer;
    const updated = addToArchive(profile, {
      type: exercise.type === 'punchline' ? 'punchline' : 'argument',
      content,
      topic: exercise.title,
      rating: result?.score ?? 70,
    });
    saveProfile(updated);
    onProfileChange(updated);
    setSaved(true);
  };

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
        <ArrowLeft size={16} />
        Terug
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded ${scenarioColors[exercise.scenario] ?? ''}`}>
            {scenarioLabels[exercise.scenario]}
          </span>
          <span className="text-xs text-slate-400 capitalize">{typeLabels[exercise.type]}</span>
          <span className={`text-xs ${difficultyColors[exercise.difficulty]}`}>{difficultyLabels[exercise.difficulty]}</span>
        </div>
        <h2 className="text-white text-xl font-bold">{exercise.title}</h2>
      </div>

      {/* Scenario */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-sm mb-2">{exercise.context}</p>
        <p className="text-white font-medium italic">"{exercise.prompt}"</p>
      </div>

      {/* Hints */}
      <div>
        <button
          onClick={() => setShowHints(!showHints)}
          className="flex items-center gap-2 text-yellow-400 text-sm font-medium"
        >
          <Lightbulb size={16} />
          {showHints ? 'Hints verbergen' : 'Tips tonen'}
        </button>
        {showHints && (
          <div className="mt-2 bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-4 space-y-1.5">
            {exercise.hints.map((hint, i) => (
              <p key={i} className="text-yellow-200 text-xs flex items-start gap-1.5">
                <span className="text-yellow-500 mt-0.5">•</span>
                {hint}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Answer input */}
      {!result && (
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Typ je antwoord hier..."
            rows={5}
            className="w-full bg-slate-800 border border-slate-600 focus:border-emerald-500 rounded-xl p-4 text-white text-sm placeholder-slate-500 resize-none outline-none transition-colors"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyseren...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Indienen & Analyseren
              </>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          {/* Scores */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Resultaat</h3>
              <span className={`text-2xl font-bold ${scoreColor(result.score)}`}>{result.score}/100</span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Structuur', score: result.structuurScore },
                { label: 'Overtuiging', score: result.overtuigingScore },
                { label: 'Consistentie', score: result.consistentieScore },
              ].map(({ label, score }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className={scoreColor(score)}>{score}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-white font-semibold text-sm mb-2">Feedback</h3>
            <p className="text-slate-300 text-sm">{result.feedback}</p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {result.sterktepunten.length > 0 && (
                <div>
                  <p className="text-emerald-400 text-xs font-semibold mb-1">Sterktes</p>
                  {result.sterktepunten.map((p, i) => (
                    <p key={i} className="text-slate-300 text-xs">✓ {p}</p>
                  ))}
                </div>
              )}
              {result.verbeterpunten.length > 0 && (
                <div>
                  <p className="text-yellow-400 text-xs font-semibold mb-1">Verbeterpunten</p>
                  {result.verbeterpunten.map((p, i) => (
                    <p key={i} className="text-slate-300 text-xs">→ {p}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Improved version */}
          {result.verbeterd && (
            <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-800/40">
              <h3 className="text-emerald-400 font-semibold text-sm mb-2">Verbeterd antwoord</h3>
              <p className="text-slate-200 text-sm italic">{result.verbeterd}</p>
            </div>
          )}

          {/* Model answer */}
          {exercise.modelAnswer && (
            <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-800/40">
              <h3 className="text-blue-400 font-semibold text-sm mb-2">Voorbeeldantwoord</h3>
              <p className="text-slate-200 text-sm italic">"{exercise.modelAnswer}"</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saved}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                saved ? 'bg-slate-700 text-slate-400 cursor-default' : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              <Save size={16} />
              {saved ? 'Opgeslagen in arsenaal' : 'Opslaan in arsenaal'}
            </button>
            <button
              onClick={() => {
                setAnswer('');
                setResult(null);
                setSaved(false);
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const DebatLab: React.FC<Props> = ({ exerciseId, profile, onProfileChange, onNavigate }) => {
  if (exerciseId) {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (exercise) {
      return (
        <ExerciseView
          exercise={exercise}
          profile={profile}
          onProfileChange={onProfileChange}
          onBack={() => onNavigate('labo')}
        />
      );
    }
  }
  return <ExerciseList profile={profile} onSelect={(id) => onNavigate('labo-oefening', id)} />;
};
