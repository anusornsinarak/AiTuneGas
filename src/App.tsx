import { useState } from 'react';
import { SetupGuide } from './components/SetupGuide';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'setup'>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg">A</div>
            <h1 className="font-bold text-lg text-slate-800">AI Gas Tuning Assistant</h1>
          </div>
          <nav className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all shadow-sm ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 shadow-none'
              }`}
            >
              Live Dashboard
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all shadow-sm ${
                activeTab === 'setup'
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 shadow-none'
              }`}
            >
              Setup Guide (Python)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-6">
        {activeTab === 'dashboard' ? <Dashboard /> : <SetupGuide />}
      </main>
    </div>
  );
}

