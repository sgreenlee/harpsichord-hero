var maps = require("./keys");
var KEY_MAPS = maps.KEY_MAPS;
var KEY_NOTE_MAP = maps.KEY_NOTE_MAP;
var Note = require("./note.js");
var LinkedList = require("./linkedList");

var DISTANCE_TO_TRAVEL = 13000;
var SECONDS_TO_TRAVEL = 11;
var STOP_ANIMATION = true;
// speed that notes move in pixels per second
var NOTE_SPEED = DISTANCE_TO_TRAVEL / SECONDS_TO_TRAVEL;

var $noteContainer = $('#note-container');
var _notes = new LinkedList();
var _trash = new LinkedList();


var _noteInterval;
var oldTime;
var startingTime;

var NoteStore;

function loadNotes(songName) {
  var noteRoll = NoteRolls.roll;
  if (noteRoll.isLoaded()) {
    NoteStore = new LinkedList();
    noteRoll.notes.forEach( function (note) {
      NoteStore.add(new Note(note.note, note.time));
    });
    start();
  }
  else {
    setTimeout(loadNotes.bind(this, songName), 20);
  }
}

function deleteNote(node) {
  node.delete();
  node.item.element.fadeOut(400, function() {
    $(this).remove();
  });
}

function clearNotes() {
  _notes.forEach(deleteNote);
}

function animateNote (node) {
  var note = node.item;
  var elapsedTime = arguments[1];
  var remaining = Math.floor(note.time - elapsedTime);
  note.y = remaining + 400;
  if (note.y < 300) {
    note.element.addClass("missed");
    deleteNote(node);
    StarMeter.malus(6);
    // play a random mistake
    Sounds.mistakes[Math.floor(Math.random() * Sounds.mistakes.length)].play();
  } else {
    note.element.css("bottom", note.y);
  }
}

function animate () {
  if (STOP_ANIMATION) return;
  var now = performance.now();
  var elapsedTime = now - startingTime;
  _notes.forEach(animateNote, elapsedTime);
  requestAnimationFrame(animate);
}

function stopAnimation () {
  STOP_ANIMATION = true;
}

function startAnimation () {
  STOP_ANIMATION = false;
  startingTime = performance.now();
  addNotes();
  animate();
}

function addNotes () {
  _noteInterval = setInterval(function () {
    var elapsedTime = performance.now() - startingTime;
    NoteStore.while( function (node) { return node.item.time - elapsedTime < 7500; },
      function (node) {
        _notes.add(node.item);
        node.item.generateDOMElement();
        $noteContainer.append(node.item.element);
        node.delete();
    });
  }, 100);
}

function playNote (noteName) {
  _notes.while(function (node) {return node.item.y < 500; }, scoreNode, noteName);
}

function scoreNode(node, noteName) {
  var note = node.item;
  if (note.name === noteName) {
    StarMeter.bonus(note.y - 400);
    note.element.addClass("scored");
    deleteNote(node);
  }
}

function load() {
  loadNotes("bach_minuet_g_major");
}

function start() {
  clearNotes();
  Sounds.music.play();
  startAnimation();
}

function stop() {
  console.log("stopping");
  stopAnimation();
  clearInterval(_noteInterval);
}

window.stop = stop;

document.addEventListener("keydown", function(e) {
  var noteName = KEY_MAPS[e.keyCode];
  $("." + noteName).addClass("pressed");
  playNote(noteName);
});

document.addEventListener("keyup", function(e) {
  var keyName = KEY_MAPS[e.keyCode];
  $("." + keyName).removeClass("pressed");
});

module.exports = {
  load: load,
  stop: stop
};
