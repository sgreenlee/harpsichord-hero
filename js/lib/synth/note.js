var pulseWaveOscillator = require("./pulseWaveOscillator");

var AudioContext = window.AudioContext || window.webkitAudioContext;
var ctx = new AudioContext();

function createNote(freq) {
  var node1 = pulseWaveOscillator(freq, ctx);
  var node2 = pulseWaveOscillator(freq * 2, ctx);
  var gain1 = ctx.createGain();
  var gain2 = ctx.createGain();

  node1.connect(gain1);
  gain1.connect(ctx.destination);

  node2.connect(gain2);
  gain2.connect(ctx.destination);

  gain1.gain.value = 0;
  gain2.gain.value = 0;
  node1.width.value = 0.3;
  node2.width.value = 0.3;
  node1.start(ctx.currentTime);
  node2.start(ctx.currentTime);

  return {
    play: function () {
      var now = ctx.currentTime;
      gain1.gain.setValueAtTime(1, now + 0.02);
      gain2.gain.setValueAtTime(1, now + 0.02);
      gain1.gain.linearRampToValueAtTime(0.2 , now + 0.2);
      gain2.gain.linearRampToValueAtTime(0.2 , now + 0.2);
      gain1.gain.linearRampToValueAtTime(0 , now + 0.3);
      gain2.gain.linearRampToValueAtTime(0 , now + 0.3);
    },

    width: function (width) {
      node1.width.value = width;
      node2.width.value = width;
    }
  };
}

module.exports = createNote;
