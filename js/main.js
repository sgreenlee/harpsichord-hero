// var synth = require("./lib/synth/synth.js");

var maps = require("./lib/keys");
var KEY_MAPS = maps.KEY_MAPS;
var KEY_NOTE_MAP = maps.KEY_NOTE_MAP;

window.Game = require("./lib/notes");
window.StarMeter = require("./lib/starMeter");
window.Sounds = require("./lib/sounds");
window.Modals = require("./lib/modals");
// require("./lib/midi.js");

function onWin () {
  Game.stop();
  Sounds.applause.play();
  Modals.win.open();
}

function onLose () {
  Game.stop();
  Sounds.music.pause();
  Sounds.music.currentTime = 0;
  Sounds.boo.play();
  Modals.lose.open();
}

function onRestart () {
  Modals.close();
  StarMeter.reset();
  Game.load();
}

Sounds.setMusicEndCallback(onWin);
StarMeter.setLoseCallback(onLose);
Modals.setRestartCallback(onRestart);

document.addEventListener("DOMContentLoaded", function () {
  Modals.load.open();
});


// var KEY_PRESSED = {};

// document.addEventListener("keydown", function(e) {
//   if (KEY_PRESSED[e.keyCode]) return;
//   KEY_PRESSED[e.keyCode] = true;
//   var noteName = KEY_NOTE_MAP[e.keyCode];
//   if (noteName) synth[noteName].play();
// });
// document.addEventListener("keyup", function(e) {
//   KEY_PRESSED[e.keyCode] = false;
//   var noteName = KEY_NOTE_MAP[e.keyCode];
// });
//
// window.playChord = function () {
//   synth["G4"].play();
//   synth["B4"].play();
//   synth["D5"].play();
//   synth["G5"].play();
//   synth["B5"].play();
//   synth["D6"].play();
// };
