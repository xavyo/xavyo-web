<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { enhance as svelteEnhance } from '$app/forms';
	import {
		updateScheduleSchema,
		SCHEDULE_FREQUENCIES,
		OUTPUT_FORMATS
	} from '$lib/schemas/governance-reporting';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';

	let { data } = $props();
	let schedule = $derived(data.schedule);

	const { form: editForm, errors: editErrors, enhance: editEnhance } = superForm(data.editForm, {
		validators: zodClient(updateScheduleSchema),
		onResult: ({ result }) => {
			if (result.type === 'redirect') addToast('success', 'Schedule updated');
		},
		onUpdated: ({ form: f }) => {
			if (f.message) addToast('error', f.message);
		}
	});

	let showDeleteConfirm = $state(false);
	let deleteFormRef: HTMLFormElement | undefined = $state(undefined);

	const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	function statusClass(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
			case 'paused':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
			case 'disabled':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
			default:
				return 'bg-muted text-muted-foreground';
		}
	}

	function frequencyLabel(): string {
		const hour = `${String(schedule.schedule_hour).padStart(2, '0')}:00 UTC`;
		if (schedule.frequency === 'daily') return `Daily at ${hour}`;
		if (schedule.frequency === 'weekly' && schedule.schedule_day_of_week !== null)
			return `Weekly on ${dayNames[schedule.schedule_day_of_week]} at ${hour}`;
		if (schedule.frequency === 'monthly' && schedule.schedule_day_of_month !== null)
			return `Monthly on day ${schedule.schedule_day_of_month} at ${hour}`;
		return schedule.frequency;
	}

	function formatDate(d: string | null): string {
		if (!d) return '—';
		return new Date(d).toLocaleString();
	}
</script>

