var _musicEndCallback = function () {};

var Sounds = {
  music: new Audio("/assets/mp3/bach-minuet-g-minor.mp3"),
  boo: new Audio("/assets/mp3/boo.mp3"),
  applause: new Audio("/assets/mp3/applause.mp3"),
  setMusicEndCallback: function (callback) {
    _musicEndCallback = callback;
  }
};

Sounds.music.addEventListener("ended", function () {
  _musicEndCallback();
});

module.exports = Sounds;
