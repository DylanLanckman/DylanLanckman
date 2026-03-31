import React, { useState } from 'react';
import { UserProfile } from '../types';
import { loadApiKey, saveApiKey, saveProfile } from '../utils/storage';
import { Settings as SettingsIcon, Eye, EyeOff, Check, Trash2, AlertTriangle } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
}

export const Settings: React.FC<Props> = ({ profile, onProfileChange }) => {
  const [apiKey, setApiKey] = useState(loadApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleSaveKey = () => {
    saveApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const fresh: UserProfile = {
      level: 1, xp: 0, streak: 0, lastStudied: '', completedLessons: [],
      completedExercises: [], weakTopics: [], strongTopics: [], archive: [],
      dailyXP: 0, lastXPDate: '', totalDebates: 0, totalExercises: 0, role: 'Leerling van Daens',
    };
    saveProfile(fresh);
    onProfileChange(fresh);
    setShowReset(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon size={20} className="text-slate-400" />
          <h2 className="text-white text-xl font-bold">Instellingen</h2>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-white font-semibold mb-1">Claude API-sleutel</h3>
        <p className="text-slate-400 text-xs mb-3">
          Vereist voor AI-analyse, debatsimulaties en feedback. Haal je sleutel op via{' '}
          <span className="text-emerald-400">console.anthropic.com</span>.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-slate-700 border border-slate-600 focus:border-emerald-500 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 outline-none pr-10 transition-colors"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            onClick={handleSaveKey}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              saved ? 'bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {saved ? <><Check size={14} /> Opgeslagen</> : 'Opslaan'}
          </button>
        </div>
        <p className="text-slate-600 text-xs mt-2">
          Je sleutel wordt enkel lokaal opgeslagen in je browser.
        </p>
      </div>

      {/* App info */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-white font-semibold mb-3">Over de app</h3>
        <div className="space-y-2 text-sm text-slate-400">
          <p>Debat Academie — Sociaal Daensisme</p>
          <p>Versie 1.0</p>
          <p className="text-xs leading-relaxed">
            Deze app traint je om sociaal-daensistische standpunten helder, snel en moreel sterk
            te formuleren. Gebaseerd op de waarden van priester Adolf Daens: arbeidswaardigheid,
            solidariteit en de menselijke maat.
          </p>
        </div>
      </div>

      {/* Reset */}
      <div className="bg-slate-800 rounded-xl p-5 border border-red-900/40">
        <h3 className="text-red-400 font-semibold mb-1">Voortgang resetten</h3>
        <p className="text-slate-400 text-xs mb-3">
          Dit verwijdert alle voortgang, XP en opgeslagen items. Niet ongedaan te maken.
        </p>
        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
          >
            <Trash2 size={15} />
            Alles resetten
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <AlertTriangle size={16} />
              <span>Ben je zeker? Dit kan niet ongedaan gemaakt worden.</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleReset} className="bg-red-700 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                Ja, reset alles
              </button>
              <button onClick={() => setShowReset(false)} className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                Annuleren
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
