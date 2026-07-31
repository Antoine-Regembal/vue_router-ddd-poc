<script setup lang="ts">
// Composite page: only imports each module's public API (its index.ts),
// never reaches into a module's domain/application/infrastructure/ui internals.
import { useDeviceList } from '@modules/devices';
import { beneficiaries } from '@modules/beneficiary';

const { devices, loading } = useDeviceList();
</script>

<template>
  <section>
    <h2>Dashboard</h2>

    <article>
      <h3>Devices</h3>
      <p v-if="loading">Loading…</p>
      <p v-else>{{ devices.length }} device(s) registered.</p>
    </article>

    <article>
      <h3>Beneficiaries</h3>
      <p>{{ beneficiaries.length }} beneficiary(ies) registered.</p>
    </article>
  </section>
</template>
