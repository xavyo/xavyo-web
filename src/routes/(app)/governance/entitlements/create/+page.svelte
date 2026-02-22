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
				addToast('success', 'Entitlement created successfully');
			}
		}
	});
</script>

<PageHeader title="Create entitlement" description="Define a new entitlement for governance" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Entitlement details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<!-- Application Selection -->
			<h3 class="text-sm font-medium text-muted-foreground">Application</h3>

			<div class="space-y-2">
				<Label for="application_id">Application</Label>
				{#if data.applications.length > 0}
					<select
						id="application_id"
						name="application_id"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.application_id ?? '')}
					>
						<option value="">Select application</option>
						{#each data.applications as app}
							<option value={app.id}>{app.name}</option>
						{/each}
					</select>
				{:else}
					<Alert class="mb-2">
						<AlertDescription>
							No applications found. Create an application first before adding entitlements.
						</AlertDescription>
					</Alert>
				{/if}
				{#if $errors.application_id}
					<p class="text-sm text-destructive">{$errors.application_id}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<!-- Basic Info -->
			<h3 class="text-sm font-medium text-muted-foreground">Basic info</h3>

			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="e.g. View Financial Reports"
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
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Brief description of this entitlement"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<!-- Risk & Classification -->
			<h3 class="text-sm font-medium text-muted-foreground">Risk & classification</h3>

			<div class="space-y-2">
				<Label for="risk_level">Risk level</Label>
				<select
					id="risk_level"
					name="risk_level"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.risk_level ?? '')}
				>
					<option value="">Select risk level</option>
					<option value="low">Low</option>
					<option value="medium">Medium</option>
					<option value="high">High</option>
					<option value="critical">Critical</option>
				</select>
				{#if $errors.risk_level}
					<p class="text-sm text-destructive">{$errors.risk_level}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="data_protection_classification">Data protection classification</Label>
				<select
					id="data_protection_classification"
					name="data_protection_classification"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.data_protection_classification ?? '')}
				>
					<option value="">Select classification</option>
					<option value="none">None</option>
					<option value="personal">Personal Data</option>
					<option value="sensitive">Sensitive Data</option>
					<option value="special_category">Special Category</option>
				</select>
				{#if $errors.data_protection_classification}
					<p class="text-sm text-destructive">{$errors.data_protection_classification}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="legal_basis">Legal basis (optional)</Label>
				<select
					id="legal_basis"
					name="legal_basis"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					value={String($form.legal_basis ?? '')}
				>
					<option value="">Select legal basis</option>
					<option value="consent">Consent</option>
					<option value="contract">Contract</option>
					<option value="legal_obligation">Legal Obligation</option>
					<option value="vital_interest">Vital Interest</option>
					<option value="public_task">Public Task</option>
					<option value="legitimate_interest">Legitimate Interest</option>
				</select>
				{#if $errors.legal_basis}
					<p class="text-sm text-destructive">{$errors.legal_basis}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<!-- GDPR Details -->
			<h3 class="text-sm font-medium text-muted-foreground">GDPR details</h3>

			<div class="flex items-center gap-2">
				<input
					id="is_delegable"
					name="is_delegable"
					type="checkbox"
					class="h-4 w-4 rounded border-input"
					checked={$form.is_delegable}
				/>
				<Label for="is_delegable">Is delegable</Label>
			</div>

			<div class="space-y-2">
				<Label for="retention_period_days">Retention period (days, optional)</Label>
				<Input
					id="retention_period_days"
					name="retention_period_days"
					type="number"
					placeholder="e.g. 365"
					value={$form.retention_period_days !== undefined ? String($form.retention_period_days) : ''}
				/>
				{#if $errors.retention_period_days}
					<p class="text-sm text-destructive">{$errors.retention_period_days}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="data_controller">Data controller (optional)</Label>
				<Input
					id="data_controller"
					name="data_controller"
					type="text"
					placeholder="e.g. Acme Corp"
					value={String($form.data_controller ?? '')}
				/>
				{#if $errors.data_controller}
					<p class="text-sm text-destructive">{$errors.data_controller}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="data_processor">Data processor (optional)</Label>
				<Input
					id="data_processor"
					name="data_processor"
					type="text"
					placeholder="e.g. Processing Inc"
					value={String($form.data_processor ?? '')}
				/>
				{#if $errors.data_processor}
					<p class="text-sm text-destructive">{$errors.data_processor}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="purposes">Purposes (optional, comma-separated)</Label>
				<Input
					id="purposes"
					name="purposes"
					type="text"
					placeholder="e.g. analytics, reporting, compliance"
					value={String($form.purposes ?? '')}
				/>
				{#if $errors.purposes}
					<p class="text-sm text-destructive">{$errors.purposes}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create entitlement</Button>
				<a
					href="/governance"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
