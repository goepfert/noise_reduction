/**
 * TODO: find more suitable name
 */

'use strict';

const Core = (function () {
  /**
   * calculates magnitudes and phases of fragments of given length and hops from time domain data
   *
   * @param {function} windowing callback function for windowing
   */
  function getSTFT(timedata, frame_size, frame_stride, windowing) {
    const availableData = timedata.length;
    let nFrames = utils.getNumberOfFrames(availableData, frame_size, frame_stride);
    let startPos_frame = 0;
    let endPos_frame = 0;
    console.log('getSTFT: ', availableData, nFrames);

    let buffer = [1, 2, 3, 4, 5];
    windowing(buffer);
  }

  return { getSTFT };
})();
