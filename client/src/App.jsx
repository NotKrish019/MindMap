import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Session from './pages/Session';
import Reflection from './pages/Reflection';
import Dashboard from './pages/Dashboard';
import { Layout, Home as HomeIcon, BarChart2, User, LogOut, Brain } from 'lucide-react';
import { handleLogin, handleLogout, getUser } from './services/appid';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function Navbar() {
  const { user, handleLogout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Focus' },
    { path: '/dashboard', icon: BarChart2, label: 'Stats' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 bg-white/[0.02] border-r border-white/5 backdrop-blur-xl z-50">
      <div className="mb-12">
        <Brain className="w-8 h-8 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      </div>
      
      <div className="flex-1 flex flex-col gap-8">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={`p-3 rounded-2xl transition-all duration-300 ${
              location.pathname === item.path 
                ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                : 'text-slate-500 hover:text-indigo-400 hover:bg-white/5'
            }`}
          >
            <item.icon size={24} />
          </Link>
        ))}
      </div>

      {user && (
        <button 
          onClick={handleLogout}
          className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all"
        >
          <LogOut size={24} />
        </button>
      )}
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getUser();
      setUser(currentUser);
    };
    checkAuth();
  }, []);

  const login = async () => {
    await handleLogin();
    const currentUser = await getUser();
    setUser(currentUser);
  };

  const logout = async () => {
    await handleLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, handleLogin: login, handleLogout: logout }}>
      <Router>
        <div className="flex bg-[#050510] min-h-screen text-white selection:bg-indigo-500/30">
          <div className="bg-gradient-animate" />
          <div className="blob w-[500px] h-[500px] bg-indigo-600/10 -top-20 -left-20" />
          <div className="blob w-[400px] h-[400px] bg-violet-600/10 bottom-20 right-20" style={{ animationDelay: '-5s' }} />
          
          <Navbar />
          
          <main className="flex-1 ml-20 p-8 lg:p-12 overflow-y-auto">
            <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Brain className="text-white w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">MindMap</h1>
              </div>
              
              {user && (
                <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-sm text-slate-400">Welcome, <span className="text-white font-bold">{user.name}</span></span>
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-bold">
                    {user.name.charAt(0)}
                  </div>
                </div>
              )}
            </header>

            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/session" element={<Session />} />
                <Route path="/reflection" element={<Reflection />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
