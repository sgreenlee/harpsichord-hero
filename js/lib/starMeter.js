var $starMeter = $('#star-meter');
var $starMeterHP = $('#star-meter-hp');

var _hp = 60;

var starMeter = {
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
    return this.isLost();
  },

  isLost: function () {
    return _hp < 20;
  }
};

function updateMeter () {
  $starMeterHP.css("height", _hp + "%");
}

module.exports = starMeter;
