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
	import { AGENT_TYPES } from '$lib/schemas/nhi';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Agent created successfully');
			}
		}
	});
</script>

<PageHeader title="Create agent" description="Register a new AI or automation agent" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Agent details</h2>
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
					placeholder="e.g. Code Assistant"
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
					placeholder="Brief description of this agent"
					value={String($form.description ?? '')}
				/>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="agent_type">Agent type</Label>
				<select
					id="agent_type"
					name="agent_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					value={String($form.agent_type ?? '')}
				>
					<option value="" disabled>Select agent type</option>
					{#each AGENT_TYPES as type}
						<option value={type}>{type}</option>
					{/each}
				</select>
				{#if $errors.agent_type}
					<p class="text-sm text-destructive">{$errors.agent_type}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<h3 class="text-sm font-medium text-muted-foreground">Model configuration (optional)</h3>

			<div class="space-y-2">
				<Label for="model_provider">Model provider</Label>
				<Input
					id="model_provider"
					name="model_provider"
					type="text"
					placeholder="e.g. anthropic, openai"
					value={String($form.model_provider ?? '')}
				/>
				{#if $errors.model_provider}
					<p class="text-sm text-destructive">{$errors.model_provider}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="model_name">Model name</Label>
				<Input
					id="model_name"
					name="model_name"
					type="text"
					placeholder="e.g. claude-4"
					value={String($form.model_name ?? '')}
				/>
				{#if $errors.model_name}
					<p class="text-sm text-destructive">{$errors.model_name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="model_version">Model version</Label>
				<Input
					id="model_version"
					name="model_version"
					type="text"
					placeholder="e.g. 1.0"
					value={String($form.model_version ?? '')}
				/>
				{#if $errors.model_version}
					<p class="text-sm text-destructive">{$errors.model_version}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="max_token_lifetime_secs">Max token lifetime (seconds)</Label>
				<Input
					id="max_token_lifetime_secs"
					name="max_token_lifetime_secs"
					type="number"
					placeholder="e.g. 3600"
					value={$form.max_token_lifetime_secs !== undefined ? String($form.max_token_lifetime_secs) : ''}
				/>
				{#if $errors.max_token_lifetime_secs}
					<p class="text-sm text-destructive">{$errors.max_token_lifetime_secs}</p>
				{/if}
			</div>

			<div class="flex items-center gap-2">
				<input
					id="requires_human_approval"
					name="requires_human_approval"
					type="checkbox"
					class="h-4 w-4 rounded border-input"
					checked={$form.requires_human_approval}
				/>
				<Label for="requires_human_approval">Requires human approval</Label>
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create agent</Button>
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