<div class="mx-auto max-w-3xl space-y-6 p-6">
	<div class="flex items-start justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{schedule.name}</h1>
			<p class="text-sm text-muted-foreground">{frequencyLabel()}</p>
		</div>
		<div class="flex gap-2">
			<Badge class={statusClass(schedule.status)}>{schedule.status}</Badge>
			<Badge>{schedule.output_format.toUpperCase()}</Badge>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 text-sm">
		<div><span class="text-muted-foreground">Template ID:</span> <span class="font-mono text-xs">{schedule.template_id}</span></div>
		<div><span class="text-muted-foreground">Status:</span> {schedule.status}</div>
		<div><span class="text-muted-foreground">Next Run:</span> {formatDate(schedule.next_run_at)}</div>
		<div><span class="text-muted-foreground">Last Run:</span> {formatDate(schedule.last_run_at)}</div>
		<div><span class="text-muted-foreground">Created:</span> {formatDate(schedule.created_at)}</div>
		<div><span class="text-muted-foreground">Updated:</span> {formatDate(schedule.updated_at)}</div>
	</div>

	<div class="rounded-lg border border-border p-4">
		<h2 class="mb-2 text-sm font-medium">Recipients</h2>
		<div class="flex flex-wrap gap-2">
			{#each schedule.recipients as email}
				<Badge class="bg-muted text-muted-foreground">{email}</Badge>
			{/each}
		</div>
	</div>

	{#if schedule.consecutive_failures > 0}
		<div class="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
			<h2 class="mb-1 text-sm font-medium text-destructive">Consecutive Failures: {schedule.consecutive_failures}</h2>
			{#if schedule.last_error}
				<p class="text-sm text-destructive/80">{schedule.last_error}</p>
			{/if}
			{#if schedule.status === 'disabled'}
				<p class="mt-1 text-xs text-muted-foreground">This schedule was auto-disabled after 3 consecutive failures.</p>
			{/if}
		</div>
	{/if}

	<div class="flex gap-3">
		{#if schedule.status === 'active'}
			<form method="POST" action="?/pause" use:svelteEnhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'redirect') { addToast('success', 'Schedule paused'); await update(); }
					else if (result.type === 'error') addToast('error', result.error?.message ?? 'Pause failed');
				};
			}}>
				<button
					type="submit"
					class="inline-flex h-9 items-center rounded-md border border-yellow-500 px-4 text-sm font-medium text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
				>
					Pause
				</button>
			</form>
		{:else}
			<form method="POST" action="?/resume" use:svelteEnhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'redirect') { addToast('success', 'Schedule resumed'); await update(); }
					else if (result.type === 'error') addToast('error', result.error?.message ?? 'Resume failed');
				};
			}}>
				<button
					type="submit"
					class="inline-flex h-9 items-center rounded-md border border-green-500 px-4 text-sm font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
				>
					Resume
				</button>
			</form>
		{/if}
		<form bind:this={deleteFormRef} method="POST" action="?/delete" use:svelteEnhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'redirect') { addToast('success', 'Schedule deleted'); await update(); }
				else if (result.type === 'error') addToast('error', result.error?.message ?? 'Delete failed');
			};
		}}>
			<button
				type="button"
				class="inline-flex h-9 items-center rounded-md border border-destructive px-4 text-sm font-medium text-destructive hover:bg-destructive/10"
				onclick={() => (showDeleteConfirm = true)}
			>
				Delete
			</button>
		</form>
	</div>

	<form method="POST" action="?/edit" use:editEnhance class="space-y-4 rounded-lg border border-border p-4">
		<h2 class="text-sm font-medium">Edit Schedule</h2>
		<div>
			<label for="edit-name" class="block text-sm">Name</label>
			<input
				id="edit-name"
				name="name"
				type="text"
				value={String($editForm.name ?? '')}
				oninput={(e) => ($editForm.name = e.currentTarget.value)}
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
			/>
			{#if $editErrors.name}<p class="text-xs text-destructive">{$editErrors.name}</p>{/if}
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="edit-frequency" class="block text-sm">Frequency</label>
				<select
					id="edit-frequency"
					name="frequency"
					class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
					value={String($editForm.frequency ?? '')}
					onchange={(e) => ($editForm.frequency = e.currentTarget.value as typeof $editForm.frequency)}
				>
					{#each SCHEDULE_FREQUENCIES as f}
						<option value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="edit-hour" class="block text-sm">Hour (UTC)</label>
				<input
					id="edit-hour"
					name="schedule_hour"
					type="number"
					min="0"
					max="23"
					value={$editForm.schedule_hour ?? 8}
					oninput={(e) => ($editForm.schedule_hour = parseInt(e.currentTarget.value))}
					class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				/>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="edit-dow" class="block text-sm">Day of Week</label>
				<select
					id="edit-dow"
					name="schedule_day_of_week"
					class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
					value={String($editForm.schedule_day_of_week ?? '')}
					onchange={(e) => {
						const v = e.currentTarget.value;
						$editForm.schedule_day_of_week = v ? parseInt(v) : undefined;
					}}
				>
					<option value="">N/A</option>
					{#each dayNames as day, i}
						<option value={String(i)}>{day}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="edit-dom" class="block text-sm">Day of Month</label>
				<input
					id="edit-dom"
					name="schedule_day_of_month"
					type="number"
					min="1"
					max="31"
					value={$editForm.schedule_day_of_month ?? ''}
					oninput={(e) => {
						const v = e.currentTarget.value;
						$editForm.schedule_day_of_month = v ? parseInt(v) : undefined;
					}}
					class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
					placeholder="1-31"
				/>
			</div>
		</div>

		<div>
			<label for="edit-recipients" class="block text-sm">Recipients (comma-separated)</label>
			<input
				id="edit-recipients"
				name="recipients"
				type="text"
				value={String($editForm.recipients ?? '')}
				oninput={(e) => ($editForm.recipients = e.currentTarget.value)}
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
			/>
		</div>

		<div>
			<label for="edit-format" class="block text-sm">Output Format</label>
			<select
				id="edit-format"
				name="output_format"
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				value={String($editForm.output_format ?? 'json')}
				onchange={(e) => ($editForm.output_format = e.currentTarget.value as 'json' | 'csv')}
			>
				{#each OUTPUT_FORMATS as fmt}
					<option value={fmt}>{fmt.toUpperCase()}</option>
				{/each}
			</select>
		</div>

		<button type="submit" class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
			Save Changes
		</button>
	</form>

	<a href="/governance/reports" class="inline-flex text-sm text-muted-foreground hover:text-foreground">
		&larr; Back to Reports
	</a>
</div>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete schedule"
	description="Are you sure you want to delete this schedule?"
	confirmLabel="Delete"
	variant="destructive"
	onconfirm={() => deleteFormRef?.requestSubmit()}
/>
