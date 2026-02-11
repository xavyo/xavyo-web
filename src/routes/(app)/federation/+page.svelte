<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Network, Globe, Shield, Share2, Plus, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Separator } from '$lib/components/ui/separator';
	import EmptyState from '$lib/components/ui/empty-state/empty-state.svelte';
	import CertificateList from '$lib/components/federation/certificate-list.svelte';
	import CertificateForm from '$lib/components/federation/certificate-form.svelte';
	import OverviewTab from '$lib/components/federation/overview-tab.svelte';
	import SocialTab from '$lib/components/federation/social-tab.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type {
		IdentityProvider,
		IdentityProviderListResponse,
		ServiceProvider,
		ServiceProviderListResponse,
		IdPCertificate,
		CertificateListResponse,
		UploadCertificateRequest
	} from '$lib/api/types';

	let activeTab = $derived($page.url.searchParams.get('tab') ?? 'overview');

	function handleTabChange(value: string) {
		goto(`/federation?tab=${value}`, { replaceState: true });
	}

	// --- OIDC tab state ---
	let oidcProviders = $state<IdentityProvider[]>([]);
	let oidcTotal = $state(0);
	let oidcOffset = $state(0);
	let oidcLimit = $state(20);
	let oidcLoading = $state(false);
	let oidcError = $state<string | null>(null);
	let oidcLoaded = $state(false);

	async function loadOidcProviders() {
		oidcLoading = true;
		oidcError = null;
		try {
			const res = await fetch(`/api/federation/identity-providers?offset=${oidcOffset}&limit=${oidcLimit}`);
			if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
			const data: IdentityProviderListResponse = await res.json();
			oidcProviders = data.items;
			oidcTotal = data.total;
		} catch (e) {
			oidcError = e instanceof Error ? e.message : 'Failed to load identity providers';
		} finally {
			oidcLoading = false;
			oidcLoaded = true;
		}
	}

	// Load OIDC data when tab is active
	$effect(() => {
		if (activeTab === 'oidc' && !oidcLoaded) {
			loadOidcProviders();
		}
	});

	// Derived pagination helpers
	let oidcStart = $derived(oidcTotal === 0 ? 0 : oidcOffset + 1);
	let oidcEnd = $derived(Math.min(oidcOffset + oidcLimit, oidcTotal));
	let oidcHasPrev = $derived(oidcOffset > 0);
	let oidcHasNext = $derived(oidcOffset + oidcLimit < oidcTotal);

	function oidcPrevPage() {
		oidcOffset = Math.max(0, oidcOffset - oidcLimit);
		oidcLoaded = false;
	}

	function oidcNextPage() {
		oidcOffset = oidcOffset + oidcLimit;
		oidcLoaded = false;
	}

	// --- SAML tab state ---
	let samlProviders = $state<ServiceProvider[]>([]);
	let samlTotal = $state(0);
	let samlOffset = $state(0);
	let samlLimit = $state(20);
	let samlLoading = $state(false);
	let samlError = $state<string | null>(null);
	let samlLoaded = $state(false);

	// Certificate state
	let certificates = $state<IdPCertificate[]>([]);
	let certsLoading = $state(false);
	let certsError = $state<string | null>(null);
	let certsLoaded = $state(false);
	let showCertForm = $state(false);

	async function loadSamlProviders() {
		samlLoading = true;
		samlError = null;
		try {
			const res = await fetch(`/api/federation/saml/service-providers?offset=${samlOffset}&limit=${samlLimit}`);
			if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
			const data: ServiceProviderListResponse = await res.json();
			samlProviders = data.items;
			samlTotal = data.total;
		} catch (e) {
			samlError = e instanceof Error ? e.message : 'Failed to load service providers';
		} finally {
			samlLoading = false;
			samlLoaded = true;
		}
	}

	async function loadCertificates() {
		certsLoading = true;
		certsError = null;
		try {
			const res = await fetch('/api/federation/saml/certificates');
			if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
			const data: CertificateListResponse = await res.json();
			certificates = data.items;
		} catch (e) {
			certsError = e instanceof Error ? e.message : 'Failed to load certificates';
		} finally {
			certsLoading = false;
			certsLoaded = true;
		}
	}

	// Load SAML data when tab is active
	$effect(() => {
		if (activeTab === 'saml' && !samlLoaded) {
			loadSamlProviders();
		}
	});

	$effect(() => {
		if (activeTab === 'saml' && !certsLoaded) {
			loadCertificates();
		}
	});

	// SAML pagination helpers
	let samlStart = $derived(samlTotal === 0 ? 0 : samlOffset + 1);
	let samlEnd = $derived(Math.min(samlOffset + samlLimit, samlTotal));
	let samlHasPrev = $derived(samlOffset > 0);
	let samlHasNext = $derived(samlOffset + samlLimit < samlTotal);

	function samlPrevPage() {
		samlOffset = Math.max(0, samlOffset - samlLimit);
		samlLoaded = false;
	}

	function samlNextPage() {
		samlOffset = samlOffset + samlLimit;
		samlLoaded = false;
	}

	function handleCertificateActivated() {
		certsLoaded = false;
	}

	async function handleCertificateUpload(data: UploadCertificateRequest) {
		const res = await fetch('/api/federation/saml/certificates', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (!res.ok) {
			const errorBody = await res.json().catch(() => null);
			throw new Error(errorBody?.message || `Upload failed: ${res.status}`);
		}
		addToast('success', 'Certificate uploaded successfully');
		showCertForm = false;
		certsLoaded = false;
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString();
	}
</script>

<PageHeader title="Federation" description="Manage identity federation and social login providers" />

<Tabs value={activeTab} onValueChange={handleTabChange}>
	<TabsList>
		<TabsTrigger value="overview"><Network class="mr-2 h-4 w-4" />Overview</TabsTrigger>
		<TabsTrigger value="oidc"><Globe class="mr-2 h-4 w-4" />OIDC</TabsTrigger>
		<TabsTrigger value="saml"><Shield class="mr-2 h-4 w-4" />SAML</TabsTrigger>
		<TabsTrigger value="social"><Share2 class="mr-2 h-4 w-4" />Social</TabsTrigger>
	</TabsList>

	<!-- Overview Tab -->
	<TabsContent value="overview">
		<OverviewTab />
	</TabsContent>

	<!-- OIDC Tab -->
	<TabsContent value="oidc">
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">OIDC Identity Providers</h2>
				<a href="/federation/oidc/create">
					<Button><Plus class="mr-2 h-4 w-4" />Add Identity Provider</Button>
				</a>
			</div>

			{#if oidcLoading}
				<div class="space-y-3">
					<Skeleton class="h-20 w-full" />
					<Skeleton class="h-20 w-full" />
					<Skeleton class="h-20 w-full" />
				</div>
			{:else if oidcError}
				<div class="rounded-md border border-destructive/50 bg-destructive/10 p-4">
					<p class="text-sm text-destructive">{oidcError}</p>
					<Button variant="outline" size="sm" class="mt-2" onclick={() => { oidcLoaded = false; }}>
						Retry
					</Button>
				</div>
			{:else if oidcProviders.length === 0}
				<EmptyState
					title="No identity providers"
					description="Add an OIDC identity provider to enable federated authentication"
					actionLabel="Add Identity Provider"
					actionHref="/federation/oidc/create"
				/>
			{:else}
				<div class="space-y-3">
					{#each oidcProviders as idp (idp.id)}
						<Card>
							<CardContent class="flex items-center justify-between py-4">
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-3">
										<a
											href="/federation/oidc/{idp.id}"
											class="font-medium text-foreground hover:underline"
										>
											{idp.name}
										</a>
										<div class="flex gap-1.5">
											{#if idp.is_enabled}
												<Badge class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
													<CheckCircle class="mr-1 h-3 w-3" />Enabled
												</Badge>
											{:else}
												<Badge variant="secondary">
													<XCircle class="mr-1 h-3 w-3" />Disabled
												</Badge>
											{/if}
											{#if idp.validation_status === 'valid'}
												<Badge class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Valid</Badge>
											{:else if idp.validation_status === 'invalid'}
												<Badge variant="destructive">Invalid</Badge>
											{/if}
										</div>
									</div>
									<p class="mt-1 truncate text-sm text-muted-foreground">{idp.issuer_url}</p>
								</div>
								<div class="ml-4 shrink-0 text-sm text-muted-foreground">
									{formatDate(idp.created_at)}
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>

				<!-- Pagination -->
				{#if oidcTotal > oidcLimit}
					<div class="flex items-center justify-between pt-4">
						<p class="text-sm text-muted-foreground">
							{oidcStart}-{oidcEnd} of {oidcTotal}
						</p>
						<div class="flex gap-2">
							<Button variant="outline" size="sm" disabled={!oidcHasPrev} onclick={oidcPrevPage}>
								Previous
							</Button>
							<Button variant="outline" size="sm" disabled={!oidcHasNext} onclick={oidcNextPage}>
								Next
							</Button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</TabsContent>

	<!-- SAML Tab -->
	<TabsContent value="saml">
		<div class="space-y-4">
			<!-- Service Providers section -->
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">SAML Service Providers</h2>
				<a href="/federation/saml/create">
					<Button><Plus class="mr-2 h-4 w-4" />Add Service Provider</Button>
				</a>
			</div>

			{#if samlLoading}
				<div class="space-y-3">
					<Skeleton class="h-20 w-full" />
					<Skeleton class="h-20 w-full" />
					<Skeleton class="h-20 w-full" />
				</div>
			{:else if samlError}
				<div class="rounded-md border border-destructive/50 bg-destructive/10 p-4">
					<p class="text-sm text-destructive">{samlError}</p>
					<Button variant="outline" size="sm" class="mt-2" onclick={() => { samlLoaded = false; }}>
						Retry
					</Button>
				</div>
			{:else if samlProviders.length === 0}
				<EmptyState
					title="No service providers"
					description="Add a SAML service provider to enable SSO for your applications"
					actionLabel="Add Service Provider"
					actionHref="/federation/saml/create"
				/>
			{:else}
				<div class="space-y-3">
					{#each samlProviders as sp (sp.id)}
						<Card>
							<CardContent class="flex items-center justify-between py-4">
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-3">
										<a
											href="/federation/saml/{sp.id}"
											class="font-medium text-foreground hover:underline"
										>
											{sp.name}
										</a>
										<div class="flex gap-1.5">
											{#if sp.enabled}
												<Badge class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
													<CheckCircle class="mr-1 h-3 w-3" />Enabled
												</Badge>
											{:else}
												<Badge variant="secondary">
													<XCircle class="mr-1 h-3 w-3" />Disabled
												</Badge>
											{/if}
										</div>
									</div>
									<p class="mt-1 truncate text-sm text-muted-foreground">{sp.entity_id}</p>
								</div>
								<div class="ml-4 shrink-0 text-sm text-muted-foreground">
									{formatDate(sp.created_at)}
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>

				<!-- Pagination -->
				{#if samlTotal > samlLimit}
					<div class="flex items-center justify-between pt-4">
						<p class="text-sm text-muted-foreground">
							{samlStart}-{samlEnd} of {samlTotal}
						</p>
						<div class="flex gap-2">
							<Button variant="outline" size="sm" disabled={!samlHasPrev} onclick={samlPrevPage}>
								Previous
							</Button>
							<Button variant="outline" size="sm" disabled={!samlHasNext} onclick={samlNextPage}>
								Next
							</Button>
						</div>
					</div>
				{/if}
			{/if}

			<Separator class="my-6" />

			<!-- Certificates section -->
			<div class="space-y-4">
				<h2 class="text-lg font-semibold">IdP Signing Certificates</h2>

				{#if certsLoading}
					<div class="space-y-3">
						<Skeleton class="h-16 w-full" />
						<Skeleton class="h-16 w-full" />
					</div>
				{:else if certsError}
					<div class="rounded-md border border-destructive/50 bg-destructive/10 p-4">
						<p class="text-sm text-destructive">{certsError}</p>
						<Button variant="outline" size="sm" class="mt-2" onclick={() => { certsLoaded = false; }}>
							Retry
						</Button>
					</div>
				{:else}
					<CertificateList {certificates} onActivate={handleCertificateActivated} />
				{/if}

				<!-- Upload certificate expandable section -->
				<div>
					<Button
						variant="outline"
						onclick={() => (showCertForm = !showCertForm)}
					>
						{#if showCertForm}
							<ChevronUp class="mr-2 h-4 w-4" />Hide upload form
						{:else}
							<ChevronDown class="mr-2 h-4 w-4" />Upload certificate
						{/if}
					</Button>

					{#if showCertForm}
						<div class="mt-4">
							<CertificateForm onSubmit={handleCertificateUpload} />
						</div>
					{/if}
				</div>
			</div>
		</div>
	</TabsContent>

	<!-- Social Tab -->
	<TabsContent value="social">
		<SocialTab />
	</TabsContent>
</Tabs>
