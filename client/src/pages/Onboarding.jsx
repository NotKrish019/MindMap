import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Onboarding() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto flex flex-col min-h-[calc(100vh-80px)] pb-12"
    >
      {/* Welcome Header Section */}
      <header className="text-center mb-8 pt-8">
        <h1 className="font-h1 text-4xl text-on-background mb-2">
          Welcome to your MindMap
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant">
          Your playful companion for a clearer, calmer mind.
        </p>
      </header>

      {/* Illustration Canvas */}
      <div className="relative w-full aspect-square flex items-center justify-center mb-8">
        {/* Geometric Confetti Decorations */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-secondary-container border-[2.5px] border-zinc-900 rounded-full rotate-12 neobrutal-shadow animate-bounce"></div>
        <div className="absolute bottom-10 right-2 w-16 h-8 bg-tertiary-fixed-dim border-[2.5px] border-zinc-900 rounded-xl -rotate-6 neobrutal-shadow"></div>
        <div className="absolute top-1/2 -right-4 w-10 h-10 bg-primary-fixed border-[2.5px] border-zinc-900 rotate-45 neobrutal-shadow"></div>
        
        {/* Main Hero Image: Playful Brain */}
        <div className="relative z-10 bg-white border-[2.5px] border-zinc-900 rounded-3xl p-6 neobrutal-shadow-lg overflow-hidden">
          <img 
            alt="Playful Brain Illustration" 
            className="w-full h-auto rounded-xl" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtSxTZEvxgcT3r90BeHScumKKlDbP1tN-XCxVOBrZEr6Un0mON_jRzMLVbINY5MhwXKcMF55hJX5xcFc1Wdr0Gm7dt0mvPB9zMGXts2KzM0ud_yNPszgakD2ouJvU_LASFDn39mlYyidi0sxZO7I1YVorKCZc3UUnjIqKOBVZSyqd-IcSsiBMrXmR1UUhUhLSfjLduTtwgRYUlLBipeB9xYVlDTo4XTNkiKTCLHXDDHgm123hQLs_YWXQX2Tj9QUWCLfUpQ6BTQ24" 
          />
        </div>
      </div>

      {/* Steps List Section */}
      <section className="space-y-4 mb-12">
        {/* Step 1 */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-[2.5px] border-zinc-900 p-6 rounded-2xl neobrutal-shadow flex items-start gap-4"
        >
          <div className="bg-secondary-container text-on-secondary-container w-10 h-10 flex-shrink-0 border-2 border-zinc-900 rounded-full flex items-center justify-center font-h3 text-xl">
            1
          </div>
          <div>
            <h3 className="font-h3 text-xl mb-1 text-on-background">Check-in daily.</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">Capture your moods and thoughts with interactive stickers.</p>
          </div>
        </motion.div>

        {/* Step 2 */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white border-[2.5px] border-zinc-900 p-6 rounded-2xl neobrutal-shadow flex items-start gap-4"
        >
          <div className="bg-primary-container text-white w-10 h-10 flex-shrink-0 border-2 border-zinc-900 rounded-full flex items-center justify-center font-h3 text-xl">
            2
          </div>
          <div>
            <h3 className="font-h3 text-xl mb-1 text-on-background">Focus deeply.</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">Guided sessions designed to help you reach clarity and flow.</p>
          </div>
        </motion.div>

        {/* Step 3 */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white border-[2.5px] border-zinc-900 p-6 rounded-2xl neobrutal-shadow flex items-start gap-4"
        >
          <div className="bg-tertiary-container text-white w-10 h-10 flex-shrink-0 border-2 border-zinc-900 rounded-full flex items-center justify-center font-h3 text-xl">
            3
          </div>
          <div>
            <h3 className="font-h3 text-xl mb-1 text-on-background">Grow together.</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">Connect with your MindBuddies for shared wellness milestones.</p>
          </div>
        </motion.div>
      </section>

      {/* CTA Action */}
      <div className="mt-auto">
        <button 
          onClick={() => navigate('/')}
          className="w-full py-5 bg-primary text-white border-[2.5px] border-zinc-900 rounded-2xl font-h3 text-xl neobrutal-shadow-lg active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-3 hover:scale-[1.02]"
        >
          Get Started
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        <p className="text-center mt-6 font-label-bold text-xs text-on-surface-variant tracking-widest uppercase">
          ALREADY HAVE AN ACCOUNT? <span className="text-primary font-bold cursor-pointer underline underline-offset-4">LOG IN</span>
        </p>
      </div>
    </motion.div>
  );
}

export default Onboarding;
