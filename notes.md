samplerate = 48 kHz
frame*size = 48 kHz * 0.025 s = 1200
frame*stride = 48 kHz * 0.010 s = 480

fft on frame_size
mag: 1200/2 + 1 = 601
phase: 601

available data: 144000
n Images ~ 144000 / 1200 = 120 (117 :))

## Tensorflow

Input Shape [129,8]
ZeroPadding2D [[4,4],[0,0]]: 4 Top, 4 Bottom, 0 Links, 0 Rechts

Input Shape [137,8]
Conv2D [9,8] stride 1, 18, padding valid
-> Isn't it the same as paddin same w/o zeropadding2d? -> No, output would be [129,8,18]

Input Shape [129,1,18]
Conv2D [5,1] stride 1, 30, padding same (should be zero padding?!)

       .    0
     .      0

0 x1,18
0 x2,18
x1,1 ...
x2,1 x129,18
... 0
x129,1 0
0
0

https://stackoverflow.com/questions/43306323/keras-conv2d-and-input-channels

## Refactor

# Prepare Input Audio

- Read Clean Audio from File
- Mix Noise (ONE type and level)
- TODO: Read Noise from File and Mix
- downsampling etc.
- fills some datastructure audioDataset
- can be saved and loaded again

# Extract Features (from audioDataset)

- getSTFT(timedata, frame_size, frame_stride, windowing)
  - returns mag and phase of overlapping/windowed time domain data
  - abs(mag) ???
- prepares clean and noisy data, the output is overlap-windowed-fft
- save phase at least for noisy audio (for ifft)
- Fills some datastructure imageDataset

# Prepare Input Features (from imageDataset)

- Loops over imageDataset
  - combine 8 segments noisy
  - hop size -> frame_stride !!! (that mean some work after inverse FFT)
  - standardize noisy and clean
    - mean and sigma from noisy data for every 8 segment input window
- extend imageDataset
- imageDataset should contain easy to obtain input(s) for NN
  - training and prediction

# Training


# Prediction
- process imageDataset
  - prediction magnitude
- de-standardize with mean/sigma from noisy segments
- decorate with phase from noisy data (last segment)
- getISTFT(frequency, frame_size, frame_stride, de-windowing)
  - de-windowing
  - de-overlap
- save time domain data
