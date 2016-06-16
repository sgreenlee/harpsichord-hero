var KEYS = require("./lib/keys");

document.addEventListener("keydown", function(e) {
  console.log(e.keyCode);
  var keyName = KEYS[e.keyCode];
  $("." + keyName).addClass("pressed");
});

document.addEventListener("keyup", function(e) {
  var keyName = KEYS[e.keyCode];
  $("." + keyName).removeClass("pressed");
});
