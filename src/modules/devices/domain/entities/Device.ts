export type DeviceStatus = 'active' | 'inactive' | 'maintenance';

export interface Device {
  id: string;
  name: string;
  serialNumber: string;
  status: DeviceStatus;
}
