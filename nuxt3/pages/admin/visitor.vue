<template>
  <nuxt-layout name="admin">
    <v-container max-width="1000">
      <v-card :loading="visitorSearch.busy">
        <v-table>
          <thead>
            <tr>
              <th>IP</th>
              <th>Referrer</th>
              <th>Place</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="o in visitorSearch.response.data">
              <tr>
                <td>{{ o.ip }}</td>
                <td>{{ o.referrer }}</td>
                <td>
                  <div>{{ o.place_city }}</div>
                  <div>{{ o.place_state }}</div>
                </td>
              </tr>
            </template>
          </tbody>
        </v-table>
      </v-card>
    </v-container>
  </nuxt-layout>
</template>

<script setup>
const fire = useFirebase();

const visitorSearch = reactive({
  busy: false,
  response: { data: [] },
  query: {},
  async submit() {
    this.busy = true;
    this.response = await fire.firestore.search("visitor", this.query);
    this.busy = false;
  },
});

visitorSearch.submit();

definePageMeta({
  title: "Visitantes",
});
</script>
