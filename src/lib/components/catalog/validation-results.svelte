<script lang="ts">
	import type { CartValidationResponse } from '$lib/api/types';
	import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-svelte';

	interface Props {
		validation: CartValidationResponse;
	}

	let { validation }: Props = $props();
</script>

<div class="space-y-4" data-testid="validation-results">
	{#if validation.valid && validation.sod_violations.length === 0}
		<div class="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-950 dark:text-green-200">
			<CheckCircle2 class="h-5 w-5" />
			<span class="font-medium">Cart is valid — no issues found</span>
		</div>
	{/if}

	{#if validation.issues.length > 0}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
			<h4 class="mb-2 flex items-center gap-2 font-medium text-destructive">
				<XCircle class="h-4 w-4" />
				Issues ({validation.issues.length})
			</h4>
			<ul class="space-y-1">
				{#each validation.issues as issue}
					<li class="text-sm text-destructive">{issue.message} ({issue.code})</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if validation.sod_violations.length > 0}
		<div class="rounded-lg border border-yellow-500/50 bg-yellow-50 p-4 dark:bg-yellow-950">
			<h4 class="mb-2 flex items-center gap-2 font-medium text-yellow-800 dark:text-yellow-200">
				<AlertTriangle class="h-4 w-4" />
				SoD Warnings ({validation.sod_violations.length})
			</h4>
			<ul class="space-y-2">
				{#each validation.sod_violations as violation}
					<li class="text-sm">
						<span class="font-medium text-yellow-800 dark:text-yellow-200">{violation.rule_name}</span>
						<span class="text-yellow-700 dark:text-yellow-300"> — {violation.description}</span>
					</li>
				{/each}
			</ul>
			<p class="mt-2 text-xs text-yellow-600 dark:text-yellow-400">SoD warnings do not block submission.</p>
		</div>
	{/if}
</div>
