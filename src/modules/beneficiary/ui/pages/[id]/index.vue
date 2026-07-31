<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';

import { getBeneficiaryById } from '../../../domain/beneficiaries.data';
import type { Beneficiary } from '../../../domain/entities/Beneficiary';

const route = useRoute<'/beneficiary/[id]/'>();
const found = computed(() => getBeneficiaryById(route.params.id));

// Local reactive copy: this stays an in-memory-only demo interaction, not
// persisted — consistent with the rest of this imaginary module.
const overview = reactive<Beneficiary>({ ...(found.value as Beneficiary) });
watch(found, (value) => {
  if (value) Object.assign(overview, value);
});

function completeSession() {
  overview.sessionCompleted = true;
}
</script>

<template>
  <div v-if="found">
    <h3>Overview</h3>
    <p>Session completed: <strong>{{ overview.sessionCompleted }}</strong></p>
    <button :disabled="overview.sessionCompleted" @click="completeSession">
      Mark session as completed
    </button>
  </div>
</template>
