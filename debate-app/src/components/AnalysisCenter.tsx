import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { analyzeText } from '../utils/claude';
import { addToArchive, saveProfile, loadApiKey } from '../utils/storage';
import { Search, Loader, Save, Sparkles, ClipboardPaste } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
}

const EXAMPLES = [
  '"We kunnen ons de verzorgingsstaat niet langer veroorloven. We moeten keuzes maken."',
  '"Armoede is een persoonlijke keuze. Als je hard werkt, kom je er wel."',
  '"De vrije markt lost alle problemen op. Overheidsinterventie maakt dingen altijd erger."',
  '"Immigranten nemen de jobs en de uitkeringen van hardwerkende Belgen."',
];

export const AnalysisCenter: React.FC<Props> = ({ profile, onProfileChange }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    const apiKey = loadApiKey();
    if (!apiKey) {
      setError('Voer eerst je API-sleutel in bij Instellingen.');
      return;
    }
    setLoading(true);
    setError('');
    setOutput('');
    setSaved(false);
    let text = '';
    try {
      await analyzeText(apiKey, input, (chunk) => {
        text += chunk;
        setOutput(text);
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fout bij analyse.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!output) return;
    const updated = addToArchive(profile, {
      type: 'analyse',
      content: output,
      topic: input.slice(0, 60) + '...',
      rating: 0,
    });
    saveProfile(updated);
    onProfileChange(updated);
    setSaved(true);
  };

  // Render markdown-like output
  const renderOutput = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} className="text-emerald-400 font-bold text-base mt-4 mb-2">
            {line.slice(3)}
          </h3>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="text-white font-semibold text-sm">
            {line.slice(2, -2)}
          </p>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-1" />;
      return (
        <p key={i} className="text-slate-300 text-sm leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-white text-xl font-bold">Analysecentrum</h2>
        <p className="text-slate-400 text-sm mt-1">
          Plak een quote, uitspraak of artikel en krijg een daensistische retorische analyse.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Plak hier een quote, uitspraak of tekst om te analyseren..."
          rows={4}
          className="w-full bg-slate-800 border border-slate-600 focus:border-emerald-500 rounded-xl p-4 text-white text-sm placeholder-slate-500 resize-none outline-none transition-colors"
        />

        {/* Examples */}
        <div>
          <p className="text-slate-500 text-xs mb-2">Voorbeelden:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setInput(ex.slice(1, -1))}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-2 py-1 text-slate-400 hover:text-white transition-colors text-left"
              >
                Voorbeeld {i + 1}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleAnalyze}
          disabled={!input.trim() || loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin" />
              Analyseren...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Analyseer
            </>
          )}
        </button>
      </div>

      {/* Output */}
      {(output || loading) && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Search size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold text-sm">Analyse</span>
            </div>
            {output && !loading && (
              <button
                onClick={handleSave}
                disabled={saved}
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors ${
                  saved ? 'text-slate-500' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Save size={12} />
                {saved ? 'Opgeslagen' : 'Opslaan'}
              </button>
            )}
          </div>
          <div
            ref={outputRef}
            className="p-4 max-h-[500px] overflow-y-auto space-y-1"
          >
            {output ? renderOutput(output) : (
              <div className="flex gap-1 py-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
