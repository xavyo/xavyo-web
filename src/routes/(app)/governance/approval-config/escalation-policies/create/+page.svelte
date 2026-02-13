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
				addToast('success', 'Escalation policy created successfully');
			}
		}
	});
</script>

<PageHeader title="Create Escalation Policy" description="Define timeout and escalation behavior" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Policy details</h2>
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
					placeholder="e.g. 48h Auto-Reject"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<textarea
					id="description"
					name="description"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder="Describe escalation behavior"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="default_timeout_secs">Default Timeout (seconds)</Label>
				<Input
					id="default_timeout_secs"
					name="default_timeout_secs"
					type="number"
					min="60"
					placeholder="86400"
					value={String($form.default_timeout_secs ?? '')}
				/>
				{#if $errors.default_timeout_secs}
					<p class="text-sm text-destructive">{$errors.default_timeout_secs}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="warning_threshold_secs">Warning Threshold (seconds, optional)</Label>
				<Input
					id="warning_threshold_secs"
					name="warning_threshold_secs"
					type="number"
					min="60"
					placeholder="43200"
					value={String($form.warning_threshold_secs ?? '')}
				/>
				{#if $errors.warning_threshold_secs}
					<p class="text-sm text-destructive">{$errors.warning_threshold_secs}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="final_fallback">Final Fallback Action</Label>
				<select
					id="final_fallback"
					name="final_fallback"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.final_fallback ?? '')}
				>
					<option value="">Select action</option>
					<option value="escalate_admin">Escalate to Admin</option>
					<option value="auto_approve">Auto Approve</option>
					<option value="auto_reject">Auto Reject</option>
					<option value="remain_pending">Remain Pending</option>
				</select>
				{#if $errors.final_fallback}
					<p class="text-sm text-destructive">{$errors.final_fallback}</p>
				{/if}
			</div>
			<div class="flex gap-2 pt-2">
				<Button type="submit">Create policy</Button>
				<a
					href="/governance/approval-config"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
					>Cancel</a
				>
			</div>
		</form>
	</CardContent>
</Card>
