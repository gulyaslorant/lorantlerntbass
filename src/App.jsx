import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './App.css';
import AboutMe from './components/AboutMe/AboutMe.jsx';
import Practice from './components/Practice/Practice.jsx';
import { Analytics } from "@vercel/analytics/react"

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroContentY = useTransform(scrollYProgress, [0, 0.8], ['0%', '-150%']);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      <div
        ref={heroRef}
        className={`hero ${isLoaded ? 'loaded' : ''}`}
      >
        <div className="hero-image">
          <img src="/bass/bass001.jpg" alt="Bass Guitar" />
          <div className="overlay"></div>
        </div>

        <motion.div
          className="hero-content"
          style={{ y: heroContentY, opacity: heroContentOpacity }}
        >
          <h1 className="title">LORANT</h1>
          <div className="subtitle">LERNT BASS</div>
          <div className="divider"></div>
          <p className="tagline">Eine musikalische Reise</p>
        </motion.div>

        <motion.div
          className="scroll-indicator"
          style={{ opacity: heroContentOpacity }}
        >
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <div className="arrow-down"></div>
        </motion.div>
      </div>
<Analytics/>
      <AboutMe />
      <Practice />
    </div>
  );
}

export default App;
