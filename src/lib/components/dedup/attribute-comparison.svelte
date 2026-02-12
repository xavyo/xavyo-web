<script lang="ts">
	import type { AttributeComparison, IdentitySummary } from '$lib/api/types';

	interface Props {
		comparisons: AttributeComparison[];
		identityA: IdentitySummary;
		identityB: IdentitySummary;
	}

	let { comparisons, identityA, identityB }: Props = $props();
</script>

<div class="overflow-x-auto">
	<table class="w-full text-sm" data-testid="attribute-comparison">
		<thead>
			<tr class="border-b border-border">
				<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Attribute</th>
				<th class="py-2 pr-4 text-left font-medium text-muted-foreground">
					{identityA.display_name ?? identityA.email ?? 'Identity A'}
				</th>
				<th class="py-2 pr-4 text-left font-medium text-muted-foreground">
					{identityB.display_name ?? identityB.email ?? 'Identity B'}
				</th>
				<th class="py-2 text-left font-medium text-muted-foreground">Match</th>
			</tr>
		</thead>
		<tbody>
			{#each comparisons as comp}
				<tr class="border-b border-border/50">
					<td class="py-2 pr-4 font-medium text-foreground">{comp.attribute}</td>
					<td class="py-2 pr-4 text-foreground {comp.is_different ? 'bg-red-50 dark:bg-red-900/10' : ''}">
						{comp.value_a ?? '—'}
					</td>
					<td class="py-2 pr-4 text-foreground {comp.is_different ? 'bg-red-50 dark:bg-red-900/10' : ''}">
						{comp.value_b ?? '—'}
					</td>
					<td class="py-2">
						{#if comp.is_different}
							<span class="text-red-600 dark:text-red-400">Different</span>
						{:else}
							<span class="text-green-600 dark:text-green-400">Match</span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
