import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './App.css';
import AboutMe from './components/AboutMe';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef(null);

  // Track scroll progress of the hero section
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Parallax transformations - hero content floats UP and fades out
  const heroContentY = useTransform(scrollYProgress, [0, 0.8], ["0%", "-150%"]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      {/* Hero Section */}
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

        {/* Scroll Indicator */}
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

      {/* About Me Section */}
      <AboutMe />
    </div>
  );
}

export default App;
