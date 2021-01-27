/**
 * Audio Context Controller
 *
 * @param opt {'buffer' : AudioBuffer, 'context' : AudioContext, 'loop' : boolean}
 * @return see public return methods
 */

function createAudioCtxCtrl(opt) {
  let options;
  let def_options = {
    loop: true,
  };

  if (opt !== undefined) {
    setOpt(opt);
  } else {
    // argument not passed or undefined
    console.log('gimme options');
  }

  // https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
  function setOpt(opt) {
    options = { ...def_options, ...opt }; //alter, das is geil
  }

  let source = undefined;
  let startedAt = 0;
  let pausedAt = 0;
  let isPlaying = false;

  function play(callback) {
    console.log('- PLAY PAUSE --------------------------------');

    let context = options.context;

    let offset = pausedAt;
    source = context.createBufferSource();
    source.buffer = options.buffer;

    source.connect(context.destination);

    source.start(0, pausedAt);
    source.loop = options.loop;

    startedAt = context.currentTime - offset;
    pausedAt = 0;
    isPlaying = true;

    if (typeof callback === 'function') {
      callback();
      //e.g. some updateAnimationFrame();
    }
  }

  function pause() {
    var elapsed = options.context.currentTime - startedAt;
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
      return options.context.currentTime - startedAt;
    }
    return 0;
  }

  function getDuration() {
    return options.buffer.duration;
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
