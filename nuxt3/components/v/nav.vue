<template>
  <div :class="`v-nav v-nav--${props.layout}`">
    <v-defaults-provider
      :defaults="{
        VBtn: { rounded: 0 },
      }"
    >
      <!-- Level 0 -->
      <template v-if="props.deep == 0">
        <!-- Horizontal -->
        <div
          class="d-flex ga-1"
          v-if="props.layout == 'horizontal'"
        >
          <template v-for="(_item, i) in items">
            <v-menu v-bind="{ closeOnContentClick: false, ...props.menuBind }">
              <template #activator="bind">
                <v-btn
                  :text="_item.title"
                  class="text-capitalize"
                  v-bind="{
                    variant: props.variant,
                    ...bind.props,
                    ..._item.bind,
                  }"
                />
              </template>

              <v-nav
                v-bind="{ ...props, layout: 'vertical', items: _item.children }"
              />
            </v-menu>
          </template>
        </div>

        <!-- Vertical -->
        <v-list
          v-else
          class="bg-transparent"
          v-bind="{ variant: 'text', ...props.listBind }"
        >
          <v-nav v-bind="{ ...props, items, deep: props.deep + 1 }" />
        </v-list>
      </template>

      <!-- Level 1+ -->
      <template v-else>
        <template v-for="(_item, i) in items">
          <template v-if="!isObject(_item)">
            <v-divider />
          </template>

          <template v-else-if="_item.children.length > 0">
            <v-list-group v-bind="{ variant: 'text' }">
              <template #activator="bind">
                <v-btn
                  :text="_item.title"
                  class="text-capitalize mb-1"
                  block
                  v-bind="{
                    variant: props.variant,
                    ...bind.props,
                    ..._item.bind,
                  }"
                  :style="{ paddingLeft: props.deep * 10 + 'px' }"
                />
              </template>

              <v-nav
                v-bind="{
                  ...props,
                  items: _item.children,
                  deep: props.deep + 1,
                }"
              />
            </v-list-group>
          </template>

          <template v-else>
            <v-btn
              :text="_item.title"
              class="text-capitalize mb-1"
              block
              v-bind="{ variant: props.variant, ..._item.bind }"
              :style="{ paddingLeft: props.deep * 10 + 'px' }"
            />
          </template>
        </template>
      </template>
    </v-defaults-provider>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
import _ from "lodash";

const props = defineProps({
  items: { type: Array, default: () => [] },
  deep: { type: Number, default: 0 },
  layout: { type: String, default: "vertical" },
  variant: { type: String, default: "text" },
  menuBind: { type: Object, default: () => ({}) },
  listBind: { type: Object, default: () => ({}) },
});

const isObject = (item) => {
  return _.isPlainObject(item);
};

const getItem = (item) => {
  if (!isObject(item)) return item;

  item = {
    title: "",
    to: null,
    icon: null,
    bind: {},
    condition: () => true,
    children: [],
    ...item,
  };

  if (item.children.length > 0) {
    item.bind.appendIcon = "material-symbols:keyboard-arrow-down-rounded";
  }

  if (item.to) item.bind.to = item.to;
  if (item.icon) item.bind.prependIcon = item.icon;
  return item;
};

const items = computed(() => props.items.map(getItem));
</script>

<style>
.v-nav--vertical .v-btn__content {
  flex-grow: 1;
  justify-content: start;
}
</style>
