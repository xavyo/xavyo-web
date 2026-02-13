<script lang="ts">
	interface RuleData {
		rule_type: 'default' | 'computed' | 'validation' | 'normalization';
		target_attribute: string;
		expression: string;
		strength: 'strong' | 'normal' | 'weak';
		priority: number;
		condition?: string;
		error_message?: string;
		authoritative: boolean;
		exclusive: boolean;
	}

	interface Props {
		ruleType?: 'default' | 'computed' | 'validation' | 'normalization';
		targetAttribute?: string;
		expression?: string;
		strength?: 'strong' | 'normal' | 'weak';
		priority?: number;
		condition?: string;
		errorMessage?: string;
		authoritative?: boolean;
		exclusive?: boolean;
		onsubmit?: (data: RuleData) => void;
		oncancel?: () => void;
		submitLabel?: string;
	}

	let {
		ruleType = 'default',
		targetAttribute = '',
		expression = '',
		strength = 'normal',
		priority = 100,
		condition = '',
		errorMessage = '',
		authoritative = true,
		exclusive = false,
		onsubmit,
		oncancel,
		submitLabel = 'Add Rule'
	}: Props = $props();

	let formRuleType = $state(ruleType);
	let formTargetAttribute = $state(targetAttribute);
	let formExpression = $state(expression);
	let formStrength = $state(strength);
	let formPriority = $state(priority);
	let formCondition = $state(condition);
	let formErrorMessage = $state(errorMessage);
	let formAuthoritative = $state(authoritative);
	let formExclusive = $state(exclusive);

	function handleSubmit() {
		if (!formTargetAttribute.trim() || !formExpression.trim()) return;
		const data: RuleData = {
			rule_type: formRuleType,
			target_attribute: formTargetAttribute.trim(),
			expression: formExpression.trim(),
			strength: formStrength,
			priority: formPriority,
			authoritative: formAuthoritative,
			exclusive: formExclusive
		};
		if (formCondition.trim()) {
			data.condition = formCondition.trim();
		}
		if (formErrorMessage.trim()) {
			data.error_message = formErrorMessage.trim();
		}
		onsubmit?.(data);
	}
</script>

<div class="space-y-3 rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
	<div class="grid gap-3 md:grid-cols-2">
		<div>
			<label for="rule-type" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Rule Type</label>
			<select
				id="rule-type"
				bind:value={formRuleType}
				class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
			>
				<option value="default">Default</option>
				<option value="computed">Computed</option>
				<option value="validation">Validation</option>
				<option value="normalization">Normalization</option>
			</select>
		</div>
		<div>
			<label for="rule-target-attribute" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Target Attribute</label>
			<input
				id="rule-target-attribute"
				type="text"
				bind:value={formTargetAttribute}
				placeholder="e.g., department"
				class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
			/>
		</div>
	</div>
	<div>
		<label for="rule-expression" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Expression</label>
		<textarea
			id="rule-expression"
			bind:value={formExpression}
			rows={3}
			placeholder="e.g., 'Engineering' or source.department"
			class="w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
		></textarea>
	</div>
	<div class="grid gap-3 md:grid-cols-3">
		<div>
			<label for="rule-strength" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Strength</label>
			<select
				id="rule-strength"
				bind:value={formStrength}
				class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
			>
				<option value="strong">Strong</option>
				<option value="normal">Normal</option>
				<option value="weak">Weak</option>
			</select>
		</div>
		<div>
			<label for="rule-priority" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Priority</label>
			<input
				id="rule-priority"
				type="number"
				bind:value={formPriority}
				min="1"
				max="1000"
				class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
			/>
		</div>
		<div>
			<label for="rule-condition" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Condition (optional)</label>
			<input
				id="rule-condition"
				type="text"
				bind:value={formCondition}
				placeholder="e.g., source.type == 'hr'"
				class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
			/>
		</div>
	</div>
	<div>
		<label for="rule-error-message" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Error Message (optional)</label>
		<input
			id="rule-error-message"
			type="text"
			bind:value={formErrorMessage}
			placeholder="Validation error message"
			class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
		/>
	</div>
	<div class="flex items-center gap-6">
		<label class="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
			<input
				type="checkbox"
				bind:checked={formAuthoritative}
				class="h-4 w-4 rounded border-zinc-300 text-blue-600"
			/>
			Authoritative
		</label>
		<label class="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
			<input
				type="checkbox"
				bind:checked={formExclusive}
				class="h-4 w-4 rounded border-zinc-300 text-blue-600"
			/>
			Exclusive
		</label>
	</div>
	<div class="flex gap-2">
		<button
			onclick={handleSubmit}
			class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
		>
			{submitLabel}
		</button>
		{#if oncancel}
			<button
				onclick={oncancel}
				class="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
			>
				Cancel
			</button>
		{/if}
	</div>
</div>
