/**
 * Noise Reduction Demo
 *
 * https://arxiv.org/pdf/1609.07132.pdf
 *
 * author: Pat Fénis
 */

'use strict';

// Start off by initializing a new context
const context = new AudioContext();

// Global consts
const samplerate = context.sampleRate;
const FRAME_SIZE = samplerate * 0.025; // Frame_time == 25 ms (about 1000 samples @48 kHz)
const FRAME_STRIDE = samplerate * 0.01; // Frame_stride == 10 ms (=> 15 ms overlap)
const N_SEGMENTS = 8;

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

// App Controller ----------------------------------------------------------------------------
const App = (function () {
  const fenster = createWindowing(FRAME_SIZE);
  const fft = createFFT(FRAME_SIZE);

  function init() {
    console.log('initializing app ...');

    document.getElementById('file-load').addEventListener('change', handleFileSelect_load, false);
  }

  // Load pcm data from file, clean and noisy
  function handleFileSelect_load(evt) {
    const file = evt.target.files[0];
    console.log('loading data from', file.name);
    let data;
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      let res = event.target.result;
      let textByLine = res.split('\n');
      data = JSON.parse(textByLine);
      processData(data);
    });
    reader.readAsText(file);
  }

  // Extract Clean and Noisy Buffer
  //
  function processData(data) {
    // console.log('data', data);

    utils.assert(data.length >= 2, 'reading not valid data length');

    let cleanData = Float32Array.from(Object.values(data[0].data));
    let noisyData = Float32Array.from(Object.values(data[1].data));

    // console.log(cleanData);
    // console.log(noisyData);

    // Framing
    framing(cleanData);
  }

  function framing(buffer) {
    let availableData = buffer.length;

    let nFrames = utils.getNumberOfFrames(availableData, FRAME_SIZE, FRAME_STRIDE);
    let startPos = 0;
    let endPos = 0;

    console.log(availableData, FRAME_SIZE, nFrames, startPos, endPos);

    utils.assert(nFrames >= N_SEGMENTS, 'need more data ...');

    // create input image
    for (let hop_idx = 0; hop_idx < N_SEGMENTS - 1; hop_idx++) {
      startPos += hop_idx * FRAME_STRIDE;
      endPos = startPos + FRAME_SIZE;
      let hop_buffer = buffer.slice(startPos, endPos);
      fenster.hamming(hop_buffer);
      const mag = fft.getPowerspectrum(hop_buffer);
    }

    for (let idx = 0; idx < nFrames; idx++) {
      let frame_buffer = buffer.slice(startPos, endPos);

      // Windowing
      fenster.hamming(frame_buffer);

      // Fourier Transform
      const mag = fft.getPowerspectrum(frame_buffer);

      //DFT_Data[Data_Pos] = utils.logRangeMapBuffer(mag, MIN_EXP, MAX_EXP, 255, 0);
      //console.log(idx, mag);
    }
  }

  // Public methods
  return {
    init: init,
  };
})();

// let's go
App.init();
