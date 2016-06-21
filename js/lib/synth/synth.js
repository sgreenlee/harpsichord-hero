var FREQUENCIES = require("./frequencies");
var createNote = require("./note");

var synth = {};

Object.keys(FREQUENCIES).forEach( function (noteName) {
  synth[noteName] = createNote(FREQUENCIES[noteName]);
});

module.exports = synth;
