<script setup lang="ts">
import { beneficiaries } from '../../domain/beneficiaries.data';
</script>

<template>
  <section>
    <h2>Beneficiaries</h2>
    <ul class="beneficiary-list">
      <li v-for="beneficiary in beneficiaries" :key="beneficiary.id">
        <RouterLink :to="`/beneficiary/${beneficiary.id}`">
          {{ beneficiary.firstName }} {{ beneficiary.lastName }} — {{ beneficiary.program }}
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.beneficiary-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
