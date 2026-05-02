import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Session from './pages/Session';
import Reflection from './pages/Reflection';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Break from './pages/Break';
import { handleLogin, handleLogout, getUser } from './services/appid';
import { setAccessToken } from './services/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function Navbar() {
  const { user, handleLogout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'edit_note', label: 'Check-in' },
    { path: '/session', icon: 'timer', label: 'Focus' },
    { path: '/dashboard', icon: 'equalizer', label: 'Stats' },
    { path: '/profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <>
      {/* Top Bar for Desktop */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#FDFBF7] border-b-[2.5px] border-zinc-900 shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-black tracking-tight text-zinc-900 font-h1">MindMap</Link>
        </div>
        <div className="hidden md:flex gap-8 items-center h-full">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`font-h3 font-bold transition-all h-full flex items-center mt-1 border-b-4 ${
                location.pathname === item.path 
                  ? 'text-[#8B5CF6] border-[#8B5CF6]' 
                  : 'text-zinc-600 border-transparent hover:text-zinc-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-all active:translate-y-0.5">
              <span className="material-symbols-outlined text-zinc-900">logout</span>
            </button>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-100">
              <span className="material-symbols-outlined text-zinc-900">account_circle</span>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden flex justify-around items-center h-20 pb-safe px-4 bg-white border-t-[2.5px] border-zinc-900 shadow-[0_-4px_0px_0px_#1A1A1A]">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center transition-all px-6 py-2 rounded-xl ${
              location.pathname === item.path 
                ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_0px_#1A1A1A]' 
                : 'text-zinc-500 hover:text-[#8B5CF6]'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-h3 text-[10px] font-bold uppercase tracking-wider mt-0.5">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

function SessionRoute({ children }) {
  const session = sessionStorage.getItem('currentSession');
  if (!session) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const tokensStr = sessionStorage.getItem('appid_tokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        setAccessToken(tokens.accessToken);
      }
      const currentUser = await getUser();
      console.log('Current User Auth Object:', currentUser);
      setUser(currentUser);
    };
    checkAuth();
  }, []);

  const login = async () => {
    const tokens = await handleLogin();
    if (tokens) {
      setAccessToken(tokens.accessToken);
    }
    const currentUser = await getUser();
    setUser(currentUser);
  };

  const logout = async () => {
    await handleLogout();
    setAccessToken(null);
    setUser(null);
    sessionStorage.removeItem('currentSession');
  };

  return (
    <AuthContext.Provider value={{ user, handleLogin: login, handleLogout: logout }}>
      <Router>
        <div className="min-h-screen bg-[#FFFDF5] text-[#1d1a23] font-body-md selection:bg-primary-container selection:text-white overflow-x-hidden">
          <Navbar />
          
          <main className="pt-24 pb-32 min-h-screen relative">
            {/* Polka Dot Decoration */}
            <div className="polka-dot-strip opacity-10 absolute top-16 left-0"></div>
            
            <div className="max-w-6xl mx-auto px-6 relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/session" element={
                  <SessionRoute>
                    <Session />
                  </SessionRoute>
                } />
                <Route path="/reflection" element={<Reflection />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/break" element={<Break />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
