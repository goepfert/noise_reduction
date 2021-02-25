/**
 * uses external plot libs Dygraph
 * DFT of Mic Signal and direct inverse DFT
 *
 */

var graph_div = document.getElementById('div_g1');
var mag_div = document.getElementById('div_g2');
var mag_div2 = document.getElementById('div_g21');
var phase_div = document.getElementById('div_g3');
var inverse_div = document.getElementById('div_g4');

let data1 = [[0, 0]];
let data2 = [[0, 0]];
let data21 = [[0, 0]];
let data3 = [[0, 0]];
let data4 = [[0, 0]];

let graph1 = new Dygraph(graph_div, data1, {
  drawPoints: true,
  showRoller: true,
  valueRange: [-1.0, 1.0],
});

let graph2 = new Dygraph(mag_div, data2, {
  drawPoints: true,
  showRoller: true,
  //logscale: true,
  //valueRange: [1e-2, 100.0],
  valueRange: [-2, 2],
});

let graph21 = new Dygraph(mag_div2, data21, {
  drawPoints: true,
  showRoller: true,
  //logscale: true,
  //valueRange: [1e-2, 100.0],
  valueRange: [-2, 2],
});

let graph3 = new Dygraph(phase_div, data3, {
  drawPoints: true,
  showRoller: true,
  valueRange: [-4, 4],
});

let graph4 = new Dygraph(inverse_div, data4, {
  drawPoints: true,
  showRoller: true,
  valueRange: [-1.0, 1.0],
});

const handleSuccess = function (stream) {
  console.log('handle');
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);

  // Create a ScriptProcessorNode with a bufferSize of 1024 and a single input and output channel
  // 48 kHz sampling rate, 1024 samples => 21.3 ms
  const BUFFERSIZE = 256;
  const processor = context.createScriptProcessor(BUFFERSIZE, 1, 1);

  source.connect(processor);
  processor.connect(context.destination);

  // Prefill arrays
  data1 = [];
  for (let idx = 0; idx < BUFFERSIZE; idx++) {
    data1.push([idx, 0]);
  }

  data2 = [];
  for (let idx = 0; idx < BUFFERSIZE / 2 + 1; idx++) {
    data2.push([idx, 0]);
  }

  data21 = [];
  for (let idx = 0; idx < BUFFERSIZE / 2 + 1; idx++) {
    data21.push([idx, 0]);
  }

  data3 = [];
  for (let idx = 0; idx < BUFFERSIZE / 2 + 1; idx++) {
    data3.push([idx, 0]);
  }

  data4 = [];
  for (let idx = 0; idx < BUFFERSIZE; idx++) {
    data4.push([idx, 0]);
  }

  let invBuffer = Array.from(new Array(BUFFERSIZE), () => 0);

  const fft = createFFT(BUFFERSIZE);

  processor.onaudioprocess = function (e) {
    const inputBuffer = e.inputBuffer;
    const nowBuffering = inputBuffer.getChannelData(0);
    // Plot time series
    nowBuffering.forEach((element, index) => {
      data1[index] = [index, element];
    });

    // Do the Fourier Transformation
    const { mag, phase } = fft.getMagnitudeAndPhase(nowBuffering);

    const mag_copy = mag.slice(0);

    const { mean, sigma } = utils.getMeanAndSigma1D(mag_copy);
    utils.standardize1D(mag_copy, mean, sigma);

    // The magnitude
    mag_copy.forEach((element, index) => {
      data2[index] = [index, element];
    });

    // And phase
    phase.forEach((element, index) => {
      data3[index] = [index, element];
    });

    const mag_copy_copy = mag_copy.slice(0);
    utils.de_standardize1D(mag_copy_copy, mean * 0.8, sigma * 2);
    //utils.de_standardize1D(mag_copy_copy, mean, sigma);

    const mag_copy_copy_copy = mag_copy_copy.slice(0);
    utils.standardize1D(mag_copy_copy_copy, mean, sigma);
    mag_copy_copy_copy.forEach((element, index) => {
      data21[index] = [index, element];
    });

    // Inverse DFT
    invBuffer = fft.inverseTransformMagAndPhase(mag_copy_copy, phase);
    invBuffer.forEach((element, index) => {
      data4[index] = [index, element];
    });

    // The output buffer contains the samples that will be modified and played
    var outputBuffer = e.outputBuffer;

    // Loop through the output channels (in this case there is only one)
    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      var outputData = outputBuffer.getChannelData(channel);
      // Loop through the 4096 samples
      for (var sample = 0; sample < invBuffer.length; sample++) {
        // make output equal to the same as the input
        outputData[sample] = invBuffer[sample];
      }
    }
  };
};

//https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
navigator.mediaDevices
  .getUserMedia({ audio: true, video: false })
  .then(handleSuccess)
  .catch((err) => console.log(err));

let counter = -1;
let drawEveryFrame = 1;
const draw = function () {
  requestAnimationFrame(draw);

  counter++;
  if (counter % drawEveryFrame) {
    return;
  }

  graph1.updateOptions({ file: data1 });
  graph2.updateOptions({ file: data2 });
  graph21.updateOptions({ file: data21 });
  graph3.updateOptions({ file: data3 });
  graph4.updateOptions({ file: data4 });
};

draw();
