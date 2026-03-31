import React, { useState } from 'react';
import { UserProfile } from '../types';
import { saveProfile } from '../utils/storage';
import { Archive as ArchiveIcon, Trash2, Star } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
}

const typeLabels: Record<string, string> = {
  argument: '💬 Argument',
  punchline: '⚡ Punchline',
  repliek: '🔄 Repliek',
  analyse: '🔍 Analyse',
};

export const Archive: React.FC<Props> = ({ profile, onProfileChange }) => {
  const [filter, setFilter] = useState<string>('alle');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const types = ['alle', 'argument', 'punchline', 'repliek', 'analyse'];

  const filtered = filter === 'alle'
    ? profile.archive
    : profile.archive.filter((a) => a.type === filter);

  const handleDelete = (id: string) => {
    const updated = { ...profile, archive: profile.archive.filter((a) => a.id !== id) };
    saveProfile(updated);
    onProfileChange(updated);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ArchiveIcon size={20} className="text-emerald-400" />
          <h2 className="text-white text-xl font-bold">Arsenaal</h2>
        </div>
        <p className="text-slate-400 text-sm">{profile.archive.length} items opgeslagen</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === t ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t === 'alle' ? 'Allemaal' : typeLabels[t]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-sm">Geen items gevonden.</p>
          <p className="text-slate-600 text-xs mt-1">Sla je beste antwoorden op via het labo of de arena.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400">{typeLabels[item.type]}</span>
                      {item.rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 text-xs">{item.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-white text-sm font-medium truncate">{item.topic}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{item.date}</p>
                  </div>
                </div>
              </button>
              {expandedId === item.id && (
                <div className="px-4 pb-4 border-t border-slate-700 pt-3">
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs mt-3 transition-colors"
                  >
                    <Trash2 size={12} />
                    Verwijderen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
