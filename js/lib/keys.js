var keyMaps = {
  65: "G1",
  83: "A1",
  68: "B1",
  70: "C1",
  71: "D1",
  72: "E2",
  74: "F2",
  75: "G2",
  76: "A2",
  186: "B2"
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
