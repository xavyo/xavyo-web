<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { enhance as svelteEnhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogDescription from '$lib/components/ui/dialog/dialog-description.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { ScimTokenInfo, ScimAttributeMapping } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const tokens = $derived(data.tokens as ScimTokenInfo[]);
	const mappings = $derived(data.mappings as ScimAttributeMapping[]);

	// Tab state
	const tabs = [
		{ id: 'tokens', label: 'Tokens' },
		{ id: 'mappings', label: 'Mappings' }
	];
	let activeTab = $state('tokens');

	// Create token form
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'success' && result.data?.tokenCreated) {
				addToast('success', 'SCIM token created successfully');
			}
		}
	});

	// Derive created token from page form result
	let createdTokenData = $derived(
		($page.form as Record<string, unknown> | undefined)?.tokenCreated
			? ($page.form as Record<string, unknown>)?.createdToken as
					| { id: string; name: string; token: string; created_at: string; warning: string }
					| undefined
			: undefined
	);

	let showCreatedToken = $state(false);

	$effect(() => {
		if (createdTokenData) {
			showCreatedToken = true;
		}
	});

	function dismissCreatedToken() {
		showCreatedToken = false;
	}

	// Revoke token state
	let showRevokeConfirm = $state(false);
	let revokeTargetId: string | null = $state(null);
	let revokeTargetName: string = $state('');

	function openRevokeConfirm(id: string, name: string) {
		revokeTargetId = id;
		revokeTargetName = name;
		showRevokeConfirm = true;
	}

	function closeRevokeConfirm() {
		showRevokeConfirm = false;
		revokeTargetId = null;
		revokeTargetName = '';
	}

	// Mappings save state
	let isSavingMappings = $state(false);

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString();
	}
</script>

<PageHeader title="SCIM Administration" description="Manage SCIM provisioning tokens and attribute mappings" />

