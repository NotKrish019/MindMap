import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import api from '../services/api';
import { motion } from 'framer-motion';

function Profile() {
  const { user, handleLogout } = useAuth();
  const [stats, setStats] = useState({ totalMinutes: 0, streak: 0, entryCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/profile/${user?.id || 'share'}`;
    const textToShare = `Check out my MindMap profile! I've studied for ${stats.totalMinutes} mindful minutes. Can you beat my streak?\n${profileUrl}`;
    
    navigator.clipboard.writeText(textToShare).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  useEffect(() => {
    const fetchStats = async () => {
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

        const totalMinutes = history.reduce((acc, doc) => acc + (doc.actualMinutes || 25), 0);
        setStats({
          totalMinutes: totalMinutes,
          streak: streak,
          entryCount: history.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const achievements = [
    { name: 'First Breath', icon: 'star', color: 'bg-primary-container', active: stats.entryCount > 0, description: 'Complete your first study session' },
    { name: 'Self Love', icon: 'favorite', color: 'bg-secondary-container', active: stats.entryCount > 2, description: 'Complete 3 study sessions' },
    { name: 'Unstoppable', icon: 'diamond', color: 'bg-tertiary-fixed-dim', active: stats.streak > 3, description: 'Maintain a 4-day study streak' },
    { name: 'Week One', icon: 'calendar_month', color: 'bg-primary-fixed', active: stats.entryCount > 7, description: 'Complete 8 study sessions' },
    { name: 'Zen Master', icon: 'energy_savings_leaf', color: 'bg-error-container', active: stats.totalMinutes > 200, description: 'Accumulate 200 mindful minutes' },
    { name: 'Deep Diver', icon: 'water_drop', color: 'bg-secondary-fixed', active: stats.totalMinutes > 500, description: 'Accumulate 500 mindful minutes' },
  ];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="material-symbols-outlined text-6xl text-zinc-300 mb-6">lock</span>
        <h2 className="font-h3 text-2xl mb-4">Please sign in to view your profile</h2>
        <button onClick={() => window.location.href = '/'} className="bg-primary text-white px-8 py-3 rounded-xl neobrutal-shadow font-label-bold">Go Home</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8 pb-24"
    >
      {/* Profile Header */}
      <section className="relative bg-white border-[2.5px] border-zinc-900 p-8 neobrutal-shadow-lg rounded-3xl">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="relative">
            <img 
              alt="User Profile" 
              className="w-24 h-24 rounded-full border-[2.5px] border-zinc-900 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] object-cover" 
              src={user.picture || "https://lh3.googleusercontent.com/a/default-user=s96-c"}
            />
            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-lg border-2 border-zinc-900">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <div className="flex-grow">
            <h1 className="font-h2 text-3xl text-zinc-900 mb-1">{user.name}</h1>
            <p className="font-label-bold text-primary">Mindfulness Explorer • Lvl {Math.floor(stats.totalMinutes / 100) + 1}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="neobrutal-card px-4 py-2 text-xs font-label-bold border-2 border-zinc-900 rounded-xl hover:bg-zinc-50 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span> Sign Out
          </button>
        </div>
        
        {/* Floating Decoration */}
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-secondary-container border-2 border-zinc-900 rounded-full flex items-center justify-center rotate-12 neobrutal-shadow hidden md:flex">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-6">
        <div className="bg-white border-[2.5px] border-zinc-900 p-6 neobrutal-shadow rounded-2xl flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-primary text-4xl mb-2">timer</span>
          <span className="font-h2 text-3xl">{stats.totalMinutes}</span>
          <span className="font-label-caps text-xs text-zinc-500 uppercase tracking-widest mt-1">Mindful Minutes</span>
        </div>
        <div className="bg-white border-[2.5px] border-zinc-900 p-6 neobrutal-shadow rounded-2xl flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-secondary text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <span className="font-h2 text-3xl">{stats.streak}</span>
          <span className="font-label-caps text-xs text-zinc-500 uppercase tracking-widest mt-1">Day Streak</span>
        </div>
      </section>

      {/* Sticker Book Section */}
      <section className="bg-white border-[2.5px] border-zinc-900 p-8 neobrutal-shadow-lg rounded-3xl">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-h3 text-2xl text-zinc-900">Sticker Book</h2>
            <p className="font-body-md text-zinc-600">Your milestones, celebrated.</p>
          </div>
          <div className="bg-tertiary-fixed border-2 border-zinc-900 px-4 py-1.5 rounded-full font-label-bold text-xs uppercase tracking-wider">
            {achievements.filter(a => a.active).length}/{achievements.length} Collected
          </div>
        </div>

        {/* Stable Grid for Achievements */}
        <div className="grid grid-cols-3 gap-8">
          {achievements.map((ach, idx) => (
            <div key={idx} className={`flex flex-col items-center gap-3 group relative cursor-pointer ${!ach.active && 'opacity-40 grayscale'}`}>
              <div className={`w-20 h-20 ${ach.color} border-[2.5px] border-zinc-900 rounded-2xl flex items-center justify-center neobrutal-shadow group-hover:scale-105 transition-transform ${idx % 2 === 0 ? 'rotate-3' : '-rotate-3'}`}>
                <span className={`material-symbols-outlined text-white text-4xl ${ach.active ? '' : 'hidden'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{ach.icon}</span>
                {!ach.active && <span className="material-symbols-outlined text-zinc-400 text-3xl">lock</span>}
              </div>
              <span className="font-label-bold text-[10px] text-center uppercase tracking-tighter leading-none">{ach.name}</span>
              
              {/* Tooltip Overlay */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 bg-zinc-900 text-white text-[9px] font-label-bold p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center shadow-xl z-20 border-2 border-white/10">
                {ach.description}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-r-2 border-b-2 border-white/10"></div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <button className="w-full mt-10 bg-primary text-white font-label-bold text-lg py-4 rounded-2xl border-[2.5px] border-zinc-900 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all">
          VIEW ALL ACHIEVEMENTS
        </button>
      </section>

      {/* Share Section */}
      <section className="bg-secondary-container border-[2.5px] border-zinc-900 p-8 neobrutal-shadow-lg rounded-3xl text-white relative overflow-hidden group">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white border-[2.5px] border-zinc-900 rounded-2xl flex items-center justify-center neobrutal-shadow rotate-3 group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-zinc-900 text-3xl">share</span>
            </div>
            <div>
              <h3 className="font-h3 text-2xl text-white mb-1">Spread the calm.</h3>
              <p className="font-body-md text-white/90">Showcase your mindfulness journey with friends.</p>
            </div>
          </div>
          <button 
            onClick={handleShare}
            className={`font-label-bold py-4 px-8 rounded-2xl border-[2.5px] border-zinc-900 neobrutal-shadow active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center gap-3 text-sm uppercase tracking-wider ${
              isCopied ? 'bg-[#8B5CF6] text-white' : 'bg-white text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{isCopied ? 'check_circle' : 'content_copy'}</span>
            {isCopied ? 'Link Copied!' : 'Share Profile'}
          </button>
        </div>
      </section>
    </motion.div>
  );
}

export default Profile;
