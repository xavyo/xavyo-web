<script lang="ts">
	import type { IdentityProviderDomain } from '$lib/api/types';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Trash2, Plus, Globe } from 'lucide-svelte';
	import { addToast } from '$lib/stores/toast.svelte';

	interface Props {
		idpId: string;
		domains: IdentityProviderDomain[];
		onDomainsChange?: () => void;
	}

	let { idpId, domains, onDomainsChange }: Props = $props();

	let newDomain = $state('');
	let newPriority = $state('');
	let isAdding = $state(false);
	let removingId = $state<string | null>(null);

	const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

	function isValidDomain(domain: string): boolean {
		return domainPattern.test(domain.trim());
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString();
	}

	async function handleAdd() {
		const trimmedDomain = newDomain.trim();
		if (!trimmedDomain) return;

		if (!isValidDomain(trimmedDomain)) {
			addToast('error', 'Please enter a valid domain (e.g. example.com)');
			return;
		}

		isAdding = true;
		try {
			const body: Record<string, unknown> = { domain: trimmedDomain };
			if (newPriority !== '') {
				body.priority = parseInt(newPriority, 10);
			}

			const response = await fetch(
				`/api/federation/identity-providers/${idpId}/domains`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);

			if (!response.ok) {
				const error = await response.json().catch(() => ({ message: 'Failed to add domain' }));
				throw new Error(error.message || 'Failed to add domain');
			}

			newDomain = '';
			newPriority = '';
			addToast('success', 'Domain added successfully');
			onDomainsChange?.();
		} catch (err) {
			addToast('error', err instanceof Error ? err.message : 'Failed to add domain');
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(domainId: string) {
		removingId = domainId;
		try {
			const response = await fetch(
				`/api/federation/identity-providers/${idpId}/domains/${domainId}`,
				{ method: 'DELETE' }
			);

			if (!response.ok) {
				const error = await response.json().catch(() => ({ message: 'Failed to remove domain' }));
				throw new Error(error.message || 'Failed to remove domain');
			}

			addToast('success', 'Domain removed successfully');
			onDomainsChange?.();
		} catch (err) {
			addToast('error', err instanceof Error ? err.message : 'Failed to remove domain');
		} finally {
			removingId = null;
		}
	}
</script>

<Card>
	<CardHeader>
		<div class="flex items-center gap-2">
			<Globe class="h-5 w-5 text-muted-foreground" />
			<h3 class="text-lg font-semibold">Home Realm Discovery Domains</h3>
		</div>
	</CardHeader>
	<CardContent>
		{#if domains.length === 0}
			<p class="mb-4 text-sm text-muted-foreground">
				No domains configured. Add a domain for Home Realm Discovery routing.
			</p>
		{:else}
			<div class="mb-4 space-y-2">
				{#each domains as domain}
					<div
						class="flex items-center justify-between rounded-md border px-3 py-2"
					>
						<div class="flex items-center gap-3">
							<span class="text-sm font-medium">{domain.domain}</span>
							{#if domain.priority !== undefined}
								<Badge variant="secondary">priority: {domain.priority}</Badge>
							{/if}
							<span class="text-xs text-muted-foreground">
								{formatDate(domain.created_at)}
							</span>
						</div>
						<Button
							variant="ghost"
							size="icon"
							disabled={removingId === domain.id}
							onclick={() => handleRemove(domain.id)}
						>
							{#if removingId === domain.id}
								<span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
							{:else}
								<Trash2 class="h-4 w-4 text-destructive" />
							{/if}
							<span class="sr-only">Remove domain</span>
						</Button>
					</div>
				{/each}
			</div>
		{/if}

		<div class="flex items-end gap-2">
			<div class="flex-1 space-y-2">
				<Label for="new-domain">Domain</Label>
				<Input
					id="new-domain"
					type="text"
					placeholder="example.com"
					value={newDomain}
					oninput={(e: Event) => {
						newDomain = (e.target as HTMLInputElement).value;
					}}
				/>
			</div>
			<div class="w-24 space-y-2">
				<Label for="new-priority">Priority</Label>
				<Input
					id="new-priority"
					type="number"
					placeholder="0"
					value={newPriority}
					oninput={(e: Event) => {
						newPriority = (e.target as HTMLInputElement).value;
					}}
				/>
			</div>
			<Button
				disabled={isAdding || !newDomain.trim()}
				onclick={handleAdd}
			>
				{#if isAdding}
					<span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
				{:else}
					<Plus class="h-4 w-4" />
				{/if}
				Add Domain
			</Button>
		</div>
	</CardContent>
</Card>
