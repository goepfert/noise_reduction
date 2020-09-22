/**
 *
 */

'use strict';

function createDataset(img_width, img_height, fraction_validation) {
  let _fraction_validation = fraction_validation;

  const _img_width = img_width;
  const _img_height = img_height;
  let _data = [];
  let _target = [];

  (function init() {})();

  // add image with label to the record
  function addData(data, target) {
    //TODO: check sizes
    _data.push(data);
    _target.push(target);
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
    shuffle(_data, _target);

    // split
    const length = _data.length;
    const split = Math.round((1 - _fraction_validation) * length);
    utils.assert(split != 0, 'dataset too small for splitting');
    utils.assert(split != length, 'dataset too small for splitting');
    //console.log(split);

    let xData_validation = _data.slice(split, length);
    let yData_validation = _target.slice(split, length);
    xData = _data.splice(0, split);
    yData = _target.splice(0, split);

    let xs = tf.tensor3d(xData);
    xs = xs.reshape([xData.length, _img_width, _img_height, 1]);
    let labelstensor = tf.tensor1d(yData, 'int32');
    let ys = tf.oneHot(labelstensor, _inputs.length);
    labelstensor.dispose();

    let xs_validation = tf.tensor3d(xData_validation);
    xs_validation = xs_validation.reshape([xData_validation.length, _img_width, _img_height, 1]);
    labelstensor = tf.tensor1d(yData_validation, 'int32');
    let ys_validation = tf.oneHot(labelstensor, _inputs.length);
    labelstensor.dispose();

    return {
      x: xs,
      y: ys,
      x_validation: xs_validation,
      y_validation: ys_validation,
    };
  }

  function getNumImages(label) {
    let index = _inputs.findIndex((input) => input.label == label);
    utils.assert(index != -1, 'cannot find label');
    return _inputs[index].data.length;
  }

  function getInputs() {
    return _inputs;
  }

  function clearInputs() {
    _inputs = [];
    console.log('clearing inputs');
  }

  function setInputs(inputs) {
    console.log('setting new inputs');
    _inputs = inputs;
    printInfo(_inputs);
  }

  function printInfo() {
    console.log('number of classes:', _inputs.length);
    for (let idx = 0; idx < _inputs.length; idx++) {
      console.log('class idx', idx, ', class label', _inputs[idx].label);
      console.log('number of images in class label', _inputs[idx].data.length);
    }
  }

  return {
    addImage: addImage,
    getData: getData,
    getNumImages: getNumImages,
    getInputs: getInputs,
    clearInputs: clearInputs,
    setInputs: setInputs,
  };
}