<nav class="-mb-px flex gap-4 border-b border-border" role="tablist" aria-label="SCIM Administration tabs">
	{#each tabs as tab}
		<button
			role="tab"
			aria-selected={activeTab === tab.id}
			aria-controls="tabpanel-{tab.id}"
			id="tab-{tab.id}"
			class="border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
				? 'border-primary text-primary'
				: 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'}"
			onclick={() => (activeTab = tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</nav>

<!-- Tokens Tab -->
<div
	id="tabpanel-tokens"
	role="tabpanel"
	aria-labelledby="tab-tokens"
	class="mt-6"
	class:hidden={activeTab !== 'tokens'}
>
	<!-- Created Token Banner -->
	{#if showCreatedToken && createdTokenData}
		<div
			class="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-600 dark:bg-yellow-950"
		>
			<h3 class="font-semibold text-yellow-800 dark:text-yellow-200">
				Token Created Successfully
			</h3>
			<p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
				This token will not be shown again. Store it securely.
			</p>
			<div class="mt-2 flex items-center gap-2">
				<code
					class="flex-1 rounded bg-yellow-100 p-2 font-mono text-sm break-all dark:bg-yellow-900"
				>
					{createdTokenData.token}
				</code>
				<button
					onclick={() => {
						if (createdTokenData) {
							navigator.clipboard.writeText(createdTokenData.token);
							addToast('success', 'Token copied to clipboard');
						}
					}}
					class="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
				>
					Copy
				</button>
			</div>
			<div class="mt-3">
				<button
					onclick={dismissCreatedToken}
					class="text-sm font-medium text-primary hover:underline"
				>
					Done
				</button>
			</div>
		</div>
	{/if}

	<!-- Create Token Form -->
	<div class="mb-6 rounded-lg border bg-card p-6">
		<h3 class="mb-4 text-lg font-medium">Create Token</h3>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}
		<form method="POST" action="?/createToken" use:enhance class="flex items-end gap-3">
			<div class="flex-1 space-y-2">
				<Label for="token-name">Token Name</Label>
				<Input
					id="token-name"
					name="name"
					type="text"
					placeholder="e.g. Okta SCIM Token"
					value={String($form.name ?? '')}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>
			<Button type="submit">Create Token</Button>
		</form>
	</div>

	<!-- Token List -->
	{#if tokens.length === 0}
		<EmptyState
			title="No SCIM tokens"
			description="Create a SCIM bearer token to allow identity providers to provision users."
			icon="🔑"
		/>
	{:else}
		<div class="rounded-md border">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b bg-muted/50">
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">Prefix</th>
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">Last Used</th>
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
						<th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each tokens as token}
						<tr class="border-b transition-colors hover:bg-muted/50">
							<td class="px-4 py-3 font-medium">{token.name}</td>
							<td class="px-4 py-3">
								<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
									{token.token_prefix}...
								</code>
							</td>
							<td class="px-4 py-3 text-muted-foreground">{formatDate(token.created_at)}</td>
							<td class="px-4 py-3 text-muted-foreground">
								{token.last_used_at ? formatDate(token.last_used_at) : 'Never'}
							</td>
							<td class="px-4 py-3">
								{#if token.revoked_at}
									<span
										class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200"
									>
										Revoked
									</span>
								{:else}
									<span
										class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
									>
										Active
									</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-right">
								{#if !token.revoked_at}
									<button
										onclick={() => openRevokeConfirm(token.id, token.name)}
										class="text-sm font-medium text-destructive hover:underline"
									>
										Revoke
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Mappings Tab -->
<div
	id="tabpanel-mappings"
	role="tabpanel"
	aria-labelledby="tab-mappings"
	class="mt-6"
	class:hidden={activeTab !== 'mappings'}
>
	{#if mappings.length === 0}
		<EmptyState
			title="No SCIM attribute mappings"
			description="No attribute mappings are configured for this tenant."
			icon="🔗"
		/>
	{:else}
		<form
			method="POST"
			action="?/updateMappings"
			use:svelteEnhance={() => {
				isSavingMappings = true;
				return async ({ result, update }) => {
					isSavingMappings = false;
					if (result.type === 'success') {
						addToast('success', 'Mappings saved successfully');
					} else if (result.type === 'failure') {
						addToast('error', (result.data as Record<string, unknown>)?.message as string ?? 'Failed to save mappings');
					}
					await update();
				};
			}}
		>
			<div class="rounded-md border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">SCIM Path</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground"
								>Platform Field</th
							>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Transform</th>
							<th class="px-4 py-3 text-center font-medium text-muted-foreground">Required</th>
						</tr>
					</thead>
					<tbody>
						{#each mappings as mapping, i}
							<tr class="border-b transition-colors hover:bg-muted/50">
								<td class="px-4 py-3">
									<code class="text-xs">{mapping.scim_path}</code>
									<input type="hidden" name="scim_path" value={mapping.scim_path} />
								</td>
								<td class="px-4 py-3">
									<code class="text-xs">{mapping.xavyo_field}</code>
									<input type="hidden" name="xavyo_field" value={mapping.xavyo_field} />
								</td>
								<td class="px-4 py-3">
									<select
										name="transform"
										class="rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
										value={mapping.transform ?? 'none'}
									>
										<option value="none">None</option>
										<option value="lowercase">Lowercase</option>
										<option value="uppercase">Uppercase</option>
										<option value="trim">Trim</option>
									</select>
								</td>
								<td class="px-4 py-3 text-center">
									<input
										type="hidden"
										name="required"
										value={mapping.required ? 'true' : 'false'}
									/>
									<input
										type="checkbox"
										checked={mapping.required}
										onchange={(e) => {
											const checkbox = e.target as HTMLInputElement;
											const hiddenInput = checkbox.previousElementSibling as HTMLInputElement;
											hiddenInput.value = checkbox.checked ? 'true' : 'false';
										}}
										class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="mt-4">
				<Button type="submit" disabled={isSavingMappings}>
					{#if isSavingMappings}
						Saving...
					{:else}
						Save Changes
					{/if}
				</Button>
			</div>
		</form>
	{/if}
</div>

<!-- Revoke Confirmation Dialog -->
<Dialog.Root bind:open={showRevokeConfirm}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Revoke Token</DialogTitle>
			<DialogDescription>
				Are you sure you want to revoke the token <strong>{revokeTargetName}</strong>? This action
				cannot be undone. Any integrations using this token will stop working.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<Button variant="outline" onclick={closeRevokeConfirm}>Cancel</Button>
			<form
				method="POST"
				action="?/revokeToken"
				use:svelteEnhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							addToast('success', 'SCIM token revoked');
							closeRevokeConfirm();
						} else if (result.type === 'failure') {
							addToast('error', 'Failed to revoke token');
							closeRevokeConfirm();
						}
						await update();
					};
				}}
			>
				<input type="hidden" name="id" value={revokeTargetId} />
				<Button type="submit" variant="destructive">Revoke</Button>
			</form>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>
