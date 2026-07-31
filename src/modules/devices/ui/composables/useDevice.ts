import { ref, watchEffect, type Ref } from 'vue';

import { createGetDeviceDetailUseCase } from '../../application/GetDeviceDetail.use-case';
import { createListDevicesUseCase } from '../../application/ListDevices.use-case';
import type { Device } from '../../domain/entities/Device';
import { HttpDeviceRepository } from '../../infrastructure/HttpDeviceRepository';

const repository = new HttpDeviceRepository();

// Exported so the defineColadaLoader() calls in ui/pages/*.vue can reuse the
// same use-cases instead of instantiating their own repository.
export const listDevices = createListDevicesUseCase(repository);
export const getDeviceDetail = createGetDeviceDetailUseCase(repository);

export function useDeviceList() {
  const devices = ref<Device[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  listDevices
    .execute()
    .then((result) => {
      devices.value = result;
    })
    .catch(() => {
      error.value = 'Unable to load devices';
    })
    .finally(() => {
      loading.value = false;
    });

  return { devices, loading, error };
}

export function useDevice(id: Ref<string>) {
  const device = ref<Device | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  watchEffect(() => {
    loading.value = true;
    error.value = null;

    getDeviceDetail
      .execute(id.value)
      .then((result) => {
        device.value = result;
        if (!result) {
          error.value = `Device ${id.value} not found`;
        }
      })
      .catch(() => {
        error.value = 'Unable to load device';
      })
      .finally(() => {
        loading.value = false;
      });
  });

  return { device, loading, error };
}
