import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Practice.css';
import Fretboard from './Fretboard.jsx';
import BassLinePlayer from './BassLinePlayer.jsx';

function Practice() {
  const sectionRef = useRef(null);
  const [highlights, setHighlights] = useState([]);
  const [fretboardState, setFretboardState] = useState({ stringCount: 4, selectedTuning: 'standard' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  });

  const contentScale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.8, 1]);

  return (
    <section
      ref={sectionRef}
      className="practice-section"
      style={{ position: 'relative' }}
    >
      <motion.div
        className="practice-container"
        style={{ scale: contentScale, opacity: contentOpacity }}
      >
        <h2 className="practice-title">Practice</h2>

        <div className="practice-content">
          <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.2rem' }}>
            Interactive Bass Fretboard
          </p>
          <Fretboard
            highlights={highlights}
            onStateChange={setFretboardState}
          />
          <BassLinePlayer
            stringCount={fretboardState.stringCount}
            selectedTuning={fretboardState.selectedTuning}
            onHighlightChange={setHighlights}
          />
        </div>
      </motion.div>
    </section>
  );
}

export default Practice;
