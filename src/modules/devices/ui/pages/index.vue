<script lang="ts">
import { defineColadaLoader } from 'vue-router/experimental/pinia-colada';

import { listDevices } from '../composables/useDevice';

// Route-navigation-aware data loading (Pinia Colada cache), as opposed to the
// plain useDeviceList() composable used by pages/dashboard.vue outside of any
// route navigation.
export const useDevicesLoader = defineColadaLoader('/devices/', {
  key: () => ['devices'],
  query: () => listDevices.execute(),
});
</script>

<script setup lang="ts">
import DeviceCard from '../components/DeviceCard.vue';

const { data: devices, isLoading, error } = useDevicesLoader();
</script>

<template>
  <section>
    <h2>Devices</h2>
    <p v-if="isLoading">Loading devices…</p>
    <p v-else-if="error">{{ error }}</p>
    <ul v-else class="device-list">
      <li v-for="device in devices" :key="device.id">
        <RouterLink :to="`/devices/${device.id}`">
          <DeviceCard :device="device" />
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.device-list {
  display: grid;
  gap: 1rem;
  list-style: none;
  padding: 0;
}

.device-list a {
  text-decoration: none;
  color: inherit;
}
</style>
