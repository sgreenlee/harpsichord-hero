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
