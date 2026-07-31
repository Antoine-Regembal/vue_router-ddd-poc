import { setupWorker } from 'msw/browser';

import { devicesHandlers } from './devices.handlers';

export const worker = setupWorker(...devicesHandlers);
