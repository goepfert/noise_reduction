/**
 * Noise Reduction Demo
 *
 * https://arxiv.org/pdf/1609.07132.pdf
 *
 * author: Pat Fénis
 */

'use strict';

// Start off by initializing a new context
//const context = new AudioContext();

// Global consts
//TODO: read samplerate from file
const samplerate = 16000; //context.sampleRate;
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
  let model;
  const fenster = createWindowing(FRAME_SIZE);
  const fft = createFFT(FRAME_SIZE);
  const soundDataset = createSoundDataset();
  const imageDataset = createImageDataset();

  /**
   * Yes, inititalize this
   */
  function init() {
    console.log('initializing app ...');

    document.getElementById('train').addEventListener('change', handleFileSelect_train, false);
    document.getElementById('save-model').addEventListener('click', saveModel, false);
    document.getElementById('load-model').addEventListener('change', loadModel, false);
    document.getElementById('predict').addEventListener('change', handleFileSelect_predict, false);
  }

  /**
   * Read datafile created by prepareInputData
   */
  function handleFileSelect_train(evt) {
    const file = evt.target.files[0];
    console.log('loading data from', file.name);
    let data;
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      let res = event.target.result;
      let textByLine = res.split('\n');
      data = JSON.parse(textByLine);
      soundDataset.clearData();
      soundDataset.setData(data);

      extractFeatures();

      //processData();
      //train();
    });
    reader.readAsText(file);
  }

  /**
   * extract audio features from audioDataset
   * fills imageDataset
   */
  function extractFeatures() {
    const data = soundDataset.getData();
    utils.assert(data.length >= 2, 'reading not valid data length');

    // TODO: implicit knowledge :(
    // but for now its OK to have only one noise per file
    let cleanData = Float32Array.from(Object.values(data[0].data));
    let noisyData = Float32Array.from(Object.values(data[1].data));

    utils.assert(cleanData.length == noisyData.length, 'size mismatch of clean and noisy data');

    let availableData = cleanData.length;
    utils.assert(availableData >= FRAME_SIZE, 'not enough data');
  } // -end extractFeatures()

  /**
   * Process soundDataset data
   * Fills imageDataset with input and target images from clean and noisy Data
   * ATM only clean data and one noise
   */
  function processData() {
    const data = soundDataset.getData();
    utils.assert(data.length >= 2, 'reading not valid data length');

    // TODO: implicit knowledge :(
    let cleanData = Float32Array.from(Object.values(data[0].data));
    let noisyData = Float32Array.from(Object.values(data[1].data));

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
        //console.log("hop", hop_idx, startPos_frame, endPos_frame);
        let hop_buffer = cleanData.slice(startPos_frame, endPos_frame);
        fenster.hamming(hop_buffer);
        let mag = fft.getPowerspectrum(hop_buffer);

        input.push(mag);

        // Last hop
        if (hop_idx == N_SEGMENTS - 1) {
          //console.log("last hop");
          hop_buffer = noisyData.slice(startPos_frame, endPos_frame);
          fenster.hamming(hop_buffer);
          mag = fft.getPowerspectrum(hop_buffer);
          target.push(mag);
        }

        startPos_frame += FRAME_STRIDE;
        endPos_frame += FRAME_STRIDE;
      }

      utils.standardize(input);
      utils.standardize(target);

      imageDataset.addData(input, target);
      loopIdx++;
    }
  }

  /**
   * Train NN with imageDataset
   */
  async function train() {
    const nn_noise = createNetwork(N_SEGMENTS, FRAME_SIZE / 2 + 1);
    model = nn_noise.getModel();
    tfvis.show.modelSummary({ name: 'Model Summary' }, model);

    const trainingData = imageDataset.getTrainingData();

    await nn_noise.train(trainingData.xs, trainingData.ys, model);

    console.log('training finished!');

    //showAccuracy();
    //showConfusion();
  }

  /**
   * Load pcm data from file, clean and noisy
   */
  function handleFileSelect_predict(evt) {
    const file = evt.target.files[0];
    console.log('loading data from', file.name);
    let data;
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      let res = event.target.result;
      let textByLine = res.split('\n');
      data = JSON.parse(textByLine);
      soundDataset.clearData();
      soundDataset.setData(data);
      processData();
      predict();
    });
    reader.readAsText(file);
  }

  /**
   * predict imageDataset
   */
  function predict() {
    tf.tidy(() => {
      let image = imageDataset.getData().image;

      let x = tf.tensor3d(image).reshape([image.length, N_SEGMENTS, FRAME_SIZE / 2 + 1, 1]);

      const res = model.predict(x);
      const result = res.dataSync();
      console.log(result);

      var array = Array.from(result);

      const newArr = [];
      while (array.length) {
        newArr.push(array.splice(0, FRAME_SIZE / 2 + 1));
      }

      console.log(newArr);
    });
  }

  /**
   * save NN model
   */
  async function saveModel() {
    utils.assert(model != undefined, 'noise model undefined');
    //utils.assert(is_trained == true, "not trained yet?");
    const filename = 'noise_model_name';
    console.log(await model.save(`downloads://${filename}`));
  }

  /**
   * load NN model
   * user has to select json and bin file
   */
  async function loadModel(e) {
    utils.assert(e.target.files.length == 2, 'select one json and one bin file for model');

    console.log(e);

    e.target.labels[1].innerHTML = '';

    let jsonFile;
    let binFile;

    if (e.target.files[0].name.split('.').pop() == 'json') {
      jsonFile = e.target.files[0];
      binFile = e.target.files[1];
    } else {
      jsonFile = e.target.files[1];
      binFile = e.target.files[0];
    }

    utils.assert(model == undefined, 'model already defined?'); //overwrite????
    // utils.assert(is_trained_vad == false, 'model already trained?');
    console.log('loading model from', jsonFile.name, binFile.name);

    e.target.labels[1].innerHTML = jsonFile.name + ', ' + binFile.name;

    model = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, binFile]));
    console.log(model);
  }

  // Public methods
  return {
    init: init,
  };
})();

// let's go
App.init();
