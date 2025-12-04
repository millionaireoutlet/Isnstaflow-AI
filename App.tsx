import React, { useState } from 'react';
import { INSTAGRAM_GRADIENT, NAV_ITEMS, APP_NAME } from './constants';
import { UrlAnalyzer } from './components/UrlAnalyzer';
import { MediaAnalyzer } from './components/MediaAnalyzer';
import { AppMode } from './types';
import { Instagram } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.URL_ANALYZER);

  return (
    <div className="min-h-screen w-full bg-[#0F0F0F] text-white selection:bg-pink-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-900/20 blur-[120px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="flex flex-col items-center mb-12 space-y-6">
          <div className={`p-4 rounded-3xl ${INSTAGRAM_GRADIENT} shadow-2xl shadow-pink-500/20`}>
            <Instagram size={48} className="text-white" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400">
              {APP_NAME}
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              The ultimate AI companion for Instagram creators. Analyze, extract, and optimize your content.
            </p>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex justify-center mb-12">
          <div className="p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = mode === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id as AppMode)}
                  className={`
                    relative px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-300
                    ${isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-white/10 rounded-xl border border-white/10 shadow-sm" />
                  )}
                  <Icon size={18} className={isActive ? 'text-pink-400' : ''} />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* View Content */}
        <main className="min-h-[400px]">
          {mode === AppMode.URL_ANALYZER ? (
            <UrlAnalyzer />
          ) : (
            <MediaAnalyzer />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-500 text-sm pb-8">
            <p>&copy; {new Date().getFullYear()} InstaFlow AI. Built with Gemini 2.5 Flash.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
