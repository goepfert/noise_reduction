console.log('hello');

let length = 8;
let buffer = Array.from(Array(length), () => Math.random());
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

//console.log('mag', fft.getMagnitude(buffer));
let mag = fft.getMagnitudeAndPhase(buffer).mag;
let phase = fft.getMagnitudeAndPhase(buffer).phase;
console.log('mag phase mag', mag);
console.log('mag phase phase', phase);

// inverseTransform
console.log('inverse', fft.inverseTransformMagAndPhase(mag, phase));
