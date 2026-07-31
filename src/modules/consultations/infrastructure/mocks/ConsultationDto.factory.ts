import { faker } from '@faker-js/faker';

import type { ConsultationDto } from '../dtos/ConsultationDto';

export class ConsultationDtoFactory {
  static create(overrides: Partial<ConsultationDto> = {}): ConsultationDto {
    return {
      id: faker.string.uuid(),
      beneficiary_id: faker.string.uuid(),
      status: faker.helpers.arrayElement(['in_progress', 'done']),
      reason: faker.lorem.sentence(4),
      notes: faker.lorem.sentence(10),
      done_at: faker.date.recent({ days: 60 }).toISOString(),
      ...overrides,
    };
  }

  static createMany(
    count: number,
    overrides: Partial<ConsultationDto> = {}
  ): ConsultationDto[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
