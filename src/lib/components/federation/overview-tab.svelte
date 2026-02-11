<script lang="ts">
	import { listIdentityProviders, listServiceProviders } from '$lib/api/federation-client';
	import { listSocialProviders } from '$lib/api/social-client';
	import FederationOverview from './federation-overview.svelte';
	import type { IdentityProvider, ServiceProvider, SocialProviderConfig } from '$lib/api/types';

	let oidcProviders = $state<IdentityProvider[]>([]);
	let samlProviders = $state<ServiceProvider[]>([]);
	let socialProviders = $state<SocialProviderConfig[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let loaded = $state(false);

	async function loadAll() {
		loading = true;
		error = null;
		try {
			const [oidcRes, samlRes, socialRes] = await Promise.all([
				listIdentityProviders({ limit: 100 }),
				listServiceProviders({ limit: 100 }),
				listSocialProviders()
			]);
			oidcProviders = oidcRes.items;
			samlProviders = samlRes.items;
			socialProviders = socialRes.providers;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load federation data';
		} finally {
			loading = false;
			loaded = true;
		}
	}

	$effect(() => {
		if (!loaded) loadAll();
	});
</script>

<FederationOverview
	{oidcProviders}
	{samlProviders}
	{socialProviders}
	{loading}
	{error}
	onRetry={() => {
		loaded = false;
	}}
/>
