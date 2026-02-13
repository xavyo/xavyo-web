<script lang="ts">
	import { Github, Mail, LinkIcon, Unlink, Calendar } from 'lucide-svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import type { SocialConnection } from '$lib/api/types';

	interface Props {
		connections: SocialConnection[];
		availableProviders: string[];
		onLink: (provider: string) => void;
		onUnlink: (provider: string) => void;
	}

	let { connections, availableProviders, onLink, onUnlink }: Props = $props();

	let unlinkingProvider = $state<string | null>(null);

	const linkedProviders = $derived(new Set(connections.map((c) => c.provider)));
	const unlinkableProviders = $derived(
		availableProviders.filter((p) => !linkedProviders.has(p))
	);

	function formatProviderName(name: string): string {
		return name.charAt(0).toUpperCase() + name.slice(1);
	}

	function getProviderIcon(name: string): typeof Github | null {
		switch (name.toLowerCase()) {
			case 'github':
				return Github;
			default:
				return null;
		}
	}

	function getProviderInitial(name: string): string {
		switch (name.toLowerCase()) {
			case 'google':
				return 'G';
			case 'microsoft':
				return 'M';
			case 'apple':
				return 'A';
			default:
				return name.charAt(0).toUpperCase();
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	async function handleUnlink(provider: string) {
		unlinkingProvider = provider;
		try {
			onUnlink(provider);
		} finally {
			unlinkingProvider = null;
		}
	}
</script>

<div class="space-y-6">
	{#if connections.length > 0}
		<div>
			<h3 class="text-base font-medium">Linked accounts</h3>
			<p class="text-sm text-muted-foreground">
				Your account is linked to the following social providers.
			</p>
		</div>

		<div class="space-y-3">
			{#each connections as connection (connection.id)}
				{@const Icon = getProviderIcon(connection.provider)}
				<Card>
					<CardContent class="p-4">
						<div class="flex items-center gap-4">
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
								{#if Icon}
									<Icon class="h-5 w-5 text-muted-foreground" />
								{:else}
									<span class="text-sm font-bold text-muted-foreground">
										{getProviderInitial(connection.provider)}
									</span>
								{/if}
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<span class="font-medium">{formatProviderName(connection.provider)}</span>
									{#if connection.display_name}
										<span class="text-sm text-muted-foreground">
											{connection.display_name}
										</span>
									{/if}
								</div>
								<div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
									<span class="inline-flex items-center gap-1">
										<Mail class="h-3 w-3" />
										{#if connection.is_private_email}
											<span class="italic">Private email</span>
										{:else}
											{connection.email ?? 'No email'}
										{/if}
									</span>
									<span class="inline-flex items-center gap-1">
										<Calendar class="h-3 w-3" />
										Linked {formatDate(connection.created_at)}
									</span>
								</div>
							</div>
							<Button
								variant="outline"
								size="sm"
								disabled={unlinkingProvider === connection.provider}
								onclick={() => handleUnlink(connection.provider)}
							>
								<Unlink class="mr-1.5 h-3.5 w-3.5" />
								{#if unlinkingProvider === connection.provider}
									Unlinking...
								{:else}
									Unlink
								{/if}
							</Button>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}

	{#if unlinkableProviders.length > 0}
		{#if connections.length > 0}
			<Separator />
		{/if}

		<div>
			<h3 class="text-base font-medium">Available providers</h3>
			<p class="text-sm text-muted-foreground">
				Link additional social accounts to your profile.
			</p>
		</div>

		<div class="space-y-3">
			{#each unlinkableProviders as providerName (providerName)}
				{@const Icon = getProviderIcon(providerName)}
				<Card>
					<CardContent class="p-4">
						<div class="flex items-center gap-4">
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
								{#if Icon}
									<Icon class="h-5 w-5 text-muted-foreground" />
								{:else}
									<span class="text-sm font-bold text-muted-foreground">
										{getProviderInitial(providerName)}
									</span>
								{/if}
							</div>
							<div class="min-w-0 flex-1">
								<span class="font-medium">{formatProviderName(providerName)}</span>
								<p class="text-xs text-muted-foreground">Not linked</p>
							</div>
							<Button
								variant="default"
								size="sm"
								onclick={() => onLink(providerName)}
							>
								<LinkIcon class="mr-1.5 h-3.5 w-3.5" />
								Link account
							</Button>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}

	{#if connections.length === 0 && unlinkableProviders.length === 0}
		<div class="rounded-lg border border-dashed p-8 text-center">
			<LinkIcon class="mx-auto h-8 w-8 text-muted-foreground" />
			<p class="mt-2 text-sm font-medium text-muted-foreground">
				No social connections available
			</p>
			<p class="mt-1 text-xs text-muted-foreground">
				No social login providers are currently enabled. Contact your administrator to set up social login.
			</p>
		</div>
	{/if}
</div>
