// Separate, dev-only entry point — deliberately NOT re-exported from index.ts.
// Keeping mock handlers out of the main public API barrel means real
// consumers (e.g. pages/dashboard.vue) never statically pull in msw/faker
// through a shared module, so they stay out of their production chunk.
export { devicesHandlers as devicesMockHandlers } from './infrastructure/mocks/devices.handlers';
