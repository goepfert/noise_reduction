/**
 * Dataset handlers for image and audio data
 */

'use strict';

/**
 * Image data as imput for machine learning
 * Every index contains data belonging together
 */
function createImageDataset(img_width, img_height, target_height) {
  let _img_width = img_width;
  let _img_height = img_height;
  let _target_height = target_height;

  let _data = {
    image_magnitude: [],
    image_phase: [],
    target_magnitude: [],
  };

  // Add data with label to the record
  // Mean and Sigma calculated on the fly and pushed to the dataset
  function addData(image_magnitude, image_phase, target_magnitude) {
    let img_width = image_magnitude.length;
    if (_img_width != undefined) {
      utils.assert(img_width == _img_width, 'image size mismatch: width');
    } else {
      _img_width = img_width;
    }

    let img_height = image_magnitude[0].length;
    if (_img_height != undefined) {
      utils.assert(img_height == _img_height, 'image size mismatch: height');
    } else {
      _img_height = img_height;
    }

    let target_height = target_magnitude[0].length;
    if (_target_height != undefined) {
      utils.assert(target_height == _target_height, 'target size mismatch: height');
    } else {
      _target_height = target_height;
    }

    _data.image_magnitude.push(image_magnitude);
    _data.image_phase.push(image_phase);
    _data.target_magnitude.push(target_magnitude);
  }

  // shuffles to objects and preserve their relation
  function shuffle(obj1, obj2) {
    let index = obj1.length;
    let rnd, tmp1, tmp2;

    while (index) {
      rnd = Math.floor(Math.random() * index);
      index -= 1;
      tmp1 = obj1[index];
      tmp2 = obj2[index];
      obj1[index] = obj1[rnd];
      obj2[index] = obj2[rnd];
      obj1[rnd] = tmp1;
      obj2[rnd] = tmp2;
    }
  }

  function getData() {
    return _data;
  }

  function clearData() {
    console.log('clearing data');
    _data = {
      image_magnitude: [],
      image_phase: [],
      target_magnitude: [],
    };
  }

  function setData(data) {
    _data = data;
    printInfo(_data);
  }

  function printInfo() {
    console.log('length:', _data.length);
  }

  // Returns the content of the imageDataset as Tensors
  function getTrainingData() {
    const xs = get_xData();
    const ys = get_yData();

    return { xs, ys };
  }

  function getPredictionData() {
    const xs = get_xData();

    return xs;
  }

  function get_xData() {
    // should be array of 2d arrays
    let xData = _data.image_magnitude;
    let xs = tf.tensor3d(xData);
    xs = xs.reshape([xData.length, _img_width, _img_height, 1]);
    return xs;
  }

  function get_yData() {
    // should be array of 2d arrays (but length is one)
    let yData = _data.target_magnitude;
    let ys = tf.tensor3d(yData);
    ys = ys.reshape([yData.length, 1, _target_height, 1]);

    return ys;
  }

  return {
    addData,
    getData,
    clearData,
    setData,
    getTrainingData,
    getPredictionData,
  };
}

/**
 * for audio dataset of clean and noisy sound
 * nothing special done here, just save some labled data
 */
function createAudioDataset() {
  let _data = [];

  (function init() {})();

  // add data with label to the record
  function addData(data, label) {
    //TODO: check sizes

    _data.push({
      label,
      data,
    });
  }

  function getData() {
    return _data;
  }

  function clearData() {
    console.log('clearing audioDataset');
    _data = [];
  }

  function setData(data) {
    _data = data;
    printInfo(_data);
  }

  function saveData(filename) {
    let _filename = 'test.data';

    if (filename !== undefined) {
      _filename = filename;
    }

    utils.download(JSON.stringify(_data), _filename, 'text/plain');
  }

  function printInfo() {
    console.log('length:', _data.length);
    if (_data.length >= 0) {
      console.log('data length', Object.keys(_data[0].data).length);
    }
  }

  return {
    addData,
    getData,
    clearData,
    setData,
    saveData,
    printInfo,
  };
}
