<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Trash2, Play } from 'lucide-svelte';
	import type { TransitionCondition, EvaluateConditionsResponse } from '$lib/api/types';
	import { saveConditions, evaluateConditions } from '$lib/api/lifecycle-client';
	import { addToast } from '$lib/stores/toast.svelte';

	let {
		configId,
		transitionId,
		initialConditions = []
	}: {
		configId: string;
		transitionId: string;
		initialConditions?: TransitionCondition[];
	} = $props();

	let conditions = $state<TransitionCondition[]>([...initialConditions]);
	let saving = $state(false);
	let error = $state('');
	let evaluating = $state(false);
	let evalContext = $state('{}');
	let evalResult = $state<EvaluateConditionsResponse | null>(null);
	let evalError = $state('');
	let showEvaluate = $state(false);

	function addCondition() {
		conditions = [...conditions, { condition_type: 'attribute_check', attribute_path: '', expression: '' }];
	}

	function removeCondition(index: number) {
		conditions = conditions.filter((_, i) => i !== index);
	}

	async function handleSave() {
		saving = true;
		error = '';
		try {
			const result = await saveConditions(configId, transitionId, { conditions });
			conditions = result;
			addToast('success', 'Conditions saved');
		} catch (e: any) {
			error = e.message || 'Failed to save conditions';
		} finally {
			saving = false;
		}
	}

	async function handleEvaluate() {
		evaluating = true;
		evalError = '';
		evalResult = null;
		try {
			const ctx = JSON.parse(evalContext) as Record<string, unknown>;
			evalResult = await evaluateConditions(configId, transitionId, ctx);
		} catch (e: any) {
			evalError = e.message || 'Failed to evaluate conditions';
		} finally {
			evaluating = false;
		}
	}
</script>

<div class="space-y-4">
	{#if error}
		<Alert variant="destructive">
			<AlertDescription>{error}</AlertDescription>
		</Alert>
	{/if}

	<!-- Condition list -->
	{#if conditions.length === 0}
		<p class="text-sm text-muted-foreground">No conditions. Transition is always allowed.</p>
	{:else}
		{#each conditions as condition, i}
			<div class="flex items-end gap-2 rounded-md border p-3">
				<div class="flex-1 space-y-1">
					<Label>Type</Label>
					<Input type="text" placeholder="e.g. attribute_check" bind:value={condition.condition_type} />
				</div>
				<div class="flex-1 space-y-1">
					<Label>Attribute Path</Label>
					<Input type="text" placeholder="e.g. user.department" bind:value={condition.attribute_path} />
				</div>
				<div class="flex-1 space-y-1">
					<Label>Expression</Label>
					<Input type="text" placeholder="e.g. != 'Executive'" bind:value={condition.expression} />
				</div>
				<Button variant="ghost" size="sm" onclick={() => removeCondition(i)}>
					<Trash2 class="h-4 w-4 text-destructive" />
				</Button>
			</div>
		{/each}
	{/if}

	<div class="flex gap-2">
		<Button variant="outline" size="sm" onclick={addCondition}>
			<Plus class="mr-1 h-3 w-3" />
			Add Condition
		</Button>
		<Button size="sm" onclick={handleSave} disabled={saving}>
			{saving ? 'Saving...' : 'Save Conditions'}
		</Button>
		<Button variant="outline" size="sm" onclick={() => (showEvaluate = !showEvaluate)}>
			<Play class="mr-1 h-3 w-3" />
			Evaluate
		</Button>
	</div>

	<!-- Evaluate section -->
	{#if showEvaluate}
		<div class="rounded-md border p-4">
			<h4 class="mb-2 text-sm font-semibold">Evaluate Conditions</h4>
			<div class="space-y-2">
				<Label>Context (JSON)</Label>
				<textarea
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					bind:value={evalContext}
					placeholder={'{"user": {"department": "Engineering"}}'}
				></textarea>
				<Button size="sm" onclick={handleEvaluate} disabled={evaluating}>
					{evaluating ? 'Evaluating...' : 'Run Evaluation'}
				</Button>
				{#if evalError}
					<Alert variant="destructive">
						<AlertDescription>{evalError}</AlertDescription>
					</Alert>
				{/if}
				{#if evalResult}
					<div class="mt-2">
						{#if evalResult.is_allowed}
							<Badge variant="default" class="bg-green-600">Allowed</Badge>
						{:else}
							<Badge variant="destructive">Not Allowed</Badge>
						{/if}
						{#if evalResult.results && evalResult.results.length > 0}
							<div class="mt-2 space-y-1 text-sm">
								{#each evalResult.results as result}
									<p>
										<span class="font-medium">{result.condition_type}</span>:
										{#if result.passed}
											<Badge variant="outline" class="ml-1">Passed</Badge>
										{:else}
											<Badge variant="destructive" class="ml-1">Failed</Badge>
										{/if}
									</p>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
