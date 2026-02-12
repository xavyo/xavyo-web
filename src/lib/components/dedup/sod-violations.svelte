<script lang="ts">
	import type { MergeSodCheckResponse } from '$lib/api/types';

	interface Props {
		sodCheck: MergeSodCheckResponse;
	}

	let { sodCheck }: Props = $props();

	function severityClass(severity: string): string {
		switch (severity) {
			case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
			case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
		}
	}
</script>

<div data-testid="sod-violations">
	{#if !sodCheck.has_violations}
		<div class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
			<p class="text-sm text-green-700 dark:text-green-400">No SoD violations detected. Merge is safe to proceed.</p>
		</div>
	{:else}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
			<p class="mb-3 text-sm font-medium text-red-700 dark:text-red-400">
				{sodCheck.violations.length} SoD violation{sodCheck.violations.length !== 1 ? 's' : ''} detected
				{#if sodCheck.can_override}
					<span class="text-muted-foreground">(can be overridden)</span>
				{/if}
			</p>
			<div class="space-y-2">
				{#each sodCheck.violations as violation}
					<div class="flex items-center justify-between rounded border border-red-200 bg-white p-3 dark:border-red-800 dark:bg-background">
						<div>
							<p class="text-sm font-medium text-foreground">{violation.rule_name}</p>
							{#if violation.has_exemption}
								<p class="text-xs text-muted-foreground">Has existing exemption</p>
							{/if}
						</div>
						<span class="rounded-full px-2 py-0.5 text-xs font-medium {severityClass(violation.severity)}">
							{violation.severity}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
