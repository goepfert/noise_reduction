/**
 * inspired by https://noisehack.com/generate-noise-web-audio-api/
 * https://github.com/zacharydenton/noise.js/blob/master/noise.js
 *
 * author: Thomas Goepfert
 */

/**
 * some testing code for the record
 *
 * var myArrayBuffer = context.createBuffer(1, context.sampleRate * 20.0, context.sampleRate);
 * const noise = createNoiseGenerator(context.sampleRate * 20.0);
 * myArrayBuffer.copyToChannel(noise.brownNoise(), 0, 0);
 * source.buffer = myArrayBuffer;
 */

'use strict';

function createNoiseGenerator(bufferSize) {
  let buffer = new Float32Array(bufferSize);

  /**
   * 20*Math.log10(RMS) = -14.16
   */
  function pinkNoise(scale) {
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

      buffer[i] *= scale;
    }

    // console.log('scale', scale);

    return buffer;
  }

  function whiteNoise(scale) {
    for (let i = 0; i < bufferSize; i++) {
      buffer[i] = Math.random() * 2 - 1;
      buffer[i] *= scale;
    }

    return buffer;
  }

  function brownNoise(scale) {
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      buffer[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = buffer[i];
      buffer[i] *= 3.5; // (roughly) compensate for gain.
      buffer[i] *= scale;
    }

    return buffer;
  }

  function getRMS() {
    let rms = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms /= bufferSize;
    rms = Math.sqrt(rms);

    return rms;
  }

  return {
    pinkNoise: pinkNoise,
    whiteNoise: whiteNoise,
    brownNoise: brownNoise,
    getRMS: getRMS,
  };
}
