<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { UserResponse } from '$lib/api/types';

	type PickedUser = { user_id: string; email: string };

	let {
		existingMemberIds = [],
		selected = $bindable([])
	}: { existingMemberIds?: string[]; selected?: PickedUser[] } = $props();

	let query = $state('');
	let results = $state<PickedUser[]>([]);
	let loading = $state(false);
	let open = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const excluded = $derived(
		new Set([...existingMemberIds, ...selected.map((u) => u.user_id)])
	);

	function onInput(value: string) {
		query = value;
		if (timer) clearTimeout(timer);
		if (value.trim().length < 2) {
			results = [];
			open = false;
			return;
		}
		timer = setTimeout(search, 250);
	}

	async function search() {
		loading = true;
		try {
			const params = new URLSearchParams({ email: query.trim(), limit: '10' });
			const res = await fetch(`/api/users?${params}`);
			if (!res.ok) throw new Error('search failed');
			const data = (await res.json()) as { users: UserResponse[] };
			results = data.users
				.map((u) => ({ user_id: u.id, email: u.email }))
				.filter((u) => !excluded.has(u.user_id));
			open = true;
		} catch {
			results = [];
			open = true;
		} finally {
			loading = false;
		}
	}

	function add(user: PickedUser) {
		if (!excluded.has(user.user_id)) {
			selected = [...selected, user];
		}
		query = '';
		results = [];
		open = false;
	}

	function removeSelected(id: string) {
		selected = selected.filter((u) => u.user_id !== id);
	}
</script>

<div class="space-y-2">
	<div class="relative">
		<Input
			type="text"
			placeholder="Search users by email…"
			value={query}
			oninput={(e) => onInput((e.currentTarget as HTMLInputElement).value)}
			autocomplete="off"
		/>
		{#if open}
			<div
				class="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-input bg-popover shadow-md"
			>
				{#if loading}
					<p class="px-3 py-2 text-sm text-muted-foreground">Searching…</p>
				{:else if results.length === 0}
					<p class="px-3 py-2 text-sm text-muted-foreground">No matching users</p>
				{:else}
					<ul class="max-h-56 overflow-auto">
						{#each results as user (user.user_id)}
							<li>
								<button
									type="button"
									class="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
									onclick={() => add(user)}
								>
									{user.email}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
	</div>

	{#if selected.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each selected as user (user.user_id)}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
				>
					{user.email}
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground"
						aria-label={`Remove ${user.email}`}
						onclick={() => removeSelected(user.user_id)}
					>
						×
					</button>
				</span>
			{/each}
		</div>
	{/if}

	<input type="hidden" name="member_ids" value={selected.map((u) => u.user_id).join(',')} />
</div>
