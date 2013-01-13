/**
 * @author Erik Lindebratt
 */
var
  mySounds = [],
  soundCloudClientID = "3360f20ecd28b1992689f23391b50478",
  soundCloudSDKURI = "http://connect.soundcloud.com/sdk.js",
  soundCloudDebugTrackPermalink = "https://soundcloud.com/openingceremony/showtunes-steve-j-yoni-p-ss13",

  init = function() {
    var r = "Getings und Bajs";
    if (document.querySelector("[src='"+soundCloudSDKURI+"']")) {
      console.info("Already initialized");
      return r;
    }

    var sdkEl = document.createElement("script");
    sdkEl.src = soundCloudSDKURI;
    document.body.appendChild(sdkEl);
    sdkEl.addEventListener("error", onSoundCloudSDKLoadError);
    sdkEl.addEventListener("load", onSoundCloudSDKLoad);

    return r;
  },

  onSoundCloudSDKLoadError = function() {
    console.error("SDK Load Error: ", arguments);
  },
  onSoundCloudSDKLoad = function() {
    var prepareSound = function(soundObj, callback) {
      if (!soundObj.track) {
        SC.get("/resolve", { url: soundObj.url }, function(track) {
          console.log("resolved track data: ", track);
          soundObj.track = track;
          prepareSound(soundObj, callback);
        });
        return false;
      }
      
      if (!soundObj.loadedSound) {
        SC.stream("/tracks/"+soundObj.track.id, function(loadedSound) {
          console.log("loaded sound data: ", loadedSound);
          soundObj.loadedSound = loadedSound;
          prepareSound(soundObj, callback);
        });
        return false;
      }
      
      if (callback) callback(soundObj);
      return true;
    };

    var playSound = function(soundObj) {
      prepareSound(soundObj, function() {
        if (soundObj.loadedSound.playState === 1 && !soundObj.loadedSound.paused) return;
        soundObj.loadedSound.play();
      });
    };

    var pauseSound = function(soundObj, isPrepared) {
      prepareSound(soundObj, function() {
        if (soundObj.loadedSound.paused) return;
        soundObj.loadedSound.pause();
      });
    };

    var stopSound = function(soundObj, isPrepared) {
      prepareSound(soundObj, function() {
        if (soundObj.loadedSound.playState === 0) return;
        soundObj.loadedSound.stop();
      });
    };
    
    mySounds.prepareAll = function() {
      mySounds.forEach(function(soundObj) {
        prepareSound(soundObj);
      });
    };
    
    mySounds.playAll = function() {
      mySounds.forEach(function(soundObj) {
        playSound(soundObj);
      });
    };
    
    mySounds.pauseAll = function() {
      mySounds.forEach(function(soundObj) {
        pauseSound(soundObj);
      });
    };

    mySounds.stopAll = function() {
      mySounds.forEach(function(soundObj) {
        stopSound(soundObj);
      });
    };

    SC.initialize({ client_id: soundCloudClientID });
    mySounds.push({ url: soundCloudDebugTrackPermalink });
    mySounds.playAll();
  };
