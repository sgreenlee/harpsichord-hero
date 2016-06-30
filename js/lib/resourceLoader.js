var resources = {
  backgroundImage: false,
  music: false,
  booMp3: false,
  applauseMp3: false,
  notes: false
};

var

function ResourceLoader(completionCallback) {

  this._completionCallback = completionCallback;
  Object.keys(resources).forEach( function (resource) {
    this._status
  });

  function isLoaded() {
    return resources.backgroundImage &&
           resources.music &&
           resources.booMp3 &&
           resources.applauseMp3 &&
           resources.notes;
  }

  function loadAll(completionCallback) {
    var music = new Audio();
    // load everything

    this._completionCallback = completionCallback;
  }

  function completionCallback() {
    closeLoadingScreen();
    open
  }
}
