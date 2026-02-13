<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus } from 'lucide-svelte';
	import ConditionRow from './condition-row.svelte';
	import type { BirthrightCondition, BirthrightOperator } from '$lib/api/types';

	interface Props {
		conditions: BirthrightCondition[];
		onchange: (conditions: BirthrightCondition[]) => void;
	}

	let { conditions, onchange }: Props = $props();

	function addCondition() {
		const updated = [...conditions, { attribute: '', operator: 'equals' as BirthrightOperator, value: '' }];
		onchange(updated);
	}

	function removeCondition(index: number) {
		if (conditions.length <= 1) return;
		const updated = conditions.filter((_, i) => i !== index);
		onchange(updated);
	}

	function updateCondition(index: number, field: 'attribute' | 'operator' | 'value', val: string | string[] | BirthrightOperator) {
		const updated = conditions.map((c, i) => {
			if (i !== index) return c;
			return { ...c, [field]: val };
		});
		onchange(updated);
	}
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-medium">Conditions</h3>
		<Button variant="outline" size="sm" onclick={addCondition}>
			<Plus class="mr-1 h-4 w-4" />
			Add Condition
		</Button>
	</div>

	{#if conditions.length === 0}
		<p class="text-sm text-muted-foreground">No conditions added. At least one condition is required.</p>
	{/if}

	{#each conditions as condition, i}
		<ConditionRow
			attribute={condition.attribute}
			operator={condition.operator}
			value={condition.value}
			index={i}
			onchange={updateCondition}
			onremove={removeCondition}
		/>
	{/each}
</div>
