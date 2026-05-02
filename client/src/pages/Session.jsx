import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../services/api';
import Whiteboard from '../components/Whiteboard';

// --- Sub-Components ---

const LofiPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {showPlayer && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="neobrutal-card neobrutal-shadow-lg bg-white p-4 rounded-3xl border-[2.5px] border-zinc-900 w-72"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-h3 text-sm">MindMap Lofi</h4>
              <button onClick={() => setShowPlayer(false)} className="material-symbols-outlined text-zinc-400 hover:text-zinc-900 transition-colors">close</button>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-zinc-900 bg-zinc-900">
               {isPlaying ? (
                 <iframe 
                   width="100%" 
                   height="100%" 
                   src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&controls=0" 
                   title="Lofi Radio" 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                 ></iframe>
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-white flex-col gap-2">
                   <span className="material-symbols-outlined text-4xl">music_note</span>
                   <p className="text-[10px] font-label-bold uppercase">Click Play to Stream</p>
                 </div>
               )}
            </div>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-full mt-4 py-2 rounded-xl border-2 border-zinc-900 font-label-bold text-xs uppercase tracking-widest transition-all ${
                isPlaying ? 'bg-red-50 text-red-600' : 'bg-primary text-white'
              }`}
            >
              {isPlaying ? 'Stop Music' : 'Start Radio'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setShowPlayer(!showPlayer)}
        className="w-14 h-14 bg-white border-[2.5px] border-zinc-900 rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-none transition-all hover:bg-zinc-50"
      >
        <span className={`material-symbols-outlined text-3xl ${isPlaying ? 'animate-pulse text-primary' : 'text-zinc-900'}`}>
          {isPlaying ? 'graphic_eq' : 'music_note'}
        </span>
      </button>
    </div>
  );
};

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
      if (cycleCount < 3) {
        setCycleCount(prev => prev + 1);
        cycle();
      } else {
        clearInterval(interval);
      }
    }, 19000);
    return () => clearInterval(interval);
  }, [cycleCount]);

  return (
    <div className="flex flex-col items-center justify-center relative w-full h-full">
      {/* Cycle Indicator at the top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
        <span className="font-label-bold text-[9px] text-primary bg-white border-2 border-primary/20 px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-sm">
          Cycle {cycleCount}/3
        </span>
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Background Guide Ring */}
        <div className="absolute w-full h-full rounded-full border-[2px] border-dashed border-zinc-200" />
        
        {/* The Breathing Orb */}
        <div className="w-16 h-16 bg-primary/30 rounded-full animate-breathe-478 border-[2.5px] border-zinc-900 neobrutal-shadow shadow-primary/20" />
        
        {/* Stage Text Overlayed for perfect centering */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.p 
              key={stage}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xl font-h3 font-black text-zinc-900 drop-shadow-sm"
            >
              {stage}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const MoodCard = ({ data }) => {
  const { mood, energy, focus, stress } = data;
  
  const moodMap = {
    low_mood: { icon: 'sentiment_dissatisfied', color: 'text-blue-500' },
    anxious: { icon: 'psychology_alt', color: 'text-red-500' },
    burned_out: { icon: 'battery_0_bar', color: 'text-zinc-500' },
    focused: { icon: 'center_focus_strong', color: 'text-primary' },
    calm: { icon: 'self_improvement', color: 'text-green-500' },
  };

  const currentMood = moodMap[mood] || moodMap.calm;

  return (
    <div className="neobrutal-card neobrutal-shadow p-6 rounded-2xl bg-white relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-h3 text-zinc-900">Current State</h3>
          <p className="font-body-md text-on-surface-variant capitalize">{mood.replace('_', ' ')}</p>
        </div>
        <span className={`material-symbols-outlined text-4xl ${currentMood.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {currentMood.icon}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <span className="px-3 py-1 rounded-full border-2 border-zinc-900 bg-secondary-fixed text-on-secondary-fixed font-label-bold text-[10px] uppercase">
          Energy {energy}/10
        </span>
        <span className="px-3 py-1 rounded-full border-2 border-zinc-900 bg-tertiary-fixed text-on-tertiary-fixed font-label-bold text-[10px] uppercase">
          Focus {focus}/10
        </span>
      </div>
    </div>
  );
};

