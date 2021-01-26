/**
 * dataset handler
 *
 * TODO:
 * getter for tensor objects for feeding into tensorflow
 * but before I need to think about what I really want to save (pcm, fft)
 */

'use strict';

function createDataset() {
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
    _data = [];
    console.log('clearing data');
  }

  function setData(data) {
    _data = data;
    printInfo(_data);
  }

  function printInfo() {
    console.log('length:', _data.length);
  }

  return {
    addData,
    getData,
    clearData,
    setData,
  };
}
