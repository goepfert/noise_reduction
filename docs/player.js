/**
 * Loads and displays example wav data using html5 audio
 */

const path = 'predictions/';

const files = [
  {
    title: 'Armbanduhr, Brown noise, SNR 0dB',
    data: ['Armbanduhr_brown_0dB_clean', 'Armbanduhr_brown_0dB', 'Armbanduhr_brown_0dB_predict'],
  },
  {
    title: 'Armbanduhr, Honk, SNR 0dB',
    data: ['Armbanduhr_Honk_1_0dB_clean', 'Armbanduhr_Honk_1_0dB', 'Armbanduhr_Honk_1_0dB_predict'],
  },
  {
    title: 'Armbanduhr, Pink noise, SNR 0dB',
    data: ['Armbanduhr_pink_0dB_clean', 'Armbanduhr_pink_0dB', 'Armbanduhr_pink_0dB_predict'],
  },
  {
    title: 'Emirate, Playing children, SNR 0dB',
    data: [
      'Emirate_ChildrenPlaying_1_0dB_clean',
      'Emirate_ChildrenPlaying_1_0dB',
      'Emirate_ChildrenPlaying_1_0dB_predict',
    ],
  },
  {
    title: 'Emirate, Jackhammer, SNR -10dB',
    data: ['Emirate_Jackhammer_1_10dB_clean', 'Emirate_Jackhammer_1_10dB', 'Emirate_Jackhammer_1_10dB_predict'],
  },
  {
    title: 'Hauskatze, Barking dog, SNR 0dB',
    data: ['Hauskatzen_DogBark_2_0dB_clean', 'Hauskatzen_DogBark_2_0dB', 'Hauskatzen_DogBark_2_0dB_predict'],
  },
  {
    title: 'Hauskatzen, Drilling, SNR 0dB',
    data: [
      'Hauskatzen_Schlagbohrer_1_0dB_clean',
      'Hauskatzen_Schlagbohrer_1_0dB',
      'Hauskatzen_Schlagbohrer_1_0dB_predict',
    ],
  },
  {
    title: 'Hauskatzen, Drilling, SNR -10dB',
    data: [
      'Hauskatzen_Schlagbohrer_1_10dB_clean',
      'Hauskatzen_Schlagbohrer_1_10dB',
      'Hauskatzen_Schlagbohrer_1_10dB_predict',
    ],
  },
  {
    title: 'Himbeertorte, Jackhammer, SNR 0dB',
    data: [
      'Himbeertorte_Jackhammer_1_0dB_clean',
      'Himbeertorte_Jackhammer_1_0dB',
      'Himbeertorte_Jackhammer_1_0dB_predict',
    ],
  },
  {
    title: 'Himbeertorte, Street noise, SNR -10dB',
    data: [
      'Himbeertorte_Streetnoise_1_10dB_clean',
      'Himbeertorte_Streetnoise_1_10dB',
      'Himbeertorte_Streetnoise_1_10dB_predict',
    ],
  },
  {
    title: 'Men and woman, Siren, SNR 0dB',
    data: ['ManAndWoman_Siren_1_0dB_clean', 'ManAndWoman_Siren_1_0dB', 'ManAndWoman_Siren_1_0dB_predict'],
  },
  {
    title: 'Men and woman, White noise, SNR 0dB',
    data: ['ManAndWoman_white_0dB_clean', 'ManAndWoman_white_0dB', 'ManAndWoman_white_0dB_predict'],
  },
];

const container = document.getElementById('container');

(function (files) {
  files.forEach((obj) => {
    console.log(obj.title);

    const div = document.createElement('div');
    div.setAttribute('class', 'music-container');

    div.innerHTML = `<h2>${obj.title}</h2>\
          <div class="row player">\
            <span class="title">Clean</span>
            <audio controls loop src="${path}/${obj.data[0]}.wav"></audio>\
          </div>\
          <div class="row player">\
            <span class="title">Noisy</span>
            <audio controls loop src="${path}/${obj.data[1]}.wav"></audio>\
          </div>\
          <div class="row player">\
            <span class="title">Denoised</span>
            <audio controls loop src="${path}/${obj.data[2]}.wav"></audio>\
          </div>\
        `;

    container.appendChild(div);
  });
})(files);
