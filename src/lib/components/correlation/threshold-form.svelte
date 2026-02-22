<script lang="ts">
	import type { CorrelationThreshold } from '$lib/api/types';
	import { upsertCorrelationThresholdsClient } from '$lib/api/correlation-client';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { addToast } from '$lib/stores/toast.svelte';
	import { AlertTriangle, Save } from 'lucide-svelte';

	interface Props {
		connectorId: string;
		threshold?: CorrelationThreshold;
		onSuccess?: () => void;
	}

	let { connectorId, threshold, onSuccess }: Props = $props();

	// Form values as $state (simpler than Superforms for single-save form)
	// svelte-ignore state_referenced_locally
	let autoConfirmPct = $state(threshold ? Math.round(threshold.auto_confirm_threshold * 100) : 90);
	// svelte-ignore state_referenced_locally
	let manualReviewPct = $state(threshold ? Math.round(threshold.manual_review_threshold * 100) : 70);
	// svelte-ignore state_referenced_locally
	let tuningMode = $state(threshold?.tuning_mode ?? false);
	// svelte-ignore state_referenced_locally
	let includeDeactivated = $state(threshold?.include_deactivated ?? false);
	// svelte-ignore state_referenced_locally
	let batchSize = $state(threshold?.batch_size ?? 100);

	let saving = $state(false);

	// Validation: auto must be >= manual
	let hasThresholdError = $derived(autoConfirmPct < manualReviewPct);

	// Clamped values for the visual bar
	let manualPctClamped = $derived(Math.min(Math.max(manualReviewPct, 0), 100));
	let autoPctClamped = $derived(Math.min(Math.max(autoConfirmPct, 0), 100));

	async function handleSave() {
		if (hasThresholdError) {
			addToast('error', 'Auto-confirm threshold must be greater than or equal to manual review threshold');
			return;
		}
		saving = true;
		try {
			await upsertCorrelationThresholdsClient(connectorId, {
				auto_confirm_threshold: autoConfirmPct / 100,
				manual_review_threshold: manualReviewPct / 100,
				tuning_mode: tuningMode,
				include_deactivated: includeDeactivated,
				batch_size: batchSize
			});
			addToast('success', 'Correlation thresholds saved');
			onSuccess?.();
		} catch (err) {
			addToast('error', err instanceof Error ? err.message : 'Failed to save thresholds');
		} finally {
			saving = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Threshold inputs -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<div class="space-y-2">
			<Label for="auto-confirm">Auto-Confirm Threshold (%)</Label>
			<Input
				id="auto-confirm"
				type="number"
				min="0"
				max="100"
				step="1"
				bind:value={autoConfirmPct}
			/>
			<p class="text-xs text-muted-foreground">
				Matches above this score are automatically confirmed. API value: {(autoConfirmPct / 100).toFixed(2)}
			</p>
		</div>
		<div class="space-y-2">
			<Label for="manual-review">Manual Review Threshold (%)</Label>
			<Input
				id="manual-review"
				type="number"
				min="0"
				max="100"
				step="1"
				bind:value={manualReviewPct}
			/>
			<p class="text-xs text-muted-foreground">
				Matches above this score are queued for manual review. API value: {(manualReviewPct / 100).toFixed(2)}
			</p>
		</div>
	</div>

	<!-- Threshold validation warning -->
	{#if hasThresholdError}
		<div class="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
			<AlertTriangle class="h-4 w-4 shrink-0" />
			Auto-confirm threshold must be greater than or equal to manual review threshold.
		</div>
	{/if}

	<!-- Visual threshold bar -->
	<div class="space-y-2">
		<p class="text-sm font-medium text-muted-foreground">Threshold Ranges</p>
		<div class="relative h-8 w-full overflow-hidden rounded-md bg-muted">
			<!-- No match zone -->
			<div
				class="absolute left-0 top-0 flex h-full items-center justify-center text-xs font-medium text-muted-foreground"
				style="width: {manualPctClamped}%"
			>
				{#if manualPctClamped > 15}No Match{/if}
			</div>
			<!-- Manual review zone -->
			<div
				class="absolute top-0 flex h-full items-center justify-center bg-amber-200 text-xs font-medium text-amber-900 dark:bg-amber-800 dark:text-amber-100"
				style="left: {manualPctClamped}%; width: {Math.max(autoPctClamped - manualPctClamped, 0)}%"
			>
				{#if autoPctClamped - manualPctClamped > 15}Review{/if}
			</div>
			<!-- Auto confirm zone -->
			<div
				class="absolute top-0 flex h-full items-center justify-center bg-green-200 text-xs font-medium text-green-900 dark:bg-green-800 dark:text-green-100"
				style="left: {autoPctClamped}%; width: {100 - autoPctClamped}%"
			>
				{#if 100 - autoPctClamped > 15}Auto{/if}
			</div>
		</div>
		<div class="flex justify-between text-xs text-muted-foreground">
			<span>0%</span>
			<span>100%</span>
		</div>
	</div>

	<!-- Toggles -->
	<div class="space-y-4">
		<label class="flex items-center justify-between rounded-md border p-3">
			<div>
				<p class="text-sm font-medium">Tuning Mode</p>
				<p class="text-xs text-muted-foreground">
					When enabled, all matches are queued for review regardless of score (useful for calibrating thresholds).
				</p>
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={tuningMode}
				aria-label="Toggle tuning mode"
				class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {tuningMode ? 'bg-primary' : 'bg-muted-foreground/30'}"
				onclick={() => (tuningMode = !tuningMode)}
			>
				<span
					class="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform {tuningMode ? 'translate-x-5' : 'translate-x-0'}"
				></span>
			</button>
		</label>

		<label class="flex items-center gap-3 rounded-md border p-3">
			<input
				type="checkbox"
				checked={includeDeactivated}
				onchange={(e) => {
					includeDeactivated = (e.target as HTMLInputElement).checked;
				}}
				class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
			/>
			<div>
				<p class="text-sm font-medium">Include Deactivated Identities</p>
				<p class="text-xs text-muted-foreground">
					Match connector accounts against deactivated identities as well.
				</p>
			</div>
		</label>
	</div>

	<!-- Batch size -->
	<div class="space-y-2">
		<Label for="batch-size">Batch Size</Label>
		<Input
			id="batch-size"
			type="number"
			min="1"
			max="10000"
			step="1"
			bind:value={batchSize}
		/>
		<p class="text-xs text-muted-foreground">
			Number of accounts to process in each batch. Default: 100.
		</p>
	</div>

	<!-- Save -->
	<div class="flex justify-end pt-2">
		<Button onclick={handleSave} disabled={saving || hasThresholdError}>
			<Save class="mr-1 h-4 w-4" />
			{saving ? 'Saving...' : 'Save Thresholds'}
		</Button>
	</div>
</div>
