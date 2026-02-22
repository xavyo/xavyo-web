<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createScriptTemplateSchema } from '$lib/schemas/provisioning-scripts';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		validators: zodClient(createScriptTemplateSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Template created successfully');
			}
		}
	});

	const selectClass =
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

	const textareaClass =
		'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

	const categories = [
		{ value: 'attribute_mapping', label: 'Attribute Mapping' },
		{ value: 'value_generation', label: 'Value Generation' },
		{ value: 'conditional_logic', label: 'Conditional Logic' },
		{ value: 'data_formatting', label: 'Data Formatting' },
		{ value: 'custom', label: 'Custom' }
	];

	const annotationsPlaceholder = '{"placeholder": "description"}';
</script>

<PageHeader
	title="Create Template"
	description="Create a new script template"
/>

<div class="mb-4">
	<a
		href="/governance/provisioning-scripts"
		class="text-sm text-muted-foreground hover:text-foreground"
	>
		&larr; Back to Scripts
	</a>
</div>

<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Template details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input id="name" name="name" type="text" placeholder="e.g. AD Attribute Mapper" bind:value={$form.name} />
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<textarea
					id="description"
					name="description"
					class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder="Describe the template..."
					bind:value={$form.description}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="category">Category</Label>
				<select
					id="category"
					name="category"
					class={selectClass}
					bind:value={$form.category}
				>
					<option value="" disabled>Select category</option>
					{#each categories as cat}
						<option value={cat.value}>{cat.label}</option>
					{/each}
				</select>
				{#if $errors.category}
					<p class="text-sm text-destructive">{$errors.category}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="template_body">Template Body</Label>
				<textarea
					id="template_body"
					name="template_body"
					class={textareaClass}
					placeholder="Enter template script body..."
					bind:value={$form.template_body}
				></textarea>
				{#if $errors.template_body}
					<p class="text-sm text-destructive">{$errors.template_body}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="placeholder_annotations">Placeholder Annotations (optional JSON)</Label>
				<textarea
					id="placeholder_annotations"
					name="placeholder_annotations"
					class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder={annotationsPlaceholder}
					bind:value={$form.placeholder_annotations}
				></textarea>
				{#if $errors.placeholder_annotations}
					<p class="text-sm text-destructive">{$errors.placeholder_annotations}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Template</Button>
				<a
					href="/governance/provisioning-scripts"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
