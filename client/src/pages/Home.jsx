import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Trash2, Send, Sparkles, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../App';

function Home() {
  const [journalText, setJournalText] = useState('');
  const [subjects, setSubjects] = useState([{ name: '', hoursNeeded: 1 }]);
  const [loading, setLoading] = useState(false);
  const { user, handleLogin } = useAuth();
  const navigate = useNavigate();

  const addSubject = () => {
    setSubjects([...subjects, { name: '', hoursNeeded: 1 }]);
  };

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!journalText || subjects.some(s => !s.name)) return;
    
    setLoading(true);
    try {
      const response = await api.post('/analyseAndPlan', {
        journalText,
        subjects,
        availableHours: 3 // Default for MVP
      });
      sessionStorage.setItem('currentSession', JSON.stringify(response.data));
      navigate('/session');
    } catch (err) {
      console.error('Generation Error:', err);
      alert('Failed to generate session. Please ensure you are signed in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          How's your mind today?
        </h1>
        <p className="text-slate-400 text-lg">
          Share your thoughts and what you need to study. We'll handle the schedule.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-card">
          <label className="block text-sm font-medium text-indigo-300 mb-3 uppercase tracking-wider">
            Mood Journal
          </label>
          <textarea
            className="w-full h-40 input-field resize-none"
            placeholder="I'm feeling a bit overwhelmed by the upcoming exams, but I want to stay focused..."
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            required
          />
        </div>

        <div className="glass-card">
          <div className="flex justify-between items-center mb-6">
            <label className="text-sm font-medium text-indigo-300 uppercase tracking-wider">
              Study Subjects
            </label>
            <button 
              type="button" 
              onClick={addSubject}
              className="text-xs flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Subject
            </button>
          </div>

          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div key={index} className="flex gap-4 items-center animate-in fade-in slide-in-from-left-4">
                <input
                  className="flex-1 input-field"
                  placeholder="Subject Name (e.g. OS, Maths)"
                  value={subject.name}
                  onChange={(e) => updateSubject(index, 'name', e.target.value)}
                  required
                />
                <input
                  type="number"
                  className="w-24 input-field"
                  min="0.5"
                  step="0.5"
                  value={subject.hoursNeeded}
                  onChange={(e) => updateSubject(index, 'hoursNeeded', parseFloat(e.target.value) || 0)}
                  required
                />
                <span className="text-xs text-slate-500">hrs</span>
                {subjects.length > 1 && (
                  <button type="button" onClick={() => removeSubject(index)} className="text-slate-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          {user ? (
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full max-w-sm flex items-center justify-center gap-3 py-4 text-lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate My Session
                </>
              )}
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleLogin}
              className="btn-primary w-full max-w-sm flex items-center justify-center gap-3 py-4 text-lg bg-white/10 hover:bg-white/20"
            >
              <LogIn className="w-5 h-5" />
              Sign In to Start
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}

export default Home;
