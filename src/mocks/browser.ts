import { setupWorker } from 'msw/browser';

import { devicesMockHandlers } from '@modules/devices/mocks';
import { consultationsMockHandlers } from '@modules/consultations/mocks';

// Single worker for the whole app: each module owns its handlers, this
// top-level file (outside src/modules/) is the only place allowed to compose
// them, consuming each module strictly through its dedicated mocks.ts entry
// (never its index.ts — see modules/devices/mocks.ts for why).
export const worker = setupWorker(...devicesMockHandlers, ...consultationsMockHandlers);
