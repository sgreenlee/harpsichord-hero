var keyMaps = {
  65: "B1",
  83: "C1",
  68: "D1",
  70: "E1",
  71: "F1",
  72: "G1",
  74: "A1",
  75: "B2",
  76: "C2",
  186: "D2"
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

var noteNames = ["G1", "A1", "B1", "C1", "D1", "E2", "F2", "G2", "A2", "B2"];

module.exports = { KEY_MAPS: keyMaps, NOTE_NAMES: noteNames, KEY_NOTE_MAP: keyNoteMapping };
