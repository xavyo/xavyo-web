<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import FunnelSteps from '$lib/components/auth/funnel-steps.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message, submitting } = superForm(data.form);

	const canSubmit = $derived(($form.organizationName ?? '').toString().trim().length > 0);
</script>

<div class="mx-auto max-w-lg py-8">
	<FunnelSteps current={3} />
	<Card>
		<CardHeader>
			<h1 class="text-2xl font-semibold tracking-tight">Create your organization</h1>
			<p class="text-sm text-muted-foreground">
				One last step — name your workspace to finish setting up your account.
			</p>
		</CardHeader>
		<CardContent>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="organizationName">Organization name</Label>
					<Input
						id="organizationName"
						name="organizationName"
						type="text"
						placeholder="Acme Corp"
						aria-invalid={$errors.organizationName ? 'true' : undefined}
						value={String($form.organizationName ?? '')}
						oninput={(e) => {
							$form.organizationName = e.currentTarget.value;
						}}
					/>
					{#if $errors.organizationName}
						<p class="text-sm text-destructive">{$errors.organizationName}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full" disabled={!canSubmit || $submitting}>
					{$submitting ? 'Creating organization…' : 'Create organization'}
				</Button>
			</form>
		</CardContent>
	</Card>
</div>
