<template>
  <div>
    <v-fade-transition>
      <div
        class="d-flex align-center justify-center"
        v-if="props.loading"
        style="
          position: fixed;
          top: 0;
          width: 100vw;
          height: 100vh;
          z-index: 99999;
        "
      >
        <div>
          <slot
            name="loading"
            v-bind="slotBind()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 300 150"
              style="width: 150px"
            >
              <path
                fill="none"
                stroke="#74238c"
                stroke-width="15"
                stroke-linecap="round"
                stroke-dasharray="300 385"
                stroke-dashoffset="0"
                d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  calcMode="spline"
                  dur="2"
                  values="685;-685"
                  keySplines="0 0 1 1"
                  repeatCount="indefinite"
                ></animate>
              </path>
            </svg>
          </slot>
        </div>
      </div>
    </v-fade-transition>

    <v-layout
      :style="{ opacity: props.loading ? 0 : 1 }"
      style="transition: all 300ms ease"
    >
      <template v-if="!props.loading">
        <v-navigation-drawer
          v-model="drawer.show"
          :class="{ 'bg-surface-light': !theme?.current?.value?.dark }"
        >
          <slot
            name="drawer"
            v-bind="slotBind()"
          ></slot>
        </v-navigation-drawer>

        <v-app-bar
          :class="{ 'bg-surface-light': !theme?.current?.value?.dark }"
        >
          <v-btn
            icon="solar:hamburger-menu-linear"
            class="d-lg-none"
            @click="drawer.toggle()"
          />
          <slot
            name="header"
            v-bind="slotBind()"
          ></slot>
        </v-app-bar>

        <v-main style="height: 100vh">
          <slot
            name="default"
            v-bind="slotBind()"
          ></slot>
        </v-main>
      </template>
    </v-layout>
  </div>
</template>

<script setup>
import { useTheme } from "vuetify";
const theme = useTheme();

const props = defineProps({
  loading: { type: Boolean, default: false },
  defaultsProvider: { type: Object, default: () => ({}) },
});

const route = useRoute();

const drawer = reactive({
  show: null,
  toggle() {
    drawer.show = !drawer.show;
  },
});

const slotBind = (merge = {}) => {
  return { title: route.meta.title || null, ...merge };
};
</script>
