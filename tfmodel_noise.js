/**
 * CNN Model for Noise Reduction
 * https://github.com/daitan-innovation/cnn-audio-denoiser/blob/master/SpeechDenoiserCNN.ipynb
 * Cascade Redundant Convolutional Encoder-Decoder Network, CR-CED
 */

'use strict';

// shape[width, height]
function createNetwork(width, height) {
  const IMAGE_WIDTH = width; // columns
  const IMAGE_HEIGHT = height; // rows

  /**
   * create the network
   */
  function getModel() {
    const model = tf.sequential();
    const IMAGE_CHANNELS = 1; // default

    model.add(
      tf.layers.zeroPadding2d({
        inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
        dataFormat: 'channelsLast',
        padding: [
          [0, 0],
          [4, 4],
        ],
      })
    );

    //- 1 ----------------------------------------------------------

    model.add(
      tf.layers.conv2d({
        kernelSize: [IMAGE_WIDTH, 9],
        padding: 'valid', // this is why I need to pad before
        filters: 18,
        strides: 1,
        activation: 'relu',
        useBias: false,
        kernelInitializer: 'varianceScaling',
      })
    );
    model.add(tf.layers.batchNormalization());

    model.add(
      tf.layers.conv2d({
        kernelSize: [1, 5],
        padding: 'same',
        filters: 30,
        strides: 1,
        activation: 'relu',
        useBias: false,
        kernelInitializer: 'varianceScaling',
      })
    );
    model.add(tf.layers.batchNormalization());

    model.add(
      tf.layers.conv2d({
        kernelSize: [1, 9],
        padding: 'same',
        filters: 8,
        strides: 1,
        activation: 'relu',
        useBias: false,
        kernelInitializer: 'varianceScaling',
      })
    );
    model.add(tf.layers.batchNormalization());

    //- 2 ----------------------------------------------------------

    // model.add(
    //   tf.layers.conv2d({
    //     kernelSize: [1, 9],
    //     padding: "same",
    //     filters: 18,
    //     strides: 1,
    //     activation: "relu",
    //     useBias: false,
    //     kernelInitializer: "varianceScaling",
    //   })
    // );
    // model.add(tf.layers.batchNormalization());

    // model.add(
    //   tf.layers.conv2d({
    //     kernelSize: [1, 5],
    //     padding: "same",
    //     filters: 30,
    //     strides: 1,
    //     activation: "relu",
    //     useBias: false,
    //     kernelInitializer: "varianceScaling",
    //   })
    // );
    // model.add(tf.layers.batchNormalization());

    // model.add(
    //   tf.layers.conv2d({
    //     kernelSize: [1, 9],
    //     padding: "same",
    //     filters: 8,
    //     strides: 1,
    //     activation: "relu",
    //     useBias: false,
    //     kernelInitializer: "varianceScaling",
    //   })
    // );
    // model.add(tf.layers.batchNormalization());

    // //- 3 ----------------------------------------------------------

    // model.add(
    //   tf.layers.conv2d({
    //     kernelSize: [1, 9],
    //     padding: "same",
    //     filters: 18,
    //     strides: 1,
    //     activation: "relu",
    //     useBias: false,
    //     kernelInitializer: "varianceScaling",
    //   })
    // );
    // model.add(tf.layers.batchNormalization());

    // model.add(
    //   tf.layers.conv2d({
    //     kernelSize: [1, 5],
    //     padding: "same",
    //     filters: 30,
    //     strides: 1,
    //     activation: "relu",
    //     useBias: false,
    //     kernelInitializer: "varianceScaling",
    //   })
    // );
    // model.add(tf.layers.batchNormalization());

    // model.add(
    //   tf.layers.conv2d({
    //     kernelSize: [1, 9],
    //     padding: "same",
    //     filters: 8,
    //     strides: 1,
    //     activation: "relu",
    //     useBias: false,
    //     kernelInitializer: "varianceScaling",
    //   })
    // );
    // model.add(tf.layers.batchNormalization());

    // //- 4 ----------------------------------------------------------

    // model.add(
    //   tf.layers.conv2d({
    //     kernelSize: [1, 9],
    //     padding: "same",
    //     filters: 18,
    //     strides: 1,
    //     activation: "relu",
    //     useBias: false,
    //     kernelInitializer: "varianceScaling",
    //   })
    // );
    // model.add(tf.layers.batchNormalization());

    // model.add(
    //   tf.layers.conv2d({
    //     kernelSize: [1, 5],
    //     padding: "same",
    //     filters: 30,
    //     strides: 1,
    //     activation: "relu",
    //     useBias: false,
    //     kernelInitializer: "varianceScaling",
    //   })
    // );
    // model.add(tf.layers.batchNormalization());

    // model.add(
    //   tf.layers.conv2d({
    //     kernelSize: [1, 9],
    //     padding: "same",
    //     filters: 8,
    //     strides: 1,
    //     activation: "relu",
    //     useBias: false,
    //     kernelInitializer: "varianceScaling",
    //   })
    // );
    // model.add(tf.layers.batchNormalization());

    // //- 5 ----------------------------------------------------------

    // model.add(
    //   tf.layers.conv2d({
    //     kernelSize: [1, 9],
    //     padding: "same",
    //     filters: 18,
    //     strides: 1,
    //     activation: "relu",
    //     useBias: false,
    //     kernelInitializer: "varianceScaling",
    //   })
    // );
    // model.add(tf.layers.batchNormalization());

    // model.add(
    //   tf.layers.conv2d({
    //     kernelSize: [1, 5],
    //     padding: "same",
    //     filters: 30,
    //     strides: 1,
    //     activation: "relu",
    //     useBias: false,
    //     kernelInitializer: "varianceScaling",
    //   })
    // );
    // model.add(tf.layers.batchNormalization());

    // model.add(
    //   tf.layers.conv2d({
    //     kernelSize: [1, 9],
    //     padding: "same",
    //     filters: 8,
    //     strides: 1,
    //     activation: "relu",
    //     useBias: false,
    //     kernelInitializer: "varianceScaling",
    //   })
    // );
    // model.add(tf.layers.batchNormalization());

    // //-----------------------------------------------------------

    model.add(tf.layers.dropout({ rate: 0.2 }));

    model.add(
      tf.layers.conv2d({
        kernelSize: [IMAGE_HEIGHT, 1],
        padding: 'same',
        filters: 1,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
      })
    );

    compile_model(model);

    return model;
  }

  function compile_model(model) {
    const optimizer = tf.train.adam();
    model.compile({
      optimizer: optimizer,
      loss: 'meanSquaredError',
      metrics: ['accuracy'],
    });
  }

  // function freezeModelforTransferLearning(model) {
  //   console.log('Freezing feature layers of the model.');
  //   for (let i = 0; i < 5; ++i) {
  //     model.layers[i].trainable = false;
  //   }
  //   compile_model(model);
  // }

  async function train(xs, ys, model) {
    // mhh: Which batch size shall I choose?
    // https://machinelearningmastery.com/gentle-introduction-mini-batch-gradient-descent-configure-batch-size/
    const BATCH_SIZE = 8;
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {
      name: 'Model Training NRed',
      styles: { height: '1000px' },
    };
    //const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);
    const onEpochEnd = tfvis.show.fitCallbacks(container, metrics);

    return model.fit(xs, ys, {
      batchSize: BATCH_SIZE,
      epochs: 10,
      shuffle: true,
      validationSplit: 0.2,
      callbacks: onEpochEnd,
    });
  }

  return {
    getModel: getModel,
    train: train,
    // freezeModelforTransferLearning: freezeModelforTransferLearning,
    compile_model: compile_model,
  };
}
