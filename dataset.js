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
function createImageDataset() {
  let _data = {
    image: [],
    target: [],
  };

  (function init() {})();

  // add data with label to the record
  function addData(image, target) {
    //TODO: check sizes
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

  return {
    addData,
    getData,
    clearData,
    setData,
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
