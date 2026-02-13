<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createSiemExportSchema } from '$lib/schemas/siem';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		validators: zodClient(createSiemExportSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Batch export created successfully');
			}
		}
	});

	const selectClass =
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

	const eventCategories = [
		{ value: 'authentication', label: 'Authentication' },
		{ value: 'user_lifecycle', label: 'User Lifecycle' },
		{ value: 'group_changes', label: 'Group Changes' },
		{ value: 'access_requests', label: 'Access Requests' },
		{ value: 'provisioning', label: 'Provisioning' },
		{ value: 'administrative', label: 'Administrative' },
		{ value: 'security', label: 'Security' },
		{ value: 'entitlement', label: 'Entitlement' },
		{ value: 'sod_violation', label: 'SoD Violation' }
	] as const;

	function handleEventTypeToggle(value: string) {
		const current = $form.event_type_filter ?? [];
		if (current.includes(value as (typeof current)[number])) {
			$form.event_type_filter = current.filter((v) => v !== value) as typeof current;
		} else {
			$form.event_type_filter = [...current, value] as typeof current;
		}
	}
</script>

<PageHeader
	title="Create Batch Export"
	description="Export audit events for a specific date range and event categories"
/>

<div class="mb-4">
	<a
		href="/governance/siem"
		class="text-sm text-muted-foreground hover:text-foreground"
	>
		&larr; Back to SIEM
	</a>
</div>

<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Export details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-6">
			<!-- Date Range -->
			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="date_range_start">Start Date</Label>
						<Input
							id="date_range_start"
							name="date_range_start"
							type="datetime-local"
							value={String($form.date_range_start ?? '')}
						/>
						{#if $errors.date_range_start}
							<p class="text-sm text-destructive">{$errors.date_range_start}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="date_range_end">End Date</Label>
						<Input
							id="date_range_end"
							name="date_range_end"
							type="datetime-local"
							value={String($form.date_range_end ?? '')}
						/>
						{#if $errors.date_range_end}
							<p class="text-sm text-destructive">{$errors.date_range_end}</p>
						{/if}
					</div>
				</div>
				<p class="text-xs text-muted-foreground">
					Date range cannot exceed 90 days. End date must be after start date.
				</p>
			</div>

			<!-- Output Format -->
			<div class="space-y-2">
				<Label for="output_format">Output Format</Label>
				<select
					id="output_format"
					name="output_format"
					class={selectClass}
					value={String($form.output_format ?? '')}
					onchange={(e) => {
						$form.output_format = (e.target as HTMLSelectElement).value as typeof $form.output_format;
					}}
				>
					<option value="" disabled>Select format</option>
					<option value="cef">CEF</option>
					<option value="syslog_rfc5424">Syslog RFC5424</option>
					<option value="json">JSON</option>
					<option value="csv">CSV</option>
				</select>
				{#if $errors.output_format}
					<p class="text-sm text-destructive">{$errors.output_format}</p>
				{/if}
			</div>

			<!-- Event Type Filter -->
			<div class="space-y-2">
				<Label>Event Categories</Label>
				<p class="text-xs text-muted-foreground">
					Select at least one event category to include in the export.
				</p>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
					{#each eventCategories as cat}
						<label class="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								name="event_type_filter"
								value={cat.value}
								checked={($form.event_type_filter ?? []).includes(cat.value)}
								onchange={() => handleEventTypeToggle(cat.value)}
								class="h-4 w-4 rounded border-input"
							/>
							{cat.label}
						</label>
					{/each}
				</div>
				{#if $errors.event_type_filter}
					<p class="text-sm text-destructive">{$errors.event_type_filter}</p>
				{/if}
			</div>

			<!-- Submit -->
			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Export</Button>
				<a
					href="/governance/siem"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
