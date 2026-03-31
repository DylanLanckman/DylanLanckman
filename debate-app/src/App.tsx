import React, { useState, useEffect } from 'react';
import { View, UserProfile } from './types';
import { loadProfile, saveProfile } from './utils/storage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SetupWizard } from './components/SetupWizard';
import { TheoryLibrary } from './components/TheoryLibrary';
import { LessonDetail } from './components/LessonDetail';
import { DebatLab } from './components/DebateLab';
import { AnalysisCenter } from './components/AnalysisCenter';
import { Arena } from './components/Arena';
import { EmergencyMode } from './components/EmergencyMode';
import { Archive } from './components/Archive';
import { Coach } from './components/Coach';
import { Settings } from './components/Settings';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [setupComplete, setSetupComplete] = useState<boolean>(
    () => localStorage.getItem('setup_complete') === 'true'
  );

  const handleProfileChange = (p: UserProfile) => {
    setProfile(p);
    saveProfile(p);
  };

  const handleNavigate = (view: View, id?: string) => {
    setCurrentView(view);
    setViewParam(id);
    window.scrollTo(0, 0);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard profile={profile} onProfileChange={handleProfileChange} onNavigate={handleNavigate} />;
      case 'theorie':
        return <TheoryLibrary profile={profile} onNavigate={handleNavigate} />;
      case 'les':
        return viewParam ? (
          <LessonDetail
            lessonId={viewParam}
            profile={profile}
            onProfileChange={handleProfileChange}
            onNavigate={handleNavigate}
          />
        ) : <TheoryLibrary profile={profile} onNavigate={handleNavigate} />;
      case 'labo':
        return <DebatLab profile={profile} onProfileChange={handleProfileChange} onNavigate={handleNavigate} />;
      case 'labo-oefening':
        return (
          <DebatLab
            exerciseId={viewParam}
            profile={profile}
            onProfileChange={handleProfileChange}
            onNavigate={handleNavigate}
          />
        );
      case 'analyse':
        return <AnalysisCenter profile={profile} onProfileChange={handleProfileChange} />;
      case 'arena':
        return <Arena profile={profile} onProfileChange={handleProfileChange} onNavigate={handleNavigate} />;
      case 'arena-debat':
        return (
          <Arena
            opponentId={viewParam}
            profile={profile}
            onProfileChange={handleProfileChange}
            onNavigate={handleNavigate}
          />
        );
      case 'noodmodus':
        return <EmergencyMode />;
      case 'archief':
        return <Archive profile={profile} onProfileChange={handleProfileChange} />;
      case 'coach':
        return <Coach profile={profile} />;
      case 'instellingen':
        return <Settings profile={profile} onProfileChange={handleProfileChange} />;
      default:
        return <Dashboard profile={profile} onProfileChange={handleProfileChange} onNavigate={handleNavigate} />;
    }
  };

  if (!setupComplete) {
    return <SetupWizard onComplete={() => setSetupComplete(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar currentView={currentView} onNavigate={handleNavigate} profile={profile} />

      {/* Main content */}
      <main className="md:ml-64 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
