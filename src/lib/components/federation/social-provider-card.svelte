<script lang="ts">
	import { ChevronDown, ChevronUp, Github } from 'lucide-svelte';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { SocialProviderConfig, UpdateSocialProviderRequest } from '$lib/api/types';

	interface Props {
		provider: SocialProviderConfig;
		onSave: (provider: string, data: UpdateSocialProviderRequest) => Promise<void>;
		onToggle: (provider: string, enabled: boolean) => Promise<void>;
	}

	let { provider, onSave, onToggle }: Props = $props();

	let expanded = $state(false);
	let saving = $state(false);
	let toggling = $state(false);
	// svelte-ignore state_referenced_locally
	let editedClientId = $state(provider.client_id ?? '');
	let editedSecret = $state('');
	// svelte-ignore state_referenced_locally
	let editedScopes = $state(provider.scopes.join(', '));
	// svelte-ignore state_referenced_locally
	let editedAzureTenant = $state(
		(provider.additional_config?.azure_tenant as string) ?? 'common'
	);
	// svelte-ignore state_referenced_locally
	let editedTeamId = $state((provider.additional_config?.team_id as string) ?? '');
	// svelte-ignore state_referenced_locally
	let editedKeyId = $state((provider.additional_config?.key_id as string) ?? '');

	// Reset edited fields when provider prop changes
	$effect(() => {
		editedClientId = provider.client_id ?? '';
		editedSecret = '';
		editedScopes = provider.scopes.join(', ');
		editedAzureTenant = (provider.additional_config?.azure_tenant as string) ?? 'common';
		editedTeamId = (provider.additional_config?.team_id as string) ?? '';
		editedKeyId = (provider.additional_config?.key_id as string) ?? '';
	});

	const providerDisplayName = $derived(formatProviderName(provider.provider));

	const isMicrosoft = $derived(provider.provider.toLowerCase() === 'microsoft');
	const isApple = $derived(provider.provider.toLowerCase() === 'apple');

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

	const ProviderIcon = $derived(getProviderIcon(provider.provider));

	async function handleSave() {
		saving = true;
		try {
			const data: UpdateSocialProviderRequest = {
				client_id: editedClientId || undefined,
				scopes: editedScopes
					? editedScopes
							.split(',')
							.map((s) => s.trim())
							.filter((s) => s.length > 0)
					: undefined
			};

			if (editedSecret) {
				data.client_secret = editedSecret;
			}

			// Build additional_config based on provider
			if (isMicrosoft) {
				data.additional_config = { azure_tenant: editedAzureTenant };
			} else if (isApple) {
				const appleConfig: Record<string, unknown> = {};
				if (editedTeamId) appleConfig.team_id = editedTeamId;
				if (editedKeyId) appleConfig.key_id = editedKeyId;
				if (Object.keys(appleConfig).length > 0) {
					data.additional_config = appleConfig;
				}
			}

			await onSave(provider.provider, data);
			editedSecret = '';
			addToast('success', `${providerDisplayName} provider updated`);
		} catch (err) {
			addToast('error', `Failed to update ${providerDisplayName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
		} finally {
			saving = false;
		}
	}

	async function handleToggle() {
		toggling = true;
		try {
			await onToggle(provider.provider, !provider.enabled);
			addToast('success', `${providerDisplayName} ${provider.enabled ? 'disabled' : 'enabled'}`);
		} catch (err) {
			addToast('error', `Failed to toggle ${providerDisplayName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
		} finally {
			toggling = false;
		}
	}
</script>

<Card>
	<CardHeader class="pb-3">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
					{#if ProviderIcon}
						<ProviderIcon class="h-5 w-5 text-muted-foreground" />
					{:else}
						<span class="text-sm font-bold text-muted-foreground">
							{getProviderInitial(provider.provider)}
						</span>
					{/if}
				</div>
				<div>
					<h3 class="text-base font-medium">{providerDisplayName}</h3>
					<div class="mt-0.5">
						{#if provider.enabled}
							<Badge class="border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
								Enabled
							</Badge>
						{:else}
							<Badge variant="secondary">Disabled</Badge>
						{/if}
					</div>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Button
					variant={provider.enabled ? 'outline' : 'default'}
					size="sm"
					disabled={toggling}
					onclick={handleToggle}
				>
					{#if toggling}
						Updating...
					{:else if provider.enabled}
						Disable
					{:else}
						Enable
					{/if}
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => (expanded = !expanded)}
					aria-label={expanded ? 'Collapse configuration' : 'Expand configuration'}
				>
					{#if expanded}
						<ChevronUp class="h-4 w-4" />
					{:else}
						<ChevronDown class="h-4 w-4" />
					{/if}
				</Button>
			</div>
		</div>
	</CardHeader>

	{#if expanded}
		<Separator />
		<CardContent class="pt-4">
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="{provider.provider}-client-id">Client ID</Label>
					<Input
						id="{provider.provider}-client-id"
						type="text"
						placeholder="Enter client ID"
						bind:value={editedClientId}
					/>
				</div>

				<div class="space-y-2">
					<Label for="{provider.provider}-client-secret">Client Secret</Label>
					<Input
						id="{provider.provider}-client-secret"
						type="password"
						placeholder="Enter new secret"
						bind:value={editedSecret}
					/>
					{#if provider.has_client_secret}
						<p class="text-xs text-muted-foreground">
							A secret is already configured. Leave blank to keep the current secret.
						</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="{provider.provider}-scopes">Scopes</Label>
					<textarea
						id="{provider.provider}-scopes"
						placeholder="openid, profile, email"
						rows="2"
						class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						bind:value={editedScopes}
					></textarea>
					<p class="text-xs text-muted-foreground">Comma-separated list of scopes</p>
				</div>

				{#if isMicrosoft}
					<Separator />
					<h4 class="text-sm font-medium">Microsoft-specific settings</h4>
					<div class="space-y-2">
						<Label for="{provider.provider}-azure-tenant">Azure Tenant ID</Label>
						<Input
							id="{provider.provider}-azure-tenant"
							type="text"
							placeholder="common"
							bind:value={editedAzureTenant}
						/>
						<p class="text-xs text-muted-foreground">
							Use "common" for multi-tenant, or specify a tenant ID
						</p>
					</div>
				{/if}

				{#if isApple}
					<Separator />
					<h4 class="text-sm font-medium">Apple-specific settings</h4>
					<div class="space-y-2">
						<Label for="{provider.provider}-team-id">Team ID</Label>
						<Input
							id="{provider.provider}-team-id"
							type="text"
							placeholder="Enter Apple Team ID"
							bind:value={editedTeamId}
						/>
					</div>
					<div class="space-y-2">
						<Label for="{provider.provider}-key-id">Key ID</Label>
						<Input
							id="{provider.provider}-key-id"
							type="text"
							placeholder="Enter Apple Key ID"
							bind:value={editedKeyId}
						/>
					</div>
				{/if}

				<div class="flex gap-2 pt-2">
					<Button disabled={saving} onclick={handleSave}>
						{#if saving}
							Saving...
						{:else}
							Save configuration
						{/if}
					</Button>
					<Button variant="outline" onclick={() => (expanded = false)}>
						Cancel
					</Button>
				</div>
			</div>
		</CardContent>
	{/if}
</Card>
