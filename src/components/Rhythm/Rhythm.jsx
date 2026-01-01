import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Rhythm.css';

const NOTE_DEFINITIONS = [
  { id: 'whole', label: 'Ganze Note', short: '1', beats: 4 },
  { id: 'half', label: 'Halbe Note', short: '1/2', beats: 2 },
  { id: 'quarter', label: 'Viertelnote', short: '1/4', beats: 1 },
  { id: 'eighth', label: 'Achtelnote', short: '1/8', beats: 0.5 },
  // 16th notes could be added later with beats: 0.25
];

function generatePattern(tempoBpm, bars = 1, allowedNotes = NOTE_DEFINITIONS) {
  const beatsPerBar = 4;
  let remainingBeats = beatsPerBar * bars;
  const pattern = [];

  while (remainingBeats > 0) {
    const candidates = allowedNotes.filter((n) => n.beats <= remainingBeats);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    pattern.push(chosen);
    remainingBeats -= chosen.beats;
  }

  const beatMs = 60000 / tempoBpm;
  let currentTime = 0;
  let currentBeat = 0;
  const expectedTimes = pattern.map((note) => {
    const startBeat = currentBeat;
    const start = currentTime;
    currentTime += note.beats * beatMs;
    currentBeat += note.beats;
    const barIndex = Math.floor(startBeat / beatsPerBar);
    return { note, timeMs: start, barIndex };
  });

  const totalDurationMs = currentTime;

  return { pattern, expectedTimes, totalDurationMs, beatMs };
}

function evaluateTaps(expectedTimes, taps, toleranceMs = 120) {
  if (!expectedTimes.length) {
    return { hitPercent: 0, avgDelayMs: 0, hits: 0, total: 0, noteResults: [] };
  }

  const usedTapIndexes = new Set();
  let totalDelay = 0;
  let hitCount = 0;
  const noteResults = [];

  expectedTimes.forEach((expected) => {
    let bestIndex = -1;
    let bestDiff = Infinity;

    taps.forEach((tapTime, index) => {
      if (usedTapIndexes.has(index)) return;
      const diff = tapTime - expected.timeMs;
      const absDiff = Math.abs(diff);
      if (absDiff < bestDiff) {
        bestDiff = absDiff;
        bestIndex = index;
      }
    });

    if (bestIndex !== -1 && bestDiff <= toleranceMs) {
      usedTapIndexes.add(bestIndex);
      hitCount += 1;
      const delay = taps[bestIndex] - expected.timeMs;
      totalDelay += delay;
      noteResults.push({
        hit: true,
        delayMs: Math.round(delay),
      });
    } else {
      let missDelay = null;
      if (bestIndex !== -1) {
        missDelay = Math.round(taps[bestIndex] - expected.timeMs);
      }
      noteResults.push({
        hit: false,
        delayMs: missDelay,
      });
    }
  });

  const hitPercent = Math.round((hitCount / expectedTimes.length) * 100);
  const avgDelayMs = hitCount ? Math.round(totalDelay / hitCount) : 0;

  return { hitPercent, avgDelayMs, hits: hitCount, total: expectedTimes.length, noteResults };
}

