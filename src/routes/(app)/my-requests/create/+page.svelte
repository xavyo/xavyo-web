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
				addToast('success', 'Access request submitted successfully');
			}
		}
	});
</script>

<PageHeader title="New Access Request" description="Request access to an entitlement" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Request details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="entitlement_id">Entitlement ID</Label>
				<Input
					id="entitlement_id"
					name="entitlement_id"
					type="text"
					placeholder="Enter entitlement UUID"
					value={String($form.entitlement_id ?? '')}
				/>
				{#if $errors.entitlement_id}
					<p class="text-sm text-destructive">{$errors.entitlement_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="justification">Justification</Label>
				<textarea
					id="justification"
					name="justification"
					class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Explain why you need access (minimum 20 characters)"
					value={String($form.justification ?? '')}
				></textarea>
				{#if $errors.justification}
					<p class="text-sm text-destructive">{$errors.justification}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="requested_expires_at">Requested expiry date (optional)</Label>
				<Input
					id="requested_expires_at"
					name="requested_expires_at"
					type="date"
					value={String($form.requested_expires_at ?? '')}
				/>
				{#if $errors.requested_expires_at}
					<p class="text-sm text-destructive">{$errors.requested_expires_at}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Submit request</Button>
				<a
					href="/my-requests"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
