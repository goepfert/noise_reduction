/**
 * Noise Reduction Demo
 *
 * https://arxiv.org/pdf/1609.07132.pdf
 *
 * author: Pat Fénis
 */

'use strict';

// Start off by initializing a new context
let context = new AudioContext(); // any reason why not const?

// Global consts
const samplerate = context.sampleRate;
const FRAME_SIZE = samplerate * 0.025; // Frame_time == 25 ms (about 1000 samples @48 kHz)
const FRAME_STRIDE = samplerate * 0.01; // Frame_stride == 10 ms (=> 15 ms overlap)

// Parameter Controller ---------------------------------------------------------------------
// Ranges and default values of various parameters
const ParaCtrl = (function () {
  let loop = true;

  function setLoop(doloop) {
    loop = doloop;
  }

  function getLoop() {
    return loop;
  }

  return {
    setLoop: setLoop,
    getLoop: getLoop,
  };
})();

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
    source.loop = ParaCtrl.getLoop();

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

// Audio Processing Controller ---------------------------------------------------------------
const Noise = (function () {
  // create noise of same length
  const LENGTH = 500000;
  const SCALE = 0.5;

  const noise = createNoiseGenerator(LENGTH);
  let noiseData;

  //pink
  noiseData = noise.pinkNoise(SCALE);
  let pinkArrayBuffer = context.createBuffer(1, LENGTH, context.sampleRate);
  pinkArrayBuffer.copyToChannel(noiseData, 0, 0);

  //white

  //brown

  return {
    getPinkBuffer: pinkArrayBuffer,
  };
})();

// App Controller ----------------------------------------------------------------------------
const App = (function () {
  let audioCtxCtrl_pink = undefined;
  let somebool = true;

  function init() {
    console.log('initializing app ...');

    // Get UI selectors
    const UISelectors = UICtrl.getSelectors();

    // Load event listeners

    // Play Button
    let playbtn = document.getElementById(UISelectors.btn_pink);
    playbtn.addEventListener('click', () => {
      playPauseButton(playbtn);
    });

    audioCtxCtrl_pink = createAudioCtxCtrl(createAudioProcCtrl());
  }

  function playPauseButton(btn) {
    if (audioCtxCtrl_pink.getPlaying()) {
      audioCtxCtrl_pink.pause();
      btn.firstChild.nodeValue = 'Play';
    } else {
      audioCtxCtrl_pink.play();
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
