import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Break() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-primary z-[100] flex flex-col items-center justify-center font-body-md overflow-hidden"
    >
      {/* Polka Dot Background Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(#1A1A1A_1.5px,transparent_1.5px)] bg-[length:24px_24px] opacity-10 pointer-events-none"></div>
      
      {/* Decorative "Wild Decoration" Stickers */}
      <div className="absolute top-12 left-8 -rotate-12 bg-secondary text-white px-6 py-2 border-[2.5px] border-zinc-900 shadow-[4px_4px_0px_0px_#1A1A1A] rounded-full font-label-bold text-sm">
        PAUSE
      </div>
      <div className="absolute bottom-24 right-12 rotate-6 bg-tertiary-fixed text-tertiary px-6 py-3 border-[2.5px] border-zinc-900 shadow-[6px_6px_0px_0px_#1A1A1A] rounded-2xl font-label-bold flex items-center gap-2">
        <span className="material-symbols-outlined">energy_savings_leaf</span>
        MIND OVER MATTER
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 flex flex-col items-center gap-12 max-w-md w-full px-6 text-center">
        {/* Breathing Circle Section */}
        <div className="relative">
          {/* Pulsing Outer Ring */}
          <div className="absolute inset-0 rounded-full bg-primary-container opacity-20 blur-xl animate-pulse"></div>
          {/* Main Breathing Circle */}
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-white border-[2.5px] border-zinc-900 shadow-[12px_12px_0px_0px_#1A1A1A] flex items-center justify-center relative z-20 animate-breathe-478">
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-7xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
            </div>
            {/* Floating Small Accents */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-secondary-container rounded-full border-[2.5px] border-zinc-900 shadow-[3px_3px_0px_0px_#1A1A1A] flex items-center justify-center">
              <span className="material-symbols-outlined text-zinc-900 text-sm">sparkles</span>
            </div>
          </div>
        </div>

        {/* Text Guidance */}
        <div className="space-y-4 text-white">
          <h1 className="font-h1 text-4xl">Take a deep breath.</h1>
          <p className="font-body-lg text-lg opacity-80 max-w-[280px] mx-auto">
            Let your thoughts settle like dust in a quiet room.
          </p>
        </div>

        {/* Sticker-style End Break Button */}
        <div className="mt-8">
          <button 
            onClick={() => navigate(-1)}
            className="bg-white hover:bg-zinc-50 text-zinc-900 font-label-bold border-[2.5px] border-zinc-900 shadow-[6px_6px_0px_0px_#1A1A1A] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] px-10 py-4 rounded-2xl transition-all flex items-center gap-3 text-lg"
          >
            <span className="material-symbols-outlined">close</span>
            End Break
          </button>
        </div>
      </main>

      {/* Decorative Image */}
      <div className="absolute top-1/4 -right-24 rotate-12 opacity-30 hidden lg:block">
        <img 
          className="w-48 h-64 object-cover border-[2.5px] border-zinc-900 rounded-3xl shadow-[8px_8px_0px_0px_#1A1A1A]" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUsVLh8MISTDJxxkrU-GmO70zsaiBw-XYTXBFQKpugfwvBObguU3scEVedJaR4v5Zpti1atL12kLj2jkfrwjU0jLJifZ0FyHpVumqYeu6yufsRwBWQa-t3GtZB6EQXKqjXBs0v2ID5ex4WVbB-sCyibbvSdk9qad9U_Kv6PVR966mrG6rHQ1E3OThorDw1I0d2FZ4eKC2QKUzqqhR20wHzf2H4nzPNV5dodaKJvl2J2nR0EUQncW4ekKSUuVg0JHi0p9CmWEO7wm4" 
          alt="Serene"
        />
      </div>
    </motion.div>
  );
}

export default Break;
