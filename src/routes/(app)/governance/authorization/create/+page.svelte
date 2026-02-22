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
				addToast('success', 'Policy created successfully');
			}
		}
	});

	interface ConditionEntry {
		condition_type: string;
		attribute_path: string;
		operator: string;
		value: string;
	}

	let conditions = $state<ConditionEntry[]>([]);

	function addCondition() {
		conditions = [
			...conditions,
			{ condition_type: 'user_attribute', attribute_path: '', operator: 'equals', value: '' }
		];
	}

	function removeCondition(index: number) {
		conditions = conditions.filter((_, i) => i !== index);
	}

	const conditionTypeLabels: Record<string, string> = {
		time_window: 'Time Window',
		user_attribute: 'User Attribute',
		entitlement_check: 'Entitlement Check'
	};

	const operatorLabels: Record<string, string> = {
		equals: 'Equals',
		not_equals: 'Not Equals',
		contains: 'Contains',
		in_list: 'In List'
	};
</script>

<PageHeader title="Create Policy" description="Create a new authorization policy" />

<Card class="max-w-2xl">
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
					placeholder="e.g. Allow read access to documents"
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
					placeholder="Brief description of this policy"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="effect">Effect</Label>
				<select
					id="effect"
					name="effect"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					value={String($form.effect ?? 'allow')}
				>
					<option value="allow">Allow</option>
					<option value="deny">Deny</option>
				</select>
				{#if $errors.effect}
					<p class="text-sm text-destructive">{$errors.effect}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="priority">Priority</Label>
				<Input
					id="priority"
					name="priority"
					type="number"
					placeholder="100"
					value={String($form.priority ?? '100')}
				/>
				<p class="text-xs text-muted-foreground">
					Lower numbers = higher priority. Range: 0-10000.
				</p>
				{#if $errors.priority}
					<p class="text-sm text-destructive">{$errors.priority}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="resource_type">Resource Type</Label>
				<Input
					id="resource_type"
					name="resource_type"
					type="text"
					placeholder="e.g. document, user, report"
					value={String($form.resource_type ?? '')}
				/>
				{#if $errors.resource_type}
					<p class="text-sm text-destructive">{$errors.resource_type}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="action">Action</Label>
				<Input
					id="action"
					name="action"
					type="text"
					placeholder="e.g. read, write, delete"
					value={String($form.action ?? '')}
				/>
				{#if $errors.action}
					<p class="text-sm text-destructive">{$errors.action}</p>
				{/if}
			</div>

			<Separator class="my-4" />

			<!-- Conditions Section -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-medium">Conditions</h3>
					<Button type="button" variant="outline" size="sm" onclick={addCondition}>
						Add Condition
					</Button>
				</div>

				{#if conditions.length === 0}
					<p class="text-sm text-muted-foreground">
						No conditions added. Policy will apply unconditionally.
					</p>
				{/if}

				{#each conditions as condition, index}
					<div class="rounded-md border p-4 space-y-3">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium">Condition {index + 1}</span>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onclick={() => removeCondition(index)}
							>
								Remove
							</Button>
						</div>

						<div class="space-y-2">
							<Label for="condition_type_{index}">Type</Label>
							<select
								id="condition_type_{index}"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								value={condition.condition_type}
								onchange={(e) => {
									conditions[index].condition_type = (e.target as HTMLSelectElement).value;
								}}
							>
								{#each Object.entries(conditionTypeLabels) as [val, label]}
									<option value={val}>{label}</option>
								{/each}
							</select>
						</div>

						<div class="space-y-2">
							<Label for="condition_attribute_path_{index}">Attribute Path</Label>
							<Input
								id="condition_attribute_path_{index}"
								type="text"
								placeholder="e.g. department, role, location"
								value={condition.attribute_path}
								oninput={(e) => {
									conditions[index].attribute_path = (e.target as HTMLInputElement).value;
								}}
							/>
						</div>

						<div class="space-y-2">
							<Label for="condition_operator_{index}">Operator</Label>
							<select
								id="condition_operator_{index}"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								value={condition.operator}
								onchange={(e) => {
									conditions[index].operator = (e.target as HTMLSelectElement).value;
								}}
							>
								{#each Object.entries(operatorLabels) as [val, label]}
									<option value={val}>{label}</option>
								{/each}
							</select>
						</div>

						<div class="space-y-2">
							<Label for="condition_value_{index}">Value</Label>
							<Input
								id="condition_value_{index}"
								type="text"
								placeholder="e.g. engineering, admin"
								value={condition.value}
								oninput={(e) => {
									conditions[index].value = (e.target as HTMLInputElement).value;
								}}
							/>
						</div>

						<!-- Hidden fields for form submission -->
						<input type="hidden" name="condition_type" value={condition.condition_type} />
						<input type="hidden" name="condition_attribute_path" value={condition.attribute_path} />
						<input type="hidden" name="condition_operator" value={condition.operator} />
						<input type="hidden" name="condition_value" value={condition.value} />
					</div>
				{/each}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Policy</Button>
				<a
					href="/governance/authorization"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
