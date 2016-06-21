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

function getSongNotes() {
  $.ajax({
    type: "GET",
    url: "assets/json/bach_minuet_g_major.json",
    dataType: "json",
    success: function (data) {
      loadNotes(data.track);
      start();
    }
  });
}

function loadNotes(notes) {
  NoteStore = new LinkedList();
  notes.forEach( function (note) {
    NoteStore.add(new Note(note.note, note.time));
  });
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
  getSongNotes();
}

function start() {
  clearNotes();
  Sounds.music.play()
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
