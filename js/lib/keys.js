var keyMaps = {
  65: "g1",
  83: "a1",
  68: "b1",
  70: "c1",
  71: "d1",
  72: "e2",
  74: "f2",
  75: "g2",
  76: "a2",
  186: "b2"
};

var keyNoteMapping = {
  65: "G4",
  83: "A4",
  68: "B4",
  70: "C5",
  71: "D5",
  72: "E5",
  74: "F5",
  75: "G5",
  76: "A5",
  186: "B5"
};

var noteNames = ["g1", "a1", "b1", "c1", "d1", "e2", "f2", "g2", "a2", "b2"];

module.exports = { KEY_MAPS: keyMaps, NOTE_NAMES: noteNames, KEY_NOTE_MAP: keyNoteMapping };
