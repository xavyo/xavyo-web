<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { X } from 'lucide-svelte';
	import type { BirthrightOperator } from '$lib/api/types';

	interface Props {
		attribute: string;
		operator: BirthrightOperator;
		value: string | string[];
		index: number;
		onchange: (index: number, field: 'attribute' | 'operator' | 'value', val: string | string[] | BirthrightOperator) => void;
		onremove: (index: number) => void;
	}

	let { attribute, operator, value, index, onchange, onremove }: Props = $props();

	const operators: { value: BirthrightOperator; label: string }[] = [
		{ value: 'equals', label: 'Equals' },
		{ value: 'not_equals', label: 'Not Equals' },
		{ value: 'in', label: 'In' },
		{ value: 'not_in', label: 'Not In' },
		{ value: 'starts_with', label: 'Starts With' },
		{ value: 'contains', label: 'Contains' }
	];

	let isMultiValue = $derived(operator === 'in' || operator === 'not_in');

	let displayValue = $derived(
		Array.isArray(value) ? value.join(', ') : (value ?? '')
	);

	const attributeSuggestions = ['department', 'location', 'job_title', 'metadata.cost_center', 'custom_attributes.employee_type'];

	function handleAttributeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		onchange(index, 'attribute', target.value);
	}

	function handleOperatorChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		const newOp = target.value as BirthrightOperator;
		onchange(index, 'operator', newOp);
		// Reset value when switching between single/multi-value operators
		const wasMulti = operator === 'in' || operator === 'not_in';
		const isNowMulti = newOp === 'in' || newOp === 'not_in';
		if (wasMulti !== isNowMulti) {
			onchange(index, 'value', isNowMulti ? [] : '');
		}
	}

	function handleValueChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (isMultiValue) {
			const values = target.value.split(',').map((v) => v.trim()).filter(Boolean);
			onchange(index, 'value', values);
		} else {
			onchange(index, 'value', target.value);
		}
	}
</script>

<div class="flex items-end gap-2" data-testid="condition-row-{index}">
	<div class="flex-1 space-y-1">
		<Label for="condition-attr-{index}" class="text-xs">Attribute</Label>
		<Input
			id="condition-attr-{index}"
			type="text"
			list="attr-suggestions"
			placeholder="e.g. department"
			value={attribute}
			oninput={handleAttributeChange}
		/>
	</div>

	<div class="w-40 space-y-1">
		<Label for="condition-op-{index}" class="text-xs">Operator</Label>
		<select
			id="condition-op-{index}"
			class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			value={operator}
			onchange={handleOperatorChange}
		>
			{#each operators as op}
				<option value={op.value}>{op.label}</option>
			{/each}
		</select>
	</div>

	<div class="flex-1 space-y-1">
		<Label for="condition-val-{index}" class="text-xs">
			{isMultiValue ? 'Values (comma-separated)' : 'Value'}
		</Label>
		<Input
			id="condition-val-{index}"
			type="text"
			placeholder={isMultiValue ? 'e.g. US, UK, DE' : 'e.g. Engineering'}
			value={displayValue}
			oninput={handleValueChange}
		/>
	</div>

	<Button variant="ghost" size="icon" onclick={() => onremove(index)} aria-label="Remove condition">
		<X class="h-4 w-4" />
	</Button>
</div>

<datalist id="attr-suggestions">
	{#each attributeSuggestions as suggestion}
		<option value={suggestion}></option>
	{/each}
</datalist>
