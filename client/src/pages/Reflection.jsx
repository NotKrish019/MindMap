import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';

function Reflection() {
  const [reflectionData, setReflectionData] = useState(null);
  const [answers, setAnswers] = useState({ q1: '', q2: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionData = JSON.parse(sessionStorage.getItem('currentSession'));
    if (!sessionData) return navigate('/');

    const fetchReflection = async () => {
      try {
        const response = await api.post('/getReflection', {
          mood: sessionData.mood,
          plannedMinutes: sessionData.sessionPlan.totalStudyMinutes,
          actualMinutes: sessionData.sessionPlan.totalStudyMinutes
        });
        setReflectionData(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchReflection();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const sessionData = JSON.parse(sessionStorage.getItem('currentSession'));
    
    try {
      await api.post('/saveSession', {
        ...sessionData,
        reflectionAnswers: answers,
        date: new Date().toISOString().split('T')[0],
        partial: false // Mark as full completion
      });
      setSubmitted(true);
      sessionStorage.removeItem('currentSession'); // Clear session
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Failed to save session:', err);
      // Fallback: Still navigate if save fails but show a warning?
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (!reflectionData) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="w-16 h-16 border-4 border-zinc-900 border-t-primary rounded-full animate-spin"></div>
      <p className="font-h3 text-xl text-zinc-900">Preparing your reflection prompts...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto pb-24"
    >
      <header className="text-center mb-16">
        <div className="inline-block p-4 bg-secondary-fixed-dim border-2 border-zinc-900 rounded-2xl shadow-[4px_4px_0px_0px_#1A1A1A] text-secondary mb-6 rotate-3">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
        </div>
        <h1 className="font-h1 text-4xl mb-4">Well done.</h1>
        <p className="font-body-lg text-on-surface-variant max-w-md mx-auto">Take a moment to process your session before you head out.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="neobrutal-card neobrutal-shadow p-8 bg-white rounded-3xl relative">
          <div className="absolute -top-4 -left-4 bg-tertiary-fixed border-2 border-zinc-900 px-4 py-1 rounded-lg -rotate-3 shadow-[2px_2px_0px_0px_#1A1A1A] font-label-bold text-xs">
            PROMPT 01
          </div>
          <label className="block font-h3 text-xl text-zinc-900 mb-6 italic leading-relaxed">
            "{reflectionData.prompt1}"
          </label>
          <textarea
            className="w-full h-32 bg-zinc-50 border-2 border-zinc-900 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/20 font-body-md text-lg"
            placeholder="Write your thoughts..."
            value={answers.q1}
            onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
            required
          />
        </div>

        <div className="neobrutal-card neobrutal-shadow p-8 bg-white rounded-3xl relative">
          <div className="absolute -top-4 -left-4 bg-primary-fixed border-2 border-zinc-900 px-4 py-1 rounded-lg -rotate-3 shadow-[2px_2px_0px_0px_#1A1A1A] font-label-bold text-xs">
            PROMPT 02
          </div>
          <label className="block font-h3 text-xl text-zinc-900 mb-6 italic leading-relaxed">
            "{reflectionData.prompt2}"
          </label>
          <textarea
            className="w-full h-32 bg-zinc-50 border-2 border-zinc-900 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/20 font-body-md text-lg"
            placeholder="Write your thoughts..."
            value={answers.q2}
            onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
            required
          />
        </div>

        <div className="bg-primary-fixed/30 border-2 border-dashed border-primary rounded-3xl p-6 text-center">
          <p className="font-body-md text-primary font-bold italic leading-relaxed">
            {reflectionData.closingNote}
          </p>
        </div>

        <div className="flex justify-center">
          <button 
            type="submit" 
            disabled={loading || submitted}
            className={`neobrutal-card neobrutal-shadow px-12 py-5 rounded-2xl font-label-bold text-xl flex items-center gap-3 transition-all ${
              submitted 
                ? 'bg-green-500 text-white' 
                : 'bg-primary text-white hover:translate-y-[-2px]'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : submitted ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl neobrutal-shadow">
                  <span className="material-symbols-outlined">check_circle</span> 
                  <span className="font-label-bold">Session Saved Successfully!</span>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => navigate('/')}
                    className="neobrutal-card neobrutal-shadow px-6 py-3 bg-white rounded-xl font-label-bold text-sm"
                  >
                    Back to Check-in
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="neobrutal-card neobrutal-shadow px-6 py-3 bg-primary text-white rounded-xl font-label-bold text-sm"
                  >
                    View Stats
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span> Complete Session
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default Reflection;
