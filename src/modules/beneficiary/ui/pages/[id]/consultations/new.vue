<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

import { ConsultationForm, useCreateConsultation } from '@modules/consultations';

const route = useRoute<'/beneficiary/[id]/consultations/new'>();
const router = useRouter();
const { mutateAsync, isLoading, error } = useCreateConsultation();

async function onSubmit(payload: { reason: string; notes: string }) {
  await mutateAsync({ beneficiaryId: route.params.id, ...payload });
  router.push(`/beneficiary/${route.params.id}/consultations`);
}
</script>

<template>
  <div>
    <h3>New consultation</h3>
    <ConsultationForm @submit="onSubmit" />
    <p v-if="isLoading">Creating…</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>
