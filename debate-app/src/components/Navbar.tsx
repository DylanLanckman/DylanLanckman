import React from 'react';
import { View, UserProfile } from '../types';
import { getRole } from '../utils/storage';
import {
  LayoutDashboard, BookOpen, Sword, Search, Shield, Zap, Archive, User, Settings, LucideIcon
} from 'lucide-react';

interface Props {
  currentView: View;
  onNavigate: (view: View) => void;
  profile: UserProfile;
}

const navItems: { view: View; label: string; Icon: LucideIcon }[] = [
  { view: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { view: 'theorie', label: 'Theorie', Icon: BookOpen },
  { view: 'labo', label: 'Labo', Icon: Sword },
  { view: 'analyse', label: 'Analyse', Icon: Search },
  { view: 'arena', label: 'Arena', Icon: Shield },
  { view: 'noodmodus', label: 'Noodmodus', Icon: Zap },
];

export const Navbar: React.FC<Props> = ({ currentView, onNavigate, profile }) => {
  const role = getRole(profile.xp);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-700 h-screen fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">Debat Academie</h1>
              <p className="text-emerald-400 text-xs">Sociaal Daensisme</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{role.icon}</span>
            <div>
              <p className="text-white text-xs font-semibold">{role.name}</p>
              <p className="text-slate-400 text-xs">Niveau {profile.level} · {profile.xp} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-orange-400">🔥</span>
            <span>{profile.streak} dag streak</span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ view, label, Icon }) => (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === view || (view === 'labo' && currentView === 'labo-oefening') || (view === 'arena' && currentView === 'arena-debat') || (view === 'theorie' && currentView === 'les')
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-700 space-y-1">
          <button
            onClick={() => onNavigate('archief')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'archief' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Archive size={18} />
            Arsenaal
          </button>
          <button
            onClick={() => onNavigate('coach')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'coach' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User size={18} />
            Coach
          </button>
          <button
            onClick={() => onNavigate('instellingen')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'instellingen' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings size={18} />
            Instellingen
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-40">
        <div className="flex">
          {navItems.map(({ view, label, Icon }) => (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                currentView === view || (view === 'labo' && currentView === 'labo-oefening') || (view === 'arena' && currentView === 'arena-debat') || (view === 'theorie' && currentView === 'les')
                  ? 'text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              <Icon size={20} />
              <span className="mt-0.5">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};
