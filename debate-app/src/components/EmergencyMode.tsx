import React, { useState } from 'react';
import { getEmergencyBriefing, generatePunchlines } from '../utils/claude';
import { loadApiKey } from '../utils/storage';
import { Zap, Loader, Sparkles, Target } from 'lucide-react';

const QUICK_TOPICS = [
  'minimumloon verhogen',
  'rijkentaks',
  'sociale zekerheid',
  'immigratie en integratie',
  'pensioenen',
  'klimaat en sociale rechtvaardigheid',
  'onderwijs en kansengelijkheid',
  'woningmarkt',
];

export const EmergencyMode: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'briefing' | 'punchlines'>('briefing');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    const apiKey = loadApiKey();
    if (!apiKey) {
      setError('Voer eerst je API-sleutel in bij Instellingen.');
      return;
    }
    setLoading(true);
    setError('');
    setOutput('');
    let text = '';
    try {
      const fn = mode === 'briefing' ? getEmergencyBriefing : generatePunchlines;
      await fn(apiKey, topic, (chunk) => {
        text += chunk;
        setOutput(text);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fout.');
    } finally {
      setLoading(false);
    }
  };

  const renderOutput = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-yellow-400 font-bold text-sm mt-4 mb-1.5">{line.slice(3)}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="text-white font-semibold text-sm">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith('**')) {
        const parts = line.split('**');
        return (
          <p key={i} className="text-slate-300 text-sm">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part)}
          </p>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-1.5" />;
      return <p key={i} className="text-slate-300 text-sm leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={20} className="text-yellow-400" />
          <h2 className="text-white text-xl font-bold">Noodmodus</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Moet je direct debatteren? Krijg in seconden kernargumenten, valkuilen en punchlines.
        </p>
      </div>

      {/* Mode */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('briefing')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            mode === 'briefing' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Target size={16} />
          Snelvoorbereiding
        </button>
        <button
          onClick={() => setMode('punchlines')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            mode === 'punchlines' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={16} />
          Punchlines
        </button>
      </div>

      {/* Quick topic buttons */}
      <div>
        <p className="text-slate-400 text-xs mb-2">Snel onderwerp kiezen:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                topic === t
                  ? 'bg-yellow-600 border-yellow-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Custom topic */}
      <div className="space-y-3">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="Of typ je eigen onderwerp..."
          className="w-full bg-slate-800 border border-slate-600 focus:border-yellow-500 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 outline-none transition-colors"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || loading}
          className={`w-full font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
            mode === 'briefing'
              ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          }`}
        >
          {loading ? (
            <><Loader size={16} className="animate-spin" />Genereren...</>
          ) : mode === 'briefing' ? (
            <><Zap size={16} />Geef me mijn briefing!</>
          ) : (
            <><Sparkles size={16} />Genereer punchlines!</>
          )}
        </button>
      </div>

      {/* Output */}
      {(output || loading) && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-yellow-400" />
            <span className="text-yellow-400 font-semibold text-sm">
              {mode === 'briefing' ? 'Snelvoorbereiding' : 'Punchlines'}
            </span>
          </div>
          {loading && !output ? (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          ) : (
            <div className="space-y-1">{renderOutput(output)}</div>
          )}
        </div>
      )}
    </div>
  );
};
