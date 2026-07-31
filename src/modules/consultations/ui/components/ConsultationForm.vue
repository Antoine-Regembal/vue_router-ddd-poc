<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  submit: [payload: { reason: string; notes: string }];
}>();

const reason = ref('');
const notes = ref('');

function onSubmit() {
  emit('submit', { reason: reason.value, notes: notes.value });
}
</script>

<template>
  <form class="consultation-form" @submit.prevent="onSubmit">
    <label>
      Reason
      <input v-model="reason" type="text" required />
    </label>
    <label>
      Notes
      <textarea v-model="notes" required></textarea>
    </label>
    <button type="submit">Create consultation</button>
  </form>
</template>

<style scoped>
.consultation-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 24rem;
}
</style>
