import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Heart, Send, CheckCircle } from 'lucide-react';

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
          actualMinutes: sessionData.sessionPlan.totalStudyMinutes // Simplified
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
        date: new Date().toISOString().split('T')[0]
      });
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!reflectionData) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      <p className="text-slate-400">Preparing your reflection prompts...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      <header className="text-center mb-12">
        <div className="inline-block p-3 bg-red-500/10 rounded-full text-red-400 mb-4">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Well done.</h1>
        <p className="text-slate-400">Take a moment to process your session before you head out.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-card">
          <label className="block text-sm font-medium text-indigo-300 mb-3 italic">
            "{reflectionData.prompt1}"
          </label>
          <textarea
            className="w-full h-32 input-field resize-none"
            value={answers.q1}
            onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
            required
          />
        </div>

        <div className="glass-card">
          <label className="block text-sm font-medium text-indigo-300 mb-3 italic">
            "{reflectionData.prompt2}"
          </label>
          <textarea
            className="w-full h-32 input-field resize-none"
            value={answers.q2}
            onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
            required
          />
        </div>

        <p className="text-center text-slate-400 italic text-sm">
          {reflectionData.closingNote}
        </p>

        <div className="flex justify-center">
          <button 
            type="submit" 
            disabled={loading || submitted}
            className={`btn-primary w-full max-w-sm flex items-center justify-center gap-3 py-4 ${submitted ? 'bg-green-500 hover:from-green-500 hover:to-green-500' : ''}`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : submitted ? (
              <>
                <CheckCircle className="w-5 h-5" /> Saved to History
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> Complete Session
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default Reflection;
