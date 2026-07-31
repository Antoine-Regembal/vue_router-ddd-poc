import type { Device } from '../domain/entities/Device';
import type { DeviceRepository } from '../domain/ports/DeviceRepository.port';

export function createListDevicesUseCase(repository: DeviceRepository) {
  return {
    execute(): Promise<Device[]> {
      return repository.list();
    },
  };
}
