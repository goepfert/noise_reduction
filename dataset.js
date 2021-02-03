/**
 * dataset handler
 *
 * TODO:
 * getter for tensor objects for feeding into tensorflow
 * but before I need to think about what I really want to save (pcm, fft)
 */

"use strict";

/**
 * for image data as imput for machine learning
 */
function createImageDataset(img_width, img_height, target_height) {
  let _img_width = img_width;
  let _img_height = img_height;
  let _target_height = target_height;

  let _data = {
    image: [],
    target: [],
  };

  (function init() {})();

  // add data with label to the record
  function addData(image, target) {
    let img_width = image.length;
    if (_img_width != undefined) {
      utils.assert(img_width == _img_width, "image size mismatch: width");
    } else {
      _img_width = img_width;
    }

    let img_height = image[0].length;
    if (_img_height != undefined) {
      utils.assert(img_height == _img_height, "image size mismatch: height");
    } else {
      _img_height = img_height;
    }

    let target_height = target[0].length;
    if (_target_height != undefined) {
      utils.assert(target_height == _target_height, "target size mismatch: height");
    } else {
      _target_height = target_height;
    }

    _data.image.push(image);
    _data.target.push(target);
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
    console.log("clearing data");
    _data = {
      image: [],
      target: [],
    };
  }

  function setData(data) {
    _data = data;
    printInfo(_data);
  }

  function printInfo() {
    console.log("length:", _data.length);
  }

  function getTrainingData() {
    console.log(_img_width, _img_height, _target_height);

    let xData = _data.image;
    let yData = _data.target;

    console.log(xData);
    console.log(yData);

    let xs = tf.tensor3d(xData);
    xs = xs.reshape([xData.length, _img_width, _img_height, 1]);

    let ys = tf.tensor3d(yData);
    ys = ys.reshape([yData.length, 1, _target_height, 1]);

    return { xs, ys };
  }

  return {
    addData,
    getData,
    clearData,
    setData,
    getTrainingData,
  };
}

/**
 * for audio dataset of clean and noisy sound
 */
function createSoundDataset() {
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
    console.log("clearing data");
    _data = [];
  }

  function setData(data) {
    _data = data;
    printInfo(_data);
  }

  function printInfo() {
    console.log("length:", _data.length);
  }

  return {
    addData,
    getData,
    clearData,
    setData,
  };
}
