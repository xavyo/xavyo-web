<script lang="ts">
	import type { CorrelationRule, CreateCorrelationRuleRequest } from '$lib/api/types';
	import {
		createCorrelationRuleClient,
		updateCorrelationRuleClient,
		validateExpressionClient
	} from '$lib/api/correlation-client';
	import { createCorrelationRuleSchema, updateCorrelationRuleSchema } from '$lib/schemas/correlation';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { addToast } from '$lib/stores/toast.svelte';
	import { FlaskConical } from 'lucide-svelte';

	interface Props {
		connectorId: string;
		rule?: CorrelationRule;
		onSuccess?: () => void;
		onCancel?: () => void;
	}

	let { connectorId, rule, onSuccess, onCancel }: Props = $props();

	let isEditing = $derived(!!rule);
	let schema = $derived(isEditing ? updateCorrelationRuleSchema : createCorrelationRuleSchema);

	// Build initial data from the rule (if editing) or defaults
	const initialData = rule
		? {
				name: rule.name,
				source_attribute: rule.source_attribute,
				target_attribute: rule.target_attribute,
				match_type: rule.match_type,
				algorithm: rule.algorithm ?? undefined,
				threshold: rule.threshold,
				weight: rule.weight,
				expression: rule.expression ?? undefined,
				tier: rule.tier,
				is_definitive: rule.is_definitive,
				normalize: rule.normalize,
				priority: rule.priority
			}
		: {
				name: '',
				source_attribute: '',
				target_attribute: '',
				match_type: 'exact' as const,
				algorithm: undefined,
				threshold: 0.8,
				weight: 1,
				expression: undefined,
				tier: 1,
				is_definitive: false,
				normalize: true,
				priority: 10
			};

	const { form, errors, enhance, submitting: formSubmitting } = superForm(defaults(initialData, zodClient(schema)), {
		SPA: true,
		validators: zodClient(schema),
		async onUpdate({ form: updatedForm }) {
			if (!updatedForm.valid) return;
			try {
				const data = updatedForm.data;
				if (isEditing && rule) {
					await updateCorrelationRuleClient(connectorId, rule.id, data);
					addToast('success', 'Correlation rule updated');
				} else {
					await createCorrelationRuleClient(
						connectorId,
						data as CreateCorrelationRuleRequest
					);
					addToast('success', 'Correlation rule created');
				}
				onSuccess?.();
			} catch (err) {
				addToast('error', err instanceof Error ? err.message : 'Failed to save rule');
			}
		}
	});

	let submitting = $derived($formSubmitting);

	// Expression validation state
	let testInput = $state('');
	let expressionResult = $state<{ valid: boolean; result: string | null; error: string | null } | null>(null);
	let testingExpression = $state(false);

	// Derived: show/hide conditional fields
	let showAlgorithm = $derived(String($form.match_type ?? '') === 'fuzzy');
	let showExpression = $derived(String($form.match_type ?? '') === 'expression');

	async function handleTestExpression() {
		const expr = String($form.expression ?? '');
		if (!expr.trim()) {
			addToast('error', 'Expression is empty');
			return;
		}
		testingExpression = true;
		expressionResult = null;
		try {
			let testInputParsed: { source: Record<string, unknown>; target: Record<string, unknown> } | undefined;
			if (testInput.trim()) {
				try {
					testInputParsed = JSON.parse(testInput) as { source: Record<string, unknown>; target: Record<string, unknown> };
				} catch {
					addToast('error', 'Invalid JSON test input. Expected {"source": {...}, "target": {...}}');
					testingExpression = false;
					return;
				}
			}
			expressionResult = await validateExpressionClient(connectorId, {
				expression: expr,
				test_input: testInputParsed
			});
		} catch (err) {
			addToast('error', err instanceof Error ? err.message : 'Failed to validate expression');
		} finally {
			testingExpression = false;
		}
	}

	function handleInput(field: string) {
		return (e: Event) => {
			const target = e.target as HTMLInputElement;
			($form as Record<string, unknown>)[field] = target.value;
		};
	}

	function handleNumberInput(field: string) {
		return (e: Event) => {
			const target = e.target as HTMLInputElement;
			($form as Record<string, unknown>)[field] = target.valueAsNumber;
		};
	}

	function handleCheckboxInput(field: string) {
		return (e: Event) => {
			const target = e.target as HTMLInputElement;
			($form as Record<string, unknown>)[field] = target.checked;
		};
	}

	function handleSelectInput(field: string) {
		return (e: Event) => {
			const target = e.target as HTMLSelectElement;
			($form as Record<string, unknown>)[field] = target.value;
		};
	}
