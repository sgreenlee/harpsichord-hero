var pulseWaveOscillator = require("./pulseWaveOscillator");

var AudioContext = window.AudioContext || window.webkitAudioContext;
var ctx = new AudioContext();

function createNote(freq) {
  var node1 = pulseWaveOscillator(freq, ctx);
  var node2 = pulseWaveOscillator(freq * 2, ctx);
  var gain1 = ctx.createGain();
  var gain2 = ctx.createGain();
  var filter1 = ctx.createBiquadFilter();
  var filter2 = ctx.createBiquadFilter();
  var delay = ctx.createDelay();

  filter1.type = "highpass";
  filter2.type = "highpass";
  filter1.frequency.value = 350;
  filter2.frequency.value = 350;

  delay.delayTime.value = 0.05;

  node1.connect(gain1);
  gain1.connect(filter1);
  filter1.connect(ctx.destination);

  node2.connect(gain2);
  gain2.connect(filter2);
  filter2.connect(delay);
  delay.connect(ctx.destination);
  filter2.connect(ctx.destination);

  gain1.gain.value = 0;
  gain2.gain.value = 0;
  node1.width.value = 0.3;
  node2.width.value = 0.3;
  node1.start(ctx.currentTime);
  node2.start(ctx.currentTime);

  return {
    play: function () {
      var now = ctx.currentTime;
      gain1.gain.cancelScheduledValues(now);
      gain2.gain.cancelScheduledValues(now);
      gain1.gain.linearRampToValueAtTime(1, now + 0.02);
      gain2.gain.linearRampToValueAtTime(1, now + 0.02);
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
