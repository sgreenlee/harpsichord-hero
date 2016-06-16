var NOTE_NAMES = require("./keys").NOTE_NAMES;
var NUM_NOTES = NOTE_NAMES.length;

function Note (noteName) {
  this.name = noteName;
  this.element = $("<div>").addClass("note").addClass(noteName);
  this.y = 13400;
}

Note.random = function () {
  var noteName = NOTE_NAMES[Math.floor(Math.random() * NUM_NOTES)];
  return new Note(noteName);
};

module.exports = Note;
