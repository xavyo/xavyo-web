<script lang="ts">
	import type { BirthrightCondition } from '$lib/api/types';
	import { POLICY_CONDITION_OPERATORS } from '$lib/schemas/birthright';
	import { Button } from '$lib/components/ui/button';
	import { Plus, Trash2 } from 'lucide-svelte';

	interface Props {
		conditions: BirthrightCondition[];
		onUpdate: (conditions: BirthrightCondition[]) => void;
	}

	let { conditions, onUpdate }: Props = $props();

	function addCondition() {
		onUpdate([...conditions, { attribute: '', operator: 'equals', value: '' }]);
	}

	function removeCondition(index: number) {
		onUpdate(conditions.filter((_, i) => i !== index));
	}

	function updateCondition(index: number, field: keyof BirthrightCondition, val: unknown) {
		const updated = conditions.map((c, i) => i === index ? { ...c, [field]: val } : c);
		onUpdate(updated);
	}

	function parseValue(operator: string, raw: string): unknown {
		if (operator === 'in' || operator === 'not_in') {
			return raw.split(',').map((s) => s.trim()).filter(Boolean);
		}
		return raw;
	}
</script>

<div class="space-y-3" data-testid="condition-builder">
	{#each conditions as condition, index (index)}
		<div class="flex items-start gap-2 rounded-lg border bg-card p-3">
			<div class="grid flex-1 gap-2 sm:grid-cols-3">
				<input
					type="text"
					placeholder="Attribute (e.g., department)"
					value={condition.attribute}
					oninput={(e) => updateCondition(index, 'attribute', e.currentTarget.value)}
					class="rounded-md border bg-background px-3 py-2 text-sm"
				/>
				<select
					value={condition.operator}
					onchange={(e) => updateCondition(index, 'operator', e.currentTarget.value)}
					class="rounded-md border bg-background px-3 py-2 text-sm"
				>
					{#each POLICY_CONDITION_OPERATORS as op}
						<option value={op}>{op}</option>
					{/each}
				</select>
				<input
					type="text"
					placeholder={condition.operator === 'in' || condition.operator === 'not_in' ? 'val1, val2, val3' : 'Value'}
					value={typeof condition.value === 'object' && Array.isArray(condition.value) ? condition.value.join(', ') : String(condition.value ?? '')}
					oninput={(e) => updateCondition(index, 'value', parseValue(condition.operator, e.currentTarget.value))}
					class="rounded-md border bg-background px-3 py-2 text-sm"
				/>
			</div>
			<Button variant="ghost" size="icon" onclick={() => removeCondition(index)} aria-label="Remove condition">
				<Trash2 class="h-4 w-4 text-destructive" />
			</Button>
		</div>
	{/each}

	<Button variant="outline" size="sm" onclick={addCondition}>
		<Plus class="mr-1.5 h-3.5 w-3.5" />
		Add Condition
	</Button>
</div>
