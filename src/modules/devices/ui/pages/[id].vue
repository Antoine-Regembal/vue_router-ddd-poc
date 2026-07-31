<script lang="ts">
import { defineColadaLoader } from 'vue-router/experimental/pinia-colada';

import { getDeviceDetail } from '../composables/useDevice';

export const useDeviceLoader = defineColadaLoader('/devices/[id]', {
  key: (to) => ['devices', to.params.id],
  query: (to) => getDeviceDetail.execute(to.params.id),
});
</script>

<script setup lang="ts">
const { data: device, isLoading, error } = useDeviceLoader();
</script>

<template>
  <section>
    <RouterLink to="/devices">&larr; Back to devices</RouterLink>

    <p v-if="isLoading">Loading device…</p>
    <p v-else-if="error">{{ error }}</p>
    <p v-else-if="!device">Device not found</p>
    <template v-else>
      <h2>{{ device.name }}</h2>
      <p>Serial: {{ device.serialNumber }}</p>
      <p>Status: <strong>{{ device.status }}</strong></p>
    </template>
  </section>
</template>
