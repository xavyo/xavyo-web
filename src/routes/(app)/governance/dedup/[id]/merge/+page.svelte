<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import ConfidenceBadge from '$lib/components/dedup/confidence-badge.svelte';
	import EntitlementPreview from '$lib/components/dedup/entitlement-preview.svelte';
	import SodViolations from '$lib/components/dedup/sod-violations.svelte';
	import MergePreviewCard from '$lib/components/dedup/merge-preview.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { EntitlementStrategy } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let preview = $derived(data.preview);
	let duplicate = $derived(data.duplicate);

	const { form: mergeFormData, enhance: mergeEnhance } = superForm(data.mergeForm, {
		invalidateAll: 'force',
		onUpdated({ form }) {
			if (form.message) {
				addToast(form.valid ? 'success' : 'error', form.message);
			}
		}
	});

	// Attribute selections — for each differing attr, track source or target
	let attributeSelections: Record<string, 'source' | 'target'> = $state({});

	// Initialize from comparison
	$effect(() => {
		const initial: Record<string, 'source' | 'target'> = {};
		for (const comp of duplicate.attribute_comparison) {
			if (comp.is_different) {
				initial[comp.attribute] = 'target'; // default: keep target
			}
		}
		attributeSelections = initial;
	});

	let selectedStrategy: EntitlementStrategy = $state('union');
	let sodOverrideReason = $state('');

	// Compute reactive merged preview based on attribute selections
	const mergedResult = $derived.by(() => {
		const base = { ...preview.merged_preview };
		for (const [attr, source] of Object.entries(attributeSelections)) {
			const comp = duplicate.attribute_comparison.find(c => c.attribute === attr);
			if (!comp) continue;
			const value = source === 'source' ? comp.value_a : comp.value_b;
			if (attr === 'email') base.email = value as string | null;
			else if (attr === 'display_name') base.display_name = value as string | null;
			else if (attr === 'department') base.department = value as string | null;
			else base.attributes = { ...base.attributes, [attr]: value };
		}
		return base;
	});

	// Build hidden input JSON
	const attributeSelectionsJson = $derived(
		JSON.stringify(
			Object.fromEntries(
				Object.entries(attributeSelections).map(([k, v]) => [k, { source: v }])
			)
		)
	);

	const hasSodViolations = $derived(preview.sod_check.has_violations);
	const canExecute = $derived(!hasSodViolations || (preview.sod_check.can_override && sodOverrideReason.length > 0));
</script>

<PageHeader title="Merge Identities" description="Review and execute identity merge">
	<a href="/governance/dedup/{duplicate.id}" class="text-sm text-muted-foreground hover:text-foreground">&larr; Back to detail</a>
</PageHeader>

<div class="space-y-6">
	<!-- Confidence -->
	<div class="flex items-center gap-2">
		<span class="text-sm text-muted-foreground">Confidence:</span>
		<ConfidenceBadge score={duplicate.confidence_score} />
	</div>

	<!-- Side-by-side Preview -->
	<div class="grid gap-4 md:grid-cols-3">
		<MergePreviewCard identity={preview.source_identity} title="Source (will be removed)" />
		<MergePreviewCard identity={preview.target_identity} title="Target (will be kept)" />
		<MergePreviewCard identity={mergedResult} title="Merged Result" />
	</div>

	<!-- Attribute Selection for Differing Attributes -->
	{#if duplicate.attribute_comparison.some(c => c.is_different)}
		<div class="rounded-lg border border-border p-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Resolve Attribute Differences</h3>
			<div class="space-y-3">
				{#each duplicate.attribute_comparison.filter(c => c.is_different) as comp}
					<div class="flex items-center gap-4 rounded border border-border/50 p-3">
						<span class="w-32 text-sm font-medium text-foreground">{comp.attribute}</span>
						<label class="flex items-center gap-2 text-sm">
							<input
								type="radio"
								name="attr_{comp.attribute}"
								value="source"
								checked={attributeSelections[comp.attribute] === 'source'}
								onchange={() => (attributeSelections[comp.attribute] = 'source')}
							/>
							<span class="text-foreground">{comp.value_a ?? '—'}</span>
							<span class="text-xs text-muted-foreground">(source)</span>
						</label>
						<label class="flex items-center gap-2 text-sm">
							<input
								type="radio"
								name="attr_{comp.attribute}"
								value="target"
								checked={attributeSelections[comp.attribute] === 'target'}
								onchange={() => (attributeSelections[comp.attribute] = 'target')}
							/>
							<span class="text-foreground">{comp.value_b ?? '—'}</span>
							<span class="text-xs text-muted-foreground">(target)</span>
						</label>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Entitlement Strategy -->
	<div class="rounded-lg border border-border p-4">
		<h3 class="mb-3 text-sm font-semibold text-foreground">Entitlement Strategy</h3>
		<select
			class="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
			bind:value={selectedStrategy}
		>
			<option value="union">Union (keep all)</option>
			<option value="intersection">Intersection (common only)</option>
			<option value="manual">Manual selection</option>
		</select>
	</div>

	<!-- Entitlement Preview -->
	<EntitlementPreview preview={preview.entitlements_preview} strategy={selectedStrategy} />

	<!-- SoD Violations -->
	<SodViolations sodCheck={preview.sod_check} />

	<!-- SoD Override Reason -->
	{#if hasSodViolations && preview.sod_check.can_override}
		<div class="rounded-lg border border-border p-4">
			<label for="sod-override" class="block text-sm font-medium text-foreground">SoD Override Reason (required)</label>
			<textarea
				id="sod-override"
				rows="3"
				class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
				placeholder="Explain why this override is justified..."
				bind:value={sodOverrideReason}
			></textarea>
		</div>
	{/if}

	<!-- Execute Form -->
	<form method="POST" action="?/execute" use:mergeEnhance>
		<input type="hidden" name="source_identity_id" value={$mergeFormData.source_identity_id} />
		<input type="hidden" name="target_identity_id" value={$mergeFormData.target_identity_id} />
		<input type="hidden" name="entitlement_strategy" value={selectedStrategy} />
		<input type="hidden" name="attribute_selections" value={attributeSelectionsJson} />
		{#if sodOverrideReason}
			<input type="hidden" name="sod_override_reason" value={sodOverrideReason} />
		{/if}

		<div class="flex gap-3">
			<button
				type="submit"
				class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
				disabled={!canExecute}
			>
				Execute Merge
			</button>
			<a
				href="/governance/dedup/{duplicate.id}"
				class="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
