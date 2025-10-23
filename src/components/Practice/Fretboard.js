import React, { useState } from 'react';
import './Fretboard.css';

function Fretboard() {
  const [stringCount, setStringCount] = useState(4);
  const fretCount = 16; // Extended to 16 frets

  // Bass string notes (standard tuning)
  const fourStringNotes = ['G', 'D', 'A', 'E']; // 4-string bass (high to low)
  const fiveStringNotes = ['G', 'D', 'A', 'E', 'B']; // 5-string bass (high to low)
  
  const strings = stringCount === 4 ? fourStringNotes : fiveStringNotes;

  // Generate fret markers (single dots at frets 3, 5, 7, 9, 15; double dots at 12)
  const singleDotFrets = [3, 5, 7, 9, 15];
  const doubleDotFrets = [12];

  return (
    <div className="fretboard-wrapper">
      {/* String Selector Dropdown */}
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
        </select>
      </div>

      {/* Fretboard */}
      <div className="fretboard-container">
        <div className="fretboard">
          {/* Nut (left edge) */}
          <div className="nut"></div>

          {/* String labels */}
          <div className="string-labels">
            {strings.map((note, index) => (
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

            {/* Fret wires and markers */}
            {Array.from({ length: fretCount }).map((_, fretIndex) => (
              <div key={fretIndex} className="fret-section">
                {/* Fret number */}
                <div className="fret-number">{fretIndex + 1}</div>

                {/* Single dot marker */}
                {singleDotFrets.includes(fretIndex + 1) && (
                  <div className="fret-marker">
                    <div 
                      className="marker-dot"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    ></div>
                  </div>
                )}

                {/* Double dot marker (12th fret) */}
                {doubleDotFrets.includes(fretIndex + 1) && (
                  <div className="fret-marker-double">
                    {/* For 4-string: between G-D and A-E */}
                    {/* For 5-string: between G-D and E-B */}
                    {/* Strings are evenly spaced, so we position between them */}
                    <div 
                      className="marker-dot" 
                      style={{ 
                        position: 'absolute',
                        top: stringCount === 4 ? '25%' : '20%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    ></div>
                    <div 
                      className="marker-dot"
                      style={{ 
                        position: 'absolute',
                        top: stringCount === 4 ? '75%' : '80%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    ></div>
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
  );
}

export default Fretboard;
