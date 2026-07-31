import type { Device } from '../entities/Device';

export interface DeviceRepository {
  list(): Promise<Device[]>;
  getById(id: string): Promise<Device | null>;
}
