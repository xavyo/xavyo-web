<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Search } from 'lucide-svelte';

	interface Entitlement {
		id: string;
		name: string;
	}

	interface Props {
		entitlements: Entitlement[];
		selectedIds: string[];
		onchange: (ids: string[]) => void;
	}

	let { entitlements, selectedIds, onchange }: Props = $props();

	let search = $state('');

	let filtered = $derived(
		search
			? entitlements.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
			: entitlements
	);

	function toggleEntitlement(id: string) {
		const updated = selectedIds.includes(id)
			? selectedIds.filter((sid) => sid !== id)
			: [...selectedIds, id];
		onchange(updated);
	}
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-medium">Entitlements</h3>
		<span class="text-xs text-muted-foreground">{selectedIds.length} selected</span>
	</div>

	<div class="relative">
		<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
		<Input
			type="text"
			placeholder="Search entitlements..."
			class="pl-9"
			value={search}
			oninput={(e: Event) => { search = (e.target as HTMLInputElement).value; }}
		/>
	</div>

	<div class="max-h-60 space-y-1 overflow-y-auto rounded-md border border-border p-2">
		{#if filtered.length === 0}
			<p class="py-4 text-center text-sm text-muted-foreground">
				{search ? 'No entitlements match your search' : 'No entitlements available'}
			</p>
		{:else}
			{#each filtered as ent}
				<label
					class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
				>
					<input
						type="checkbox"
						checked={selectedIds.includes(ent.id)}
						onchange={() => toggleEntitlement(ent.id)}
						class="h-4 w-4 rounded border-input"
					/>
					<span>{ent.name}</span>
				</label>
			{/each}
		{/if}
	</div>
</div>
