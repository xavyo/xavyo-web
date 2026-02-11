<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import SocialProviderCard from './social-provider-card.svelte';
	import { listSocialProviders, updateSocialProvider } from '$lib/api/social-client';
	import type { SocialProviderConfig, UpdateSocialProviderRequest } from '$lib/api/types';

	let providers = $state<SocialProviderConfig[]>([]);
	let loading = $state(true);
	let error = $state('');

	async function fetchProviders() {
		loading = true;
		error = '';

		try {
			const response = await listSocialProviders();
			providers = response.providers;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load social providers. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function handleSave(provider: string, data: UpdateSocialProviderRequest) {
		const updated = await updateSocialProvider(provider, data);
		providers = providers.map((p) => (p.provider === provider ? updated : p));
	}

	async function handleToggle(provider: string, enabled: boolean) {
		const updated = await updateSocialProvider(provider, { enabled });
		providers = providers.map((p) => (p.provider === provider ? updated : p));
	}

	$effect(() => {
		fetchProviders();
	});
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-xl font-semibold">Social login providers</h2>
		<p class="text-sm text-muted-foreground">
			Configure social login providers to allow users to sign in with their existing accounts.
		</p>
	</div>

	{#if loading}
		<div class="space-y-4">
			{#each [1, 2, 3, 4] as _}
				<Card>
					<CardContent class="p-4">
						<div class="flex items-center gap-4">
							<div class="h-10 w-10 animate-pulse rounded-lg bg-muted"></div>
							<div class="flex-1 space-y-2">
								<div class="h-4 w-32 animate-pulse rounded bg-muted"></div>
								<div class="h-3 w-20 animate-pulse rounded bg-muted"></div>
							</div>
							<div class="flex gap-2">
								<div class="h-8 w-16 animate-pulse rounded bg-muted"></div>
								<div class="h-8 w-8 animate-pulse rounded bg-muted"></div>
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else if error}
		<Alert variant="destructive">
			<AlertDescription>{error}</AlertDescription>
		</Alert>
		<div class="flex justify-center">
			<Button variant="outline" onclick={fetchProviders}>Retry</Button>
		</div>
	{:else if providers.length === 0}
		<div class="rounded-lg border border-dashed p-8 text-center">
			<p class="text-sm font-medium text-muted-foreground">
				No social providers configured
			</p>
			<p class="mt-1 text-xs text-muted-foreground">
				Social login providers will appear here once configured on the backend.
			</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each providers as provider (provider.provider)}
				<SocialProviderCard
					{provider}
					onSave={handleSave}
					onToggle={handleToggle}
				/>
			{/each}
		</div>
	{/if}
</div>
