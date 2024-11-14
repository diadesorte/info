<template>
  <div
    style="height: 100vh; background: #ffffff66"
    class="d-flex align-center justify-center"
  >
    <div style="position: relative">
      <img
        v-if="media.selected.gif"
        :src="media.selected.gif"
        style="height: 300px"
        class="rounded"
      />
      <br />
      <v-btn
        block
        color="primary"
        text="Quero ser mais idiota"
        @click="media.load()"
      />
      <template v-for="o in media.hearts">
        <v-icon
          icon="material-symbols:favorite"
          color="red"
          style="position: absolute"
          v-bind="o"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
const fire = useFirebase();

const media = reactive({
  gifs: [
    "7Jq6ufAgpblcm0Ih2z",
    "5k1YMw6J8f0WD3cxmC",
    "5YKiGHlMGBO48",
    "kF2dSGhb3O5NJZnV0A",
    "wDUZZ5jIzw9lkbRJDZ",
    "l2JhOVyjSHGejoXXq",
    "ZwUcNgAeD3pkI",
    "3ohs4yX9rA1MQ8EoCI",
    "3oKIPpn3LuX8qqux2g",
    "VqaEyOIjZuTM4",
    "55vNtXEMxdF13eWa2y",
    "2t9s9v4L62iIFIo7n2",
    "X74dLidP6T8PcsjfbL",
    "jTSlIBuLkXdCL895Fq",
    "H4Qg7Uwis5bvVhkN8m",
  ],
  sounds: [
    "https://www.myinstants.com/media/sounds/baby-laughing-meme.mp3",
    "https://www.myinstants.com/media/sounds/sitcom-laughing-1.mp3",
    "https://www.myinstants.com/media/sounds/cat-laugh-meme-1.mp3",
    "https://www.myinstants.com/media/sounds/ny-video-online-audio-converter.mp3",
    "https://www.myinstants.com/media/sounds/funny_82hiegE.mp3",
    "https://www.myinstants.com/media/sounds/woody-woodpecker-laugh.mp3",
    "https://www.myinstants.com/media/sounds/mexlaugh4.mp3",
    "https://www.myinstants.com/media/sounds/ngakak-laugh-annoying.mp3",
    "https://www.myinstants.com/media/sounds/efeito-jumento.mp3",
    "https://www.myinstants.com/media/sounds/tmpybd9zkua.mp3",
  ],
  hearts: [
    { size: 150, style: { top: -50, left: -30, zIndex: -1 } },
    { size: 100, style: { bottom: -20, right: -80, zIndex: 1 } },
    { size: 100, style: { bottom: 20, left: -120, zIndex: 1 } },
  ],
  selected: {
    gif: null,
    sound: null,
  },
  load() {
    this.selected.gif = this.gifs[Math.floor(Math.random() * this.gifs.length)];
    this.selected.gif = `https://i.giphy.com/${this.selected.gif}.webp`;
    document.body.style = `background:url(${this.selected.gif}) center center;`;
    this.selected.sound =
      this.sounds[Math.floor(Math.random() * this.sounds.length)];
    new Audio(this.selected.sound).play();
  },
});

media.load();

const info = reactive({
  data: {
    ip: null,
    referrer: null,
    place_country: null,
    place_state: null,
    place_city: null,
    place_lat: null,
    place_lng: null,
  },
  async init() {
    info.data.referrer = document.referrer;

    info
      .request("https://api.ipify.org?format=json")
      .then((respIp) => {
        info
          .request(`https://ipapi.co/${respIp.ip}/json/`)
          .then((respIpInfo) => {
            info.data.ip = respIp.ip;
            info.data.place_country = respIpInfo.country_code;
            info.data.place_state = respIpInfo.region;
            info.data.place_city = respIpInfo.city;
            info.data.place_lat = respIpInfo.latitude;
            info.data.place_lng = respIpInfo.longitude;
            info.save();
          })
          .catch((err) => {
            info.save();
          });
      })
      .catch((err) => {
        info.save();
      });
  },
  request(url) {
    return new Promise(async (resolve, reject) => {
      try {
        const resp = await (await fetch(url)).json();
        resolve(resp);
      } catch (err) {
        reject(err);
      }
    });
  },
  async save() {
    fire.firestore.save("visitor", info.data);
  },
});

info.init();
</script>
