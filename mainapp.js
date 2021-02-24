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
const FRAME_STRIDE = FRAME_SIZE / 2; //samplerate * 0.01; // Frame_stride == 10 ms (=> 15 ms overlap)
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
  const audioDataset = createAudioDataset();
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
   * Reads datafile(s) created by prepareInputData
   * Those files contains PCM data of clean and noisy (clean + some noise) samples and need to have the same structure
   */
  function handleFileSelect_train(evt) {
    const nFiles = evt.target.files.length;
    let promises = [];

    for (let fileIdx = 0; fileIdx < nFiles; fileIdx++) {
      const file = evt.target.files[fileIdx];
      console.log('loading data from', file.name);

      let filePromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          const res = event.target.result;
          const textByLine = res.split('\n');
          const data = JSON.parse(textByLine);
          audioDataset.clearData();
          audioDataset.setData(data);
          extractFeatures();
          resolve();
        });
        reader.readAsText(file);
      });

      promises.push(filePromise);
    }

    // wait until all promises came back
    Promise.all(promises).then(() => {
      console.log('train');
      train();
    });
  }

  /**
   * Extract audio features from audioDataset and prepares imageDataset
   * Currently the imageDataset is appended
   */
  function extractFeatures() {
    const data = audioDataset.getData();
    utils.assert(data.length === 2, 'extractFeatures: reading not valid data length');

    // TODO: implicit knowledge :(
    // but for now its OK to have only one noise per file
    let cleanData = Float32Array.from(Object.values(data[0].data));
    let noisyData = Float32Array.from(Object.values(data[1].data));

    utils.assert(cleanData.length == noisyData.length, 'size mismatch of clean and noisy data');

    let availableData = cleanData.length;
    utils.assert(availableData >= FRAME_SIZE, 'not enough data');

    // Get frequency domain data of overlapping windowed time domain data
    const { magnitudes: noisy_mags, phases: noisy_phases } = Core.getSTFT(
      noisyData,
      FRAME_SIZE,
      FRAME_STRIDE,
      fenster.hanning
    );
    const { magnitudes: clean_mags, phases: clean_phases } = Core.getSTFT(
      cleanData,
      FRAME_SIZE,
      FRAME_STRIDE,
      fenster.hanning
    );

    // Phase aware scaling (only needed for training, anyway)
    console.log('apply phase aware scaling');
    Core.phase_aware_scaling(clean_mags, clean_phases, noisy_phases);

    // Prepare imageDataset
    for (let idx = 0; idx < noisy_mags.length - N_SEGMENTS; idx++) {
      // Deep 2D copy
      const input_magnitudes = noisy_mags.slice(idx, idx + N_SEGMENTS).map((row) => row.slice());
      const input_phase = noisy_phases.slice(idx + N_SEGMENTS - 1, idx + N_SEGMENTS).map((row) => row.slice());
      const target_magnitude = clean_mags.slice(idx + N_SEGMENTS - 1, idx + N_SEGMENTS).map((row) => row.slice());

      imageDataset.addData(input_magnitudes, input_phase, target_magnitude);
    } // -end loop over all data

    //console.log('imageDS', imageDataset);
  } // -end extractFeatures()

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
      audioDataset.clearData();
      audioDataset.setData(data);

      extractFeatures();
      imageDataset.setGlobalMeanAndSigma();

      predict();
      // test();
    });
    reader.readAsText(file);
  }

  /**
   * Predict from imageDataset
   */
  function predict() {
    tf.tidy(() => {
      const image_data = imageDataset.getData();
      const image_phase = image_data.image_phase;
      const x = imageDataset.getPredictionData();

      const res = model.predict(x);
      const result = res.dataSync();
      console.log('finished prediction');

      // Get magnitudes from NN
      let predict_magnitude = [];
      var array = Array.from(result);
      while (array.length) {
        predict_magnitude.push(array.splice(0, FRAME_SIZE / 2 + 1));
      }

      // Revert standardization
      for (let i = 0; i < predict_magnitude.length; i++) {
        let mean;
        let sigma;
        if (image_data.image_magnitude_global_mean != -1 && image_data.image_magnitude_global_sigma != -1) {
          mean = image_data.image_magnitude_global_mean;
          sigma = image_data.image_magnitude_global_sigma;
        } else {
          mean = image_data.image_magnitude_mean[i];
          sigma = image_data.image_magnitude_sigma[i];
        }

        //utils.de_standardize(predict_magnitude[i], mean, sigma);
        utils.absolutes1D(predict_magnitude[i]);
      }

      // Obtain timedomain data
      const prediction_data = Core.getISTFT(predict_magnitude, image_phase, FRAME_SIZE, FRAME_STRIDE);

      //console.log('pred data', prediction_data);

      const context = new AudioContext();
      let buffer = Float32Array.from(prediction_data);
      const audioBuffer = context.createBuffer(1, buffer.length, 16000); //context.sampleRate);
      audioBuffer.copyToChannel(buffer, 0, 0);

      let audioCtxCtrl = createAudioCtxCtrl({
        buffer: audioBuffer,
        context: context,
        loop: true,
      });
      audioCtxCtrl.play();
    });
  }

  function test() {
    const data = audioDataset.getData();
    utils.assert(data.length >= 2, 'reading not valid data length');

    const cleanData = Float32Array.from(Object.values(data[0].data));

    const availableData = cleanData.length;
    utils.assert(availableData >= FRAME_SIZE, 'not enough data');

    // acts as prediction data
    let { magnitudes, phases } = Core.getSTFT(cleanData, FRAME_SIZE, FRAME_STRIDE, fenster.hanning);
    //let { magnitudes, phases } = Core.getSTFT(cleanData, FRAME_SIZE, FRAME_STRIDE);
    const { mean, sigma } = utils.getMeanAndSigma2D(magnitudes);

    utils.standardize(magnitudes, mean, sigma);
    magnitudes.map((mag) => {
      utils.de_standardize(mag, mean * 1.5, sigma);
      //utils.de_standardize(mag, mean - 0.1, sigma * 1.1);
      utils.absolutes1D(mag);
    });

    // console.log(magnitudes);
    // console.log(phases);

    // Obtain timedomain data
    const prediction_data = Core.getISTFT(magnitudes, phases, FRAME_SIZE, FRAME_STRIDE);

    const context = new AudioContext();
    let buffer = Float32Array.from(prediction_data);
    const audioBuffer = context.createBuffer(1, buffer.length, 16000); //context.sampleRate);
    audioBuffer.copyToChannel(buffer, 0, 0);

    let audioCtxCtrl = createAudioCtxCtrl({
      buffer: audioBuffer,
      context: context,
      loop: true,
    });
    audioCtxCtrl.play();
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

    //console.log(e);

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
    //console.log('loading model from', jsonFile.name, binFile.name);

    e.target.labels[1].innerHTML = jsonFile.name + ', ' + binFile.name;

    model = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, binFile]));
    //console.log(model);
  }

  // Public methods
  return {
    init: init,
  };
})();

// let's go
App.init();