function Rhythm() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  });

  const contentScale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.8, 1]);

  const [mode, setMode] = useState('easy'); // 'easy' | 'advanced'
  const [tempo, setTempo] = useState(80);
  const [bars, setBars] = useState(1);
  const [easyNoteId, setEasyNoteId] = useState('quarter');
  const [patternData, setPatternData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [taps, setTaps] = useState([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState(0); // 0..1 nur für Übungsphase
  const [results, setResults] = useState(null);
  const [patternOffsetMs, setPatternOffsetMs] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const audioContextRef = useRef(null);
  const metronomeTimerRef = useRef(null);
  const beatIndexRef = useRef(0);

  useEffect(() => {
    if (!isPlaying || !startTime) return;

    let animationFrame;

    const updateElapsed = () => {
      setElapsedMs(performance.now() - startTime);
      animationFrame = requestAnimationFrame(updateElapsed);
    };

    animationFrame = requestAnimationFrame(updateElapsed);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, startTime]);

  useEffect(() => {
    if (!isPlaying || !patternData || !startTime) return;

    const targetTime = startTime + patternOffsetMs + patternData.totalDurationMs;
    const remaining = Math.max(targetTime - performance.now(), 0);

    const timeout = setTimeout(() => {
      setIsPlaying(false);
      const evalResults = evaluateTaps(patternData.expectedTimes, taps);
      setResults(evalResults);

      if (metronomeTimerRef.current) {
        clearInterval(metronomeTimerRef.current);
        metronomeTimerRef.current = null;
      }
    }, remaining);

    return () => clearTimeout(timeout);
  }, [isPlaying, patternData, startTime, taps, patternOffsetMs]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        handleTap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, startTime, patternData, taps]);

  const playClick = (accent = false) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      // Akzent auf der 1: höherer, etwas lauterer Klick
      osc.frequency.value = accent ? 1400 : 900;
      gain.gain.setValueAtTime(accent ? 0.4 : 0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // ignore audio errors
    }
  };

  const startNewPattern = () => {
    let data;

    if (mode === 'advanced') {
      data = generatePattern(tempo, bars);
    } else {
      const fixedBars = 3;
      const selectedNote =
        NOTE_DEFINITIONS.find((n) => n.id === easyNoteId) || NOTE_DEFINITIONS[2];
      data = generatePattern(tempo, fixedBars, [selectedNote]);
    }
    setPatternData(data);
    setTaps([]);
    setResults(null);
    setElapsedMs(0);
    setExerciseProgress(0);
    // Ein Takt (4 Viertel) Einzählen vor dem eigentlichen Muster
    setPatternOffsetMs(data.beatMs * 4);
    setStartTime(performance.now());
    setIsPlaying(true);

    if (metronomeTimerRef.current) {
      clearInterval(metronomeTimerRef.current);
      metronomeTimerRef.current = null;
    }

    // Metronom: exakt 4 Klicks Einzähler + Beats für das eigentliche Muster
    const countInBeats = 4;
    const exerciseBeats = data.totalDurationMs / data.beatMs; // sollte eine ganze Zahl sein
    const totalBeats = countInBeats + exerciseBeats;

    beatIndexRef.current = 1;
    // Erster Klick: betonte 1 des Einzähl-Takts
    playClick(true);

    metronomeTimerRef.current = setInterval(() => {
      beatIndexRef.current += 1;
      if (beatIndexRef.current > totalBeats) {
        clearInterval(metronomeTimerRef.current);
        metronomeTimerRef.current = null;
        return;
      }
      // Fortschritt nur über die eigentlichen Übungs-Beats (ohne Einzähler)
      const exerciseBeatIndex = Math.min(
        Math.max(beatIndexRef.current - countInBeats, 0),
        exerciseBeats
      );
      if (exerciseBeats > 0) {
        setExerciseProgress(exerciseBeatIndex / exerciseBeats);
      }
      const isAccent = beatIndexRef.current % 4 === 1; // immer auf der "1" betonen
      playClick(isAccent);
    }, data.beatMs);
  };

  const handleTap = () => {
    if (!isPlaying || !startTime || !patternData) return;
    const now = performance.now();
    const relativeTime = now - startTime - patternOffsetMs;
    // während des Einzähl-Takts noch nicht werten
    if (relativeTime < 0) {
      return;
    }
    if (relativeTime > patternData.totalDurationMs + patternData.beatMs * 1.2) {
      return;
    }
    setTaps((prev) => [...prev, relativeTime]);
  };

  const effectiveElapsed = Math.max(0, elapsedMs - patternOffsetMs);
  const currentBeatPosition = exerciseProgress;

  const showExerciseLabel =
    isPlaying &&
    patternData &&
    effectiveElapsed >= 0 &&
    effectiveElapsed < patternData.totalDurationMs;

  return (
    <section
      id="rhythm"
      ref={sectionRef}
      className="rhythm-section"
    >
      <motion.div
        className="rhythm-container"
        style={{ scale: contentScale, opacity: contentOpacity }}
      >
        <h2 className="rhythm-title">Rhythmus</h2>

        <div className="rhythm-content">
          <div className="rhythm-panel">
            <button
              type="button"
              className="rhythm-help-toggle"
              onClick={() => setShowHelp((prev) => !prev)}
            >
              i
            </button>

            {showHelp && (
              <motion.div
                className="rhythm-help-overlay"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="rhythm-help-title">Wie funktioniert diese Übung?</h3>
                <ul className="rhythm-help-list">
                  <li>
                    <strong>1. Einzählen:</strong> Nach "Neues Muster starten" hörst du
                    zuerst einen ganzen Takt (4 Klicks). Höre nur zu und zähle
                    laut "1‑2‑3‑4" mit.
                  </li>
                  <li>
                    <strong>2. Start des Musters:</strong> Auf der nächsten betonten
                    "1" (dem 5. Klick) beginnt das Muster. Ab hier tippst du mit
                    Leertaste oder Button.
                  </li>
                  <li>
                    <strong>3. Notenwerte:</strong> Jede Kachel zeigt den Notenwert
                    (z.B. 1/4 = Viertelnote). Lange Noten halten über mehrere
                    Klicks, du tippst aber nur am Anfang der Note.
                  </li>
                  <li>
                    <strong>4. Auswertung:</strong> Nach dem Takt siehst du
                    Treffsicherheit, Ø‑Abweichung und bei jeder Note, ob sie
                    getroffen wurde (inkl. Abweichung in ms).
                  </li>
                </ul>
              </motion.div>
            )}

            <div className="rhythm-header-text">
              Tippe zum Klick in unterschiedlichen Notenwerten. Nutze die
              Leertaste oder den großen Button und versuche, das Muster so
              genau wie möglich zu treffen.
              <br />
              <br />
              Das Metronom klickt Viertelnoten: du kannst "1‑2‑3‑4" mitzählen.
              Jede Note im Muster beginnt auf einem dieser Klicks – lange Noten
              (z.B. Halbe) halten einfach über mehrere Klicks, du tippst aber
              nur am Anfang der Note, nicht bei jedem Klick.
            </div>

            <div className="rhythm-tabs">
              <button
                type="button"
                className={`rhythm-tab${mode === 'easy' ? ' active' : ''}`}
                onClick={() => setMode('easy')}
              >
                Üben
              </button>
              <button
                type="button"
                className={`rhythm-tab${mode === 'advanced' ? ' active' : ''}`}
                onClick={() => setMode('advanced')}
              >
                Testen
              </button>
            </div>

            {(mode === 'advanced' && (
              <div className="rhythm-controls">
                <div className="tempo-control">
                  <span className="tempo-label">Tempo</span>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    step="1"
                    value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))}
                  />
                  <span className="tempo-value">{tempo} BPM</span>
                </div>

                <div className="bars-control">
                  <span className="tempo-label">Takte</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={bars}
                    onChange={(e) => setBars(Number(e.target.value))}
                  />
                  <span className="tempo-value">{bars}</span>
                </div>

                <button
                  type="button"
                  className="rhythm-button primary"
                  onClick={startNewPattern}
                  disabled={isPlaying}
                >
                  {isPlaying ? 'Pattern läuft …' : 'Neues Muster starten'}
                </button>
              </div>
            )) || (
              <>
                <div className="rhythm-controls rhythm-controls-easy">
                  <div className="tempo-control">
                    <span className="tempo-label">Tempo</span>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      step="1"
                      value={tempo}
                      onChange={(e) => setTempo(Number(e.target.value))}
                    />
                    <span className="tempo-value">{tempo} BPM</span>
                  </div>

                  <div className="easy-settings-text">
                    Muster mit {bars} Takt{bars === 1 ? '' : 'en'} der ausgewählten Note
                  </div>

                  <div className="bars-control">
                    <span className="tempo-label">Takte</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={bars}
                      onChange={(e) => setBars(Number(e.target.value))}
                    />
                    <span className="tempo-value">{bars}</span>
                  </div>
                </div>

                <div className="note-select">
                  {NOTE_DEFINITIONS.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      className={`note-select-button${
                        easyNoteId === note.id ? ' selected' : ''
                      }`}
                      onClick={() => setEasyNoteId(note.id)}
                    >
                      <span className="note-short">{note.short}</span>
                      <span className="note-label">{note.label}</span>
                    </button>
                  ))}
                </div>

                <div className="rhythm-start-row">
                  <button
                    type="button"
                    className="rhythm-button primary"
                    onClick={startNewPattern}
                    disabled={isPlaying}
                  >
                    {isPlaying ? 'Pattern läuft …' : 'Übung starten'}
                  </button>
                  <label className="rhythm-details-toggle">
                    <input
                      type="checkbox"
                      checked={showDetails}
                      onChange={(e) => setShowDetails(e.target.checked)}
                    />
                    <span>Details</span>
                  </label>
                </div>
              </>
            )}

            <div className="rhythm-pattern">
              {patternData ? (
                (() => {
                  const rows = [];

                  patternData.pattern.forEach((note, index) => {
                    const expected = patternData.expectedTimes[index];
                    const barIndex = expected?.barIndex ?? 0;
                    if (!rows[barIndex]) rows[barIndex] = [];
                    rows[barIndex].push({ note, index });
                  });

                  return rows.map((row, barIndex) => (
                    <div className="rhythm-pattern-row" key={barIndex}>
                      {row.map(({ note, index }) => {
                        const noteResult = results?.noteResults?.[index];
                        const statusClass = noteResult
                          ? noteResult.hit
                            ? ' hit'
                            : ' miss'
                          : '';
                        return (
                          <div
                            key={index}
                            className={`rhythm-note-chip${statusClass}`}
                          >
                            <span className="note-short">{note.short}</span>
                            <span className="note-label">{note.label}</span>
                            {noteResult && noteResult.hit && noteResult.delayMs !== null && (
                              <span className="note-delay">
                                {noteResult.delayMs > 0
                                  ? `+${noteResult.delayMs} ms`
                                  : `${noteResult.delayMs} ms`}
                              </span>
                            )}
                            {noteResult && !noteResult.hit && (
                              <span className="note-delay miss-text">
                                {showDetails && noteResult.delayMs !== null
                                  ? `verfehlt (${noteResult.delayMs > 0 ? `+${noteResult.delayMs} ms` : `${noteResult.delayMs} ms`})`
                                  : 'verfehlt'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()
              ) : (
                <div className="rhythm-placeholder">
                  {mode === 'advanced'
                    ? 'Klicke auf „Neues Muster starten", um ein Rhythmus-Muster zu testen.'
                    : 'Klicke auf „Übung starten", um ein Rhythmus-Muster zu üben.'}
                </div>
              )}
            </div>

            <div className="rhythm-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${currentBeatPosition * 100}%` }}
                ></div>
              </div>
              {showExerciseLabel && (
                <div className="progress-label">Muster läuft – jetzt tippen!</div>
              )}
            </div>

            <button
              type="button"
              className="rhythm-button tap"
              onClick={handleTap}
              disabled={!isPlaying}
            >
              Tippen (Leertaste)
            </button>

            {results && (
              <div className="rhythm-results">
                <div className="results-main">
                  <span className="results-label">Treffsicherheit</span>
                  <span className="results-value">{results.hitPercent}%</span>
                </div>
                <div className="results-sub">
                  <span>
                    Getroffen: {results.hits}/{results.total}
                  </span>
                  <span>
                    Ø Abweichung:{' '}
                    {results.avgDelayMs > 0
                      ? `+${results.avgDelayMs} ms`
                      : `${results.avgDelayMs} ms`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default Rhythm;
