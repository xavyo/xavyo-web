<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import {
		createTemplateSchema,
		REPORT_TEMPLATE_TYPES,
		COMPLIANCE_STANDARDS
	} from '$lib/schemas/governance-reporting';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message: formMessage } = superForm(data.form, {
		validators: zodClient(createTemplateSchema),
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				addToast('success', 'Template created successfully');
			}
		}
	});

	function typeLabel(t: string): string {
		return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	$effect(() => {
		if ($formMessage) addToast('error', $formMessage);
	});
</script>

<div class="mx-auto max-w-2xl space-y-6 p-6">
	<div>
		<h1 class="text-2xl font-bold tracking-tight">Create Report Template</h1>
		<p class="text-sm text-muted-foreground">Define a custom report template.</p>
	</div>

	<form method="POST" use:enhance class="space-y-4">
		<div>
			<label for="name" class="block text-sm font-medium">Name</label>
			<input
				id="name"
				name="name"
				type="text"
				value={String($form.name ?? '')}
				oninput={(e) => ($form.name = e.currentTarget.value)}
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
			/>
			{#if $errors.name}<p class="mt-1 text-xs text-destructive">{$errors.name}</p>{/if}
		</div>

		<div>
			<label for="description" class="block text-sm font-medium">Description</label>
			<textarea
				id="description"
				name="description"
				value={String($form.description ?? '')}
				oninput={(e) => ($form.description = e.currentTarget.value)}
				rows={2}
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
			></textarea>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="template_type" class="block text-sm font-medium">Template Type</label>
				<select
					id="template_type"
					name="template_type"
					class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
					value={String($form.template_type ?? '')}
					onchange={(e) => ($form.template_type = e.currentTarget.value as typeof $form.template_type)}
				>
					<option value="">Select type...</option>
					{#each REPORT_TEMPLATE_TYPES as tt}
						<option value={tt}>{typeLabel(tt)}</option>
					{/each}
				</select>
				{#if $errors.template_type}<p class="mt-1 text-xs text-destructive">{$errors.template_type}</p>{/if}
			</div>

			<div>
				<label for="compliance_standard" class="block text-sm font-medium">Compliance Standard</label>
				<select
					id="compliance_standard"
					name="compliance_standard"
					class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
					value={String($form.compliance_standard ?? '')}
					onchange={(e) => ($form.compliance_standard = e.currentTarget.value as typeof $form.compliance_standard || undefined)}
				>
					<option value="">None</option>
					{#each COMPLIANCE_STANDARDS as cs}
						<option value={cs}>{cs.toUpperCase()}</option>
					{/each}
				</select>
			</div>
		</div>

		<div>
			<label for="definition" class="block text-sm font-medium">Template Definition (JSON)</label>
			<textarea
				id="definition"
				name="definition"
				rows={10}
				class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
				placeholder={JSON.stringify(
					{
						data_sources: ['entitlements'],
						filters: [{ field: 'status', type: 'select', required: false, options: null, default: null }],
						columns: [{ field: 'name', label: 'Name', sortable: true }],
						grouping: [],
						default_sort: null
					},
					null,
					2
				)}
			></textarea>
			{#if $errors.definition}<p class="mt-1 text-xs text-destructive">{$errors.definition}</p>{/if}
		</div>

		<div class="flex gap-3">
			<button
				type="submit"
				class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
			>
				Create Template
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
