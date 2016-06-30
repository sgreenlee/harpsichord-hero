var $starMeter = $('#star-meter');
var $starMeterHP = $('#star-meter-hp');

var _hp = 80;
var _loseCallback = function () {};

function _calculateMeterColor () {
  var green = Math.floor((217 - 22) * (_hp / 100) + 22);
  var red = Math.floor(239 - green);
  return "rgb(" + red +", " + green + ", 41)";
}

function setBooVolume() {
   var vol = _hp <= 80 ? (80 - _hp) / 60 : 0;
   vol = vol >= 1 ? 1 : vol;
   Sounds.boo.setVolume(vol);
}

function updateMeter () {
  $starMeterHP.css("height", _hp + "%");
  $starMeterHP.css("background-color", _calculateMeterColor());
  setBooVolume();
}

var starMeter = {
  reset: function () {
    _hp = 80;
    updateMeter();
  },

  bonus: function (timeDelta) {
    var score = (100 - Math.abs(timeDelta)) / 10;
    _hp += score;
    if (_hp > 100) {
      _hp = 100;
    }
    updateMeter();
  },

  malus: function (score) {
    _hp -= score;
    updateMeter();
    if (this.isLost()) {
      _loseCallback();
    }
  },

  isLost: function () {
    return _hp < 20;
  },

  setLoseCallback: function (callback) {
    _loseCallback = callback;
  }
};

updateMeter();

module.exports = starMeter;
