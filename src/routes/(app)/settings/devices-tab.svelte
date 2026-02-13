<script lang="ts">
	import { Monitor, Smartphone, Tablet, Globe, Pencil, Trash2, Shield, ShieldOff, ChevronDown } from 'lucide-svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { deviceRenameSchema } from '$lib/schemas/settings';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { DeviceInfo, DeviceList } from '$lib/api/types';

	let devices = $state<DeviceInfo[]>([]);
	let loading = $state(true);
	let error = $state('');

	// Rename dialog state
	let renameDialogOpen = $state(false);
	let renameDeviceId = $state('');
	let renameDeviceName = $state('');
	let renameError = $state('');
	let renameSubmitting = $state(false);

	// Trust dialog state
	let trustDialogOpen = $state(false);
	let trustDeviceId = $state('');
	let trustDuration = $state('30');
	let trustSubmitting = $state(false);

	// Untrust confirm dialog state
	let untrustDialogOpen = $state(false);
	let untrustDeviceId = $state('');
	let untrustSubmitting = $state(false);

	// Remove confirm dialog state
	let removeDialogOpen = $state(false);
	let removeDeviceId = $state('');
	let removeSubmitting = $state(false);

	const trustDurationOptions = [
		{ value: '7', label: '7 days' },
		{ value: '14', label: '14 days' },
		{ value: '30', label: '30 days' },
		{ value: '90', label: '90 days' },
		{ value: '365', label: '365 days' },
		{ value: '0', label: 'Permanent' }
	];

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return 'N/A';
		return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function getDeviceIcon(deviceType: string | null) {
		switch (deviceType) {
			case 'desktop':
				return Monitor;
			case 'mobile':
				return Smartphone;
			case 'tablet':
				return Tablet;
			default:
				return Globe;
		}
	}

	async function fetchDevices() {
		loading = true;
		error = '';
		try {
			const response = await fetch('/api/devices');
			if (!response.ok) {
				const data = await response.json().catch(() => null);
				error = (data as Record<string, unknown> | null)?.message?.toString() ?? 'Failed to load devices';
				return;
			}
			const data = (await response.json()) as DeviceList;
			devices = data.items;
		} catch {
			error = 'An unexpected error occurred while loading devices.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		fetchDevices();
	});

	// Rename handlers
	function openRenameDialog(device: DeviceInfo) {
		renameDeviceId = device.id;
		renameDeviceName = device.device_name ?? '';
		renameError = '';
		renameDialogOpen = true;
	}

	async function handleRename() {
		renameError = '';
		const parsed = deviceRenameSchema.safeParse({ device_name: renameDeviceName });
		if (!parsed.success) {
			renameError = parsed.error.issues[0]?.message ?? 'Invalid device name';
			return;
		}

		renameSubmitting = true;
		try {
			const response = await fetch(`/api/devices/${renameDeviceId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ device_name: parsed.data.device_name })
			});
			if (!response.ok) {
				const data = await response.json().catch(() => null);
				renameError = (data as Record<string, unknown> | null)?.message?.toString() ?? 'Failed to rename device';
				return;
			}
			addToast('success', 'Device renamed successfully');
			renameDialogOpen = false;
			await fetchDevices();
		} catch {
			renameError = 'An unexpected error occurred.';
		} finally {
			renameSubmitting = false;
		}
	}

	// Trust handlers
	function openTrustDialog(device: DeviceInfo) {
		trustDeviceId = device.id;
		trustDuration = '30';
		trustDialogOpen = true;
	}

	async function handleTrust() {
		trustSubmitting = true;
		try {
			const durationDays = parseInt(trustDuration, 10);
			const body: Record<string, unknown> = {};
			if (durationDays > 0) {
				body.trust_duration_days = durationDays;
			}
			const response = await fetch(`/api/devices/${trustDeviceId}/trust`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				const data = await response.json().catch(() => null);
				addToast('error', (data as Record<string, unknown> | null)?.message?.toString() ?? 'Failed to trust device');
				return;
			}
			addToast('success', 'Device trusted successfully');
			trustDialogOpen = false;
			await fetchDevices();
		} catch {
			addToast('error', 'An unexpected error occurred.');
		} finally {
			trustSubmitting = false;
		}
	}

	// Untrust handlers
	function openUntrustDialog(device: DeviceInfo) {
		untrustDeviceId = device.id;
		untrustDialogOpen = true;
	}

	async function handleUntrust() {
		untrustSubmitting = true;
		try {
			const response = await fetch(`/api/devices/${untrustDeviceId}/trust`, {
				method: 'DELETE'
			});
			if (!response.ok) {
				const data = await response.json().catch(() => null);
				addToast('error', (data as Record<string, unknown> | null)?.message?.toString() ?? 'Failed to untrust device');
				return;
			}
			addToast('success', 'Device untrusted successfully');
			untrustDialogOpen = false;
			await fetchDevices();
		} catch {
			addToast('error', 'An unexpected error occurred.');
		} finally {
			untrustSubmitting = false;
		}
	}

	// Remove handlers
	function openRemoveDialog(device: DeviceInfo) {
		removeDeviceId = device.id;
		removeDialogOpen = true;
	}

	async function handleRemove() {
		removeSubmitting = true;
		try {
			const response = await fetch(`/api/devices/${removeDeviceId}`, {
				method: 'DELETE'
			});
			if (!response.ok) {
				const data = await response.json().catch(() => null);
				addToast('error', (data as Record<string, unknown> | null)?.message?.toString() ?? 'Failed to remove device');
				return;
			}
			addToast('success', 'Device removed');
			removeDialogOpen = false;
			await fetchDevices();
		} catch {
			addToast('error', 'An unexpected error occurred.');
		} finally {
			removeSubmitting = false;
		}
	}

	let selectedDurationLabel = $derived(
		trustDurationOptions.find((o) => o.value === trustDuration)?.label ?? '30 days'
	);
</script>

{#if loading}
	<div class="space-y-4">
		{#each [1, 2, 3] as _}
			<Card>
				<CardContent class="p-6">
					<div class="flex items-center gap-4">
						<div class="h-10 w-10 animate-pulse rounded-lg bg-muted"></div>
						<div class="flex-1 space-y-2">
							<div class="h-4 w-48 animate-pulse rounded bg-muted"></div>
							<div class="h-3 w-32 animate-pulse rounded bg-muted"></div>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
{:else if error}
	<Card>
		<CardContent class="py-8 text-center">
			<p class="text-destructive">{error}</p>
			<Button variant="outline" class="mt-4" onclick={fetchDevices}>Try again</Button>
		</CardContent>
	</Card>
{:else if devices.length === 0}
	<Card>
		<CardContent class="py-12 text-center">
			<Globe class="mx-auto h-12 w-12 text-muted-foreground" />
			<h3 class="mt-4 text-lg font-semibold">No devices found</h3>
			<p class="mt-1 text-sm text-muted-foreground">
				Devices will appear here once you sign in from different browsers or devices.
			</p>
		</CardContent>
	</Card>
{:else}
	<div class="space-y-4">
		{#each devices as device (device.id)}
			{@const DeviceIcon = getDeviceIcon(device.device_type)}
			<Card>
				<CardContent class="p-6">
					<div class="flex items-start gap-4">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
							<DeviceIcon class="h-5 w-5 text-muted-foreground" />
						</div>

						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<h3 class="truncate text-sm font-semibold">
									{device.device_name ?? 'Unknown device'}
								</h3>
								<button
									class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
									onclick={() => openRenameDialog(device)}
									aria-label="Rename device"
								>
									<Pencil class="h-3.5 w-3.5" />
								</button>
								{#if device.is_current}
									<span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
										Current device
									</span>
								{/if}
							</div>

							<p class="mt-0.5 text-sm text-muted-foreground">
								{#if device.browser}
									{device.browser}{device.browser_version ? ` ${device.browser_version}` : ''}
								{/if}
								{#if device.browser && device.os}
									{' on '}
								{/if}
								{#if device.os}
									{device.os}{device.os_version ? ` ${device.os_version}` : ''}
								{/if}
								{#if !device.browser && !device.os}
									Unknown browser
								{/if}
							</p>

							<div class="mt-2 flex flex-wrap items-center gap-2">
								{#if device.is_trusted}
									<span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
										Trusted
									</span>
									<span class="text-xs text-muted-foreground">
										{#if device.trust_expires_at}
											Expires {formatDate(device.trust_expires_at)}
										{:else}
											Permanently
										{/if}
									</span>
								{:else}
									<span class="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
										Untrusted
									</span>
								{/if}
							</div>

							<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
								<span>{device.login_count} login{device.login_count === 1 ? '' : 's'}</span>
								<span>First seen {formatDate(device.first_seen_at)}</span>
								<span>Last seen {formatDate(device.last_seen_at)}</span>
							</div>
						</div>

						<div class="flex shrink-0 items-center gap-1">
							{#if device.is_trusted}
								<Button
									variant="outline"
									size="sm"
									onclick={() => openUntrustDialog(device)}
								>
									<ShieldOff class="mr-1.5 h-3.5 w-3.5" />
									Untrust
								</Button>
							{:else}
								<Button
									variant="outline"
									size="sm"
									onclick={() => openTrustDialog(device)}
								>
									<Shield class="mr-1.5 h-3.5 w-3.5" />
									Trust device
								</Button>
							{/if}
							<Button
								variant="ghost"
								size="icon"
								class="text-destructive hover:bg-destructive/10 hover:text-destructive"
								disabled={!!device.is_current}
								onclick={() => openRemoveDialog(device)}
								aria-label="Remove device"
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
{/if}

<!-- Rename dialog -->
<Dialog.Root bind:open={renameDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Rename device</Dialog.Title>
			<Dialog.Description>
				Enter a new name for this device.
			</Dialog.Description>
		</Dialog.Header>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleRename();
			}}
			class="space-y-4 py-4"
		>
			<div class="space-y-2">
				<Label for="device-name">Device name</Label>
				<Input
					id="device-name"
					bind:value={renameDeviceName}
					placeholder="My laptop"
					disabled={renameSubmitting}
				/>
				{#if renameError}
					<p class="text-sm text-destructive">{renameError}</p>
				{/if}
			</div>
		</form>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (renameDialogOpen = false)} disabled={renameSubmitting}>
				Cancel
			</Button>
			<Button onclick={handleRename} disabled={renameSubmitting}>
				{#if renameSubmitting}
					Renaming...
				{:else}
					Rename
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Trust dialog -->
<Dialog.Root bind:open={trustDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Trust device</Dialog.Title>
			<Dialog.Description>
				Trusted devices may skip additional verification steps. Choose how long this device should be trusted.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="trust-duration">Trust duration</Label>
				<Select.Root
					type="single"
					value={trustDuration}
					onValueChange={(v) => {
						if (v) trustDuration = v;
					}}
				>
					<Select.Trigger>
						{selectedDurationLabel}
						<ChevronDown class="ml-auto h-4 w-4 opacity-50" />
					</Select.Trigger>
					<Select.Content>
						{#each trustDurationOptions as option}
							<Select.Item value={option.value} label={option.label} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (trustDialogOpen = false)} disabled={trustSubmitting}>
				Cancel
			</Button>
			<Button onclick={handleTrust} disabled={trustSubmitting}>
				{#if trustSubmitting}
					Trusting...
				{:else}
					Trust device
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Untrust confirm dialog -->
<Dialog.Root bind:open={untrustDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Untrust device</Dialog.Title>
			<Dialog.Description>
				This device will no longer be trusted and may require additional verification on next login.
			</Dialog.Description>
		</Dialog.Header>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (untrustDialogOpen = false)} disabled={untrustSubmitting}>
				Cancel
			</Button>
			<Button variant="destructive" onclick={handleUntrust} disabled={untrustSubmitting}>
				{#if untrustSubmitting}
					Untrusting...
				{:else}
					Untrust device
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Remove confirm dialog -->
<Dialog.Root bind:open={removeDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Remove device</Dialog.Title>
			<Dialog.Description>
				Remove this device? It will need to re-authenticate next time.
			</Dialog.Description>
		</Dialog.Header>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (removeDialogOpen = false)} disabled={removeSubmitting}>
				Cancel
			</Button>
			<Button variant="destructive" onclick={handleRemove} disabled={removeSubmitting}>
				{#if removeSubmitting}
					Removing...
				{:else}
					Remove device
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
