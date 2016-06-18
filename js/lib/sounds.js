var _musicEndCallback = function () {};

var Sounds = {
  music: new Audio("https://s3.amazonaws.com/hhero-pro/bach-minuet-g-minor.mp3"),
  boo: new Audio("https://s3.amazonaws.com/hhero-pro/boo.mp3"),
  applause: new Audio("https://s3.amazonaws.com/hhero-pro/applause.mp3"),
  setMusicEndCallback: function (callback) {
    _musicEndCallback = callback;
  }
};

Sounds.music.addEventListener("ended", function () {
  _musicEndCallback();
});

module.exports = Sounds;
