var _freqs = {
  C: 16.35,
  Cs: 17.32,
  D: 18.35,
  Ds: 19.45,
  E: 20.60,
  F: 21.83,
  Fs: 23.12,
  G: 24.50,
  Gs: 25.96,
  A: 27.50,
  As: 29.14,
  B: 30.87
};

var _octaves = [0, 1, 2, 3, 4, 5, 6, 7, 8];

var FREQUENCIES = {};

_octaves.forEach( function (octave) {
  Object.keys(_freqs).forEach( function (note) {
    FREQUENCIES[note + octave] = _freqs[note] * Math.pow(2, octave);
  });
});

module.exports = FREQUENCIES;
