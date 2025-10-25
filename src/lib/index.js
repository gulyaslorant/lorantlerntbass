import tunings4String from './tunings-4-string.json';
import tunings5String from './tunings-5-string.json';
import tunings6String from './tunings-6-string.json';

export const tunings = {
  4: tunings4String,
  5: tunings5String,
  6: tunings6String
};

export const getTuningByStringCount = (stringCount) => {
  return tunings[stringCount] || tunings[4];
};

export const getStandardTuning = (stringCount) => {
  const tuningData = getTuningByStringCount(stringCount);
  return tuningData.standard;
};

export const getAllTuningNames = (stringCount) => {
  const tuningData = getTuningByStringCount(stringCount);
  return Object.keys(tuningData);
};

export const getTuningByName = (stringCount, tuningName) => {
  const tuningData = getTuningByStringCount(stringCount);
  return tuningData[tuningName];
};

export default tunings;
