var NOTE_NAMES = require("./keys").NOTE_NAMES;
var NUM_NOTES = NOTE_NAMES.length;

function Note (noteName, time) {
  this.name = noteName;
  this.time = time;
}

Note.prototype.generateDOMElement = function() {
  this.element = $("<div>").addClass("note").addClass(this.name);
};

Note.random = function () {
  var noteName = NOTE_NAMES[Math.floor(Math.random() * NUM_NOTES)];
  return new Note(noteName);
};

module.exports = Note;
