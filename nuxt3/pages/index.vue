<template>
  <div>
    <pre>info: {{ info }}</pre>
  </div>
</template>

<script setup>
const fire = useFirebase();

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
