<script setup lang="ts"></script>

<template>
  <nav class="main-nav">
    <RouterLink to="/dashboard">Dashboard</RouterLink>
    <RouterLink to="/devices">Devices</RouterLink>
    <RouterLink to="/devices/settings">Devices settings</RouterLink>
    <RouterLink to="/beneficiary">Beneficiary</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.main-nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

main {
  padding: 1rem;
}
</style>
