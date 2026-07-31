<script setup lang="ts">
import type { Device } from '../../domain/entities/Device';

defineProps<{ device: Device }>();
</script>

<template>
  <article class="device-card">
    <h3>{{ device.name }}</h3>
    <p>Serial: {{ device.serialNumber }}</p>
    <p>Status: <strong>{{ device.status }}</strong></p>
  </article>
</template>

<style scoped>
.device-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
}
</style>
