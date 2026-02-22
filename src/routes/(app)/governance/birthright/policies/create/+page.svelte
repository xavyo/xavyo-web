<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import ConditionBuilder from '$lib/components/birthright/condition-builder.svelte';
	import EntitlementPicker from '$lib/components/birthright/entitlement-picker.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';
	import type { BirthrightCondition } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Policy created successfully');
			}
		}
	});

	let conditions = $state<BirthrightCondition[]>([{ attribute: '', operator: 'equals', value: '' }]);
	let selectedEntitlementIds = $state<string[]>([]);
</script>

<PageHeader
	title="Create Birthright Policy"
	description="Define conditions and entitlements for automatic provisioning"
/>

<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Policy Details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-6">
			<!-- Hidden fields for complex data -->
			<input type="hidden" name="conditions_json" value={JSON.stringify(conditions)} />
			<input
				type="hidden"
				name="entitlement_ids_json"
				value={JSON.stringify(selectedEntitlementIds)}
			/>

			<div class="space-y-2">
				<Label for="name">Policy Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="e.g. Engineering Birthright"
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
					class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder="Brief description of the policy"
					value={String($form.description ?? '')}
				></textarea>
			</div>

			<div class="grid grid-cols-3 gap-4">
				<div class="space-y-2">
					<Label for="priority">Priority</Label>
					<Input
						id="priority"
						name="priority"
						type="number"
						min="0"
						placeholder="1"
						value={String($form.priority ?? '1')}
					/>
					{#if $errors.priority}
						<p class="text-sm text-destructive">{$errors.priority}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="evaluation_mode">Evaluation Mode</Label>
					<select
						id="evaluation_mode"
						name="evaluation_mode"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.evaluation_mode ?? 'all_match')}
					>
						<option value="all_match">All Match</option>
						<option value="first_match">First Match</option>
					</select>
				</div>
				<div class="space-y-2">
					<Label for="grace_period_days">Grace Period (days)</Label>
					<Input
						id="grace_period_days"
						name="grace_period_days"
						type="number"
						min="0"
						max="365"
						placeholder="7"
						value={String($form.grace_period_days ?? '7')}
					/>
					{#if $errors.grace_period_days}
						<p class="text-sm text-destructive">{$errors.grace_period_days}</p>
					{/if}
				</div>
			</div>

			<Separator />

			<ConditionBuilder
				{conditions}
				onchange={(c) => {
					conditions = c;
				}}
			/>

			<Separator />

			<EntitlementPicker
				entitlements={data.entitlements}
				selectedIds={selectedEntitlementIds}
				onchange={(ids) => {
					selectedEntitlementIds = ids;
				}}
			/>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Policy</Button>
				<a
					href="/governance/birthright"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
