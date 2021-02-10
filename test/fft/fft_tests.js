console.log('hello');

let length = 8;
let buffer = Array.from(Array(length), () => 2 * Math.random() - 1);
buffer = buffer.map((val, idx) => {
  return idx;
});

console.log(buffer);

// FFT
let real = Array.from(buffer);
let imag = Array.from(Array(buffer.length), () => 0);
console.log('timedomain real', real);
console.log('timedomain imag', imag);

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

console.log('cp freqdomain real', cp_real);
console.log('cp freqdomain imag', cp_imag);

console.log('\n inverse transformation');
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
console.log('inverse', fft.inverseTransformMagAndPhase(mag, phase));
