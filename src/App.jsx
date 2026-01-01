import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './App.css';
import AboutMe from './components/AboutMe/AboutMe.jsx';
import Practice from './components/Practice/Practice.jsx';
import Rhythm from './components/Rhythm';
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
  // Keep nav hidden during most of the hero; fade in as we reach About Me
  // scrollYProgress ~ 1 means the hero is fully out of view, About Me is fully in view
  const navOpacity = useTransform(scrollYProgress, [0.7, 1], [0, 1]);

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
        id="top"
      >
        <motion.nav
          className="main-nav"
          style={{ opacity: navOpacity }}
        >
          <a href="#top" className="home-link" aria-label="Home">
            <svg
              className="home-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M4 11.5L12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5a1 1 0 0 1-1-1v-4h-3v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a href="#about">Über mich</a>
          <a href="#rhythm">Rhythmus</a>
          <a href="#practice">Übungsbrett</a>
        </motion.nav>
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
      <Rhythm />
      <Practice />
    </div>
  );
}

export default App;
