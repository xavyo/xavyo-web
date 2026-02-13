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
	import { CRITERIA_FIELDS, CRITERIA_OPERATORS } from '$lib/schemas/meta-roles';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Meta-role created successfully');
			}
		}
	});

	// Criteria builder state
	let criteria = $state<{ field: string; operator: string; value: string }[]>([]);
	let newField = $state('');
	let newOperator = $state('');
	let newValue = $state('');

	const FIELD_LABELS: Record<string, string> = {
		risk_level: 'Risk Level',
		application_id: 'Application ID',
		owner_id: 'Owner ID',
		status: 'Status',
		name: 'Name',
		is_delegable: 'Is Delegable',
		metadata: 'Metadata'
	};

	const OPERATOR_LABELS: Record<string, string> = {
		eq: 'Equals',
		neq: 'Not Equals',
		in: 'In',
		not_in: 'Not In',
		gt: 'Greater Than',
		gte: 'Greater or Equal',
		lt: 'Less Than',
		lte: 'Less or Equal',
		contains: 'Contains',
		starts_with: 'Starts With'
	};

	function addCriterion() {
		if (!newField || !newOperator || !newValue) return;
		criteria = [...criteria, { field: newField, operator: newOperator, value: newValue }];
		newField = '';
		newOperator = '';
		newValue = '';
	}

	function removeCriterion(index: number) {
		criteria = criteria.filter((_, i) => i !== index);
	}
</script>

<PageHeader title="Create Meta-Role" description="Define a new business role with dynamic criteria" />

<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Meta-role details</h2>
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
					placeholder="e.g. High Risk Policy"
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
					placeholder="Brief description of this meta-role"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="priority">Priority (1-1000, lower = higher)</Label>
					<Input
						id="priority"
						name="priority"
						type="number"
						min="1"
						max="1000"
						placeholder="10"
						value={String($form.priority ?? '')}
					/>
					{#if $errors.priority}
						<p class="text-sm text-destructive">{$errors.priority}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="criteria_logic">Criteria Logic</Label>
					<select
						id="criteria_logic"
						name="criteria_logic"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						value={String($form.criteria_logic ?? 'and')}
					>
						<option value="and">AND -- All must match</option>
						<option value="or">OR -- Any can match</option>
					</select>
					{#if $errors.criteria_logic}
						<p class="text-sm text-destructive">{$errors.criteria_logic}</p>
					{/if}
				</div>
			</div>

			<Separator />

			<!-- Criteria Builder -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-medium">Matching Criteria</h3>
					<span class="text-sm text-muted-foreground">
						{criteria.length} {criteria.length === 1 ? 'criterion' : 'criteria'} added
					</span>
				</div>
				<p class="text-sm text-muted-foreground">
					At least one criterion is required. Roles matching these criteria will inherit this meta-role.
				</p>

				<!-- Existing criteria -->
				{#if criteria.length > 0}
					<div class="space-y-2">
						{#each criteria as criterion, i}
							<div class="flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm">
								<span class="font-medium">{FIELD_LABELS[criterion.field] ?? criterion.field}</span>
								<span class="text-muted-foreground">{OPERATOR_LABELS[criterion.operator] ?? criterion.operator}</span>
								<span class="font-mono text-xs">{criterion.value}</span>
								<button
									type="button"
									class="ml-auto rounded p-1 text-destructive hover:bg-destructive/10"
									onclick={() => removeCriterion(i)}
								>
									Remove
								</button>
								<!-- Hidden inputs for form submission -->
								<input type="hidden" name="criteria_field" value={criterion.field} />
								<input type="hidden" name="criteria_operator" value={criterion.operator} />
								<input type="hidden" name="criteria_value" value={criterion.value} />
							</div>
						{/each}
					</div>
				{/if}

				<!-- Add criterion form -->
				<div class="rounded-md border border-dashed p-3 space-y-3">
					<p class="text-sm font-medium">Add Criterion</p>
					<div class="grid grid-cols-3 gap-2">
						<select
							bind:value={newField}
							class="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="">Select field...</option>
							{#each CRITERIA_FIELDS as field}
								<option value={field}>{FIELD_LABELS[field] ?? field}</option>
							{/each}
						</select>

						<select
							bind:value={newOperator}
							class="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="">Select operator...</option>
							{#each CRITERIA_OPERATORS as op}
								<option value={op}>{OPERATOR_LABELS[op] ?? op}</option>
							{/each}
						</select>

						<div class="flex gap-1">
							<input
								type="text"
								bind:value={newValue}
								placeholder="Value"
								class="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
							/>
							<button
								type="button"
								class="flex h-9 shrink-0 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
								disabled={!newField || !newOperator || !newValue}
								onclick={addCriterion}
							>
								Add
							</button>
						</div>
					</div>
				</div>
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit" disabled={criteria.length === 0}>Create Meta-Role</Button>
				<a
					href="/governance/meta-roles"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
