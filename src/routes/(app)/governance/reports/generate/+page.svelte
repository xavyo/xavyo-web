<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { generateReportSchema, OUTPUT_FORMATS } from '$lib/schemas/governance-reporting';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data } = $props();

	const { form, errors, enhance } = superForm(data.form, {
		validators: zodClient(generateReportSchema),
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				addToast('success', 'Report generated successfully');
			}
		},
		onUpdated: ({ form: f }) => {
			if (f.message) addToast('error', f.message);
		}
	});
</script>

<div class="mx-auto max-w-2xl space-y-6 p-6">
	<div>
		<h1 class="text-2xl font-bold tracking-tight">Generate Report</h1>
		<p class="text-sm text-muted-foreground">Generate a compliance report from a template.</p>
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
			<label for="name" class="block text-sm font-medium">Report Name (optional)</label>
			<input
				id="name"
				name="name"
				type="text"
				value={String($form.name ?? '')}
				oninput={(e) => ($form.name = e.currentTarget.value)}
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
				placeholder="e.g., Q1 2026 SOX Report"
			/>
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

		<div>
			<label for="parameters" class="block text-sm font-medium">Parameters (optional JSON)</label>
			<textarea
				id="parameters"
				name="parameters"
				value={String($form.parameters ?? '')}
				oninput={(e) => ($form.parameters = e.currentTarget.value)}
				rows={4}
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
				placeholder={"{\"status\": \"active\"}"}
			></textarea>
			{#if $errors.parameters}<p class="mt-1 text-xs text-destructive">{$errors.parameters}</p>{/if}
		</div>

		<div class="flex gap-3">
			<button
				type="submit"
				class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
			>
				Generate Report
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
