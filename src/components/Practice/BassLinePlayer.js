import React, { useState, useEffect } from 'react';
import './BassLinePlayer.css';
import bassLinesData from '../../lib/basslines.json';

function BassLinePlayer({ stringCount, selectedTuning, onHighlightChange }) {
  const [selectedBassLine, setSelectedBassLine] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120); // BPM

  // Filter bass lines based on current tuning and string count
  // Show compatible bass lines from basses with fewer strings
  const availableBassLines = bassLinesData.basslines.filter((line) => {
    // Exact match - always show
    if (line.stringCount === stringCount && line.tuning === selectedTuning) {
      return true;
    }
    
    // Standard tuning compatibility:
    // 4-string (E-A-D-G) works on 5-string (B-E-A-D-G) and 6-string (B-E-A-D-G-C)
    // 5-string (B-E-A-D-G) works on 6-string (B-E-A-D-G-C)
    if (line.tuning === 'standard' && selectedTuning === 'standard') {
      // 4-string patterns work on 5 and 6-string
      if (line.stringCount === 4 && (stringCount === 5 || stringCount === 6)) {
        return true;
      }
      // 5-string patterns work on 6-string
      if (line.stringCount === 5 && stringCount === 6) {
        return true;
      }
    }
    
    return false;
  });

  // Reset when tuning or string count changes
  useEffect(() => {
    setSelectedBassLine(null);
    setCurrentStep(0);
    setIsPlaying(false);
    if (onHighlightChange) {
      onHighlightChange([]);
    }
  }, [stringCount, selectedTuning, onHighlightChange]);

  // Auto-play functionality
  useEffect(() => {
    let interval;
    if (isPlaying && selectedBassLine) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = (prev + 1) % selectedBassLine.sequence.length;
          return nextStep;
        });
      }, (60 / tempo) * 1000); // Convert BPM to milliseconds per beat
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, selectedBassLine, tempo]);

  // Update highlights when bass line or step changes
  useEffect(() => {
    if (selectedBassLine && onHighlightChange) {
      const highlights = selectedBassLine.sequence.map((note, index) => ({
        ...note,
        isActive: index === currentStep,
        stepNumber: index + 1
      }));
      onHighlightChange(highlights);
    } else if (onHighlightChange) {
      onHighlightChange([]);
    }
  }, [selectedBassLine, currentStep, onHighlightChange]);

  const handleBassLineSelect = (bassLine) => {
    setSelectedBassLine(bassLine);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleStepClick = (index) => {
    setCurrentStep(index);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  if (availableBassLines.length === 0) {
    return (
      <div className="bassline-player">
        <h3>Bass Line Practice</h3>
        <p className="no-basslines">
          No bass lines available for this tuning. Try selecting Standard tuning.
        </p>
      </div>
    );
  }

  return (
    <div className="bassline-player">
      <h3>Bass Line Practice</h3>
      
      {/* Bass Line Selector */}
      <div className="bassline-selector">
        <label htmlFor="bassline-select">Choose a Bass Line:</label>
        <select
          id="bassline-select"
          value={selectedBassLine?.id || ''}
          onChange={(e) => {
            const bassLine = availableBassLines.find((bl) => bl.id === e.target.value);
            handleBassLineSelect(bassLine);
          }}
          className="bassline-select"
        >
          <option value="">-- Select a Bass Line --</option>
          
          {/* Group by string count - current string count first, then others */}
          {[stringCount, ...([4, 5, 6].filter(c => c !== stringCount))].map((count) => {
            const linesForCount = availableBassLines.filter((bl) => bl.stringCount === count);
            if (linesForCount.length === 0) return null;
            
            return (
              <optgroup key={count} label={`${count}-String Bass${count === stringCount ? ' (Current)' : ''}`}>
                {linesForCount.map((bassLine) => (
                  <option key={bassLine.id} value={bassLine.id}>
                    {bassLine.name} ({bassLine.difficulty})
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      {selectedBassLine && (
        <>
          {/* Playback Controls */}
          <div className="playback-controls">
            <button onClick={togglePlayPause} className="control-button play-pause">
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={handleReset} className="control-button reset">
              ⏹ Reset
            </button>
            <div className="tempo-control">
              <label htmlFor="tempo-slider">Tempo: {tempo} BPM</label>
              <input
                id="tempo-slider"
                type="range"
                min="40"
                max="200"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="tempo-slider"
              />
            </div>
          </div>

          {/* Sequence Display */}
          <div className="sequence-display">
            <h4>Sequence:</h4>
            <div className="sequence-steps">
              {selectedBassLine.sequence.map((note, index) => (
                <div
                  key={index}
                  className={`sequence-step ${index === currentStep ? 'active' : ''}`}
                  onClick={() => handleStepClick(index)}
                >
                  <div className="step-number">{index + 1}</div>
                  <div className="step-info">
                    <span className="step-string">{note.string}</span>
                    <span className="step-fret">Fret {note.fret}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default BassLinePlayer;
