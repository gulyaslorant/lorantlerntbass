import React, { useState, useEffect } from 'react';
import './App.css';
import AboutMe from './components/AboutMe';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

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
      <div className={`hero ${isLoaded ? 'loaded' : ''}`}>
        <div className="hero-image">
          <img src="/bass/bass001.jpg" alt="Bass Guitar" />
          <div className="overlay"></div>
        </div>
        
        <div className="hero-content">
          <h1 className="title">LORANT</h1>
          <div className="subtitle">LERNT BASS</div>
          <div className="divider"></div>
          <p className="tagline">Eine musikalische Reise</p>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <div className="arrow-down"></div>
        </div>
      </div>

      {/* About Me Section */}
      <AboutMe />
    </div>
  );
}

export default App;
