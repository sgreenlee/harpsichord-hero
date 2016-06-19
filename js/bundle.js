/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var synth = __webpack_require__(9);

	var maps = __webpack_require__(4);
	var KEY_MAPS = maps.KEY_MAPS;
	var KEY_NOTE_MAP = maps.KEY_NOTE_MAP;

	window.Game = __webpack_require__(2);
	window.StarMeter = __webpack_require__(7);
	window.Sounds = __webpack_require__(8);
	window.Modals = __webpack_require__(3);
	// require("./lib/midi.js");

	function onWin () {
	  Game.stop();
	  Sounds.applause.play();
	  Modals.win.open();
	}

	function onLose () {
	  Game.stop();
	  Sounds.music.pause();
	  Sounds.boo.play();
	  Modals.lose.open();
	}

	function onRestart () {
	  Modals.close();
	  StarMeter.reset();
	  Game.start();
	  setTimeout(function() {
	    Sounds.music.currentTime = 0;
	    Sounds.music.play();
	  }, 200);
	}

	Sounds.setMusicEndCallback(onWin);
	StarMeter.setLoseCallback(onLose);
	Modals.setRestartCallback(onRestart);

	document.addEventListener("DOMContentLoaded", function () {
	  Modals.load.open();
	});


	document.addEventListener("keydown", function(e) {
	  var noteName = KEY_NOTE_MAP[e.keyCode];
	  synth[noteName].play();
	  playNote(noteName);
	});


/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var maps = __webpack_require__(4);
	var KEY_MAPS = maps.KEY_MAPS;
	var KEY_NOTE_MAP = maps.KEY_NOTE_MAP;
	var Note = __webpack_require__(5);
	var LinkedList = __webpack_require__(6);

	var DISTANCE_TO_TRAVEL = 13000;
	var SECONDS_TO_TRAVEL = 11;
	var STOP_ANIMATION = true;
	// speed that notes move in pixels per second
	var NOTE_SPEED = DISTANCE_TO_TRAVEL / SECONDS_TO_TRAVEL;

	var $noteContainer = $('#note-container');
	var _notes = new LinkedList();
	var _trash = new LinkedList();


	var _noteInterval;
	var oldTime;


	function deleteNote(node) {
	  node.delete();
	  node.item.element.fadeOut(400, function() {
	    $(this).remove();
	  });
	}

	function clearNotes() {
	  _notes.forEach(deleteNote);
	}

	function animateNote (node) {
	  var note = node.item;
	  var timeDelta = arguments[1];
	  note.y = note.y - timeDelta * NOTE_SPEED;
	  if (note.y < 300) {
	    note.element.addClass("missed");
	    deleteNote(node);
	    StarMeter.malus(6);
	  } else {
	    note.element.css("bottom", note.y);
	  }
	}

	function animate () {
	  if (STOP_ANIMATION) return;
	  var now = (new Date()).getTime();
	  oldTime = oldTime || now;
	  var timeDelta = (now - oldTime) / 660;
	  _notes.forEach(animateNote, timeDelta);

	  oldTime = now;
	  requestAnimationFrame(animate);
	}

	function stopAnimation () {
	  STOP_ANIMATION = true;
	}

	function startAnimation () {
	  STOP_ANIMATION = false;
	  addNotes();
	  animate();
	}

	function addNotes () {
	  _noteInterval = setInterval(function () {
	    var note = Note.random();
	    _notes.add(note);
	    $noteContainer.append(note.element);
	  }, 930);
	}

	function playNote (noteName) {
	  _notes.while(function (node) {return node.item.y < 500; }, scoreNode, noteName);
	}

	function scoreNode(node, noteName) {
	  var note = node.item;
	  if (note.name === noteName) {
	    StarMeter.bonus(note.y - 400);
	    note.element.addClass("scored");
	    deleteNote(node);
	  }
	}

	function start() {
	  clearNotes();
	  startAnimation();
	}

	function stop() {
	  stopAnimation();
	  clearInterval(_noteInterval);
	}

	document.addEventListener("keydown", function(e) {
	  var noteName = KEY_MAPS[e.keyCode];
	  $("." + noteName).addClass("pressed");
	  playNote(noteName);
	});

	document.addEventListener("keyup", function(e) {
	  var keyName = KEY_MAPS[e.keyCode];
	  $("." + keyName).removeClass("pressed");
	});

	module.exports = {
	  start: start,
	  stop: stop
	};


