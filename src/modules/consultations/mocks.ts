// Separate, dev-only entry point — deliberately NOT re-exported from index.ts.
// See modules/devices/mocks.ts for why this stays out of the main barrel.
export { consultationsHandlers as consultationsMockHandlers } from './infrastructure/mocks/consultations.handlers';
