/**
 * Load Clean Data example
 * Downsampling to 16 or 8 kHz but still float32
 * TODO: evaluate conversion to Int16
 * Add Noise
 * Save Noisy Data
 * Test: Load Data and Play
 *
 * to be extended:
 * meta data like sample rate, what else is needed?
 * definied set of noise types (pink, white, brown) and gains (e.g. +18, -36 dB in 6 dB steps)
 */

const App = (function () {
  let audioCtxCtrl;

  const samplerate = 8000;
  const dB = -12;
  const noisetype = 'brown';

  let noiseDatabuffer;
  let noiseFilename;

  function init() {
    console.log('init app');
    document.getElementById('file-add-noise').addEventListener('change', handleFileSelect_addNoise, false);

    document
      .getElementById('file-add-noise-from-file-clean')
      .addEventListener('change', handleFileSelect_cleanFile, false);
    document
      .getElementById('file-add-noise-from-file-noise')
      .addEventListener('change', handleFileSelect_noiseFile, false);

    document.getElementById('file-load').addEventListener('change', handleFileSelect_load, false);
    const play_btn = document.getElementById('btn_play_pause');
    play_btn.addEventListener('click', () => {
      playPauseButton(play_btn, audioCtxCtrl);
    });
  }

  /**
   * adds some given noise (dB and noiseType) to the selected file
   */
  function handleFileSelect_addNoise(evt) {
    // only needed for decoding
    const context = new AudioContext();

    const nFiles = evt.target.files.length;
    let promises = [];
    for (let fileIdx = 0; fileIdx < nFiles; fileIdx++) {
      const file = evt.target.files[fileIdx];
      console.log('loading data from', file.name);

      let filePromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          let arrayBuffer = event.target.result;
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

            // Downsampling to samplerate
            cleanData = downsampleBuffer(cleanData, 48000, samplerate);

            // poor man prescaling ...  at least no clipping
            const max1 = Math.abs(Math.min(...cleanData));
            const max2 = Math.max(...cleanData);
            const max = max1 > max2 ? max1 : max2;
            const scale = 1.0 / max;
            console.log(max1, max2, scale);
            cleanData = cleanData.map((val) => {
              return scale * val;
            });

            // create noise buffers of same length
            const noiseGenerator = createNoiseGenerator(cleanData.length);
            let noiseData;

            switch (noisetype) {
              case 'brown':
                noiseData = noiseGenerator.brownNoise(dB);
                break;
              case 'pink':
                noiseData = noiseGenerator.pinkNoise(dB);
                break;
              case 'white':
                noiseData = noiseGenerator.whiteNoise(dB);
                break;
              default:
                utils.assert(false, 'prepareInpuData: no valid noise type');
            }

            // mix it like its hot
            const mixData = [];
            for (let bufferIdx = 0; bufferIdx < cleanData.length; bufferIdx++) {
              mixData.push(0.5 * (cleanData[bufferIdx] + noiseData[bufferIdx]));
            }

            // save
            const dataset = createAudioDataset();
            dataset.addData(cleanData, 'clean');
            dataset.addData(mixData, `${noisetype}_${dB}dB`);

            let filename = file.name.split('.')[0];
            dataset.saveData(`${filename}_${noisetype}_${dB}dB`);
            resolve();
          });
        });
        reader.readAsArrayBuffer(file);
      });

      promises.push(filePromise);
    }

    // wait until all promises came back
    Promise.all(promises).then(() => {
      console.log('finished ...');
    });
  }

  function handleFileSelect_cleanFile(evt) {
    console.log(noiseFilename, noiseDatabuffer);

    utils.assert(noiseDatabuffer != undefined, 'provide valid noise file before');

    const context = new AudioContext();

    const nFiles = evt.target.files.length;
    let promises = [];
    for (let fileIdx = 0; fileIdx < nFiles; fileIdx++) {
      const file = evt.target.files[fileIdx];
      console.log('loading data from', file.name);

      let filePromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          let arrayBuffer = event.target.result;
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

            // Downsampling to samplerate
            cleanData = downsampleBuffer(cleanData, 48000, samplerate);

            // poor man prescaling ...  at least no clipping
            const max1 = Math.abs(Math.min(...cleanData));
            const max2 = Math.max(...cleanData);
            const max = max1 > max2 ? max1 : max2;
            const scale = 1.0 / max;
            console.log(max1, max2, scale);
            cleanData = cleanData.map((val) => {
              return scale * val;
            });

            // create noise buffers of same length

            // mix it like its hot
            const mixData = [];
            const noiseData_length = noiseDatabuffer.length;
            const start = Math.floor(Math.random() * noiseData_length);
            for (let bufferIdx = 0; bufferIdx < cleanData.length; bufferIdx++) {
              mixData.push(0.5 * (cleanData[bufferIdx] + noiseDatabuffer[(start + bufferIdx) % noiseData_length]));
            }

            // save
            const dataset = createAudioDataset();
            dataset.addData(cleanData, 'clean');
            dataset.addData(mixData, `${noiseFilename}`);

            let filename = file.name.split('.')[0];
            dataset.saveData(`${filename}_${noiseFilename}`);
            resolve();
          });
        });
        reader.readAsArrayBuffer(file);
      });

      promises.push(filePromise);
    }
    // wait until all promises came back
    Promise.all(promises).then(() => {
      console.log('finished ...');
    });
  }

  function handleFileSelect_noiseFile(evt) {
    const context = new AudioContext();
    const file = evt.target.files[0];
    console.log('selected file', file);
    const reader = new FileReader();

    noiseFilename = file.name.split('.')[0];

    reader.onload = function () {
      let arrayBuffer = reader.result;
      context.decodeAudioData(arrayBuffer).then((decodedData) => {
        console.log('the decoded audio data', decodedData);

        // get channel data and downmix to mono
        noiseDatabuffer = new Float32Array(decodedData.length);
        const nChannels = decodedData.numberOfChannels;
        let channelData = [];
        for (let chIdx = 0; chIdx < nChannels; chIdx++) {
          channelData.push(decodedData.getChannelData(chIdx));
        }

        for (let bufferIdx = 0; bufferIdx < noiseDatabuffer.length; bufferIdx++) {
          let mix = 0;
          for (let chIdx = 0; chIdx < nChannels; chIdx++) {
            mix += channelData[chIdx][bufferIdx];
          }
          noiseDatabuffer[bufferIdx] = mix / nChannels;
        }

        // Downsampling to samplerate
        noiseDatabuffer = downsampleBuffer(noiseDatabuffer, 48000, samplerate);

        // poor man prescaling ...  at least no clipping
        const max1 = Math.abs(Math.min(...noiseDatabuffer));
        const max2 = Math.max(...noiseDatabuffer);
        const max = max1 > max2 ? max1 : max2;
        const scale = 1.0 / max;
        console.log(max1, max2, scale);
        noiseDatabuffer = noiseDatabuffer.map((val) => {
          return scale * val;
        });
      });
    };
    reader.readAsArrayBuffer(file);
  }

  /**
   * https://github.com/mattdiamond/Recorderjs/issues/186
   * buffer: Float32Array
   */
  function downsampleBuffer(buffer, sampleRate, targetRate) {
    if (targetRate == sampleRate) {
      return buffer;
    }
    if (targetRate > sampleRate) {
      throw 'downsampling rate show be smaller than original sample rate';
    }
    let sampleRateRatio = sampleRate / targetRate;
    let newLength = Math.round(buffer.length / sampleRateRatio);
    let result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      let nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      // Use average value of skipped samples
      let accum = 0,
        count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      // Or you can simply get rid of the skipped samples:
      // result[offsetResult] = buffer[nextOffsetBuffer];
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  // load previously saved data and listen to it
  // !! hardcoded data index
  function handleFileSelect_load(evt) {
    const context = new AudioContext();

    const file = evt.target.files[0];
    console.log('loading data from', file.name);
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      let res = event.target.result;
      let textByLine = res.split('\n');
      _data = JSON.parse(textByLine);

      console.log(_data);
      let buffer = Float32Array.from(Object.values(_data[1].data));

      const audioBuffer = context.createBuffer(1, buffer.length, samplerate); //context.sampleRate);
      audioBuffer.copyToChannel(buffer, 0, 0);

      audioCtxCtrl = createAudioCtxCtrl({
        buffer: audioBuffer,
        context: context,
        loop: true,
      });
    });
    reader.readAsText(file);
  }

  function playPauseButton(btn, audioCtxCtrl) {
    if (typeof audioCtxCtrl === 'undefined') {
      utils.assert(false, 'no Audio Context Controller defined');
    }

    if (audioCtxCtrl.getPlaying()) {
      audioCtxCtrl.pause();
      btn.firstChild.nodeValue = 'Play';
    } else {
      audioCtxCtrl.play(() => {
        console.log('callback');
      });
      btn.firstChild.nodeValue = 'Pause';
      somebool = true;
    }
  }

  return {
    init,
  };
})();

App.init();
