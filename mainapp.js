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
  const soundDataset = createSoundDataset();
  const imageDataset = createImageDataset();

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
      soundDataset.setData(data);
      processData(data);
    });
    reader.readAsText(file);
  }

  // Extract Clean and Noisy Buffer
  function processData() {
    const data = soundDataset.getData();
    utils.assert(data.length >= 2, 'reading not valid data length');

    // implicit knowledge :(
    let cleanData = Float32Array.from(Object.values(data[0].data));
    let noisyData = Float32Array.from(Object.values(data[1].data));

    // Create Input and Target Images from clean and noisy Data
    preprocessing(cleanData, noisyData);
  }

  function preprocessing(cleanData, noisyData) {
    utils.assert(cleanData.length == noisyData.length, 'size mismatch of clean and noisy data');

    let availableData = cleanData.length;
    let nFrames = utils.getNumberOfFrames(availableData, FRAME_SIZE, FRAME_STRIDE);
    let startPos = 0;
    let startPos_frame = 0;
    let endPos_frame = 0;
    console.log(availableData, FRAME_SIZE, nFrames);

    if (nFrames < N_SEGMENTS) {
      console.log('need more data');
      return;
    }

    imageDataset.clearData();

    let loopIdx = 0;
    while (endPos_frame < availableData) {
      // Create input image from start position
      let input = [];
      let target = [];

      // ensures no overlap of target images
      startPos_frame = startPos + loopIdx * FRAME_SIZE;
      endPos_frame = startPos_frame + FRAME_SIZE;

      // 7 hops for 8 segments
      for (let hop_idx = 0; hop_idx < N_SEGMENTS; hop_idx++) {
        console.log('hop', hop_idx, startPos_frame, endPos_frame);
        let hop_buffer = cleanData.slice(startPos_frame, endPos_frame);
        fenster.hamming(hop_buffer);
        let mag = fft.getPowerspectrum(hop_buffer);
        input.push(mag);

        // Last hop
        if (hop_idx == N_SEGMENTS - 1) {
          console.log('last hop');
          hop_buffer = noisyData.slice(startPos_frame, endPos_frame);
          fenster.hamming(hop_buffer);
          mag = fft.getPowerspectrum(hop_buffer);
          target.push(mag);
        }

        startPos_frame += FRAME_STRIDE;
        endPos_frame += FRAME_STRIDE;
      }

      imageDataset.addData(input, target);

      loopIdx++;
    }
  }

  console.log(imageDataset);

  // Public methods
  return {
    init: init,
  };
})();

// let's go
App.init();
