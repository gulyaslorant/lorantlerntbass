import React, { useState, useEffect } from 'react';
import './Fretboard.css';
import { getAllTuningNames, getTuningByName } from '../../lib';

function Fretboard({ highlights = [], onStateChange }) {
  const [stringCount, setStringCount] = useState(4);
  const [selectedTuning, setSelectedTuning] = useState('standard');
  const [availableTunings, setAvailableTunings] = useState([]);
  const fretCount = 16;

  useEffect(() => {
    const tuningNames = getAllTuningNames(stringCount);
    setAvailableTunings(tuningNames);
    if (tuningNames.includes('standard')) {
      setSelectedTuning('standard');
    } else if (tuningNames.length > 0) {
      setSelectedTuning(tuningNames[0]);
    }
  }, [stringCount]);

  useEffect(() => {
    if (onStateChange) {
      onStateChange({ stringCount, selectedTuning });
    }
  }, [stringCount, selectedTuning, onStateChange]);

  const tuningData = getTuningByName(stringCount, selectedTuning === 'empty' ? 'standard' : selectedTuning);
  const strings = tuningData ? tuningData.tuning : [];
  const showNotes = selectedTuning !== 'empty';

  const singleDotFrets = [3, 5, 7, 9, 15];
  const doubleDotFrets = [12];

  const getHighlightStatus = (stringName, fretNumber) => {
    const matchingHighlights = highlights.filter(
      (h) => h.string === stringName && h.fret === fretNumber,
    );

    if (matchingHighlights.length === 0) {
      return { isHighlighted: false, isActive: false };
    }

    const isActive = matchingHighlights.some((h) => h.isActive);
    const stepNumbers = matchingHighlights.map((h) => h.stepNumber).sort((a, b) => a - b);

    return {
      isHighlighted: true,
      isActive,
      stepNumbers,
      stepNumber: stepNumbers[0],
    };
  };

  return (
    <div className="fretboard-wrapper">
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

      <div className="fretboard-container">
        <div className="fretboard">
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

          <div className="fretboard-main">
            <div className="nut"></div>

            <div className="string-labels">
              {strings.slice().reverse().map((note, index) => {
                const highlightStatus = getHighlightStatus(note, 0);
                return (
                  <div
                    key={index}
                    className={`string-label ${highlightStatus.isHighlighted ? 'highlighted' : ''} ${
                      highlightStatus.isActive ? 'active-highlight' : ''
                    }`}
                  >
                    {note}
                    {highlightStatus.isHighlighted && highlightStatus.stepNumbers && (
                      <span className="string-step-indicator">
                        {highlightStatus.stepNumbers.join(',')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="frets-container">
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

              {showNotes && tuningData && (
                <div className="notes-layer">
                  {tuningData.fretboard.map((stringData, stringIndex) => (
                    <div key={stringIndex} className="note-string-row">
                      {stringData.frets.slice(0, fretCount).map((note, fretIndex) => {
                        const highlightStatus = getHighlightStatus(stringData.openNote, fretIndex + 1);
                        return (
                          <div key={fretIndex} className="note-position">
                            <div
                              className={`note-circle ${highlightStatus.isHighlighted ? 'highlighted' : ''} ${
                                highlightStatus.isActive ? 'active-highlight' : ''
                              }`}
                            >
                              <span className="note-text">{note}</span>
                              {highlightStatus.isHighlighted && highlightStatus.stepNumbers && (
                                <span className="step-indicator">
                                  {highlightStatus.stepNumbers.join(',')}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {Array.from({ length: fretCount }).map((_, fretIndex) => (
                <div key={fretIndex} className="fret-section">
                  {singleDotFrets.includes(fretIndex + 1) && (
                    <div className="fret-marker">
                      <div className="marker-block-single"></div>
                    </div>
                  )}

                  {doubleDotFrets.includes(fretIndex + 1) && (
                    <div className="fret-marker">
                      <div className="marker-block-double">
                        <div className="marker-block"></div>
                        <div className="marker-block"></div>
                      </div>
                    </div>
                  )}

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
