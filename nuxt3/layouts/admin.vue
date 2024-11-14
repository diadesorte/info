<template>
  <div>
    <div
      style="height: 100vh"
      class="d-flex align-center justify-center"
      v-if="!fire.user"
    >
      <div style="width: 400px; max-width: 90vw">
        <v-form @submit.prevent="authLogin.submit()">
          <v-text-field
            label="E-mail"
            v-model="authLogin.data.email"
          />
          <v-text-field
            label="Senha"
            type="password"
            v-model="authLogin.data.password"
          />
          <v-btn
            block
            type="submit"
            text="Login"
            color="primary"
            height="50"
            :loading="authLogin.busy"
          />
        </v-form>
      </div>
    </div>

    <v-app-layout v-if="fire.user">
      <template #drawer="scope">
        <v-nav
          :items="[
            { title: 'Dashboard', to: '/admin' },
            { title: 'Visitor', to: '/admin/visitor' },
          ]"
        />
      </template>

      <template #header="scope">
        <v-spacer />
        <div>{{ fire.user.name }}</div>
        <v-btn
          text="Logout"
          @click="
            async () => {
              await fire.auth.logout();
            }
          "
        />
      </template>

      <template #default="scope">
        <slot name="default"></slot>
      </template>
    </v-app-layout>
  </div>
</template>

<script setup>
const fire = useFirebase();

const authLogin = reactive({
  busy: false,
  data: { email: "", password: "" },
  async submit() {
    this.busy = true;
    await fire.auth.login(this.data);
    this.busy = false;
  },
});

console.log(fire.auth.login);
</script>
