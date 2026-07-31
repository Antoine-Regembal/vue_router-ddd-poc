import type { Device } from '../domain/entities/Device';
import type { DeviceRepository } from '../domain/ports/DeviceRepository.port';
import type { DeviceDto } from './dtos/DeviceDto';

function mapDtoToDevice(dto: DeviceDto): Device {
  return {
    id: dto.id,
    name: dto.name,
    serialNumber: dto.serial_number,
    status: dto.status,
  };
}

export class HttpDeviceRepository implements DeviceRepository {
  async list(): Promise<Device[]> {
    const response = await fetch('/api/devices');
    const dtos = (await response.json()) as DeviceDto[];
    return dtos.map(mapDtoToDevice);
  }

  async getById(id: string): Promise<Device | null> {
    const response = await fetch(`/api/devices/${id}`);
    if (response.status === 404) {
      return null;
    }
    const dto = (await response.json()) as DeviceDto;
    return mapDtoToDevice(dto);
  }
}