</script>

<form method="POST" use:enhance class="space-y-4">
	<!-- Name -->
	<div class="space-y-2">
		<Label for="rule-name">Name</Label>
		<Input
			id="rule-name"
			type="text"
			placeholder="e.g. Email exact match"
			value={String($form.name ?? '')}
			oninput={handleInput('name')}
		/>
		{#if $errors.name}
			<p class="text-sm text-destructive">{$errors.name}</p>
		{/if}
	</div>

	<!-- Source / Target attributes -->
	<div class="grid grid-cols-2 gap-4">
		<div class="space-y-2">
			<Label for="source-attribute">Source Attribute</Label>
			<Input
				id="source-attribute"
				type="text"
				placeholder="e.g. email"
				value={String($form.source_attribute ?? '')}
				oninput={handleInput('source_attribute')}
			/>
			{#if $errors.source_attribute}
				<p class="text-sm text-destructive">{$errors.source_attribute}</p>
			{/if}
		</div>
		<div class="space-y-2">
			<Label for="target-attribute">Target Attribute</Label>
			<Input
				id="target-attribute"
				type="text"
				placeholder="e.g. email"
				value={String($form.target_attribute ?? '')}
				oninput={handleInput('target_attribute')}
			/>
			{#if $errors.target_attribute}
				<p class="text-sm text-destructive">{$errors.target_attribute}</p>
			{/if}
		</div>
	</div>

	<!-- Match Type -->
	<div class="space-y-2">
		<Label for="match-type">Match Type</Label>
		<select
			id="match-type"
			class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			value={String($form.match_type ?? 'exact')}
			onchange={handleSelectInput('match_type')}
		>
			<option value="exact">Exact</option>
			<option value="fuzzy">Fuzzy</option>
			<option value="expression">Expression</option>
		</select>
		{#if $errors.match_type}
			<p class="text-sm text-destructive">{$errors.match_type}</p>
		{/if}
	</div>

	<!-- Algorithm (shown only when fuzzy) -->
	{#if showAlgorithm}
		<div class="space-y-2">
			<Label for="algorithm">Algorithm</Label>
			<select
				id="algorithm"
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				value={String($form.algorithm ?? '')}
				onchange={handleSelectInput('algorithm')}
			>
				<option value="" disabled>Select algorithm</option>
				<option value="levenshtein">Levenshtein</option>
				<option value="jaro_winkler">Jaro-Winkler</option>
			</select>
			{#if $errors.algorithm}
				<p class="text-sm text-destructive">{$errors.algorithm}</p>
			{/if}
		</div>
	{/if}

	<!-- Expression (shown only when expression) -->
	{#if showExpression}
		<div class="space-y-2">
			<Label for="expression">Expression</Label>
			<textarea
				id="expression"
				class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				placeholder="Enter matching expression"
				value={String($form.expression ?? '')}
				oninput={(e) => {
					const target = e.target as HTMLTextAreaElement;
					($form as Record<string, unknown>).expression = target.value;
				}}
			></textarea>
			{#if $errors.expression}
				<p class="text-sm text-destructive">{$errors.expression}</p>
			{/if}

			<!-- Test Expression -->
			<div class="space-y-2 rounded-md border bg-muted/30 p-3">
				<Label for="test-input">Test Input (optional JSON)</Label>
				<textarea
					id="test-input"
					class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder={'{"source": {"email": "user@example.com"}, "target": {"email": "user@example.com"}}'}
					bind:value={testInput}
				></textarea>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={handleTestExpression}
					disabled={testingExpression}
				>
					<FlaskConical class="mr-1 h-4 w-4" />
					{testingExpression ? 'Testing...' : 'Test Expression'}
				</Button>

				{#if expressionResult}
					{#if expressionResult.valid}
						<Alert class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
							<AlertDescription>
								<span class="font-medium text-green-800 dark:text-green-200">Valid.</span>
								{#if expressionResult.result}
									<span class="ml-1 text-green-700 dark:text-green-300">Result: {expressionResult.result}</span>
								{/if}
							</AlertDescription>
						</Alert>
					{:else}
						<Alert variant="destructive">
							<AlertDescription>{expressionResult.error ?? 'Expression is invalid'}</AlertDescription>
						</Alert>
					{/if}
				{/if}
			</div>
		</div>
	{/if}

	<!-- Threshold and Weight -->
	<div class="grid grid-cols-2 gap-4">
		<div class="space-y-2">
			<Label for="threshold">Threshold (%)</Label>
			<Input
				id="threshold"
				type="number"
				min="0"
				max="100"
				step="1"
				placeholder="80"
				value={String(Math.round(Number($form.threshold ?? 0.8) * 100))}
				oninput={(e) => {
					const target = e.target as HTMLInputElement;
					($form as Record<string, unknown>).threshold = target.valueAsNumber / 100;
				}}
			/>
			<p class="text-xs text-muted-foreground">
				API value: {Number($form.threshold ?? 0).toFixed(2)}
			</p>
			{#if $errors.threshold}
				<p class="text-sm text-destructive">{$errors.threshold}</p>
			{/if}
		</div>
		<div class="space-y-2">
			<Label for="weight">Weight</Label>
			<Input
				id="weight"
				type="number"
				min="0"
				step="0.1"
				placeholder="1.0"
				value={String($form.weight ?? '')}
				oninput={handleNumberInput('weight')}
			/>
			{#if $errors.weight}
				<p class="text-sm text-destructive">{$errors.weight}</p>
			{/if}
		</div>
	</div>

	<!-- Tier and Priority -->
	<div class="grid grid-cols-2 gap-4">
		<div class="space-y-2">
			<Label for="tier">Tier</Label>
			<Input
				id="tier"
				type="number"
				min="1"
				step="1"
				placeholder="1"
				value={String($form.tier ?? '')}
				oninput={handleNumberInput('tier')}
			/>
			{#if $errors.tier}
				<p class="text-sm text-destructive">{$errors.tier}</p>
			{/if}
		</div>
		<div class="space-y-2">
			<Label for="priority">Priority</Label>
			<Input
				id="priority"
				type="number"
				min="0"
				step="1"
				placeholder="10"
				value={String($form.priority ?? '')}
				oninput={handleNumberInput('priority')}
			/>
			{#if $errors.priority}
				<p class="text-sm text-destructive">{$errors.priority}</p>
			{/if}
		</div>
	</div>

	<!-- Boolean checkboxes -->
	<div class="flex items-center gap-6">
		<label class="flex items-center gap-2 text-sm">
			<input
				type="checkbox"
				checked={!!$form.is_definitive}
				onchange={handleCheckboxInput('is_definitive')}
				class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
			/>
			Definitive match
		</label>
		<label class="flex items-center gap-2 text-sm">
			<input
				type="checkbox"
				checked={$form.normalize !== false}
				onchange={handleCheckboxInput('normalize')}
				class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
			/>
			Normalize values
		</label>
	</div>

	<!-- Form actions -->
	<div class="flex justify-end gap-2 pt-2">
		{#if onCancel}
			<Button type="button" variant="outline" onclick={onCancel}>Cancel</Button>
		{/if}
		<Button type="submit" disabled={submitting}>
			{#if submitting}
				Saving...
			{:else if isEditing}
				Update Rule
			{:else}
				Create Rule
			{/if}
		</Button>
	</div>
</form>
