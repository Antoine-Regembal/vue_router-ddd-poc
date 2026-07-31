<script setup lang="ts">
import type { Consultation } from '../../domain/entities/Consultation';

defineProps<{ consultation: Consultation }>();
</script>

<template>
  <article class="consultation-card">
    <h3>{{ consultation.reason }}</h3>
    <p>Status: <strong>{{ consultation.status }}</strong></p>
    <p>{{ new Date(consultation.doneAt).toLocaleDateString() }}</p>
    <p>{{ consultation.notes }}</p>
  </article>
</template>

<style scoped>
.consultation-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
}
</style>
