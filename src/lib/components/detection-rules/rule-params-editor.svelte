<script lang="ts">
	interface Props {
		ruleType: 'no_manager' | 'terminated' | 'inactive' | 'custom';
		daysThreshold?: number;
		expression?: string;
		onDaysThresholdChange?: (value: number) => void;
		onExpressionChange?: (value: string) => void;
		readonly?: boolean;
		nameAttr?: boolean;
	}

	let {
		ruleType,
		daysThreshold = 90,
		expression = '',
		onDaysThresholdChange,
		onExpressionChange,
		readonly = false,
		nameAttr = false
	}: Props = $props();
</script>

{#if ruleType === 'inactive'}
	<div class="space-y-2">
		<label for="days-threshold" class="text-sm font-medium text-foreground">
			Days Threshold
		</label>
		<input
			id="days-threshold"
			type="number"
			min="1"
			name={nameAttr ? 'days_threshold' : undefined}
			value={daysThreshold}
			readonly={readonly}
			onchange={(e) => onDaysThresholdChange?.(Number(e.currentTarget.value))}
			class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
		/>
		<p class="text-xs text-muted-foreground">
			Number of days of inactivity before detection triggers
		</p>
	</div>
{:else if ruleType === 'custom'}
	<div class="space-y-2">
		<label for="expression" class="text-sm font-medium text-foreground">
			Expression
		</label>
		<textarea
			id="expression"
			name={nameAttr ? 'expression' : undefined}
			value={expression}
			readonly={readonly}
			onchange={(e) => onExpressionChange?.(e.currentTarget.value)}
			class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
			rows={3}
			placeholder="Enter custom detection expression..."
		></textarea>
		<p class="text-xs text-muted-foreground">
			Custom expression for rule evaluation
		</p>
	</div>
{:else}
	<p class="text-sm text-muted-foreground">
		This rule type has no configurable parameters.
	</p>
{/if}
