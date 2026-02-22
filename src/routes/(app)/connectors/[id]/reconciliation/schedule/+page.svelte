<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { enhance as formEnhance } from '$app/forms';
	import { addToast } from '$lib/stores/toast.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import * as Dialog from '$lib/components/ui/dialog';

	let { data }: { data: PageData } = $props();

	const schedule = $derived(data.schedule);

	// Form state for create/edit
	// svelte-ignore state_referenced_locally
	let mode = $state<string>(schedule?.mode ?? 'full');
	// svelte-ignore state_referenced_locally
	let frequency = $state<string>(schedule?.frequency ?? 'daily');
	// svelte-ignore state_referenced_locally
	let dayOfWeek = $state<string>(schedule?.day_of_week?.toString() ?? '');
	// svelte-ignore state_referenced_locally
	let dayOfMonth = $state<string>(schedule?.day_of_month?.toString() ?? '');
	// svelte-ignore state_referenced_locally
	let hourOfDay = $state<string>(schedule?.hour_of_day?.toString() ?? '0');
	// svelte-ignore state_referenced_locally
	let enabled = $state<boolean>(schedule?.enabled ?? true);

	// Delete confirmation dialog
	let showDeleteDialog = $state(false);

	// Re-sync form state when schedule data changes
	$effect(() => {
		if (data.schedule) {
			mode = data.schedule.mode;
			frequency = data.schedule.frequency;
			dayOfWeek = data.schedule.day_of_week?.toString() ?? '';
			dayOfMonth = data.schedule.day_of_month?.toString() ?? '';
			hourOfDay = data.schedule.hour_of_day?.toString() ?? '0';
			enabled = data.schedule.enabled;
		} else {
			mode = 'full';
			frequency = 'daily';
			dayOfWeek = '';
			dayOfMonth = '';
			hourOfDay = '0';
			enabled = true;
		}
	});

	const showDayOfWeek = $derived(frequency === 'weekly');
	const showDayOfMonth = $derived(frequency === 'monthly');

	const modeOptions = [
		{ value: 'full', label: 'Full' },
		{ value: 'delta', label: 'Delta' }
	];

	const frequencyOptions = [
		{ value: 'hourly', label: 'Hourly' },
		{ value: 'daily', label: 'Daily' },
		{ value: 'weekly', label: 'Weekly' },
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'cron', label: 'Cron' }
	];

	const dayOfWeekOptions = [
		{ value: '0', label: 'Sunday' },
		{ value: '1', label: 'Monday' },
		{ value: '2', label: 'Tuesday' },
		{ value: '3', label: 'Wednesday' },
		{ value: '4', label: 'Thursday' },
		{ value: '5', label: 'Friday' },
		{ value: '6', label: 'Saturday' }
	];

	function formatDate(dateStr: string | null | undefined): string {
		if (!dateStr) return '---';
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Reconciliation Schedule"
		description="Configure automated reconciliation for this connector"
	/>
	<a
		href="/connectors/{data.connectorId}/reconciliation"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Reconciliation
	</a>
</div>

{#if !schedule}
	<EmptyState
		title="No schedule configured"
		description="Create a reconciliation schedule to automatically run reconciliation at regular intervals."
		icon="calendar"
	/>
	<div class="mt-6 rounded-lg border p-6">
		<h2 class="mb-4 text-lg font-semibold">Create Schedule</h2>
		<form
			method="POST"
			action="?/save"
			use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Schedule created successfully');
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Failed to create schedule');
					}
				};
			}}
		>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="mode" class="text-sm font-medium">Mode</label>
					<select
						id="mode"
						name="mode"
						bind:value={mode}
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						{#each modeOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="frequency" class="text-sm font-medium">Frequency</label>
					<select
						id="frequency"
						name="frequency"
						bind:value={frequency}
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						{#each frequencyOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
				{#if showDayOfWeek}
					<div>
						<label for="day_of_week" class="text-sm font-medium">Day of Week</label>
						<select
							id="day_of_week"
							name="day_of_week"
							bind:value={dayOfWeek}
							class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						>
							{#each dayOfWeekOptions as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</div>
				{/if}
				{#if showDayOfMonth}
					<div>
						<label for="day_of_month" class="text-sm font-medium">Day of Month</label>
						<input
							id="day_of_month"
							name="day_of_month"
							type="number"
							min="1"
							max="31"
							bind:value={dayOfMonth}
							class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
							placeholder="1-31"
						/>
					</div>
				{/if}
				<div>
					<label for="hour_of_day" class="text-sm font-medium">Hour of Day (UTC)</label>
					<input
						id="hour_of_day"
						name="hour_of_day"
						type="number"
						min="0"
						max="23"
						bind:value={hourOfDay}
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					/>
				</div>
				<div class="flex items-center gap-2 sm:col-span-2">
					<input
						id="enabled"
						name="enabled"
						type="checkbox"
						bind:checked={enabled}
						class="h-4 w-4 rounded border-gray-300"
					/>
					<label for="enabled" class="text-sm font-medium">Enabled</label>
				</div>
			</div>
			<div class="mt-6">
				<Button type="submit">Create Schedule</Button>
			</div>
		</form>
	</div>
{:else}
	<!-- Schedule info card -->
	<div class="mb-6 grid gap-4 sm:grid-cols-3">
		<div class="rounded-lg border p-4">
			<p class="text-sm text-muted-foreground">Status</p>
			<p class="mt-1 text-lg font-semibold">
				{#if schedule.enabled}
					<span class="text-green-600 dark:text-green-400">Enabled</span>
				{:else}
					<span class="text-gray-500 dark:text-gray-400">Disabled</span>
				{/if}
			</p>
		</div>
		<div class="rounded-lg border p-4">
			<p class="text-sm text-muted-foreground">Last Run</p>
			<p class="mt-1 text-sm font-medium">{formatDate(schedule.last_run_at)}</p>
		</div>
		<div class="rounded-lg border p-4">
			<p class="text-sm text-muted-foreground">Next Run</p>
			<p class="mt-1 text-sm font-medium">{formatDate(schedule.next_run_at)}</p>
		</div>
	</div>

	<!-- Edit form -->
	<div class="rounded-lg border p-6">
		<h2 class="mb-4 text-lg font-semibold">Schedule Configuration</h2>
		<form
			method="POST"
			action="?/save"
			use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Schedule updated successfully');
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Failed to update schedule');
					}
				};
			}}
		>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="edit-mode" class="text-sm font-medium">Mode</label>
					<select
						id="edit-mode"
						name="mode"
						bind:value={mode}
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						{#each modeOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="edit-frequency" class="text-sm font-medium">Frequency</label>
					<select
						id="edit-frequency"
						name="frequency"
						bind:value={frequency}
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						{#each frequencyOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
				{#if showDayOfWeek}
					<div>
						<label for="edit-day_of_week" class="text-sm font-medium">Day of Week</label>
						<select
							id="edit-day_of_week"
							name="day_of_week"
							bind:value={dayOfWeek}
							class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						>
							{#each dayOfWeekOptions as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</div>
				{/if}
				{#if showDayOfMonth}
					<div>
						<label for="edit-day_of_month" class="text-sm font-medium">Day of Month</label>
						<input
							id="edit-day_of_month"
							name="day_of_month"
							type="number"
							min="1"
							max="31"
							bind:value={dayOfMonth}
							class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
							placeholder="1-31"
						/>
					</div>
				{/if}
				<div>
					<label for="edit-hour_of_day" class="text-sm font-medium">Hour of Day (UTC)</label>
					<input
						id="edit-hour_of_day"
						name="hour_of_day"
						type="number"
						min="0"
						max="23"
						bind:value={hourOfDay}
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					/>
				</div>
				<div class="flex items-center gap-2 sm:col-span-2">
					<input
						id="edit-enabled"
						name="enabled"
						type="checkbox"
						bind:checked={enabled}
						class="h-4 w-4 rounded border-gray-300"
					/>
					<label for="edit-enabled" class="text-sm font-medium">Enabled</label>
				</div>
			</div>
			<div class="mt-6 flex items-center gap-3">
				<Button type="submit">Save</Button>

				<Button
					variant="destructive"
					onclick={() => {
						showDeleteDialog = true;
					}}>Delete</Button
				>
			</div>
		</form>

		<!-- Enable/Disable forms (separate from edit form to avoid nested forms) -->
		<div class="mt-3 flex items-center gap-3">
			{#if schedule.enabled}
				<form
					method="POST"
					action="?/disable"
					use:formEnhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								addToast('success', 'Schedule disabled');
								await invalidateAll();
							} else if (result.type === 'failure') {
								addToast(
									'error',
									(result.data?.error as string) || 'Failed to disable schedule'
								);
							}
						};
					}}
				>
					<Button type="submit" variant="outline">Disable</Button>
				</form>
			{:else}
				<form
					method="POST"
					action="?/enable"
					use:formEnhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								addToast('success', 'Schedule enabled');
								await invalidateAll();
							} else if (result.type === 'failure') {
								addToast(
									'error',
									(result.data?.error as string) || 'Failed to enable schedule'
								);
							}
						};
					}}
				>
					<Button type="submit" variant="outline">Enable</Button>
				</form>
			{/if}
		</div>
	</div>
{/if}

<!-- Delete confirmation dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Schedule</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this reconciliation schedule? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/delete"
			use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Schedule deleted');
						showDeleteDialog = false;
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Failed to delete schedule');
					}
				};
			}}
		>
			<Dialog.Footer>
				<Button
					variant="outline"
					onclick={() => {
						showDeleteDialog = false;
					}}>Cancel</Button
				>
				<Button type="submit" variant="destructive">Delete Schedule</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
