<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { getBeneficiaryById } from '../../domain/beneficiaries.data';

const route = useRoute<'/beneficiary/[id]'>();
const beneficiary = computed(() => getBeneficiaryById(route.params.id));
</script>

<template>
  <section v-if="beneficiary">
    <h2>{{ beneficiary.firstName }} {{ beneficiary.lastName }}</h2>
    <p>{{ beneficiary.program }}</p>

    <!-- Nested route layout: everything below is shared across the child
         routes rendered inside <RouterView/> — the actual per-tab content
         (overview / consultations list / new / detail) lives in
         ui/pages/[id]/*.vue. -->
    <nav class="beneficiary-tabs">
      <RouterLink :to="`/beneficiary/${beneficiary.id}`">Overview</RouterLink>
      <RouterLink :to="`/beneficiary/${beneficiary.id}/consultations`">Consultations</RouterLink>
      <RouterLink :to="`/beneficiary/${beneficiary.id}/consultations/new`">+ New consultation</RouterLink>
    </nav>

    <RouterView />
  </section>
  <p v-else>Beneficiary not found</p>
</template>

<style scoped>
.beneficiary-tabs {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}
</style>
