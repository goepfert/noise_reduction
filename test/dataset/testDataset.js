/**
 * Load Saved Dataset and check what is in there
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
    console.log('loading vad date from', file.name);
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      let res = event.target.result;
      let textByLine = res.split('\n');
      let newInputs = JSON.parse(textByLine);
    });
    //reader.readAsDataURL(file);
    reader.readAsText(file);
  }

  return {
    init,
  };
})();

App.init();
