const path = '../files/model8/predictions/';

const files = [
  {
    title: 'Armbanduhr',
    data: ['Armbanduhr_brown_0dB_clean', 'Armbanduhr_brown_0dB', 'Armbanduhr_brown_0dB_predict'],
  },
];

let audios = [];
let buttons = [];
let isPlaying = false;

const musicContainer = document.getElementById('music-container');

(function (files) {
  files.forEach((obj) => {
    console.log(obj.title);
    musicContainer.innerHTML = `<h2>${obj.title}</h2>\
        <div class="row">\

          <h4 id="title">Clean</h4>\
          <audio src="${path}/${obj.data[0]}.wav" id="audio_${obj.data[0]}"></audio>\
          <button id="play_${obj.data[0]}"><i class="fas fa-play"></i></button>\

          <h4 id="title">Noisy</h4>\
          <audio src="${path}/${obj.data[1]}.wav" id="audio_${obj.data[1]}"></audio>\
          <button id="play_${obj.data[1]}"><i class="fas fa-play"></i></button>\

          <h4 id="title">Denoised</h4>\
          <audio src="${path}/${obj.data[2]}.wav" id="audio_${obj.data[2]}"></audio>\
          <button id="play_${obj.data[2]}"><i class="fas fa-play"></i></button>\
        </div>`;

    audios.push(`audio_${obj.data[0]}`);
    audios.push(`audio_${obj.data[1]}`);
    audios.push(`audio_${obj.data[2]}`);

    buttons.push(`play_${obj.data[0]}`);
    buttons.push(`play_${obj.data[1]}`);
    buttons.push(`play_${obj.data[2]}`);
  });

  buttons.forEach((button, idx) => {
    const elm = document.getElementById(button);
    elm.addEventListener('click', () => {
      console.log('click', audios[idx]);
      if (isPlaying) {
        pause();
      } else {
        play(audios[idx]);
      }
    });
  });
})(files);

function pause() {
  audios.forEach((audioIdx) => {
    const audio = document.getElementById(audioIdx);
    audio.pause();
  });
}

function play(audioIdx) {
  const audio = document.getElementById(audioIdx);
  audio.play();
}
