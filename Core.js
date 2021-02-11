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

  return { getSTFT };
})();
