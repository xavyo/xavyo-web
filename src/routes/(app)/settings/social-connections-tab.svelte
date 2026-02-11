<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import SocialConnectionsList from '$lib/components/federation/social-connections-list.svelte';
	import {
		listSocialConnections,
		listSocialProviders,
		initiateSocialLink,
		unlinkSocialAccount
	} from '$lib/api/social-client';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { SocialConnection } from '$lib/api/types';

	let connections = $state<SocialConnection[]>([]);
	let availableProviders = $state<string[]>([]);
	let loading = $state(true);
	let error = $state('');

	async function fetchData() {
		loading = true;
		error = '';

		try {
			const [connectionsRes, providersRes] = await Promise.all([
				listSocialConnections(),
				listSocialProviders()
			]);

			connections = connectionsRes.connections;
			availableProviders = providersRes.providers
				.filter((p) => p.enabled)
				.map((p) => p.provider);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load social connections. Please try again.';
		} finally {
			loading = false;
		}
	}

	function handleLink(provider: string) {
		initiateSocialLink(provider);
	}

	async function handleUnlink(provider: string) {
		try {
			await unlinkSocialAccount(provider);
			addToast('success', `${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked`);
			await fetchData();
		} catch (err) {
			addToast('error', `Failed to unlink account: ${err instanceof Error ? err.message : 'Unknown error'}`);
		}
	}

	$effect(() => {
		fetchData();
	});
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-xl font-semibold">Social connections</h2>
		<p class="text-sm text-muted-foreground">
			Link social accounts to your profile for quick sign-in.
		</p>
	</div>

	{#if loading}
		<div class="space-y-4">
			{#each [1, 2] as _}
				<Card>
					<CardContent class="p-4">
						<div class="flex items-center gap-4">
							<div class="h-10 w-10 animate-pulse rounded-lg bg-muted"></div>
							<div class="flex-1 space-y-2">
								<div class="h-4 w-32 animate-pulse rounded bg-muted"></div>
								<div class="h-3 w-48 animate-pulse rounded bg-muted"></div>
							</div>
							<div class="h-8 w-20 animate-pulse rounded bg-muted"></div>
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
			<Button variant="outline" onclick={fetchData}>Retry</Button>
		</div>
	{:else}
		<SocialConnectionsList
			{connections}
			{availableProviders}
			onLink={handleLink}
			onUnlink={handleUnlink}
		/>
	{/if}
</div>
