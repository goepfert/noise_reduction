let length = 8;
// let buffer = Array.from(Array(length), () => 2 * Math.random() - 1);
let buffer = Array.from(Array(length), () => 0);
buffer = buffer.map((val, idx) => {
  return idx;
});

console.log('initial buffer of time domain samples', buffer);

// FFT
console.log('\ncomplex DFT: time domain');
let real = Array.from(buffer);
let imag = Array.from(Array(buffer.length), () => 0);
console.log('timedomain real', real);
console.log('timedomain imag', imag);

console.log('\ncomplex DFT: frequency domain');
const fft = createFFT();
fft.transform(real, imag);

console.log('freqdomain real', real);
console.log('freqdomain imag', imag);

//test
let cp_real = Array.from(real);
let cp_imag = Array.from(imag);

cp_real = cp_real.map((val) => {
  return Math.round((val + Number.EPSILON) * 100) / 100;
});

cp_imag = cp_imag.map((val) => {
  return Math.round((val + Number.EPSILON) * 100) / 100;
});

console.log('round freqdomain real', cp_real);
console.log('round freqdomain imag', cp_imag);

console.log('\ninverse transformation ... scaling missing :(');
fft.inverseTransform(cp_real, cp_imag);
console.log('back timedomain real', cp_real);
console.log('back timedomain imag', cp_imag);

console.log('\n');

// //console.log('mag', fft.getMagnitude(buffer));
let mag = fft.getMagnitudeAndPhase(buffer).mag;
let phase = fft.getMagnitudeAndPhase(buffer).phase;
console.log('mag phase mag', mag);
console.log('mag phase phase', phase);

// inverseTransform
console.log('\nInverse transformation of mag and phase', fft.inverseTransformMagAndPhase(mag, phase));
