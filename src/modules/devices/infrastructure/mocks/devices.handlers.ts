import { http, HttpResponse } from 'msw';

import { DeviceDtoFactory } from './DeviceDto.factory';

// Generated once so the list and the detail page stay consistent while browsing.
const devices = DeviceDtoFactory.createMany(8);

export const devicesHandlers = [
  http.get('/api/devices', () => {
    return HttpResponse.json(devices);
  }),

  http.get('/api/devices/:id', ({ params }) => {
    const device = devices.find((d) => d.id === params.id);

    if (!device) {
      return HttpResponse.json({ message: 'Device not found' }, { status: 404 });
    }

    return HttpResponse.json(device);
  }),
];
