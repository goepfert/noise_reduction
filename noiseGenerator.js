/**
 * Creates float buffers with different kind of noises (white, pink, brown)
 *
 * inspired by
 * https://noisehack.com/generate-noise-web-audio-api/
 * https://github.com/zacharydenton/noise.js/blob/master/noise.js
 *
 * author: Thomas Goepfert
 */

'use strict';

function createNoiseGenerator(bufferSize) {
  let buffer = new Float32Array(bufferSize);

  function pinkNoise(decibels) {
    const linear = utils.decibelsToLinear(decibels);

    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      buffer[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      buffer[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;

      buffer[i] *= linear;
    }

    // console.log('db / linear', decibels, linear);

    return buffer;
  }

  function whiteNoise(decibels) {
    const linear = utils.decibelsToLinear(decibels);

    for (let i = 0; i < bufferSize; i++) {
      buffer[i] = Math.random() * 2 - 1;
      buffer[i] *= linear;
    }

    return buffer;
  }

  function brownNoise(decibels) {
    const linear = utils.decibelsToLinear(decibels);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      buffer[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = buffer[i];
      buffer[i] *= 3.5; // (roughly) compensate for gain.
      buffer[i] *= linear;
    }

    return buffer;
  }

  return {
    pinkNoise: pinkNoise,
    whiteNoise: whiteNoise,
    brownNoise: brownNoise,
  };
}
