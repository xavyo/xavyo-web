<script lang="ts">
	import type { IdentityProvider, ServiceProvider, SocialProviderConfig } from '$lib/api/types';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Globe, Shield, Share2, AlertCircle } from 'lucide-svelte';

	interface Props {
		oidcProviders: IdentityProvider[];
		samlProviders: ServiceProvider[];
		socialProviders: SocialProviderConfig[];
		loading: boolean;
		error: string | null;
		onRetry: () => void;
	}

	let { oidcProviders, samlProviders, socialProviders, loading, error, onRetry }: Props =
		$props();

	// OIDC derived counts
	let oidcTotal = $derived(oidcProviders.length);
	let oidcEnabled = $derived(oidcProviders.filter((p) => p.is_enabled).length);
	let oidcValid = $derived(
		oidcProviders.filter((p) => p.validation_status === 'valid').length
	);
	let oidcInvalid = $derived(
		oidcProviders.filter((p) => p.validation_status === 'invalid').length
	);

	// SAML derived counts
	let samlTotal = $derived(samlProviders.length);
	let samlEnabled = $derived(samlProviders.filter((p) => p.enabled).length);

	// Social derived counts
	let socialEnabled = $derived(socialProviders.filter((p) => p.enabled));
	let socialEnabledNames = $derived(
		socialEnabled.map((p) => p.provider.charAt(0).toUpperCase() + p.provider.slice(1))
	);
</script>

{#if loading}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="overview-skeleton">
		{#each [1, 2, 3] as _}
			<Card>
				<CardHeader>
					<div class="flex items-center gap-3">
						<Skeleton class="h-5 w-5 rounded" />
						<Skeleton class="h-5 w-32" />
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-2">
						<Skeleton class="h-4 w-48" />
						<Skeleton class="h-4 w-36" />
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
{:else if error}
	<div
		class="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center"
		data-testid="overview-error"
	>
		<AlertCircle class="mx-auto mb-2 h-8 w-8 text-destructive" />
		<p class="text-sm text-destructive">{error}</p>
		<Button variant="outline" size="sm" class="mt-3" onclick={onRetry}>Retry</Button>
	</div>
{:else}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="overview-cards">
		<!-- OIDC Identity Providers Card -->
		<Card>
			<CardHeader>
				<div class="flex items-center gap-3">
					<Globe class="h-5 w-5 text-muted-foreground" />
					<h3 class="text-lg font-semibold">OIDC Identity Providers</h3>
				</div>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					<p class="text-sm text-muted-foreground">
						{oidcTotal}
						{oidcTotal === 1 ? 'provider' : 'providers'}
						({oidcEnabled} enabled)
					</p>
					{#if oidcTotal > 0}
						<div class="flex flex-wrap gap-1.5">
							{#if oidcValid > 0}
								<Badge class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
									{oidcValid} valid
								</Badge>
							{/if}
							{#if oidcInvalid > 0}
								<Badge variant="destructive">{oidcInvalid} invalid</Badge>
							{/if}
						</div>
					{/if}
					<a
						href="/federation?tab=oidc"
						class="mt-2 inline-block text-sm font-medium text-primary hover:underline"
					>
						Manage
					</a>
				</div>
			</CardContent>
		</Card>

		<!-- SAML Service Providers Card -->
		<Card>
			<CardHeader>
				<div class="flex items-center gap-3">
					<Shield class="h-5 w-5 text-muted-foreground" />
					<h3 class="text-lg font-semibold">SAML Service Providers</h3>
				</div>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					<p class="text-sm text-muted-foreground">
						{samlTotal}
						{samlTotal === 1 ? 'provider' : 'providers'}
						({samlEnabled} enabled)
					</p>
					<a
						href="/federation?tab=saml"
						class="mt-2 inline-block text-sm font-medium text-primary hover:underline"
					>
						Manage
					</a>
				</div>
			</CardContent>
		</Card>

		<!-- Social Providers Card -->
		<Card>
			<CardHeader>
				<div class="flex items-center gap-3">
					<Share2 class="h-5 w-5 text-muted-foreground" />
					<h3 class="text-lg font-semibold">Social Providers</h3>
				</div>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					{#if socialEnabled.length > 0}
						<p class="text-sm text-muted-foreground">
							{socialEnabledNames.join(', ')} enabled
						</p>
					{:else}
						<p class="text-sm text-muted-foreground">No providers enabled</p>
					{/if}
					<a
						href="/federation?tab=social"
						class="mt-2 inline-block text-sm font-medium text-primary hover:underline"
					>
						Manage
					</a>
				</div>
			</CardContent>
		</Card>
	</div>
{/if}
