import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { PiniaColada } from '@pinia/colada';
import { DataLoaderPlugin } from 'vue-router/experimental';

import './style.css';
import App from './App.vue';
import { router } from './router';

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return;
  }

  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  const app = createApp(App);

  app.use(createPinia());
  app.use(PiniaColada);
  // Must be registered before the router so it can hook into navigation.
  app.use(DataLoaderPlugin, { router });
  app.use(router);

  app.mount('#app');
});
