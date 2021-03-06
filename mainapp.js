/**
 * Noise Reduction Demo
 *
 * https://arxiv.org/pdf/1609.07132.pdf
 *
 * author: Pat Fénis
 */

'use strict';

// Global consts
//TODO: read samplerate from file
const samplerate = 8000; //context.sampleRate;
const FRAME_SIZE = samplerate * 0.032; // Frame_time == 23 ms (about 256 samples @8 kHz)
const FRAME_STRIDE = FRAME_SIZE / 2;
const N_SEGMENTS = 8;

// App Controller ----------------------------------------------------------------------------
const App = (function () {
  let model;
  const fenster = createWindowing(FRAME_SIZE);
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
   * Reads datafile(s) created by create_audioDataset
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
          const audioDataset = createAudioDataset();
          audioDataset.clearData();
          audioDataset.setData(data);
          extractFeatures(audioDataset);
          resolve();
        });
        reader.readAsText(file);
      });

      promises.push(filePromise);
    }

    // wait until all promises came back
    Promise.all(promises).then(() => {
      console.log('start training ...');
      train();
    });
  }

  /**
   * Extract audio features from audioDataset and prepares imageDataset
   * Currently the imageDataset is appended
   */
  function extractFeatures(audioDataset) {
    const data = audioDataset.getData();
    utils.assert(data.length === 2, 'extractFeatures: reading not valid data length');

    // TODO: implicit knowledge :(
    // but for now its OK to have only one noise per file
    let cleanData = Float32Array.from(Object.values(data[0].data));
    let noisyData = Float32Array.from(Object.values(data[1].data));

    console.log('noisy data', data[1].label);

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
      const audioDataset = createAudioDataset();
      audioDataset.clearData();
      audioDataset.setData(data);
      extractFeatures(audioDataset);
      predict(file.name.split('.')[0]);
      // test();
    });
    reader.readAsText(file);
  }

  /**
   * Predict from imageDataset
   */
  function predict(filename) {
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

      // just to be sure
      predict_magnitude.map((val) => {
        utils.absolutes1D(val);
      });

      // Obtain timedomain data
      const prediction_data = Core.getISTFT(predict_magnitude, image_phase, FRAME_SIZE, FRAME_STRIDE);

      // simple play it loud
      const context = new AudioContext();
      let buffer = Float32Array.from(prediction_data);
      const audioBuffer = context.createBuffer(1, buffer.length, samplerate); //context.sampleRate);
      audioBuffer.copyToChannel(buffer, 0, 0);

      let audioCtxCtrl = createAudioCtxCtrl({
        buffer: audioBuffer,
        context: context,
        loop: true,
      });
      audioCtxCtrl.play();

      const btn_save_wav = document.getElementById('btn_save_wav');
      btn_save_wav.classList.remove('hide');
      btn_save_wav.addEventListener(
        'click',
        () => {
          handleSaveWave(buffer, filename);
        },
        false
      );
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
   * user has to select json and bin file ... in the right order :(
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

    document.getElementById('div_predict').classList.remove('hide');
  }

  /**
   * save buffer as wave file
   */
  function handleSaveWave(buffer, filename) {
    console.log('saving buffer to wav', buffer);
    const wav = new Wav({ sampleRate: samplerate, channels: 1 });
    wav.setBuffer(buffer);
    const wavebuffer = wav.getBuffer();
    utils.download(wavebuffer, `${filename}_predict.wav`, 'audio/wav');
  }

  // Public methods
  return {
    init: init,
  };
})();

// let's go
App.init();
