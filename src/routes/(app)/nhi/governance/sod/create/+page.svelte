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

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'NHI SoD rule created successfully');
			}
		}
	});
</script>

<PageHeader title="Create NHI SoD Rule" description="Define a separation of duties rule between two tools" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Rule details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<h3 class="text-sm font-medium text-muted-foreground">Conflicting tools</h3>

			<div class="space-y-2">
				<Label for="tool_id_a">Tool A (UUID)</Label>
				<Input
					id="tool_id_a"
					name="tool_id_a"
					type="text"
					placeholder="UUID of first tool"
					value={String($form.tool_id_a ?? '')}
				/>
				{#if $errors.tool_id_a}
					<p class="text-sm text-destructive">{$errors.tool_id_a}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="tool_id_b">Tool B (UUID)</Label>
				<Input
					id="tool_id_b"
					name="tool_id_b"
					type="text"
					placeholder="UUID of second tool"
					value={String($form.tool_id_b ?? '')}
				/>
				{#if $errors.tool_id_b}
					<p class="text-sm text-destructive">{$errors.tool_id_b}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<h3 class="text-sm font-medium text-muted-foreground">Enforcement</h3>

			<div class="space-y-2">
				<Label for="enforcement">Enforcement level</Label>
				<select
					id="enforcement"
					name="enforcement"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.enforcement ?? '')}
				>
					<option value="">Select enforcement</option>
					<option value="prevent">Prevent</option>
					<option value="warn">Warn</option>
				</select>
				{#if $errors.enforcement}
					<p class="text-sm text-destructive">{$errors.enforcement}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<textarea
					id="description"
					name="description"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder="Why these tools should not be used by the same agent"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create rule</Button>
				<a
					href="/nhi/governance"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
