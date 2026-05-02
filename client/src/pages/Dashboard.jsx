import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import TomorrowTasks from '../components/TomorrowTasks';

function Dashboard() {
  const [history, setHistory] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyRes = await api.get('/history');
        setHistory(historyRes.data);
        
        if (historyRes.data.length > 0) {
          const insightRes = await api.post('/getWeeklyInsight', {
            weeklyHistory: historyRes.data
          });
          setInsight(insightRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="w-16 h-16 border-4 border-zinc-900 border-t-primary rounded-full animate-spin"></div>
      <p className="font-h3 text-xl text-zinc-900">Analyzing your mind-map patterns...</p>
    </div>
  );

  // Aggregate history by date to handle multiple entries/partial saves
  const aggregatedHistory = history.reduce((acc, doc) => {
    const dateKey = doc.date;
    if (!acc[dateKey]) {
      acc[dateKey] = { ...doc, totalMinutes: doc.actualMinutes || 25 };
    } else {
      acc[dateKey].totalMinutes += (doc.actualMinutes || 0);
      // Keep the latest emotional stats
      acc[dateKey].energy = doc.energy;
      acc[dateKey].focus = doc.focus;
      acc[dateKey].stress = doc.stress;
    }
    return acc;
  }, {});

  const sortedHistory = Object.values(aggregatedHistory).sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = sortedHistory.map(doc => ({
    date: doc.date.split('-').slice(1).join('/'),
    energy: doc.energy,
    focus: doc.focus,
    stress: doc.stress,
    day: new Date(doc.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  }));

  const totalMindfulMinutes = sortedHistory.reduce((acc, doc) => acc + (doc.totalMinutes || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 max-w-6xl mx-auto pb-24"
    >
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-label-caps text-primary uppercase tracking-widest bg-primary-fixed px-4 py-1.5 rounded-full border-2 border-zinc-900 mb-3 inline-block">
            Weekly Overview
          </span>
          <h1 className="font-h1 text-4xl text-on-surface">Hey, {user ? user.name.split(' ')[0] : 'there'}! 🧘‍♂️</h1>
          <p className="font-body-lg text-on-surface-variant max-w-md">Your mind has been relatively calm this week. Let's look at the patterns.</p>
        </div>
        <div className="flex gap-4">
          <div className="neobrutal-card bg-primary-container p-4 border-2 border-zinc-900 shadow-[4px_4px_0px_0px_#1A1A1A] rounded-2xl text-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">local_fire_department</span>
              <span className="font-h3 text-2xl">{insight?.streak || 0}</span>
            </div>
            <p className="text-[10px] font-label-bold uppercase tracking-wider text-white/80">Day Streak</p>
          </div>
        </div>
      </section>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Mood Trends Line Chart */}
        <div className="md:col-span-8 neobrutal-card neobrutal-shadow-lg p-8 bg-white min-h-[450px] flex flex-col rounded-3xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="font-h3 text-2xl text-zinc-900">Mood Trends</h2>
              <p className="font-body-md text-on-surface-variant">Last 7 days of emotional tracking</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-1.5 rounded-full border-2 border-zinc-900">
              <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
              <span className="font-label-caps text-xs tracking-widest">{insight?.moodTrend || 'STABLE'}</span>
            </div>
          </div>
          
          <div className="flex-grow w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#1A1A1A" 
                  fontSize={12} 
                  fontWeight={700}
                  axisLine={{ strokeWidth: 2 }}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#1A1A1A" 
                  fontSize={12} 
                  fontWeight={700}
                  axisLine={{ strokeWidth: 2 }}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2.5px solid #1A1A1A', 
                    borderRadius: '12px',
                    boxShadow: '4px 4px 0px 0px #1A1A1A'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                />
                <Line type="monotone" dataKey="energy" stroke="#fbbf24" strokeWidth={4} dot={{ r: 6, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="focus" stroke="#60a5fa" strokeWidth={4} dot={{ r: 6, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="stress" stroke="#f87171" strokeWidth={4} dot={{ r: 6, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mt-12 border-t-2 border-zinc-100 pt-6">
            <div className="flex items-center gap-2 font-label-bold text-xs uppercase tracking-wider">
              <div className="w-4 h-4 bg-yellow-400 border-2 border-zinc-900 rounded-full" /> Energy
            </div>
            <div className="flex items-center gap-2 font-label-bold text-xs uppercase tracking-wider">
              <div className="w-4 h-4 bg-blue-400 border-2 border-zinc-900 rounded-full" /> Focus
            </div>
            <div className="flex items-center gap-2 font-label-bold text-xs uppercase tracking-wider">
              <div className="w-4 h-4 bg-red-400 border-2 border-zinc-900 rounded-full" /> Stress
            </div>
          </div>
        </div>

        {/* Weekly Insight & Tasks Card */}
        <div className="md:col-span-4 flex flex-col gap-8">
          <TomorrowTasks />
          
          <div className="neobrutal-card neobrutal-shadow p-8 bg-tertiary-fixed relative overflow-hidden flex-grow rounded-3xl min-h-[300px]">
            <div className="absolute -top-6 -right-6 bg-secondary text-white font-label-caps text-[10px] px-6 py-10 rotate-12 flex items-center justify-center shadow-[4px_4px_0px_0px_#1A1A1A] border-2 border-zinc-900 sticker-circle">
               INSIGHT
            </div>
            <div className="mt-8">
              <span className="material-symbols-outlined text-5xl mb-4 text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <h3 className="font-h3 text-2xl text-on-tertiary-fixed mb-4">Focus Peak</h3>
              <p className="font-body-md text-on-tertiary-fixed-variant leading-relaxed">
                {insight?.suggestion || "Your data suggests a balanced week. Keep following your morning focus sessions for peak performance."}
              </p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="md:col-span-12 neobrutal-card neobrutal-shadow-lg p-8 bg-white rounded-3xl">
          <div className="flex justify-between items-center mb-10">
             <h2 className="font-h3 text-2xl">Recent Sessions</h2>
             <span className="text-xs font-label-bold uppercase tracking-widest text-outline">{history.length} Entries</span>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {history.map((doc, i) => (
              <div key={i} className="neobrutal-card p-6 rounded-2xl border-2 border-zinc-900 bg-zinc-50 flex flex-col md:flex-row items-center justify-between hover:translate-x-1 transition-all cursor-default group">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="p-4 bg-white border-2 border-zinc-900 rounded-xl text-zinc-900 group-hover:bg-primary group-hover:text-white transition-colors rotate-3">
                    <span className="material-symbols-outlined text-2xl">calendar_today</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-label-bold text-outline uppercase tracking-widest mb-1">{new Date(doc.date).toLocaleDateString('en-GB')}</p>
                    <p className="font-h3 text-xl text-zinc-900 capitalize">{(doc.mood || 'session').replace('_', ' ')} Session</p>
                  </div>
                </div>
                <div className="flex gap-8 items-center mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-label-bold text-outline uppercase tracking-widest mb-1">Total Minutes</p>
                    <p className="text-sm font-bold text-zinc-700">{doc.actualMinutes || 25} Mins</p>
                  </div>
                  <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-20 border-4 border-dashed border-zinc-100 rounded-3xl">
                <span className="material-symbols-outlined text-6xl text-zinc-200 mb-4">history</span>
                <p className="font-body-lg text-zinc-400 italic">No history yet. Complete your first session to see insights!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
