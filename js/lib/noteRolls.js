function NoteRoll(url) {
  var roll = this;

  this.req = new XMLHttpRequest();
  this.req.open("GET", url);
  this.req.addEventListener("load", function (e) {
    roll.notes = (JSON.parse(this.responseText))["track"];
  });

  this.req.send();
}

NoteRoll.prototype.isLoaded = function () {
  return (this.req.readyState === 4);
};

var rolls = {
  bach_minuet_g_major: new NoteRoll("assets/json/bach_minuet_g_major.json"),
  bach_invention4_d_minor: new NoteRoll("assets/json/bach_invention4_d_minor.json"),
  bach_goldberg_aria: new NoteRoll("assets/json/bach_goldberg_aria.json")
};

noteRolls = {
  roll: rolls["bach_minuet_g_major"],
  setSong: function(songName) {
    this.roll = rolls[songName];
  }
};

module.exports = noteRolls;
