/**
 * Noise Gen Test
 */

'use strict';

// Start off by initializing a new context
let context = new AudioContext(); // any reason why not const?

// Global consts
const samplerate = context.sampleRate;

// UI Controller ----------------------------------------------------------------------------
const UICtrl = (function () {
  const UISelectors = {
    btn_pink: 'btn_play_pause_pink',
    btn_white: 'btn_play_pause_white',
    btn_brown: 'btn_play_pause_brown',
  };

  function getSelectors() {
    return UISelectors;
  }

  // Public methods
  return {
    getSelectors: getSelectors,
  };
})();

// Audio Context Controller ------------------------------------------------------------------
function createAudioCtxCtrl(buffer) {
  let source = undefined;
  let startedAt = 0;
  let pausedAt = 0;
  let isPlaying = false;

  // nice one ... can be used as 'constructor' function
  (function construct() {})();

  function play() {
    console.log('- PLAY PAUSE --------------------------------');

    let offset = pausedAt;
    source = context.createBufferSource();
    source.buffer = buffer;

    source.connect(context.destination);

    source.start(0, pausedAt);
    source.loop = true;

    startedAt = context.currentTime - offset;
    pausedAt = 0;
    isPlaying = true;
  }

  function pause() {
    var elapsed = context.currentTime - startedAt;
    commonStop();
    pausedAt = elapsed;
  }

  function stop() {
    commonStop();
  }

  function commonStop() {
    if (source != undefined) {
      source.disconnect();
      source.stop(0);
      source = undefined;
    }
    pausedAt = 0;
    startedAt = 0;
    isPlaying = false;
  }

  function getPlaying() {
    return isPlaying;
  }

  function getCurrentTime() {
    if (pausedAt) {
      return pausedAt;
    }
    if (startedAt) {
      return context.currentTime - startedAt;
    }
    return 0;
  }

  function getDuration() {
    return buffer.duration;
  }

  // Public methods
  return {
    getCurrentTime: getCurrentTime,
    getDuration: getDuration,
    getPlaying: getPlaying,
    play: play,
    pause: pause,
    stop: stop,
  };
}

// Noise Buffer Controller ---------------------------------------------------------------
// Creates an AudioBuffer with some noise
const Noise = (function () {
  // create noise of same length
  const LENGTH = 500000;
  const DECIBELS = -42;

  const noiseGenerator = createNoiseGenerator(LENGTH);

  //pink
  let pinkArrayBuffer = context.createBuffer(1, LENGTH, context.sampleRate);
  pinkArrayBuffer.copyToChannel(noiseGenerator.pinkNoise(DECIBELS), 0, 0);

  //white
  let whiteArrayBuffer = context.createBuffer(1, LENGTH, context.sampleRate);
  whiteArrayBuffer.copyToChannel(noiseGenerator.whiteNoise(DECIBELS), 0, 0);

  //brown
  let brownArrayBuffer = context.createBuffer(1, LENGTH, context.sampleRate);
  brownArrayBuffer.copyToChannel(noiseGenerator.brownNoise(DECIBELS), 0, 0);

  return {
    getPinkBuffer: pinkArrayBuffer,
    getWhiteBuffer: whiteArrayBuffer,
    getBrownBuffer: brownArrayBuffer,
  };
})();

// App Controller ----------------------------------------------------------------------------
const App = (function () {
  let audioCtxCtrl_pink = undefined;
  let audioCtxCtrl_white = undefined;
  let audioCtxCtrl_brown = undefined;

  let somebool = true;

  function init() {
    console.log('initializing app ...');

    // Get UI selectors
    const UISelectors = UICtrl.getSelectors();

    audioCtxCtrl_pink = createAudioCtxCtrl(Noise.getPinkBuffer);
    audioCtxCtrl_white = createAudioCtxCtrl(Noise.getWhiteBuffer);
    audioCtxCtrl_brown = createAudioCtxCtrl(Noise.getBrownBuffer);

    /**
     * Load event listeners
     */
    let playbtn_pink = document.getElementById(UISelectors.btn_pink);
    playbtn_pink.addEventListener('click', () => {
      playPauseButton(playbtn_pink, audioCtxCtrl_pink);
    });

    let playbtn_white = document.getElementById(UISelectors.btn_white);
    playbtn_white.addEventListener('click', () => {
      playPauseButton(playbtn_white, audioCtxCtrl_white);
    });

    let playbtn_brown = document.getElementById(UISelectors.btn_brown);
    playbtn_brown.addEventListener('click', () => {
      playPauseButton(playbtn_brown, audioCtxCtrl_brown);
    });
  }

  function playPauseButton(btn, audioCtxCtrl) {
    if (audioCtxCtrl.getPlaying()) {
      audioCtxCtrl.pause();
      btn.firstChild.nodeValue = 'Play';
    } else {
      audioCtxCtrl.play();
      btn.firstChild.nodeValue = 'Pause';
      somebool = true;
    }
  }

  // Public methods
  return {
    init: init,
  };
})();

// let's go
App.init();
