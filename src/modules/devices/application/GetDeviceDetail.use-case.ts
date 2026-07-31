import type { Device } from '../domain/entities/Device';
import type { DeviceRepository } from '../domain/ports/DeviceRepository.port';

export function createGetDeviceDetailUseCase(repository: DeviceRepository) {
  return {
    execute(id: string): Promise<Device | null> {
      return repository.getById(id);
    },
  };
}
