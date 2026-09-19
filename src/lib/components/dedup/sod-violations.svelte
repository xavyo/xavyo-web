<script lang="ts">
	import type { MergeSodCheckResponse } from '$lib/api/types';

	interface Props {
		sodCheck: MergeSodCheckResponse;
	}

	let { sodCheck }: Props = $props();

	function severityClass(severity: string): string {
		switch (severity) {
			case 'critical': return 'bg-destructive/15 text-destructive';
			case 'high': return 'bg-warning/15 text-warning';
			case 'medium': return 'bg-warning/15 text-warning';
			default: return 'bg-muted text-muted-foreground ';
		}
	}
</script>

<div data-testid="sod-violations">
	{#if !sodCheck.has_violations}
		<div class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 /20">
			<p class="text-sm text-success ">No SoD violations detected. Merge is safe to proceed.</p>
		</div>
	{:else}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 /20">
			<p class="mb-3 text-sm font-medium text-destructive ">
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
