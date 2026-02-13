<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
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
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'A2A task created successfully');
			}
		}
	});
</script>

<PageHeader title="Create A2A Task" description="Dispatch a new agent-to-agent task" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Task details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="target_agent_id">Target Agent ID</Label>
				<Input
					id="target_agent_id"
					name="target_agent_id"
					type="text"
					placeholder="UUID of the target agent"
					value={String($form.target_agent_id ?? '')}
				/>
				{#if $errors.target_agent_id}
					<p class="text-sm text-destructive">{$errors.target_agent_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="task_type">Task Type</Label>
				<Input
					id="task_type"
					name="task_type"
					type="text"
					placeholder="e.g. code-review, data-analysis"
					value={String($form.task_type ?? '')}
				/>
				{#if $errors.task_type}
					<p class="text-sm text-destructive">{$errors.task_type}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="input">Input (JSON)</Label>
				<textarea
					id="input"
					name="input"
					rows="5"
					class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder={'{}'}
					value={String($form.input ?? '{}')}
				></textarea>
				{#if $errors.input}
					<p class="text-sm text-destructive">{$errors.input}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="source_agent_id">Source Agent ID (optional)</Label>
				<Input
					id="source_agent_id"
					name="source_agent_id"
					type="text"
					placeholder="UUID of the source agent"
					value={String($form.source_agent_id ?? '')}
				/>
				{#if $errors.source_agent_id}
					<p class="text-sm text-destructive">{$errors.source_agent_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="callback_url">Callback URL (optional)</Label>
				<Input
					id="callback_url"
					name="callback_url"
					type="text"
					placeholder="https://example.com/callback"
					value={String($form.callback_url ?? '')}
				/>
				{#if $errors.callback_url}
					<p class="text-sm text-destructive">{$errors.callback_url}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Task</Button>
				<a
					href="/nhi/a2a"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
