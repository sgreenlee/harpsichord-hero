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

	// var synth = require("./lib/synth/synth.js");

	var maps = __webpack_require__(5);
	var KEY_MAPS = maps.KEY_MAPS;
	var KEY_NOTE_MAP = maps.KEY_NOTE_MAP;

	window.Game = __webpack_require__(6);
	window.StarMeter = __webpack_require__(9);
	window.Sounds = __webpack_require__(10);
	window.Modals = __webpack_require__(11);
	// require("./lib/midi.js");

	function onWin () {
	  Game.stop();
	  Sounds.applause.play();
	  Modals.win.open();
	}

	function onLose () {
	  // Game.stop();
	  // Sounds.music.pause();
	  // Sounds.boo.play();
	  // Modals.lose.open();
	}

	function onRestart () {
	  Modals.close();
	  StarMeter.reset();
	  Game.load();
	}

	Sounds.setMusicEndCallback(onWin);
	StarMeter.setLoseCallback(onLose);
	Modals.setRestartCallback(onRestart);

	document.addEventListener("DOMContentLoaded", function () {
	  Modals.load.open();
	});


	// var KEY_PRESSED = {};

	// document.addEventListener("keydown", function(e) {
	//   if (KEY_PRESSED[e.keyCode]) return;
	//   KEY_PRESSED[e.keyCode] = true;
	//   var noteName = KEY_NOTE_MAP[e.keyCode];
	//   if (noteName) synth[noteName].play();
	// });
	// document.addEventListener("keyup", function(e) {
	//   KEY_PRESSED[e.keyCode] = false;
	//   var noteName = KEY_NOTE_MAP[e.keyCode];
	// });
	//
	// window.playChord = function () {
	//   synth["G4"].play();
	//   synth["B4"].play();
	//   synth["D5"].play();
	//   synth["G5"].play();
	//   synth["B5"].play();
	//   synth["D6"].play();
	// };


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */
/***/ function(module, exports) {

	var keyMaps = {
	  65: "G1",
	  83: "A1",
	  68: "B1",
	  70: "C1",
	  71: "D1",
	  72: "E1",
	  74: "F1",
	  75: "G2",
	  76: "A2",
	  186: "B2"
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

	var noteNames = ["G1", "A1", "B1", "C1", "D1", "E2", "F2", "G2", "A2", "B2"];

	module.exports = { KEY_MAPS: keyMaps, NOTE_NAMES: noteNames, KEY_NOTE_MAP: keyNoteMapping };


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var maps = __webpack_require__(5);
	var KEY_MAPS = maps.KEY_MAPS;
	var KEY_NOTE_MAP = maps.KEY_NOTE_MAP;
	var Note = __webpack_require__(7);
	var LinkedList = __webpack_require__(8);

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
	var startingTime;

	var NoteStore = new LinkedList();

	function getSongNotes() {
	  $.ajax({
	    type: "GET",
	    url: "/assets/json/bach_minuet_g_major.json",
	    dataType: "json",
	    success: function (data) {
	      loadNotes(data.track);
	      start();
	    }
	  });
	}

	function loadNotes(notes) {
	  debugger
	  notes.forEach( function (note) {
	    NoteStore.add(new Note(note.note, note.time));
	  });
	}

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
	  var elapsedTime = arguments[1];
	  var remaining = Math.floor(note.time - elapsedTime);
	  note.y = remaining + 400;
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
	  var now = performance.now();
	  var elapsedTime = now - startingTime;
	  _notes.forEach(animateNote, elapsedTime);
	  requestAnimationFrame(animate);
	}

	function stopAnimation () {
	  STOP_ANIMATION = true;
	}

	function startAnimation () {
	  STOP_ANIMATION = false;
	  startingTime = performance.now();
	  addNotes();
	  animate();
	}

	function addNotes () {
	  _noteInterval = setInterval(function () {
	    var elapsedTime = performance.now() - startingTime;
	    NoteStore.while( function (node) { return node.item.time - elapsedTime < 7500; },
	      function (node) {
	        _notes.add(node.item);
	        node.item.generateDOMElement();
	        $noteContainer.append(node.item.element);
	        node.delete();
	    });
	  }, 100);
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

	function load() {
	  getSongNotes();
	}

	function start() {
	  clearNotes();
	  Sounds.music.play()
	  startAnimation();
	}

	function stop() {
	  console.log("stopping");
	  stopAnimation();
	  clearInterval(_noteInterval);
	}

	window.stop = stop;

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
	  load: load,
	  stop: stop
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var NOTE_NAMES = __webpack_require__(5).NOTE_NAMES;
	var NUM_NOTES = NOTE_NAMES.length;

	function Note (noteName, time) {
	  this.name = noteName;
	  this.time = time;
	}

	Note.prototype.generateDOMElement = function() {
	  this.element = $("<div>").addClass("note").addClass(this.name);
	};

	Note.random = function () {
	  var noteName = NOTE_NAMES[Math.floor(Math.random() * NUM_NOTES)];
	  return new Note(noteName);
	};

	module.exports = Note;


/***/ },
/* 8 */
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
/* 9 */
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
/* 10 */
/***/ function(module, exports) {

	var _musicEndCallback = function () {};

	var Sounds = {
	  music: new Audio("/assets/mp3/bach_minuet_g_major.mp3"),
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
/* 11 */
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


/***/ }
/******/ ]);