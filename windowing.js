/**
 * numbers found around the web
 * can be generalized for other windowing functions
 *
 * implace
 */

'use strict';

function createWindowing(length) {
  const _LENGTH = length;
  const _WEIGHTS_HAMMING_WINDOW = [];
  const _WEIGHTS_HANNING_WINDOW = [];

  (function init() {
    for (let idx = 0; idx < _LENGTH; idx++) {
      _WEIGHTS_HAMMING_WINDOW[idx] = 0.54 - 0.46 * Math.cos((2 * Math.PI * idx) / (_LENGTH - 1));
      _WEIGHTS_HANNING_WINDOW[idx] = 0.5 - 0.5 * Math.cos((2 * Math.PI * idx) / (_LENGTH - 1));
    }
  })();

  function hamming(buffer) {
    utils.assert(_LENGTH == buffer.length, 'buffer sizes for windowing do not match');

    for (let idx = 0; idx < _LENGTH; idx++) {
      buffer[idx] = buffer[idx] * _WEIGHTS_HAMMING_WINDOW[idx];
    }
  }

  function hanning(buffer) {
    utils.assert(_LENGTH == buffer.length, 'buffer sizes for windowing do not match');

    for (let idx = 0; idx < _LENGTH; idx++) {
      buffer[idx] = buffer[idx] * _WEIGHTS_HANNING_WINDOW[idx];
    }
  }

  return {
    hamming,
    hanning,
  };
}
