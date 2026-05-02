import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Calendar, ArrowRight } from 'lucide-react';

function Dashboard() {
  const [history, setHistory] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      <p className="text-slate-400">Analyzing your study patterns...</p>
    </div>
  );

  const chartData = [...history].reverse().map(doc => ({
    date: doc.date.split('-').slice(1).join('/'),
    energy: doc.energy,
    focus: doc.focus,
    stress: doc.stress
  }));

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-slate-400">Track your mental state and study progress.</p>
        </div>
        <div className="flex gap-2">
           <div className="glass px-4 py-2 rounded-xl border-indigo-500/30 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold">{insight?.streak || 0} Day Streak</span>
           </div>
        </div>
      </header>

      {/* Insight Section */}
      {insight && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card md:col-span-2 bg-gradient-to-br from-indigo-900/20 to-transparent">
            <div className="flex items-center gap-2 text-violet-400 mb-4 font-bold text-xs uppercase tracking-widest">
              <TrendingUp className="w-4 h-4" /> Weekly Pattern
            </div>
            <p className="text-2xl font-light mb-6 text-indigo-100">
              {insight.suggestion}
            </p>
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Best Study Time</p>
                <p className="text-sm font-semibold">{insight.bestPattern}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Mood Trend</p>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20 uppercase font-bold tracking-tighter">
                  {insight.moodTrend}
                </span>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card border-red-500/20">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-4">Focus On</h3>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "Your data suggests that {insight.stressTrigger || 'you are handling stress well'}. Consider prioritizing lighter tasks on lower energy days."
            </p>
          </motion.div>
        </div>
      )}

      {/* Chart Section */}
      <div className="glass-card">
        <h3 className="text-sm font-bold uppercase tracking-widest text-violet-400 mb-8">Mood Trends (Last 7 Days)</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="energy" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="focus" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="stress" stroke="#f87171" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 bg-yellow-400 rounded-full" /> Energy
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 bg-blue-400 rounded-full" /> Focus
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 bg-red-400 rounded-full" /> Stress
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-violet-400">Recent Sessions</h3>
        <div className="grid grid-cols-1 gap-4">
          {history.map((doc, i) => (
            <div key={i} className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-default group">
              <div className="flex items-center gap-6">
                <div className="p-3 bg-white/5 rounded-xl text-slate-400 group-hover:text-violet-400 transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-mono mb-1">{doc.date}</p>
                  <p className="font-semibold text-white capitalize">{doc.mood.replace('_', ' ')} Session</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500 uppercase">Subjects</p>
                  <p className="text-sm font-medium">{doc.subjects.map(s => s.name).join(', ')}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-center py-12 glass-card">
              <p className="text-slate-500 italic">No history yet. Complete your first session to see insights!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
