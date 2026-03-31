import React, { useState } from 'react';
import { Shield, Key, Zap, BookOpen, Trophy, ChevronRight, Eye, EyeOff, Check } from 'lucide-react';
import { saveApiKey } from '../utils/storage';

interface SetupWizardProps {
  onComplete: () => void;
}

const STEPS = [
  { id: 'welcome', title: 'Welkom' },
  { id: 'apikey', title: 'API-sleutel' },
  { id: 'tour', title: 'Rondleiding' },
  { id: 'done', title: 'Klaar' },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Theorie & Lessen',
    desc: 'Leer de kernprincipes van Sociaal Daensisme via gestructureerde lessen.',
  },
  {
    icon: Zap,
    title: 'Debat Labo',
    desc: 'Oefen met scenario\'s en krijg direct AI-feedback op je argumenten.',
  },
  {
    icon: Shield,
    title: 'Arena',
    desc: 'Debatteer tegen vijf unieke AI-tegenstanders met eigen stijl en agenda.',
  },
  {
    icon: Trophy,
    title: 'Voortgang & XP',
    desc: 'Verdien ervaringspunten, klim in rang en houd streaks bij.',
  },
];

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState('');

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleApiKeyContinue = () => {
    if (!apiKey.trim()) {
      setKeyError('Voer een geldige API-sleutel in.');
      return;
    }
    if (!apiKey.trim().startsWith('sk-ant-')) {
      setKeyError('Een Anthropic API-sleutel begint met "sk-ant-".');
      return;
    }
    saveApiKey(apiKey.trim());
    setKeyError('');
    next();
  };

  const handleSkipApiKey = () => {
    next();
  };

  const handleFinish = () => {
    localStorage.setItem('setup_complete', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
      {/* Progress dots */}
      <div className="absolute top-8 left-0 right-0 flex justify-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-red-500' : i < step ? 'w-2 bg-red-700' : 'w-2 bg-slate-700'
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-sm mx-auto px-6">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto border border-red-800">
              <Shield className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Debat Academie</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Train jezelf om Sociaal Daensistische standpunten helder, snel en moreel sterk te verdedigen.
              </p>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 text-left space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Wat je gaat leren</p>
              {['Kernwaarden van Sociaal Daensisme', 'Argumenten structureren', 'Drogredenen herkennen', 'Debattechnieken en retoriek'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={next}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Aan de slag <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 1: API Key */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto border border-amber-800 mb-4">
                <Key className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Anthropic API-sleutel</h2>
              <p className="text-slate-400 text-sm">
                De app gebruikt Claude AI voor feedback en debatten. Voer je eigen API-sleutel in.
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setKeyError(''); }}
                  placeholder="sk-ant-api03-..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-600"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {keyError && <p className="text-red-400 text-xs">{keyError}</p>}
              <p className="text-slate-500 text-xs">
                Sleutel wordt enkel lokaal opgeslagen op je toestel. Haal ze op via{' '}
                <span className="text-amber-500">console.anthropic.com</span>.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleApiKeyContinue}
                className="w-full bg-amber-700 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Opslaan & doorgaan <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleSkipApiKey}
                className="w-full text-slate-500 hover:text-slate-300 text-sm py-2 transition-colors"
              >
                Later instellen
              </button>
            </div>

            <button onClick={prev} className="w-full text-slate-600 hover:text-slate-400 text-xs transition-colors">
              ← Terug
            </button>
          </div>
        )}

        {/* Step 2: Tour */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">Wat zit erin?</h2>
              <p className="text-slate-400 text-sm">Een overzicht van alle functies.</p>
            </div>

            <div className="space-y-3">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-slate-900 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{title}</p>
                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={next}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Verder <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={prev} className="w-full text-slate-600 hover:text-slate-400 text-xs transition-colors">
              ← Terug
            </button>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto border border-green-800">
              <Trophy className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Klaar om te debatteren!</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Je bent klaar. Begin met een les of spring direct in de Arena voor je eerste debat.
              </p>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 text-left">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tip voor beginners</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                Start met <span className="text-red-400 font-semibold">Theorie → Les 1</span> om de kernwaarden te leren, dan ga naar het <span className="text-red-400 font-semibold">Debat Labo</span> om te oefenen.
              </p>
            </div>
            <button
              onClick={handleFinish}
              className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
            >
              Start de academie!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
