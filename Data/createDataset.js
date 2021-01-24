/**
 * Load Clean Data example
 * Add Noise
 * Save Noisy Data
 */

const context = new AudioContext();

const App = (function () {
  let _data = [];

  function init() {
    console.log('init app');

    document.getElementById('files').addEventListener('change', handleFileSelect, false);
  }

  function handleFileSelect(evt) {
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
        const noiseData = noiseGenerator.pinkNoise(-50);

        // mix it like its hot
        const mixData = [];
        for (let bufferIdx = 0; bufferIdx < cleanData.length; bufferIdx++) {
          mixData.push(0.5 * (cleanData[bufferIdx] + noiseData[bufferIdx]));
        }

        console.log(mixData);
        // invent dataformat

        // save
        _data.push({
          label: 'clean',
          data: cleanData,
        });

        _data.push({
          label: 'mix_pinknoise_0dB',
          data: cleanData,
        });

        console.log('saving data:', _data.length);
        utils.download(JSON.stringify(_data), 'test.data', 'text/plain');

        // reload and test dataset
      });
    };
    reader.readAsArrayBuffer(file);
  }

  return {
    init,
  };
})();

App.init();
