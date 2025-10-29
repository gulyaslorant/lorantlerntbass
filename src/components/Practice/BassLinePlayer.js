import React, { useState, useEffect } from 'react';
import './BassLinePlayer.css';
import bassLinesData from '../../lib/basslines.json';

function BassLinePlayer({ stringCount, selectedTuning, onHighlightChange }) {
  const [selectedBassLine, setSelectedBassLine] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120); // BPM

  // Filter bass lines based on current tuning and string count
  const availableBassLines = bassLinesData.basslines.filter(
    (line) => line.stringCount === stringCount && line.tuning === selectedTuning
  );

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
          {availableBassLines.map((bassLine) => (
            <option key={bassLine.id} value={bassLine.id}>
              {bassLine.name} ({bassLine.difficulty})
            </option>
          ))}
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
