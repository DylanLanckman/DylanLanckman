import React, { useState, useRef, useEffect } from 'react';
import { View, UserProfile, Opponent, DebateMessage } from '../types';
import { opponents } from '../data/opponents';
import { debateResponse } from '../utils/claude';
import { addXP, saveProfile, loadApiKey } from '../utils/storage';
import { ArrowLeft, Send, Loader, Shield, Clock, ChevronRight } from 'lucide-react';

interface Props {
  opponentId?: string;
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
  onNavigate: (view: View, id?: string) => void;
}

// Opponent selector
const OpponentSelector: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => (
  <div className="space-y-5 animate-fade-in">
    <div>
      <h2 className="text-white text-xl font-bold">Arena</h2>
      <p className="text-slate-400 text-sm mt-1">Kies je tegenstander en debatteer live.</p>
    </div>
    <div className="space-y-3">
      {opponents.map((opp) => (
        <button
          key={opp.id}
          onClick={() => onSelect(opp.id)}
          className={`w-full bg-gradient-to-r ${opp.color}/20 hover:${opp.color}/40 border border-slate-700 hover:border-slate-500 rounded-xl p-4 text-left transition-all`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${opp.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
              {opp.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">{opp.name}</h3>
                <ChevronRight size={16} className="text-slate-500" />
              </div>
              <p className="text-slate-400 text-xs">{opp.role}</p>
              <p className="text-slate-300 text-sm mt-1">{opp.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// Debate view
const DebateView: React.FC<{
  opponent: Opponent;
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
  onBack: () => void;
}> = ({ opponent, profile, onProfileChange, onBack }) => {
  const apiKey = loadApiKey();
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<'20sec' | '1min' | '3min' | 'vrij'>('vrij');
  const [timeLeft, setTimeLeft] = useState(0);
  const [timing, setTiming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const modeTimes: Record<string, number> = { '20sec': 20, '1min': 60, '3min': 180, vrij: 0 };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startDebate = async () => {
    if (!apiKey) {
      setError('Voer eerst je API-sleutel in bij Instellingen.');
      return;
    }
    setStarted(true);
    setLoading(true);

    const opening = opponent.openingLines[Math.floor(Math.random() * opponent.openingLines.length)];
    const opponentMsg: DebateMessage = { role: 'opponent', content: opening, timestamp: Date.now() };
    setMessages([opponentMsg]);

    // Give XP for starting a debate
    const updated = addXP({ ...profile, totalDebates: profile.totalDebates + 1 }, 10);
    saveProfile(updated);
    onProfileChange(updated);
    setLoading(false);
  };

  const startTimer = () => {
    const seconds = modeTimes[mode];
    if (seconds === 0) return;
    setTimeLeft(seconds);
    setTiming(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTiming(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (timing) {
      clearInterval(timerRef.current);
      setTiming(false);
    }

    const userMsg: DebateMessage = { role: 'user', content: input, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    // Build conversation history for Claude
    const history: { role: 'user' | 'assistant'; content: string }[] = newMessages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    let responseText = '';
    const responseMsg: DebateMessage = { role: 'opponent', content: '', timestamp: Date.now() };

    try {
      setMessages([...newMessages, responseMsg]);
      await debateResponse(apiKey, opponent, history, (chunk) => {
        responseText += chunk;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { ...responseMsg, content: responseText },
        ]);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fout.');
      setMessages(newMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full space-y-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className={`w-10 h-10 bg-gradient-to-br ${opponent.color} rounded-xl flex items-center justify-center text-xl`}>
          {opponent.avatar}
        </div>
        <div>
          <h2 className="text-white font-bold text-sm">{opponent.name}</h2>
          <p className="text-slate-400 text-xs">{opponent.role}</p>
        </div>
      </div>

      {!started ? (
        <div className="space-y-5 flex-1">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Tegenstander</p>
            <p className="text-white font-semibold">{opponent.name}</p>
            <p className="text-slate-300 text-sm mt-1">{opponent.personality}</p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-2">Antwoordtijd</p>
            <div className="flex flex-wrap gap-2">
              {(['20sec', '1min', '3min', 'vrij'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === m ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'vrij' ? 'Vrij' : m}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={startDebate}
            className={`w-full bg-gradient-to-r ${opponent.color} text-white font-semibold py-3 rounded-xl transition-all hover:opacity-90`}
          >
            Start debat
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pb-4 max-h-[calc(100vh-280px)]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'opponent' && (
                  <div className={`w-7 h-7 bg-gradient-to-br ${opponent.color} rounded-lg flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1`}>
                    {opponent.avatar}
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-700 text-white rounded-br-sm'
                    : 'bg-slate-700 text-slate-100 rounded-bl-sm'
                }`}>
                  {msg.content || (
                    <div className="flex gap-1">
                      {[0, 1, 2].map((j) => (
                        <div key={j} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}

          {/* Timer */}
          {mode !== 'vrij' && (
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <Clock size={14} className={timing ? 'text-orange-400' : 'text-slate-500'} />
                <span className={`text-sm font-mono font-bold ${timing ? 'text-orange-400' : 'text-slate-500'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              {!timing && (
                <button
                  onClick={startTimer}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Start timer
                </button>
              )}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Jouw antwoord..."
              rows={2}
              className="flex-1 bg-slate-800 border border-slate-600 focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 resize-none outline-none transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl px-4 transition-colors flex items-center"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const Arena: React.FC<Props> = ({ opponentId, profile, onProfileChange, onNavigate }) => {
  if (opponentId) {
    const opponent = opponents.find((o) => o.id === opponentId);
    if (opponent) {
      return (
        <DebateView
          opponent={opponent}
          profile={profile}
          onProfileChange={onProfileChange}
          onBack={() => onNavigate('arena')}
        />
      );
    }
  }
  return <OpponentSelector onSelect={(id) => onNavigate('arena-debat', id)} />;
};
