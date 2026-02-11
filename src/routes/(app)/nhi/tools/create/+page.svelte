<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Tool created successfully');
			}
		}
	});
</script>

<PageHeader title="Create tool" description="Register a new tool integration" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Tool details</h2>
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
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="e.g. Weather API"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<Input
					id="description"
					name="description"
					type="text"
					placeholder="Brief description of this tool"
					value={String($form.description ?? '')}
				/>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="category">Category (optional)</Label>
				<Input
					id="category"
					name="category"
					type="text"
					placeholder="e.g. external, internal"
					value={String($form.category ?? '')}
				/>
				{#if $errors.category}
					<p class="text-sm text-destructive">{$errors.category}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="input_schema">Input schema (JSON)</Label>
				<textarea
					id="input_schema"
					name="input_schema"
					class="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder={'{"type": "object", "properties": {}}'}
					value={String($form.input_schema ?? '')}
				></textarea>
				{#if $errors.input_schema}
					<p class="text-sm text-destructive">{$errors.input_schema}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="output_schema">Output schema (optional, JSON)</Label>
				<textarea
					id="output_schema"
					name="output_schema"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder={'{"type": "object"}'}
					value={String($form.output_schema ?? '')}
				></textarea>
				{#if $errors.output_schema}
					<p class="text-sm text-destructive">{$errors.output_schema}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<h3 class="text-sm font-medium text-muted-foreground">Configuration (optional)</h3>

			<div class="flex items-center gap-2">
				<input
					id="requires_approval"
					name="requires_approval"
					type="checkbox"
					class="h-4 w-4 rounded border-input"
					checked={$form.requires_approval}
				/>
				<Label for="requires_approval">Requires approval</Label>
			</div>

			<div class="space-y-2">
				<Label for="max_calls_per_hour">Max calls per hour</Label>
				<Input
					id="max_calls_per_hour"
					name="max_calls_per_hour"
					type="number"
					placeholder="e.g. 100"
					value={$form.max_calls_per_hour !== undefined ? String($form.max_calls_per_hour) : ''}
				/>
				{#if $errors.max_calls_per_hour}
					<p class="text-sm text-destructive">{$errors.max_calls_per_hour}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="provider">Provider</Label>
				<Input
					id="provider"
					name="provider"
					type="text"
					placeholder="e.g. openweather"
					value={String($form.provider ?? '')}
				/>
				{#if $errors.provider}
					<p class="text-sm text-destructive">{$errors.provider}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create tool</Button>
				<a
					href="/nhi"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
