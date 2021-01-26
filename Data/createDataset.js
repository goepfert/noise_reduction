/**
 * Load Clean Data example
 * Add Noise
 * Save Noisy Data
 * Test: Load Data and Play
 *
 * to be extended:
 * meta data like sample rate, what esl is needed?
 * definied set of noise types (pink, white, brown) and gains (e.g. +18, -36 dB in 6 dB steps)
 */

const context = new AudioContext();

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

const App = (function () {
  function init() {
    console.log('init app');

    document.getElementById('file-create').addEventListener('change', handleFileSelect_create, false);

    document.getElementById('file-load').addEventListener('change', handleFileSelect_load, false);

    const play_btn = document.getElementById('btn_play_pause');
    play_btn.addEventListener('click', () => {
      playPauseButton(play_btn, audioCtxCtrl);
    });
  }

  function handleFileSelect_create(evt) {
    const file = evt.target.files[0];
    console.log('selected file', file);
    const reader = new FileReader();

    reader.onload = function () {
      let arrayBuffer = reader.result;
      context.decodeAudioData(arrayBuffer).then((decodedData) => {
        console.log('the decoded audio data', decodedData);

        // get channel data and downmix to mono
        let cleanData = new Float32Array(decodedData.length);
        const nChannels = decodedData.numberOfChannels;
        let channelData = [];
        for (let chIdx = 0; chIdx < nChannels; chIdx++) {
          channelData.push(decodedData.getChannelData(chIdx));
        }

        for (let bufferIdx = 0; bufferIdx < cleanData.length; bufferIdx++) {
          let mix = 0;
          for (let chIdx = 0; chIdx < nChannels; chIdx++) {
            mix += channelData[chIdx][bufferIdx];
          }
          cleanData[bufferIdx] = mix / nChannels;
        }

        console.log(cleanData);

        // create noise buffers of same length
        const noiseGenerator = createNoiseGenerator(cleanData.length);
        const noiseData = noiseGenerator.brownNoise(-6);

        // mix it like its hot
        const mixData = [];
        for (let bufferIdx = 0; bufferIdx < cleanData.length; bufferIdx++) {
          mixData.push(0.5 * (cleanData[bufferIdx] + noiseData[bufferIdx]));
        }

        console.log(mixData);
        // invent dataformat

        // save
        const dataset = createDataset();
        dataset.addData(cleanData, 'clean');
        dataset.addData(mixData, 'pink_-20dB');
        utils.download(JSON.stringify(dataset.getData()), 'test.data', 'text/plain');

        // reload and test dataset
      });
    };
    reader.readAsArrayBuffer(file);
  }

  function handleFileSelect_load(evt) {
    const file = evt.target.files[0];
    console.log('loading data from', file.name);
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      let res = event.target.result;
      let textByLine = res.split('\n');
      _data = JSON.parse(textByLine);

      console.log(_data);
      let buffer = Float32Array.from(Object.values(_data[1].data));

      const audioBuffer = context.createBuffer(1, buffer.length, context.sampleRate);
      audioBuffer.copyToChannel(buffer, 0, 0);

      audioCtxCtrl = createAudioCtxCtrl(audioBuffer);
    });
    reader.readAsText(file);
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

  return {
    init,
  };
})();

App.init();