const SessionStats = ({ current, total }) => {
  const progress = (current / total) * 100;
  return (
    <div className="neobrutal-card neobrutal-shadow p-6 rounded-2xl bg-white">
      <h3 className="font-h3 text-zinc-900 mb-4">Progress</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="font-body-md">Session Blocks</span>
          <span className="font-label-bold">{current}/{total} Completed</span>
        </div>
        <div className="w-full bg-zinc-100 h-4 rounded-full border-2 border-zinc-900 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-secondary-container h-full"
          />
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
  const [showWhiteboard, setShowWhiteboard] = useState(false);

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

  const saveProgress = async (blockIdx, extraSeconds = 0) => {
    if (!sessionData) return;
    try {
      const completedBlocks = sessionData.sessionPlan.blocks.slice(0, blockIdx);
      const fullMinutes = completedBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);
      const partialMinutes = Math.floor(extraSeconds / 60);
      const totalMinutes = fullMinutes + partialMinutes;
      
      if (totalMinutes === 0) return;

      await api.post('/saveSession', {
        ...sessionData,
        actualMinutes: totalMinutes,
        date: new Date().toISOString().split('T')[0],
        partial: true
      });
      console.log('Progress saved:', totalMinutes, 'mins');
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const handleBlockEnd = () => {
    if (!isBreak) {
      setIsBreak(true);
      const breakDuration = sessionData.sessionPlan.blocks[currentBlockIndex].breakAfter.type === 'breathing' ? 57 : (sessionData.sessionPlan.blocks[currentBlockIndex].breakAfter.durationMinutes * 60);
      setTimeLeft(breakDuration);
      setIsActive(true);
      
      // Save full minutes for the block just completed
      saveProgress(currentBlockIndex + 1);
    } else {
      setIsBreak(false);
      const nextIdx = currentBlockIndex + 1;
      if (nextIdx < sessionData.sessionPlan.blocks.length) {
        setCurrentBlockIndex(nextIdx);
        setTimeLeft(sessionData.sessionPlan.blocks[nextIdx].durationMinutes * 60);
        setIsActive(true);
      } else {
        navigate('/reflection');
      }
    }
  };

  const finishEarly = () => {
    const initialDuration = sessionData.sessionPlan.blocks[currentBlockIndex].durationMinutes * 60;
    const elapsedSeconds = isBreak ? 0 : (initialDuration - timeLeft);
    saveProgress(currentBlockIndex, elapsedSeconds);
    navigate('/reflection');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const [breakMode, setBreakMode] = useState('breathing'); // 'breathing' or 'doodle'

  if (!sessionData) return null;

  const currentBlock = sessionData.sessionPlan.blocks[currentBlockIndex];
  const totalBlocks = sessionData.sessionPlan.blocks.length;
  
  // Calculate progress for the timer ring
  const initialDuration = isBreak 
    ? (currentBlock.breakAfter.type === 'breathing' ? 57 : currentBlock.breakAfter.durationMinutes * 60)
    : currentBlock.durationMinutes * 60;
  const progressOffset = 816 - (timeLeft / initialDuration) * 816;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 relative">
      {/* Timer Section */}
      <section className="flex flex-col items-center justify-center pt-8">
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Decoration Background Circle */}
          <div className="absolute inset-0 w-80 h-80 bg-primary-fixed-dim/20 rounded-full blur-3xl -z-10" />
          
          {/* SVG Timer Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle className="text-zinc-100" cx="160" cy="160" fill="transparent" r="130" stroke="currentColor" strokeWidth="16" />
            <motion.circle 
              className="text-primary" 
              cx="160" cy="160" fill="transparent" r="130" 
              stroke="currentColor" 
              strokeWidth="16"
              strokeDasharray="816"
              animate={{ strokeDashoffset: progressOffset }}
              transition={{ duration: 1, ease: "linear" }}
              strokeLinecap="round" 
            />
          </svg>
          
          {/* Timer Content */}
          <AnimatePresence mode="wait">
            {isBreak ? (
              <div className="z-20 w-full h-full flex flex-col items-center justify-center p-8">
                <BreathingAnimation />
                <div className="absolute bottom-12 flex flex-col items-center gap-2">
                  <span className="font-h1 text-4xl text-primary tabular-nums">{formatTime(timeLeft)}</span>
                  <p className="font-label-bold text-[10px] text-primary uppercase tracking-[0.2em] bg-white border-2 border-primary/20 px-4 py-1 rounded-full">
                     Recharging...
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center z-20">
                <span className="font-h1 text-7xl text-zinc-900 block tabular-nums mb-1">{formatTime(timeLeft)}</span>
                <span className="font-label-bold text-primary uppercase tracking-[0.2em] text-[10px] bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                   {currentBlock.subject}
                </span>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Timer Controls */}
        <div className="flex flex-col items-center gap-6 mt-20">
          <div className="flex gap-6">
            <button 
              onClick={() => setIsActive(!isActive)}
              disabled={isBreak}
              className={`neobrutal-card neobrutal-shadow px-10 py-5 rounded-2xl active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-3 font-label-bold text-xl ${
                isBreak ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed opacity-60' : (isActive ? 'bg-white text-zinc-900' : 'bg-primary text-white')
              }`}
            >
              <span className="material-symbols-outlined text-2xl">{isActive ? (isBreak ? 'lock' : 'pause') : 'play_arrow'}</span>
              {isBreak ? 'Break Locked' : (isActive ? 'Pause' : 'Start')}
            </button>
            <button 
              onClick={handleBlockEnd}
              className="neobrutal-card neobrutal-shadow p-5 bg-white rounded-2xl active:translate-y-0.5 active:shadow-none transition-all"
            >
              <span className="material-symbols-outlined text-2xl">skip_next</span>
            </button>
          </div>
          
          {!isBreak && (
            <button 
              onClick={finishEarly}
              className="text-[10px] font-label-bold uppercase tracking-[0.2em] text-outline hover:text-zinc-900 transition-colors"
            >
              Finish Session Early & Save Stats
            </button>
          )}
        </div>
      </section>

      {/* Persistent Whiteboard Toggle (Left Side) */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
        <AnimatePresence>
          {showWhiteboard && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              className="neobrutal-card neobrutal-shadow-lg bg-white rounded-3xl border-[2.5px] border-zinc-900 w-[400px] h-[350px] overflow-hidden"
            >
              <Whiteboard onClose={() => setShowWhiteboard(false)} />
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setShowWhiteboard(!showWhiteboard)}
          className="w-14 h-14 bg-white border-[2.5px] border-zinc-900 rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-none transition-all hover:bg-zinc-50"
        >
          <span className={`material-symbols-outlined text-3xl ${showWhiteboard ? 'text-primary' : 'text-zinc-900'}`}>
            draw
          </span>
        </button>
      </div>

      <LofiPlayer />

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MoodCard data={sessionData} />
        <SessionStats current={currentBlockIndex} total={totalBlocks} />
        
        {/* Session Insight Card */}
        <div className="md:col-span-2 neobrutal-card neobrutal-shadow p-8 rounded-3xl bg-tertiary-fixed flex flex-col md:flex-row gap-6 items-center">
          <div className="w-16 h-16 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 rotate-3">
             <span className="material-symbols-outlined text-3xl text-tertiary">lightbulb</span>
          </div>
          <div>
            <h3 className="font-h3 text-xl mb-2 italic">MindMap Insight</h3>
            <p className="font-body-md text-zinc-800 leading-relaxed">
              "{currentBlock.tip || sessionData.sessionPlan.empathyNote}"
            </p>
          </div>
        </div>

        {/* Task List / Blocks */}
        <div className="md:col-span-2 neobrutal-card neobrutal-shadow rounded-3xl p-8 relative bg-white">
          <div className="absolute -top-4 -right-2 bg-secondary-fixed border-2 border-zinc-900 px-4 py-1 rounded-lg rotate-3 shadow-[2px_2px_0px_0px_#1A1A1A] font-label-bold text-xs">
            SESSION ROADMAP
          </div>
          <h3 className="font-h3 text-zinc-900 mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined">checklist</span>
            Study Blocks
          </h3>
          <div className="space-y-4">
            {sessionData.sessionPlan.blocks.map((block, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-4 p-5 border-2 border-zinc-900 rounded-2xl transition-all ${
                  idx === currentBlockIndex 
                    ? 'bg-primary-fixed shadow-[6px_6px_0px_0px_#1A1A1A] -translate-y-1' 
                    : idx < currentBlockIndex 
                      ? 'bg-green-50 opacity-80 shadow-[2px_2px_0px_0px_#1A1A1A]' 
                      : 'bg-white hover:bg-zinc-50'
                }`}
              >
                <div className={`w-10 h-10 border-2 border-zinc-900 rounded-xl flex items-center justify-center transition-colors ${
                  idx < currentBlockIndex ? 'bg-green-500 text-white' : idx === currentBlockIndex ? 'bg-white' : 'bg-zinc-100'
                }`}>
                  {idx < currentBlockIndex ? (
                    <span className="material-symbols-outlined font-black">check</span>
                  ) : (
                    <span className="font-label-bold">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-grow">
                  <p className={`font-h3 text-lg ${idx < currentBlockIndex ? 'text-zinc-400' : 'text-zinc-900'}`}>
                    {block.subject}
                  </p>
                  <p className="text-[10px] text-outline font-label-caps uppercase tracking-widest">{block.durationMinutes} minutes</p>
                </div>
                {idx === currentBlockIndex && (
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 rounded-lg bg-white border-2 border-zinc-900 font-label-bold text-[10px] animate-pulse uppercase tracking-tighter">
                      Current Task
                    </span>
                  </div>
                )}
                {idx < currentBlockIndex && (
                   <span className="font-label-bold text-[10px] text-green-600 uppercase">Completed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Session;
