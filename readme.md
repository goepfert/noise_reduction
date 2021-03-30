# Noise Reduction Demo

Demonstrator project for noise reduction on speech audio data using machine learning. This project tries to use the same technique as described in this paper - [A Fully Convolutional Neural Network for Speech Enhancement](https://arxiv.org/pdf/1609.07132.pdf). Here, the authors propose the Cascaded Redundant Convolutional Encoder-Decoder Network.

In contrast to classical autoencoders a Redundant Convolutional Encoder-Decoder (R-CED) network is used that encodes the features into higher dimension along the encoder an achieves compression along the decoder. The number of filters are kept symmetric: at the encoder, the number of filters are gradually increased, and at the decoder, the number of filters are gradually decreased. The Cascaded Redundant Convolutional Encoder-Decoder Network (CR-CED) that is used here is a variation of this Redundant Network. It consists of repetitions of R-CED Networks which achieves better performance with less convergence time.

The while procedure is also nicely described in this [blog post](https://betterprogramming.pub/how-to-build-a-deep-audio-de-noiser-using-tensorflow-2-0-79c1c1aea299) which also refers to the mentioned paper. If you are really interested you should read this post. If I would try to describe what I have done and why, I would only repeat what is already written there (and probably much better than I can do).

## Technologies

Short summary of the used techniques
- (Cascaded Redundant) Convolutional Encoder-Decoder Network built with Tensorflow.js
- Short Time Fourier Transform
- Web Audio API
- Based on vanilla javascript (no librosa ...) + some html and css

## Dataset

For the problem of speech denoising, I used examples from two popular publicly available audio datasets:
- [The Mozilla Common Voice (MCV)](https://commonvoice.mozilla.org/)
- [The UrbanSound8K dataset](https://urbansounddataset.weebly.com/urbansound8k.html)

As you might be imagining, the urban sounds are used as noise signals to the speech examples. In addition, generated data (white, pink and brown noise) is used as background noise. The list of used backgrounds includes:
- Barking Dog
- Honk (car horn)
- Jackhammer
- Drilling
- Siren
- Playing Children
- Street Noise
- White, Pink and Brown Noise

I believe that this is a pretty good mixture of background noise types. 


## Result

Checkout some selected results here in the [Demo](https://goepfert.github.io/noise_reduction/). 

The training was done with five different speech examples, each combined with all listed noise types at 0 dB signal-to-noise ratio. The training itself took a couple of hours on my desktop PC with a *mid-end* graphic card. Note that the example data was also used in the training phase (at least for 0 dB SNR but not for lower SNR values).

Probably one can achieve better results by using more data or fine-tune of parameters. In addition the mixing of clean and background data can be improved. But since I'm pretty happy with the result I'll stop this project by now. 