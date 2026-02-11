import { apiClient } from './client';
import type {
	DeviceList,
	RenameDeviceRequest,
	RenameDeviceResponse,
	TrustDeviceRequest,
	TrustDeviceResponse
} from './types';

export async function listDevices(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<DeviceList> {
	return apiClient<DeviceList>('/devices', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function renameDevice(
	id: string,
	data: RenameDeviceRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RenameDeviceResponse> {
	return apiClient<RenameDeviceResponse>(`/devices/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function removeDevice(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/devices/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function trustDevice(
	id: string,
	data: TrustDeviceRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TrustDeviceResponse> {
	return apiClient<TrustDeviceResponse>(`/devices/${id}/trust`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function untrustDevice(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TrustDeviceResponse> {
	return apiClient<TrustDeviceResponse>(`/devices/${id}/trust`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}
