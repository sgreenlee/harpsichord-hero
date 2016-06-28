var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var _musicEndCallback = function () {};



function MediaSource(sourceUrl) {
  this._mediaElement = new Audio(sourceUrl);
  var mediaSource = this;
  this._mediaElement.onload = function () {
    mediaSource._sourceNode = audioCtx.createMediaElementSource(this._mediaElement);
    mediaSource._gainNode.connect(audioCtx.destination);
  };
}

MediaSource.prototype.play = function () {
  this._mediaElement.play();
};

MediaSource.prototype.stop = function () {
  this._mediaElement.pause();
  this._mediaElement.currentTime = 0;
};

MediaSource.prototype.setVolume = function (vol) {
  this._mediaElement.volume = vol;
};

MediaSource.prototype.setLoop = function (loop) {
  this._mediaElement.loop = loop;
};

MediaSource.prototype.isLoaded = function () {
  return this._mediaElement.readyState === 4;
};

MediaSource.prototype.addEventListener = function () {
  // delegate event listeners to media element
  var argsArray = [].slice.call(arguments);
  this._mediaElement.addEventListener.apply(this._mediaElement, argsArray);
};

var music = new MediaSource("https://s3.amazonaws.com/hhero-pro/bach_minuet_g_major.mp3");
var boo = new MediaSource("https://s3.amazonaws.com/hhero-pro/boo.mp3");
var applause = new MediaSource("https://s3.amazonaws.com/hhero-pro/applause.mp3");

var Sounds = {
  music: music,
  boo: boo,
  applause: applause,
  setMusicEndCallback: function (callback) {
    _musicEndCallback = callback;
  },
  allLoaded: function () {
    return this.music.isLoaded() && this.boo.isLoaded() && this.applause.isLoaded();
  }
};

Sounds.music.addEventListener("ended", function () {
  _musicEndCallback();
});

module.exports = Sounds;
