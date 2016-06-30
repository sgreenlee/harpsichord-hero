var audioCtx = new (window.AudioContext || window.webkitAudioContext)();



var _musicEndCallback = function () {};

function _musicEndHandler () {
  _musicEndCallback();
}

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

function Song(sourceUrl) {
  this._mediaElement = new Audio(sourceUrl);
  var mediaSource = this;
  this._mediaElement.onload = function () {
    mediaSource._sourceNode = audioCtx.createMediaElementSource(this._mediaElement);
    mediaSource._gainNode.connect(audioCtx.destination);
  };
}

Song.prototype = Object.create(MediaSource.prototype);

var boo = new MediaSource("https://s3.amazonaws.com/hhero-pro/boo.mp3");
var applause = new MediaSource("https://s3.amazonaws.com/hhero-pro/applause.mp3");
var mistake1 = new MediaSource("https://s3.amazonaws.com/hhero-pro/mistake1.mp3");
var mistake2 = new MediaSource("https://s3.amazonaws.com/hhero-pro/mistake2.mp3");

var songs = {
  bach_minuet_g_major: new Song("https://s3.amazonaws.com/hhero-pro/bach_minuet_g_major.mp3"),
  bach_invention4_d_minor: new Song("https://s3.amazonaws.com/hhero-pro/bach_invention4_dminor.mp3"),
  bach_goldberg_aria: new Song("https://s3.amazonaws.com/hhero-pro/bach_goldberg_aria.mp3")
};

var Sounds = {
  music: songs["bach_minuet_g_major"],
  boo: boo,
  applause: applause,
  mistakes: [mistake1, mistake2],
  setMusicEndCallback: function (callback) {
    _musicEndCallback = callback;
  },
  allLoaded: function () {
    return this.music.isLoaded() &&
           this.boo.isLoaded() &&
           this.applause.isLoaded();
  },

  setSong: function (songName) {
    this.music = songs[songName];
    this.music.addEventListener("ended", _musicEndHandler);
  }
};


module.exports = Sounds;
