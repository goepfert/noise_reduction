/**
 * TODO: find more suitable name
 */

'use strict';

const Core = (function () {
  /**
   * calculates magnitudes and phases of fragments of given length and hop size from time domain data
   *
   * @param {function} windowing callback function for windowing
   * @return {object} return an object of two arrays, magitudes and phases
   */
  function getSTFT(timedata, frame_size, frame_stride, windowing) {
    const fft = createFFT(frame_size);
    const availableData = timedata.length;
    let nFrames = utils.getNumberOfFrames(availableData, frame_size, frame_stride);
    console.log('getSTFT: ', availableData, nFrames, frame_size, frame_stride);

    let startPos_frame = 0;
    let endPos_frame = frame_size;

    let magnitudes = [];
    let phases = [];

    while (endPos_frame < availableData) {
      // console.log(startPos_frame, endPos_frame);

      const frame_image = timedata.slice(startPos_frame, endPos_frame);
      windowing(frame_image);
      const { mag, phase } = fft.getMagnitudeAndPhase(frame_image);

      magnitudes.push(mag);
      phases.push(phase);

      startPos_frame += frame_stride;
      endPos_frame = startPos_frame + frame_size;
    }

    return { magnitudes, phases };
  }

  /**
   * Calculates timedomain data from overlapping frequency domain data
   *
   * @return {array} returns timedomain buffer
   */
  function getISTFT(magnitudes, phases, frame_size, frame_stride, de_windowing) {
    utils.assert(magnitudes.length === phases.length, 'Core::getISFT length mismatch');

    const fft = createFFT(frame_size);
    let timedomain_data = [];

    for (let i = 0; i < magnitudes.length; i++) {
      timedomain_data.push(fft.inverseTransformMagAndPhase(magnitudes[i], phases[i][0]));
    }

    //console.log(timedomain_data);

    const tot_length = utils.getSizeOfBuffer(timedomain_data.length, frame_size, frame_stride);
    console.log('total length of time doimain data:', tot_length);

    let time_buffer = [];
    // Loop over
    for (let idx = 0; idx < tot_length; idx++) {
      const indices = getIdxOfContributingArrays(idx, frame_size, frame_stride);
    }
  }

  function getIdxOfContributingArrays(idx, frame_size, frame_stride) {
    let indices = [];
    const max_frames = 100; //to be defined

    // Trivial
    if (idx < frame_stride) {
      indices.push(0);
      return indices;
    }

    // Brute force
    let index = 0;

    while (1) {
      idx++;
    }
  }

  return { getSTFT, getISTFT };
})();
