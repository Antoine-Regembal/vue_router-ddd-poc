export interface DeviceDto {
  id: string;
  name: string;
  serial_number: string;
  status: 'active' | 'inactive' | 'maintenance';
}
