import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useAuth } from '../App';

function Home() {
  const [journalText, setJournalText] = useState('');
  const [subjects, setSubjects] = useState([{ name: '', hoursNeeded: 1 }]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ entryCount: 0, streak: 0 });
  const { user, handleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure the user must perform a check-in to get a new session
    sessionStorage.removeItem('currentSession');

    if (user) {
      const fetchTeaserStats = async () => {
        try {
          const historyRes = await api.get('/history');
          const history = historyRes.data;
          let streak = 0;
          if (history.length > 0) {
            const insightRes = await api.post('/getWeeklyInsight', {
              weeklyHistory: history
            });
            streak = insightRes.data.streak || 0;
          }
          setStats({
            entryCount: history.length,
            streak: streak
          });
        } catch (err) {
          console.error("Failed to fetch teaser stats", err);
        }
      };
      fetchTeaserStats();
    }
  }, [user]);

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
        availableHours: 3
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
      className="max-w-4xl mx-auto"
    >
      {/* Welcome Header */}
      <header className="mb-12 text-center md:text-left">
        <h1 className="font-h1 text-4xl text-on-background mb-2">Hello, {user?.name ? user.name.split(' ')[0] : 'there'}.</h1>
        <p className="font-body-lg text-lg text-on-surface-variant">Ready for your daily mind-map?</p>
      </header>

      {/* Main Interactive Section */}
      <div className="relative flex flex-col items-center">
        {/* Decorative Background Elements */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary-fixed-dim/40 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -top-8 -z-10 sticker-circle w-72 h-72 rounded-full bg-secondary-fixed/50 animate-pulse" style={{ transform: 'rotate(-15deg)' }}></div>

        {/* Prompt Question */}
        <div className="neobrutal-card neobrutal-shadow px-6 py-3 rounded-full mb-8 bg-tertiary-fixed inline-block">
          <span className="font-label-bold text-sm text-on-tertiary-fixed uppercase tracking-wider">DAILY CHECK-IN</span>
        </div>
        <h2 className="font-h2 text-3xl text-center text-on-background mb-10 max-w-lg">How are you feeling right now?</h2>

        {/* Journal Entry Area */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
          <div className="neobrutal-card neobrutal-shadow-lg rounded-3xl p-6 relative bg-white">
            <div className="absolute -top-3 -right-3 w-12 h-12 neobrutal-card bg-secondary-fixed flex items-center justify-center rotate-6 shadow-[2px_2px_0px_0px_#1A1A1A]">
              <span className="material-symbols-outlined text-zinc-900">edit_note</span>
            </div>
            <textarea 
              className="w-full h-48 bg-transparent border-none focus:ring-0 font-body-lg text-lg text-on-background placeholder:text-outline/50 resize-none p-4" 
              placeholder="Write down whatever's on your mind..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              required
            ></textarea>
            <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-zinc-100">
              <span className="text-label-caps text-xs text-outline uppercase"></span>
            </div>
          </div>

          {/* Subjects Section */}
          <div className="neobrutal-card neobrutal-shadow-lg rounded-3xl p-6 bg-white">
            <div className="flex justify-between items-center mb-6">
              <span className="font-label-bold text-sm text-outline uppercase tracking-wider">Study Subjects</span>
              <button 
                type="button" 
                onClick={addSubject}
                className="bg-primary-container text-on-primary-container border-2 border-zinc-900 px-4 py-1.5 rounded-xl font-label-bold text-xs uppercase tracking-wider neobrutal-shadow active:translate-y-0.5 active:shadow-none transition-all"
              >
                + Add Subject
              </button>
            </div>
            <div className="space-y-4">
              {subjects.map((subject, index) => (
                <div key={index} className="flex gap-4 items-center bg-zinc-50 p-4 rounded-2xl border-2 border-zinc-900">
                  <input
                    type="text"
                    className="flex-grow bg-transparent border-none focus:ring-0 font-body-md text-zinc-900 placeholder:text-outline/50"
                    placeholder="e.g. Mathematics"
                    value={subject.name}
                    onChange={(e) => updateSubject(index, 'name', e.target.value)}
                    required
                  />
                  <div className="w-px h-8 bg-zinc-200"></div>
                  <input
                    type="number"
                    className="w-16 bg-transparent border-none focus:ring-0 font-label-bold text-center text-zinc-900"
                    min="1"
                    max="8"
                    value={subject.hoursNeeded}
                    onChange={(e) => updateSubject(index, 'hoursNeeded', parseInt(e.target.value) || 1)}
                    required
                  />
                  <span className="text-xs text-outline uppercase">hrs</span>
                  {subjects.length > 1 && (
                    <button type="button" onClick={() => removeSubject(index)} className="text-outline hover:text-red-500">
                      <span className="material-symbols-outlined">delete</span>
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
                className="bg-primary text-white font-label-bold text-lg px-12 py-4 rounded-2xl neobrutal-shadow active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Generate My Session
                  </>
                )}
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleLogin}
                className="bg-white border-[2.5px] border-zinc-900 text-zinc-900 font-label-bold text-lg px-12 py-4 rounded-2xl neobrutal-shadow active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-3"
              >
                <span className="material-symbols-outlined">login</span>
                Sign In to Start
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Dashboard Teaser */}
      {user && (
        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neobrutal-card neobrutal-shadow p-6 rounded-3xl bg-secondary-fixed col-span-1 md:col-span-2 flex justify-between items-center overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-h3 text-2xl mb-2">Overall Progress</h3>
              <p className="font-body-md text-zinc-700 max-w-xs text-sm">You've logged {stats.entryCount} entries so far. Keep up the momentum!</p>
            </div>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFmJFcLOWLJJRWMXe1ANtX_avv2Q02HpyKHTzoYnz6wPfMOTjfRKkMWTeI2bU02szViZLiiX08wcBdmzpwO10hLI8jkQVLkd7IKgFfT0t4fnQTVt_xX2GB1E5bKTM7MyIy7XQirRwmAB1rHnitY7EmXzx-NHooQir3ageceARlYAchdtBzGObVlyXjpg8ccG-cVrwdXBDoQIRTf2D_ox9iAUGsfx0FfvtF3PMmWn2LplfE-G3Es4mm6W4zXmSCdUrMBstEdfx6Zk8" alt="Progress" className="w-32 h-32 object-cover rounded-2xl neobrutal-card rotate-3" />
          </div>
          <div className="neobrutal-card neobrutal-shadow p-6 rounded-3xl bg-tertiary-fixed flex flex-col justify-center items-center text-center">
            <span className="material-symbols-outlined text-5xl mb-3 text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            <h3 className="font-h3 text-2xl">{stats.streak} Day Streak!</h3>
            <p className="font-label-bold text-xs mt-2 uppercase">Current Streak</p>
          </div>
        </section>
      )}
    </motion.div>
  );
}

export default Home;
