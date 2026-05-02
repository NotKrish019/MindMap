import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Music, Brain, Timer, Volume2 } from 'lucide-react';

// --- Sub-Components ---

const BreathingAnimation = () => {
  const [stage, setStage] = useState('Breathe in...');
  const [cycleCount, setCycleCount] = useState(1);
  
  useEffect(() => {
    const cycle = () => {
      setStage('Breathe in...');
      setTimeout(() => setStage('Hold...'), 4000);
      setTimeout(() => setStage('Breathe out...'), 11000);
    };
    cycle();
    const interval = setInterval(() => {
      setCycleCount(prev => prev + 1);
      cycle();
    }, 19000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-12">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full border-2 border-indigo-500/10" />
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/40 to-violet-500/40 rounded-full animate-breathe-478 blur-md shadow-[0_0_50px_rgba(99,102,241,0.2)]" />
        <div className="absolute top-0 right-0 p-4">
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/10 uppercase tracking-widest">
            Cycle {cycleCount}/3
          </span>
        </div>
      </div>
      <div className="text-center">
        <motion.p 
          key={stage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-light text-indigo-100 tracking-tight"
        >
          {stage}
        </motion.p>
        <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-[0.2em] font-bold opacity-60">
          Syncing mind and focus
        </p>
      </div>
    </div>
  );
};

const MoodCard = ({ data }) => {
  const { mood, energy, focus, stress } = data;
  const bars = [
    { label: 'Energy', value: energy, color: 'bg-yellow-400' },
    { label: 'Focus', value: focus, color: 'bg-blue-400' },
    { label: 'Stress', value: stress, color: 'bg-red-400' },
  ];

  return (
    <div className="glass-card flex-1">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/5 rounded-lg uppercase text-[10px] font-bold tracking-[0.2em] text-indigo-400">
          Current State: {mood.replace('_', ' ')}
        </div>
      </div>
      <div className="space-y-4">
        {bars.map(bar => (
          <div key={bar.label}>
            <div className="flex justify-between text-[10px] mb-1.5 uppercase tracking-widest text-slate-500 font-bold">
              <span>{bar.label}</span>
              <span>{bar.value}/10</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${bar.value * 10}%` }}
                className={`h-full ${bar.color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MusicPlayer = () => {
  const playlistId = 'PLfP6i5T0-DkIMLNRwmJpRBs4PJvxfgwBg';
  
  return (
    <div className="glass-card overflow-hidden !p-0 border-indigo-500/10">
      <div className="p-5 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center relative">
           <Music className="w-5 h-5 text-indigo-400" />
           <div className="absolute -bottom-1 -right-1 flex gap-0.5">
             {[1,2,3].map(i => (
               <motion.div 
                key={i}
                animate={{ height: [2, 8, 2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                className="w-0.5 bg-indigo-400 rounded-full"
               />
             ))}
           </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">MindMap Lofi</h3>
          <p className="text-[10px] text-slate-500 font-medium">Synced Playlist Active</p>
        </div>
      </div>
      
      <div className="h-2 w-full bg-white/5 relative overflow-hidden">
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"
        />
        <div className="opacity-0 absolute pointer-events-none -top-999">
          <iframe 
            width="10" 
            height="10" 
            src={`https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&autoplay=0&controls=1&modestbranding=1&enablejsapi=1`} 
            title="Lofi Music"
            frameBorder="0" 
            allow="autoplay; encrypted-media" 
          ></iframe>
        </div>
      </div>
      
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <Volume2 className="w-3 h-3 text-indigo-500" />
          <span>Lo-Fi Focus Mode</span>
        </div>
        <div className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/10">
          LIVE
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---

function Session() {
  const [sessionData, setSessionData] = useState(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('currentSession') || 'null');
    if (!data) return navigate('/');
    setSessionData(data);
    setTimeLeft(data.sessionPlan.blocks[0].durationMinutes * 60);
  }, [navigate]);

  useEffect(() => {
    if (!sessionData) return;
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      handleBlockEnd();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, sessionData]);

  const handleBlockEnd = () => {
    if (!isBreak) {
      // Start Break
      setIsBreak(true);
      // Fixed 3 cycles of 4-7-8 breathing (19s each = 57s)
      const breakDuration = sessionData.sessionPlan.blocks[currentBlockIndex].breakAfter.type === 'breathing' ? 57 : (sessionData.sessionPlan.blocks[currentBlockIndex].breakAfter.durationMinutes * 60);
      setTimeLeft(breakDuration);
      setIsActive(true); // Auto-start the break
    } else {
      // End Break, Start Next Block
      setIsBreak(false);
      const nextIdx = currentBlockIndex + 1;
      if (nextIdx < sessionData.sessionPlan.blocks.length) {
        setCurrentBlockIndex(nextIdx);
        setTimeLeft(sessionData.sessionPlan.blocks[nextIdx].durationMinutes * 60);
        setIsActive(true); // Auto-start the next study block
      } else {
        navigate('/reflection');
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!sessionData) return null;

  const currentBlock = sessionData.sessionPlan.blocks[currentBlockIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <motion.div 
          key={isBreak ? 'break' : 'study'}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden"
        >
          {isBreak && currentBlock.breakAfter.type === 'breathing' ? (
            <BreathingAnimation />
          ) : (
            <>
              <div className="text-center mb-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400 mb-4 opacity-80">
                  {isBreak ? 'Relaxation in Progress' : `Focusing on: ${currentBlock.subject}`}
                </p>
                <h2 className="text-9xl font-black tracking-tighter tabular-nums bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                  {formatTime(timeLeft)}
                </h2>
              </div>

              <div className="flex gap-6">
                <button 
                  onClick={() => setIsActive(!isActive)}
                  className="w-20 h-20 flex items-center justify-center rounded-full bg-white text-slate-900 hover:scale-110 transition-transform shadow-xl shadow-white/5"
                >
                  {isActive ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current ml-1" />}
                </button>
                <button 
                  onClick={handleBlockEnd}
                  className="w-20 h-20 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  <SkipForward size={24} />
                </button>
              </div>
            </>
          )}

          {isBreak && (
            <div className="absolute bottom-12 text-center px-12">
              <p className="text-indigo-200/60 text-xs font-medium tracking-wide leading-relaxed">
                {currentBlock.breakAfter.instruction}
              </p>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card !p-6">
            <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <Timer className="w-4 h-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Upcoming Blocks</h3>
            </div>
            <div className="space-y-3">
              {sessionData.sessionPlan.blocks.slice(currentBlockIndex + 1).map((b, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <span className="text-slate-300 font-medium">{b.subject}</span>
                  <span className="text-slate-500 font-bold">{b.durationMinutes}m</span>
                </div>
              ))}
              {currentBlockIndex === sessionData.sessionPlan.blocks.length - 1 && (
                <p className="text-xs text-slate-500 italic text-center py-6 opacity-60">Final block in progress</p>
              )}
            </div>
          </div>
          
          <div className="glass-card !p-6">
             <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <Brain className="w-4 h-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Session Insight</h3>
            </div>
            <p className="text-indigo-100/70 leading-relaxed text-sm italic">
              "{currentBlock.tip}"
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <MoodCard data={sessionData} />
        <MusicPlayer />
        
        <div className="glass-card bg-indigo-500/[0.03] border-indigo-500/10 !p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/60 mb-4">Note from AI</h3>
          <p className="text-sm text-indigo-200/80 italic leading-relaxed">
            "{sessionData.sessionPlan.empathyNote}"
          </p>
        </div>
      </div>
    </div>
  );
}

export default Session;
