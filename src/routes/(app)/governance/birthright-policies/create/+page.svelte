<script lang="ts">
	import type { PageData } from './$types';
	import type { BirthrightCondition } from '$lib/api/types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import ConditionBuilder from '$lib/components/catalog/condition-builder.svelte';
	import { EVALUATION_MODES } from '$lib/schemas/birthright';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
	let conditions = $state<BirthrightCondition[]>([{ attribute: '', operator: 'equals', value: '' }]);
	let selectedEntitlements = $state<string[]>([]);
</script>

<PageHeader title="Create Birthright Policy" description="Define conditions for automatic entitlement assignment" />

<form method="POST" use:enhance class="mt-6 max-w-2xl space-y-6">
	<div>
		<label for="name" class="mb-1 block text-sm font-medium">Policy Name *</label>
		<input id="name" name="name" required class="w-full rounded-md border bg-background px-3 py-2 text-sm" />
	</div>

	<div>
		<label for="description" class="mb-1 block text-sm font-medium">Description</label>
		<textarea id="description" name="description" rows="2" class="w-full rounded-md border bg-background px-3 py-2 text-sm"></textarea>
	</div>

	<div class="grid gap-4 sm:grid-cols-3">
		<div>
			<label for="priority" class="mb-1 block text-sm font-medium">Priority</label>
			<input id="priority" name="priority" type="number" value="10" min="0" class="w-full rounded-md border bg-background px-3 py-2 text-sm" />
		</div>
		<div>
			<label for="evaluation_mode" class="mb-1 block text-sm font-medium">Evaluation Mode</label>
			<select id="evaluation_mode" name="evaluation_mode" class="w-full rounded-md border bg-background px-3 py-2 text-sm">
				{#each EVALUATION_MODES as mode}
					<option value={mode}>{mode}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="grace_period_days" class="mb-1 block text-sm font-medium">Grace Period (days)</label>
			<input id="grace_period_days" name="grace_period_days" type="number" value="0" min="0" max="365" class="w-full rounded-md border bg-background px-3 py-2 text-sm" />
		</div>
	</div>

	<div>
		<span class="mb-2 block text-sm font-medium">Conditions *</span>
		<ConditionBuilder {conditions} onUpdate={(c) => conditions = c} />
		<input type="hidden" name="conditions_json" value={JSON.stringify(conditions)} />
	</div>

	<div>
		<span class="mb-2 block text-sm font-medium">Entitlements *</span>
		{#if data.entitlements.length === 0}
			<p class="text-sm text-muted-foreground">No entitlements available. Create entitlements first.</p>
		{:else}
			<div class="max-h-48 space-y-1 overflow-y-auto rounded-md border p-3">
				{#each data.entitlements as ent}
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							name="entitlement_ids"
							value={ent.id}
							checked={selectedEntitlements.includes(ent.id)}
							onchange={(e) => {
								if (e.currentTarget.checked) {
									selectedEntitlements = [...selectedEntitlements, ent.id];
								} else {
									selectedEntitlements = selectedEntitlements.filter(id => id !== ent.id);
								}
							}}
						/>
						{ent.name}
					</label>
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex gap-3">
		<Button type="submit">Create Policy</Button>
		<a href="/governance/birthright-policies"><Button variant="outline" type="button">Cancel</Button></a>
	</div>
</form>
