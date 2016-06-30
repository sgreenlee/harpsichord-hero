// var synth = require("./lib/synth/synth.js");

var maps = require("./lib/keys");
var KEY_MAPS = maps.KEY_MAPS;
var KEY_NOTE_MAP = maps.KEY_NOTE_MAP;

window.Game = require("./lib/game");
window.Sounds = require("./lib/sounds");
window.StarMeter = require("./lib/starMeter");
window.NoteRolls = require("./lib/noteRolls");
window.Modals = require("./lib/modals");

function onWin () {
  Game.stop();
  Sounds.applause.play();
  Modals.win.open();
}

function onLose () {
  Game.stop();
  Sounds.music.stop();
  Sounds.boo.setLoop(false);
  Modals.lose.open();
}

function onRestart (songName) {
  Modals.close();
  Sounds.setSong(songName);
  Sounds.setMusicEndCallback(onWin);
  NoteRolls.setSong(songName);

  Sounds.boo.play();

  Sounds.boo.setLoop(true);
  Sounds.boo.setVolume(0);
  StarMeter.reset();
  Game.load();
}

var imageLoaded = false;
var backgroundImage = new Image();
backgroundImage.onload = function () {
  document.body.style.backgroundImage = "/img/bg.png";
  imageLoaded = true;
};
backgroundImage.src = "/img/bg.png";


function resourcesLoaded() {
  return imageLoaded && Sounds.allLoaded();
}

StarMeter.setLoseCallback(onLose);
Modals.setRestartCallback(onRestart);

document.addEventListener("DOMContentLoaded", function () {
  (function waitForResources() {
    if( resourcesLoaded()) {
      var loadingScreen = document.getElementById("loading-screen");
      document.body.removeChild(loadingScreen);
      Modals.load.open();
    }
    else {
      setTimeout(function () {
        waitForResources();
      }, 20);
    }
  })();
});
