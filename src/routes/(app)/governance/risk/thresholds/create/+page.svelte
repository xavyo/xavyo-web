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
				addToast('success', 'Risk threshold created successfully');
			}
		}
	});
</script>

<PageHeader title="Create Risk Threshold" description="Define a new risk score threshold with automated actions" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Threshold details</h2>
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
					placeholder="e.g. Critical Risk Alert"
					bind:value={$form.name}
				/>
				{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="score_value">Score Value (1-100)</Label>
				<Input
					id="score_value"
					name="score_value"
					type="number"
					min="1"
					max="100"
					placeholder="e.g. 75"
					bind:value={$form.score_value}
				/>
				{#if $errors.score_value}<p class="text-sm text-destructive">{$errors.score_value}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="severity">Severity</Label>
				<select
					id="severity"
					name="severity"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					value={String($form.severity ?? 'info')}
					onchange={(e) => ($form.severity = e.currentTarget.value as 'info' | 'warning' | 'critical')}
				>
					<option value="info">Info</option>
					<option value="warning">Warning</option>
					<option value="critical">Critical</option>
				</select>
				{#if $errors.severity}<p class="text-sm text-destructive">{$errors.severity}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="action">Action</Label>
				<select
					id="action"
					name="action"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					value={String($form.action ?? '')}
					onchange={(e) => ($form.action = (e.currentTarget.value || undefined) as 'alert' | 'require_mfa' | 'block' | undefined)}
				>
					<option value="">None</option>
					<option value="alert">Alert</option>
					<option value="require_mfa">Require MFA</option>
					<option value="block">Block</option>
				</select>
				{#if $errors.action}<p class="text-sm text-destructive">{$errors.action}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="cooldown_hours">Cooldown Hours (optional, 1-720)</Label>
				<Input
					id="cooldown_hours"
					name="cooldown_hours"
					type="number"
					min="1"
					max="720"
					placeholder="e.g. 24"
					bind:value={$form.cooldown_hours}
				/>
				{#if $errors.cooldown_hours}<p class="text-sm text-destructive">{$errors.cooldown_hours}</p
				>{/if}
			</div>

			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="is_enabled"
					name="is_enabled"
					bind:checked={$form.is_enabled}
					class="h-4 w-4 rounded border-input"
				/>
				<Label for="is_enabled">Enabled</Label>
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Threshold</Button>
				<a
					href="/governance/risk/thresholds"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
