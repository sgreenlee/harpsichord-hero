var KEY_MAPS = require("./keys").KEY_MAPS;
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
  var timeDelta = arguments[1];
  note.y = note.y - timeDelta * NOTE_SPEED;
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
  var now = (new Date()).getTime();
  oldTime = oldTime || now;
  var timeDelta = (now - oldTime) / 660;
  _notes.forEach(animateNote, timeDelta);

  oldTime = now;
  requestAnimationFrame(animate);
}

function stopAnimation () {
  STOP_ANIMATION = true;
}

function startAnimation () {
  STOP_ANIMATION = false;
  addNotes();
  animate();
}

function addNotes () {
  _noteInterval = setInterval(function () {
    var note = Note.random();
    _notes.add(note);
    $noteContainer.append(note.element);
  }, 930);
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

function start() {
  clearNotes();
  startAnimation();
}

function stop() {
  stopAnimation();
  clearInterval(_noteInterval);
}

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
  start: start,
  stop: stop
};
