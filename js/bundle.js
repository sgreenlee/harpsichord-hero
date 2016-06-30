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

	var maps = __webpack_require__(1);
	var KEY_MAPS = maps.KEY_MAPS;
	var KEY_NOTE_MAP = maps.KEY_NOTE_MAP;

	window.Game = __webpack_require__(2);
	window.Sounds = __webpack_require__(5);
	window.StarMeter = __webpack_require__(6);
	window.NoteRolls = __webpack_require__(7);
	window.Modals = __webpack_require__(8);

	function onWin () {
	  Game.stop();
	  Sounds.applause.play();
	  Modals.win.open();
	}

	function onLose () {
	  Game.stop();
	  Sounds.music.stop();
	  Sounds.boo.setLoop(false);
	  Modals.lose.open();
	}

	function onRestart (songName) {
	  Modals.close();
	  Sounds.setSong(songName);
	  Sounds.setMusicEndCallback(onWin);
	  NoteRolls.setSong(songName);

	  Sounds.boo.play();

	  Sounds.boo.setLoop(true);
	  Sounds.boo.setVolume(0);
	  StarMeter.reset();
	  Game.load();
	}

	var imageLoaded = false;
	var backgroundImage = new Image();
	backgroundImage.onload = function () {
	  document.body.style.backgroundImage = "url(https://s3.amazonaws.com/hhero-pro/bg.png)";
	  imageLoaded = true;
	};
	backgroundImage.src = "https://s3.amazonaws.com/hhero-pro/bg.png";


	function resourcesLoaded() {
	  return imageLoaded && Sounds.allLoaded();
	}

	StarMeter.setLoseCallback(onLose);
	Modals.setRestartCallback(onRestart);

	document.addEventListener("DOMContentLoaded", function () {
	  (function waitForResources() {
	    if( resourcesLoaded()) {
	      var loadingScreen = document.getElementById("loading-screen");
	      document.body.removeChild(loadingScreen);
	      Modals.load.open();
	    }
	    else {
	      setTimeout(function () {
	        waitForResources();
	      }, 20);
	    }
	  })();
	});


/***/ },
/* 1 */
/***/ function(module, exports) {

	var keyMaps = {
	  65: "B1",
	  83: "C1",
	  68: "D1",
	  70: "E1",
	  71: "F1",
	  72: "G1",
	  74: "A1",
	  75: "B2",
	  76: "C2",
	  186: "D2"
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
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var maps = __webpack_require__(1);
	var KEY_MAPS = maps.KEY_MAPS;
	var KEY_NOTE_MAP = maps.KEY_NOTE_MAP;
	var Note = __webpack_require__(3);
	var LinkedList = __webpack_require__(4);

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

	var NoteStore;

	function loadNotes(songName) {
	  var noteRoll = NoteRolls.roll;
	  if (noteRoll.isLoaded()) {
	    NoteStore = new LinkedList();
	    noteRoll.notes.forEach( function (note) {
	      NoteStore.add(new Note(note.note, note.time));
	    });
	    start();
	  }
	  else {
	    setTimeout(loadNotes.bind(this, songName), 20);
	  }
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
	    // play a random mistake
	    Sounds.mistakes[Math.floor(Math.random() * Sounds.mistakes.length)].play();
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
	  loadNotes("bach_minuet_g_major");
	}

	function start() {
	  clearNotes();
	  Sounds.music.play();
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var NOTE_NAMES = __webpack_require__(1).NOTE_NAMES;
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
/* 4 */
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
/* 5 */
/***/ function(module, exports) {

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


/***/ },
/* 6 */
/***/ function(module, exports) {

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


/***/ },
/* 7 */
/***/ function(module, exports) {

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


/***/ },
/* 8 */
/***/ function(module, exports) {

	var $modalOverlay = $("#modal-overlay");
	var $loseModal = $(".modal.lose");
	var $winModal = $(".modal.win");
	var $loadModal = $(".modal.load");
	var $selectModal = $(".modal.select");
	var $body = $("body");

	var _restartCallback = function () {};

	var newGameButtonList = document.querySelectorAll(".new-game");
	var songSelectButtonList = document.querySelectorAll(".song-select");

	function restart () {
	  currentModal.close();
	  selectModal.open();
	}


	function selectSong(e) {
	  var songName = e.target.attributes["data-song"].value;
	  _restartCallback(songName);
	}

	for (var i = 0; i < newGameButtonList.length; i++) {
	  newGameButtonList[i].addEventListener("click", restart);
	}

	for (var i = 0; i < songSelectButtonList.length; i++) {
	  songSelectButtonList[i].addEventListener("click", selectSong);
	}

	$modalOverlay.detach();
	$modalOverlay.css("display", "block");

	$loseModal.detach();
	$loseModal.css("top", "50%");

	$winModal.detach();
	$winModal.css("top", "50%");

	$loadModal.detach();
	$loadModal.css("top", "50%");

	$selectModal.detach();
	$selectModal.css("top", "50%");

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

	var selectModal = {
	  open: function () {
	    $body.append($modalOverlay);
	    $body.append($selectModal);
	    currentModal = this;
	  },
	  close: function () {
	    $modalOverlay.detach();
	    $selectModal.detach();
	  }
	};

	module.exports = {
	  setRestartCallback: function (callback) {
	    _restartCallback = callback;
	  },

	  lose: loseModal,
	  win: winModal,
	  load: loadModal,
	  select: selectModal,
	  close: function () {
	    currentModal.close();
	  }
	};


/***/ }
/******/ ]);