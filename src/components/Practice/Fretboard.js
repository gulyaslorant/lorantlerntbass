import React, { useState, useEffect } from 'react';
import './Fretboard.css';
import { getAllTuningNames, getTuningByName } from '../../lib';

function Fretboard() {
  const [stringCount, setStringCount] = useState(4);
  const [selectedTuning, setSelectedTuning] = useState('standard');
  const [availableTunings, setAvailableTunings] = useState([]);
  const fretCount = 16; // Extended to 16 frets

  // Update available tunings when string count changes
  useEffect(() => {
    const tuningNames = getAllTuningNames(stringCount);
    setAvailableTunings(tuningNames);
    // Reset to standard or first available tuning
    if (tuningNames.includes('standard')) {
      setSelectedTuning('standard');
    } else if (tuningNames.length > 0) {
      setSelectedTuning(tuningNames[0]);
    }
  }, [stringCount]);

  // Get tuning data from JSON
  const tuningData = getTuningByName(stringCount, selectedTuning === 'empty' ? 'standard' : selectedTuning);
  const strings = tuningData ? tuningData.tuning : [];
  const showNotes = selectedTuning !== 'empty';

  // Generate fret markers (single dots at frets 3, 5, 7, 9, 15; double dots at 12)
  const singleDotFrets = [3, 5, 7, 9, 15];
  const doubleDotFrets = [12];

  return (
    <div className="fretboard-wrapper">
      {/* Controls */}
      <div className="fretboard-controls">
        <label htmlFor="string-selector" className="control-label">
          Bass Type:
        </label>
        <select
          id="string-selector"
          value={stringCount}
          onChange={(e) => setStringCount(Number(e.target.value))}
          className="string-selector"
        >
          <option value={4}>4-String Bass</option>
          <option value={5}>5-String Bass</option>
          <option value={6}>6-String Bass</option>
        </select>

        <label htmlFor="tuning-selector" className="control-label">
          Tuning:
        </label>
        <select
          id="tuning-selector"
          value={selectedTuning}
          onChange={(e) => setSelectedTuning(e.target.value)}
          className="string-selector"
        >
          <option value="empty">Empty Fretboard</option>
          {availableTunings.map((tuningName) => {
            const tuning = getTuningByName(stringCount, tuningName);
            return (
              <option key={tuningName} value={tuningName}>
                {tuning.name}
              </option>
            );
          })}
        </select>
      </div>

      {/* Fretboard */}
      <div className="fretboard-container">
        <div className="fretboard">
          {/* Fret numbers row */}
          <div className="fret-numbers-row">
            <div className="fret-numbers-spacer"></div>
            <div className="fret-numbers-container">
              {Array.from({ length: fretCount }).map((_, fretIndex) => (
                <div key={fretIndex} className="fret-number-cell">
                  {fretIndex + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Main fretboard row */}
          <div className="fretboard-main">
            {/* Nut (left edge) */}
            <div className="nut"></div>

            {/* String labels */}
            <div className="string-labels">
              {strings.slice().reverse().map((note, index) => (
                <div key={index} className="string-label">
                  {note}
                </div>
              ))}
            </div>

            {/* Frets and strings */}
            <div className="frets-container">
            {/* Continuous strings layer */}
            <div className="strings-layer">
              {strings.map((_, stringIndex) => (
                <div
                  key={stringIndex}
                  className={`string-continuous string-${stringIndex}`}
                >
                  <div className="string-line"></div>
                </div>
              ))}
            </div>

            {/* Notes layer - positioned above strings */}
            {showNotes && tuningData && (
              <div className="notes-layer">
                {tuningData.fretboard.map((stringData, stringIndex) => (
                  <div key={stringIndex} className="note-string-row">
                    {stringData.frets.slice(0, fretCount).map((note, fretIndex) => (
                      <div key={fretIndex} className="note-position">
                        <div className="note-circle">
                          <span className="note-text">{note}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Fret wires and markers */}
            {Array.from({ length: fretCount }).map((_, fretIndex) => (
              <div key={fretIndex} className="fret-section">

                {/* Single block marker */}
                {singleDotFrets.includes(fretIndex + 1) && (
                  <div className="fret-marker">
                    <div className="marker-block-single"></div>
                  </div>
                )}

                {/* Double block marker (12th fret) */}
                {doubleDotFrets.includes(fretIndex + 1) && (
                  <div className="fret-marker">
                    <div className="marker-block-double">
                      <div className="marker-block"></div>
                      <div className="marker-block"></div>
                    </div>
                  </div>
                )}

                {/* Fret wire (vertical line) */}
                <div className="fret-wire"></div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Fretboard;
