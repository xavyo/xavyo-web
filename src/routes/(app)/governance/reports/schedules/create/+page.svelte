<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import {
		createScheduleSchema,
		SCHEDULE_FREQUENCIES,
		OUTPUT_FORMATS
	} from '$lib/schemas/governance-reporting';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(data.form, {
		validators: zodClient(createScheduleSchema),
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				addToast('success', 'Schedule created successfully');
			}
		},
		onUpdated: ({ form: f }) => {
			if (f.message) addToast('error', f.message);
		}
	});

	const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	function frequencyLabel(f: string): string {
		return f.charAt(0).toUpperCase() + f.slice(1);
	}
</script>

<div class="mx-auto max-w-2xl space-y-6 p-6">
	<div>
		<h1 class="text-2xl font-bold tracking-tight">Create Report Schedule</h1>
		<p class="text-sm text-muted-foreground">Set up a recurring report generation schedule.</p>
	</div>

	<form method="POST" use:enhance class="space-y-4">
		<div>
			<label for="template_id" class="block text-sm font-medium">Template ID</label>
			<input
				id="template_id"
				name="template_id"
				type="text"
				value={String($form.template_id ?? '')}
				oninput={(e) => ($form.template_id = e.currentTarget.value)}
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				placeholder="Template UUID"
			/>
			{#if $errors.template_id}<p class="mt-1 text-xs text-destructive">{$errors.template_id}</p>{/if}
		</div>

		<div>
			<label for="name" class="block text-sm font-medium">Schedule Name</label>
			<input
				id="name"
				name="name"
				type="text"
				value={String($form.name ?? '')}
				oninput={(e) => ($form.name = e.currentTarget.value)}
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				placeholder="e.g., Weekly SOX Compliance"
			/>
			{#if $errors.name}<p class="mt-1 text-xs text-destructive">{$errors.name}</p>{/if}
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="frequency" class="block text-sm font-medium">Frequency</label>
				<select
					id="frequency"
					name="frequency"
					class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
					value={String($form.frequency ?? '')}
					onchange={(e) => ($form.frequency = e.currentTarget.value as typeof $form.frequency)}
				>
					<option value="">Select frequency...</option>
					{#each SCHEDULE_FREQUENCIES as f}
						<option value={f}>{frequencyLabel(f)}</option>
					{/each}
				</select>
				{#if $errors.frequency}<p class="mt-1 text-xs text-destructive">{$errors.frequency}</p>{/if}
			</div>

			<div>
				<label for="schedule_hour" class="block text-sm font-medium">Hour (UTC)</label>
				<input
					id="schedule_hour"
					name="schedule_hour"
					type="number"
					min="0"
					max="23"
					value={$form.schedule_hour ?? 8}
					oninput={(e) => ($form.schedule_hour = parseInt(e.currentTarget.value))}
					class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				/>
				{#if $errors.schedule_hour}<p class="mt-1 text-xs text-destructive">{$errors.schedule_hour}</p>{/if}
			</div>
		</div>

		<div class:hidden={$form.frequency !== 'weekly'}>
			<label for="schedule_day_of_week" class="block text-sm font-medium">Day of Week</label>
			<select
				id="schedule_day_of_week"
				name="schedule_day_of_week"
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				value={String($form.schedule_day_of_week ?? '')}
				onchange={(e) => ($form.schedule_day_of_week = e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined)}
			>
				<option value="">Select day...</option>
				{#each dayNames as day, i}
					<option value={String(i)}>{day}</option>
				{/each}
			</select>
			{#if $errors.schedule_day_of_week}<p class="mt-1 text-xs text-destructive">{$errors.schedule_day_of_week}</p>{/if}
		</div>

		<div class:hidden={$form.frequency !== 'monthly'}>
			<label for="schedule_day_of_month" class="block text-sm font-medium">Day of Month</label>
			<input
				id="schedule_day_of_month"
				name="schedule_day_of_month"
				type="number"
				min="1"
				max="31"
				value={$form.schedule_day_of_month ?? ''}
				oninput={(e) => ($form.schedule_day_of_month = e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined)}
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
			/>
			{#if $errors.schedule_day_of_month}<p class="mt-1 text-xs text-destructive">{$errors.schedule_day_of_month}</p>{/if}
		</div>

		<div>
			<label for="recipients" class="block text-sm font-medium">Recipients (comma-separated emails)</label>
			<input
				id="recipients"
				name="recipients"
				type="text"
				value={String($form.recipients ?? '')}
				oninput={(e) => ($form.recipients = e.currentTarget.value)}
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				placeholder="admin@example.com, compliance@example.com"
			/>
			{#if $errors.recipients}<p class="mt-1 text-xs text-destructive">{$errors.recipients}</p>{/if}
		</div>

		<div>
			<label for="output_format" class="block text-sm font-medium">Output Format</label>
			<select
				id="output_format"
				name="output_format"
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				value={String($form.output_format ?? 'json')}
				onchange={(e) => ($form.output_format = e.currentTarget.value as 'json' | 'csv')}
			>
				{#each OUTPUT_FORMATS as fmt}
					<option value={fmt}>{fmt.toUpperCase()}</option>
				{/each}
			</select>
			{#if $errors.output_format}<p class="mt-1 text-xs text-destructive">{$errors.output_format}</p>{/if}
		</div>

		<div class="flex gap-3">
			<button
				type="submit"
				class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
			>
				Create Schedule
			</button>
			<a
				href="/governance/reports"
				class="inline-flex h-10 items-center justify-center rounded-md border border-border px-6 text-sm font-medium hover:bg-muted"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
