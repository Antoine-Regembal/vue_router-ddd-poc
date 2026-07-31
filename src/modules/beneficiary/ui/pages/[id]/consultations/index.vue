<script lang="ts">
import { defineColadaLoader } from 'vue-router/experimental/pinia-colada';

import { listConsultationsForBeneficiary } from '@modules/consultations';

export const useConsultationsLoader = defineColadaLoader('/beneficiary/[id]/consultations/', {
  key: (to) => ['consultations', to.params.id],
  query: (to) => listConsultationsForBeneficiary.execute(to.params.id),
});
</script>

<script setup lang="ts">
import { useRoute } from 'vue-router';

import { ConsultationCard } from '@modules/consultations';

const route = useRoute<'/beneficiary/[id]/consultations/'>();
const { data: consultations, isLoading, error } = useConsultationsLoader();
</script>

<template>
  <div>
    <h3>Consultations</h3>
    <p v-if="isLoading">Loading consultations…</p>
    <p v-else-if="error">{{ error }}</p>
    <p v-else-if="!consultations.length">No consultation yet.</p>
    <ul v-else class="consultation-list">
      <li v-for="consultation in consultations" :key="consultation.id">
        <RouterLink :to="`/beneficiary/${route.params.id}/consultations/${consultation.id}`">
          <ConsultationCard :consultation="consultation" />
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.consultation-list {
  display: grid;
  gap: 1rem;
  list-style: none;
  padding: 0;
}

.consultation-list a {
  text-decoration: none;
  color: inherit;
}
</style>