/***/ },
/* 3 */
/***/ function(module, exports) {

	var $modalOverlay = $("#modal-overlay");
	var $loseModal = $(".modal.lose");
	var $winModal = $(".modal.win");
	var $loadModal = $(".modal.load");
	var $body = $("body");

	var _restartCallback = function () {};

	var newGameButtonList = document.querySelectorAll(".new-game");

	function restart () {
	  _restartCallback();
	}

	for (var i = 0; i < newGameButtonList.length; i++) {
	  newGameButtonList[i].addEventListener("click", restart);
	}

	$modalOverlay.detach();
	$modalOverlay.css("display", "block");

	$loseModal.detach();
	$loseModal.css("top", "50%");

	$winModal.detach();
	$winModal.css("top", "50%");

	$loadModal.detach();
	$loadModal.css("top", "50%");

	var currentModal = null;

	function closeModals () {
	  modalGroup.removeClass("active");
	}

	function openLoseModal () {
	  loseModalGroup.addClass("active");
	}

	var loseModal = {
	  open: function () {
	    $body.append($modalOverlay);
	    $body.append($loseModal);
	    currentModal = this;
	  },
	  close: function () {
	    $modalOverlay.detach();
	    $loseModal.detach();
	  }
	};

	var winModal = {
	  open: function () {
	    $body.append($modalOverlay);
	    $body.append($winModal);
	    currentModal = this;
	  },
	  close: function () {
	    $modalOverlay.detach();
	    $winModal.detach();
	  }
	};

	var loadModal = {
	  open: function () {
	    $body.append($modalOverlay);
	    $body.append($loadModal);
	    currentModal = this;
	  },
	  close: function () {
	    $modalOverlay.detach();
	    $loadModal.detach();
	  }
	};

	module.exports = {
	  setRestartCallback: function (callback) {
	    _restartCallback = callback;
	  },

	  lose: loseModal,
	  win: winModal,
	  load: loadModal,
	  close: function () {
	    currentModal.close();
	  }
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	var keyMaps = {
	  65: "g1",
	  83: "a1",
	  68: "b1",
	  70: "c1",
	  71: "d1",
	  72: "e2",
	  74: "f2",
	  75: "g2",
	  76: "a2",
	  186: "b2"
	};

	var keyNoteMapping = {
	  65: "G4",
	  83: "A4",
	  68: "B4",
	  70: "C5",
	  71: "D5",
	  72: "E5",
	  74: "F5",
	  75: "G5",
	  76: "A5",
	  186: "B5"
	};

	var noteNames = ["g1", "a1", "b1", "c1", "d1", "e2", "f2", "g2", "a2", "b2"];

	module.exports = { KEY_MAPS: keyMaps, NOTE_NAMES: noteNames, KEY_NOTE_MAP: keyNoteMapping };


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var NOTE_NAMES = __webpack_require__(4).NOTE_NAMES;
	var NUM_NOTES = NOTE_NAMES.length;

	function Note (noteName) {
	  this.name = noteName;
	  this.element = $("<div>").addClass("note").addClass(noteName);
	  this.y = 13400;
	}

	Note.random = function () {
	  var noteName = NOTE_NAMES[Math.floor(Math.random() * NUM_NOTES)];
	  return new Note(noteName);
	};

	module.exports = Note;


/***/ },
/* 6 */
/***/ function(module, exports) {

	function Node (item, prev, next) {
	  this.item = item;
	  this.prev = prev || null;
	  this.next = next || null;
	}

	Node.prototype.delete = function () {
	  this.prev.next = this.next;
	  this.next.prev = this.prev;
	};

	function LinkedList () {
	  this._head = new Node(null);
	  this._tail = new Node(null);
	  this._tail.prev = this._head;
	  this._head.next = this._tail;
	}

	LinkedList.prototype.add = function (item) {
	  var node = new Node(item);
	  node.prev = this._tail.prev;
	  node.next = this._tail;
	  this._tail.prev.next = node;
	  this._tail.prev = node;
	};

	LinkedList.prototype.forEach = function(callback) {
	  var argsArray = [].slice.call(arguments, 1);
	  var currentNode = this._head.next;
	  while (currentNode.next !== null) {
	    callback.apply(null, [currentNode].concat(argsArray));
	    currentNode = currentNode.next;
	  }
	};

	LinkedList.prototype.while = function (truthyFunc, callback) {
	  var argsArray = [].slice.call(arguments, 2);
	  var currentNode = this._head.next;
	  while (currentNode.next !== null && truthyFunc(currentNode)) {
	    callback.apply(null, [currentNode].concat(argsArray));
	    currentNode = currentNode.next;
	  }
	};

	module.exports = LinkedList;


/***/ },
/* 7 */
/***/ function(module, exports) {

	var $starMeter = $('#star-meter');
	var $starMeterHP = $('#star-meter-hp');

	var _hp = 60;
	var _loseCallback = function () {};

	function _calculateMeterColor () {
	  var green = Math.floor((217 - 22) * (_hp / 100) + 22);
	  var red = Math.floor(239 - green);
	  return "rgb(" + red +", " + green + ", 41)";
	}

	function updateMeter () {
	  $starMeterHP.css("height", _hp + "%");
	  $starMeterHP.css("background-color", _calculateMeterColor());
	}

	var starMeter = {
	  reset: function () {
	    _hp = 60;
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


/***/ },
/* 8 */
/***/ function(module, exports) {

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


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var FREQUENCIES = __webpack_require__(10);
	var createNote = __webpack_require__(11);

	var synth = {};

	Object.keys(FREQUENCIES).forEach( function (noteName) {
	  synth[noteName] = createNote(FREQUENCIES[noteName]);
	});

	module.exports = synth;


/***/ },
/* 10 */
/***/ function(module, exports) {

	var _freqs = {
	  C: 16.35,
	  Cs: 17.32,
	  D: 18.35,
	  Ds: 19.45,
	  E: 20.60,
	  F: 21.83,
	  Fs: 23.12,
	  G: 24.50,
	  Gs: 25.96,
	  A: 27.50,
	  As: 29.14,
	  B: 30.87
	};

	var _octaves = [0, 1, 2, 3, 4, 5, 6, 7, 8];

	var FREQUENCIES = {};

	_octaves.forEach( function (octave) {
	  Object.keys(_freqs).forEach( function (note) {
	    FREQUENCIES[note + octave] = _freqs[note] * Math.pow(2, octave);
	  });
	});

	module.exports = FREQUENCIES;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var pulseWaveOscillator = __webpack_require__(12);

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


/***/ },
/* 12 */
/***/ function(module, exports) {

	var pulseCurve=new Float32Array(256);
	for(var i=0;i<128;i++) {
	  pulseCurve[i]= -1;
	  pulseCurve[i+128]=1;
	}

	var constantOneCurve=new Float32Array(2);
	constantOneCurve[0]=1;
	constantOneCurve[1]=1;

	pulseWaveOscillator = function(freq, context) {
	  //Use a normal oscillator as the basis of our new oscillator.
	  var node = context.createOscillator();
	  node.type = "sawtooth";
	  node.frequency.value = freq;

	  //Shape the output into a pulse wave.
	  var pulseShaper = context.createWaveShaper();
	  pulseShaper.curve = pulseCurve;
	  node.connect(pulseShaper);

	  //Use a GainNode as our new "width" audio parameter.
	  var widthGain = context.createGain();
	  widthGain.gain.value = 0; //Default width.
	  node.width = widthGain.gain; //Add parameter to oscillator node.
	  widthGain.connect(pulseShaper);

	  //Pass a constant value of 1 into the widthGain – so the "width" setting
	  //is duplicated to its output.
	  var constantOneShaper = context.createWaveShaper();
	  constantOneShaper.curve = constantOneCurve;
	  node.connect(constantOneShaper);
	  constantOneShaper.connect(widthGain);

	  //Override the oscillator's "connect" and "disconnect" method so that the
	  //new node's output actually comes from the pulseShaper.
	  node.connect = function() {
	    pulseShaper.connect.apply(pulseShaper, arguments);
	  };
	  node.disconnect = function() {
	    pulseShaper.disconnect.apply(pulseShaper, arguments);
	  };

	  return node;
	};

	module.exports = pulseWaveOscillator;


/***/ }
/******/ ]);