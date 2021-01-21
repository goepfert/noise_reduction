/**
 * Load Clean Data example
 * Add Noise
 * Save Noisy Data
 */

const context = new AudioContext();

const App = (function () {
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

        // copy to channel
        // downmix to mono

        // create noise buffers of same length
        // mix it like its hot

        // invent dataformat
        // save

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
