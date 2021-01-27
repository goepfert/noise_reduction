/**
 * Noise Reduction Demo
 *
 * https://arxiv.org/pdf/1609.07132.pdf
 *
 * author: Pat Fénis
 */

'use strict';

// Start off by initializing a new context
let context = new AudioContext(); // any reason why not const?

// Global consts
const samplerate = context.sampleRate;
const FRAME_SIZE = samplerate * 0.025; // Frame_time == 25 ms (about 1000 samples @48 kHz)
const FRAME_STRIDE = samplerate * 0.01; // Frame_stride == 10 ms (=> 15 ms overlap)

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
  function init() {
    console.log('initializing app ...');
  }
  // Public methods
  return {
    init: init,
  };
})();

// let's go
App.init();
