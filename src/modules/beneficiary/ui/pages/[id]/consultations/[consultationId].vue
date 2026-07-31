<script lang="ts">
import { defineColadaLoader } from 'vue-router/experimental/pinia-colada';

import { getConsultationDetail } from '@modules/consultations';

export const useConsultationLoader = defineColadaLoader('/beneficiary/[id]/consultations/[consultationId]', {
  key: (to) => ['consultation', to.params.id, to.params.consultationId],
  query: (to) => getConsultationDetail.execute(to.params.id, to.params.consultationId),
});
</script>

<script setup lang="ts">
const { data: consultation, isLoading, error } = useConsultationLoader();
</script>

<template>
  <div>
    <RouterLink to="../">&larr; Back to consultations</RouterLink>

    <p v-if="isLoading">Loading consultation…</p>
    <p v-else-if="error">{{ error }}</p>
    <p v-else-if="!consultation">Consultation not found</p>
    <template v-else>
      <h3>{{ consultation.reason }}</h3>
      <p>Status: <strong>{{ consultation.status }}</strong></p>
      <p>{{ new Date(consultation.doneAt).toLocaleDateString() }}</p>
      <p>{{ consultation.notes }}</p>
    </template>
  </div>
</template>
