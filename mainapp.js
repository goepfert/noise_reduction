/**
 * Noise Reduction Demo
 *
 * https://arxiv.org/pdf/1609.07132.pdf
 *
 * author: Pat Fénis
 */

'use strict';

// Start off by initializing a new context
// The one and only global variable
let context = new AudioContext();

// Ranges and default values of various parameters
const ParaCtrl = (function () {
  let loop = true;

  const samplerate = context.sampleRate;
  const FRAME_SIZE = samplerate * 0.025; // Frame_time == 25 ms (about 1000 samples @48 kHz)
  const FRAME_STRIDE = samplerate * 0.01; // Frame_stride == 10 ms (=> 15 ms overlap)

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
    playPauseButton: 'btn_play_pause',
    stopButton: 'btn_stop',
    fileselector: 'file-select',
    filename: 'filename',
    info: 'playinfo',
    resetButton: 'btn_reset',
    loopCheckBox: 'cb_loop',
  };

  function showFileProps(props, evt) {
    let h = document.getElementById('fileprops_heading');
    h.style.display = 'block';
    let ul = document.getElementById('fileprops');
    ul.innerHTML = '';
    for (let key in props) {
      let li = document.createElement('li');
      li.appendChild(document.createTextNode(key + ': ' + props[key]));
      ul.appendChild(li);
    }

    evt.target.labels[1].innerHTML = props.filename;
  }

  function getSelectors() {
    return UISelectors;
  }

  // Public methods
  return {
    showFileProps: showFileProps,
    getSelectors: getSelectors,
  };
})();

// Audio Context Controller ------------------------------------------------------------------
function createAudioCtxCtrl(buffer) {
  let bufferSize = 4096;

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

    App.updateAnimationFrame();
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

  function setLoop() {
    if (source != undefined) {
      source.loop = ParaCtrl.getLoop();
    }
  }

  // Public methods
  return {
    getCurrentTime: getCurrentTime,
    getDuration: getDuration,
    getPlaying: getPlaying,
    play: play,
    pause: pause,
    stop: stop,
    setLoop: setLoop,
  };
}

// Audio Processing Controller ---------------------------------------------------------------
function createAudioProcCtrl(buffer) {
  // it's an AudioBuffer you have
  console.log(buffer);

  const nChannels = buffer.numberOfChannels;

  // get the audiobuffer
  const channelData = buffer.getChannelData(0);

  // create noise of same length
  const noise = createNoiseGenerator(channelData.length);
  const noiseData = noise.pinkNoise(0.5);

  // create noisy buffer (org+noise)
  let modifiedData = new Float32Array(channelData.length);
  for (let i = 0; i < channelData.length; i++) {
    modifiedData[i] = channelData[i] + noiseData[i];
  }

  // test (play it loud)
  // let myArrayBuffer = context.createBuffer(1, channelData.length, context.sampleRate);
  // myArrayBuffer.copyToChannel(modifiedData, 0, 0);
  // return myArrayBuffer;

  doFraming();

  function doFraming() {
    // Overlaps

    // Windowing

    // FFT org
    const fft = createFFT(FRAME_SIZE);
    const B2P1 = FRAME_SIZE / 2 + 1; // Length of frequency domain data

    // fft mod
  }
}

// App Controller ----------------------------------------------------------------------------
const App = (function () {
  let audioCtxCtrl = undefined;
  let somebool = true;
  let info = undefined;

  let audioProcCtrl = undefined;

  function init() {
    console.log('initializing app ...');

    // Get UI selectors
    const UISelectors = UICtrl.getSelectors();

    info = document.getElementById(UISelectors.info);

    // Load event listeners

    // PLAY
    let playbtn = document.getElementById(UISelectors.playPauseButton);
    playbtn.addEventListener('click', () => {
      playPauseButton(playbtn);
    });

    // STOP
    document.getElementById(UISelectors.stopButton).addEventListener('click', () => stopButton(playbtn));

    // FILE SELECT
    document.getElementById(UISelectors.fileselector).addEventListener('change', handleFileSelect, false);

    // LOOP CHECKBOX
    let cb_loop = document.getElementById(UISelectors.loopCheckBox);
    cb_loop.checked = ParaCtrl.getLoop();
    cb_loop.addEventListener('click', () => checkLoop(cb_loop));
  }

  function checkLoop(checkbox) {
    if (checkbox.checked) {
      ParaCtrl.setLoop(true);
    } else {
      ParaCtrl.setLoop(false);
    }
    audioCtxCtrl.setLoop();
  }

  function playPauseButton(btn) {
    if (audioCtxCtrl.getPlaying()) {
      audioCtxCtrl.pause();
      btn.firstChild.nodeValue = 'Play';
    } else {
      audioCtxCtrl.play();
      btn.firstChild.nodeValue = 'Pause';
      somebool = true;
    }
  }

  function stopButton(btn) {
    audioCtxCtrl.stop();
    btn.firstChild.nodeValue = 'Play';
    somebool = true;
  }

  // loads and decodes file asynchronically and starts off a lot of other stuff
  function handleFileSelect(evt) {
    let file = evt.target.files[0];
    console.log(file);
    let reader = new FileReader();
    reader.onload = function () {
      let arrayBuffer = reader.result;
      context.decodeAudioData(arrayBuffer).then(function (decodedData) {
        //console.log(decodedData);

        if (audioCtxCtrl != undefined) {
          audioCtxCtrl.stop();
        }
        //audioCtxCtrl = createAudioCtxCtrl(decodedData);

        let fileprops = {
          filename: file.name,
          duration: decodedData.duration.toFixed(1),
          samplerate: decodedData.sampleRate,
          numberOfChannels: decodedData.numberOfChannels,
        };
        UICtrl.showFileProps(fileprops, evt);

        audioProcCtrl = createAudioProcCtrl(decodedData);
        audioCtxCtrl = createAudioCtxCtrl(audioProcCtrl);

        //updateAnimationFrame();
      });
    };
    reader.readAsArrayBuffer(file);
  }

  /**
   * let the browser update in its capability
   * if playing, called recursively
   */
  function updateAnimationFrame() {
    // playtime / duration
    if (info != undefined) {
      info.innerHTML = audioCtxCtrl.getCurrentTime().toFixed(1) + '/' + audioCtxCtrl.getDuration().toFixed(1);
    }

    // if not in loop, pause at the end, avoid toggling
    if (!ParaCtrl.getLoop() && somebool && audioCtxCtrl.getCurrentTime() >= audioCtxCtrl.getDuration()) {
      let playbtn = document.getElementById(UICtrl.getSelectors().playPauseButton);
      playPauseButton(playbtn);
      somebool = false;
    }

    // if playing update graph and call recurslively
    // remember to update again when resume playing
    if (audioCtxCtrl.getPlaying()) {
      window.requestAnimationFrame(updateAnimationFrame);
    }
  }

  // Public methods
  return {
    init: init,
    updateAnimationFrame: updateAnimationFrame,
  };
})();

// let's go
App.init();
