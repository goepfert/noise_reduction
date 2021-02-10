/*
 * Free FFT and convolution (JavaScript)
 *
 * Copyright (c) 2017 Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/free-small-fft-in-multiple-languages
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */

'use strict';

/*
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This is a wrapper function.
 */

function createFFT() {
  (function init() {
    // TODO: think about precalculting cos/sin tables for n (power of 2) and m
  })();

  function transform(real, imag) {
    var n = real.length;
    if (n != imag.length) throw 'Mismatched lengths';
    if (n == 0) return;
    else if ((n & (n - 1)) == 0)
      // Is power of 2
      transformRadix2(real, imag);
    // More complicated algorithm for arbitrary sizes
    else transformBluestein(real, imag);
  }

  /*
   * Computes the inverse discrete Fourier transform (IDFT) of the given complex vector, storing the result back into the vector.
   * The vector can have any length. This is a wrapper function. This transform does not perform scaling, so the inverse is not a true inverse.
   */
  function inverseTransform(real, imag) {
    transform(imag, real);
  }

  /*
   * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
   * The vector's length must be a power of 2. Uses the Cooley-Tukey decimation-in-time radix-2 algorithm.
   */
  function transformRadix2(real, imag) {
    // Length variables
    var n = real.length;
    if (n != imag.length) throw 'Mismatched lengths';
    if (n == 1)
      // Trivial transform
      return;
    var levels = -1;
    for (var i = 0; i < 32; i++) {
      if (1 << i == n) levels = i; // Equal to log2(n)
    }
    if (levels == -1) throw 'Length is not a power of 2';

    // Trigonometric tables
    var cosTable = new Array(n / 2);
    var sinTable = new Array(n / 2);
    for (var i = 0; i < n / 2; i++) {
      cosTable[i] = Math.cos((2 * Math.PI * i) / n);
      sinTable[i] = Math.sin((2 * Math.PI * i) / n);
    }

    // Bit-reversed addressing permutation
    for (var i = 0; i < n; i++) {
      var j = reverseBits(i, levels);
      if (j > i) {
        var temp = real[i];
        real[i] = real[j];
        real[j] = temp;
        temp = imag[i];
        imag[i] = imag[j];
        imag[j] = temp;
      }
    }

    // Cooley-Tukey decimation-in-time radix-2 FFT
    for (var size = 2; size <= n; size *= 2) {
      var halfsize = size / 2;
      var tablestep = n / size;
      for (var i = 0; i < n; i += size) {
        for (var j = i, k = 0; j < i + halfsize; j++, k += tablestep) {
          var l = j + halfsize;
          var tpre = real[l] * cosTable[k] + imag[l] * sinTable[k];
          var tpim = -real[l] * sinTable[k] + imag[l] * cosTable[k];
          real[l] = real[j] - tpre;
          imag[l] = imag[j] - tpim;
          real[j] += tpre;
          imag[j] += tpim;
        }
      }
    }

    // Returns the integer whose value is the reverse of the lowest 'bits' bits of the integer 'x'.
    function reverseBits(x, bits) {
      var y = 0;
      for (var i = 0; i < bits; i++) {
        y = (y << 1) | (x & 1);
        x >>>= 1;
      }
      return y;
    }
  }

  /*
   * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
   * The vector can have any length. This requires the convolution function, which in turn requires the radix-2 FFT function.
   * Uses Bluestein's chirp z-transform algorithm.
   */
  function transformBluestein(real, imag) {
    // Find a power-of-2 convolution length m such that m >= n * 2 + 1
    var n = real.length;
    if (n != imag.length) throw 'Mismatched lengths';
    var m = 1;
    while (m < n * 2 + 1) m *= 2;

    // Trignometric tables
    var cosTable = new Array(n);
    var sinTable = new Array(n);
    for (var i = 0; i < n; i++) {
      var j = (i * i) % (n * 2); // This is more accurate than j = i * i
      cosTable[i] = Math.cos((Math.PI * j) / n);
      sinTable[i] = Math.sin((Math.PI * j) / n);
    }

    // Temporary vectors and preprocessing
    var areal = newArrayOfZeros(m);
    var aimag = newArrayOfZeros(m);
    for (var i = 0; i < n; i++) {
      areal[i] = real[i] * cosTable[i] + imag[i] * sinTable[i];
      aimag[i] = -real[i] * sinTable[i] + imag[i] * cosTable[i];
    }
    var breal = newArrayOfZeros(m);
    var bimag = newArrayOfZeros(m);
    breal[0] = cosTable[0];
    bimag[0] = sinTable[0];
    for (var i = 1; i < n; i++) {
      breal[i] = breal[m - i] = cosTable[i];
      bimag[i] = bimag[m - i] = sinTable[i];
    }

    // Convolution
    var creal = new Array(m);
    var cimag = new Array(m);
    convolveComplex(areal, aimag, breal, bimag, creal, cimag);

    // Postprocessing
    for (var i = 0; i < n; i++) {
      real[i] = creal[i] * cosTable[i] + cimag[i] * sinTable[i];
      imag[i] = -creal[i] * sinTable[i] + cimag[i] * cosTable[i];
    }
  }

  /*
   * Computes the circular convolution of the given real vectors. Each vector's length must be the same.
   */
  function convolveReal(x, y, out) {
    var n = x.length;
    if (n != y.length || n != out.length) throw 'Mismatched lengths';
    convolveComplex(x, newArrayOfZeros(n), y, newArrayOfZeros(n), out, newArrayOfZeros(n));
  }

  /*
   * Computes the circular convolution of the given complex vectors. Each vector's length must be the same.
   */
  function convolveComplex(xreal, ximag, yreal, yimag, outreal, outimag) {
    var n = xreal.length;
    if (n != ximag.length || n != yreal.length || n != yimag.length || n != outreal.length || n != outimag.length)
      throw 'Mismatched lengths';

    xreal = xreal.slice();
    ximag = ximag.slice();
    yreal = yreal.slice();
    yimag = yimag.slice();
    transform(xreal, ximag);
    transform(yreal, yimag);

    for (var i = 0; i < n; i++) {
      var temp = xreal[i] * yreal[i] - ximag[i] * yimag[i];
      ximag[i] = ximag[i] * yreal[i] + xreal[i] * yimag[i];
      xreal[i] = temp;
    }
    inverseTransform(xreal, ximag);

    for (var i = 0; i < n; i++) {
      // Scaling (because this FFT implementation omits it)
      outreal[i] = xreal[i] / n;
      outimag[i] = ximag[i] / n;
    }
  }

  function newArrayOfZeros(n) {
    var result = [];
    for (var i = 0; i < n; i++) result.push(0);
    return result;
  }

  function getPowerspectrum(buffer) {
    let real = Array.from(buffer);
    let imag = Array.from(Array(buffer.length), () => 0);

    transform(real, imag);

    let powerspec = [];
    for (let idx = 0; idx < buffer.length / 2 + 1; idx++) {
      powerspec[idx] = real[idx] * real[idx] + imag[idx] * imag[idx];
    }

    return powerspec;
  }

  function getMagnitude(buffer) {
    let real = Array.from(buffer);
    let imag = Array.from(Array(buffer.length), () => 0);

    transform(real, imag);

    let mag = [];
    for (let idx = 0; idx < buffer.length / 2 + 1; idx++) {
      mag[idx] = Math.sqrt(real[idx] * real[idx] + imag[idx] * imag[idx]);
    }

    return mag;
  }

  /**
   * transforms time domain signal to frequency domain magnitude and phase
   * I stronly suggest to supply only even length array (need to think more about it ...)
   *
   * @param {array} buffer real part of time domain or just the time domain samples
   * @return {obj} magnitude and phase
   */
  function getMagnitudeAndPhase(buffer) {
    let real = Array.from(buffer);
    let imag = Array.from(Array(buffer.length), () => 0);

    transform(real, imag);

    let mag = [];
    let phase = [];
    for (let idx = 0; idx < buffer.length / 2 + 1; idx++) {
      mag[idx] = Math.sqrt(real[idx] * real[idx] + imag[idx] * imag[idx]);
      phase[idx] = Math.atan2(imag[idx], real[idx]);
    }

    return { mag, phase };
  }

  /**
   * http://www.dspguide.com/ch12/1.htm
   * inverse transformation of getMagnitudeAndPhase(buffer)
   *
   * @param {array} mag magnitude in frequency domain
   * @param {array} phase phase in frequency domain
   * @return {array} time domain signal (or the real part)
   */
  function inverseTransformMagAndPhase(mag, phase) {
    utils.assert(mag.length == phase.length, 'size mismatch of magitude and phase length');

    let real = Array.from(Array((mag.length - 1) * 2), () => 0);
    let imag = Array.from(Array((mag.length - 1) * 2), () => 0);

    const len = mag.length;
    for (let idx = 0; idx < len; idx++) {
      real[idx] = mag[idx] * Math.cos(phase[idx]);
      imag[idx] = mag[idx] * Math.sin(phase[idx]);

      if (idx > 0) {
        real[real.length - idx] = real[idx];
        imag[real.length - idx] = -1 * imag[idx];
      }
    }
    inverseTransform(real, imag);

    // https://www.dsprelated.com/showarticle/800.php,
    // Scaling in Method #1
    return real.map((v) => {
      return v / real.length;
    });
  }

  return {
    transform: transform,
    inverseTransform: inverseTransform,
    getPowerspectrum: getPowerspectrum,
    getMagnitude: getMagnitude,
    getMagnitudeAndPhase,
    inverseTransformMagAndPhase,
  };
}
