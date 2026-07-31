import { faker } from '@faker-js/faker';

import type { DeviceDto } from '../dtos/DeviceDto';

export class DeviceDtoFactory {
  static create(overrides: Partial<DeviceDto> = {}): DeviceDto {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      serial_number: faker.string.alphanumeric(10).toUpperCase(),
      status: faker.helpers.arrayElement(['active', 'inactive', 'maintenance']),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<DeviceDto> = {}): DeviceDto[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
