<script lang="ts">
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { NhiCredentialResponse } from '$lib/api/types';

	let {
		credentials,
		isArchived = false
	}: {
		credentials: NhiCredentialResponse[];
		isArchived?: boolean;
	} = $props();

	let showIssueDialog: boolean = $state(false);
	let showSecretDialog: boolean = $state(false);
	let showRevokeDialog: boolean = $state(false);
	let showRotateDialog: boolean = $state(false);
	let currentSecret: string = $state('');
	let revokeCredentialId: string = $state('');
	let rotateCredentialId: string = $state('');
	let copied: boolean = $state(false);

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString();
	}

	async function copySecret() {
		await navigator.clipboard.writeText(currentSecret);
		copied = true;
		setTimeout(() => { copied = false; }, 2000);
	}
</script>

<Card class="max-w-lg">
	<CardHeader>
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-semibold">Credentials</h2>
			{#if !isArchived}
				<Button variant="outline" size="sm" onclick={() => (showIssueDialog = true)}>Issue credential</Button>
			{/if}
		</div>
	</CardHeader>
	<CardContent>
		{#if credentials.length === 0}
			<div class="flex flex-col items-center justify-center py-6 text-center">
				<p class="text-sm text-muted-foreground">No credentials issued yet.</p>
				{#if !isArchived}
					<button
						class="mt-2 text-sm font-medium text-primary hover:underline"
						onclick={() => (showIssueDialog = true)}
					>
						Issue your first credential
					</button>
				{/if}
			</div>
		{:else}
			<div class="space-y-3">
				{#each credentials as cred}
					<div class="flex items-center justify-between rounded-md border p-3">
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<span class="text-sm font-medium">{cred.credential_type}</span>
								{#if cred.is_active}
									<Badge variant="default">Active</Badge>
								{:else}
									<Badge variant="secondary">Inactive</Badge>
								{/if}
							</div>
							<p class="font-mono text-xs text-muted-foreground">{'••••••••'}</p>
							<p class="text-xs text-muted-foreground">
								{formatDate(cred.valid_from)}
								{#if cred.valid_until}
									— {formatDate(cred.valid_until)}
								{/if}
							</p>
						</div>
						{#if !isArchived && cred.is_active}
							<div class="flex gap-1">
								<Button
									variant="outline"
									size="sm"
									onclick={() => { rotateCredentialId = cred.id; showRotateDialog = true; }}
								>
									Rotate
								</Button>
								<Button
									variant="outline"
									size="sm"
									onclick={() => { revokeCredentialId = cred.id; showRevokeDialog = true; }}
								>
									Revoke
								</Button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>

<!-- Issue credential dialog -->
<Dialog.Root bind:open={showIssueDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Issue credential</Dialog.Title>
			<Dialog.Description>Create a new credential for this identity.</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/issueCredential"
			use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success' && result.data) {
						const data = result.data as Record<string, unknown>;
						if (data.secret) {
							currentSecret = String(data.secret);
							showIssueDialog = false;
							showSecretDialog = true;
							addToast('success', 'Credential issued');
							await invalidateAll();
						}
					} else if (result.type === 'failure') {
						addToast('error', String(result.data?.error ?? 'Failed to issue credential'));
						showIssueDialog = false;
					}
				};
			}}
		>
			<div class="space-y-4 py-4">
				<div class="space-y-2">
					<Label for="credential_type">Credential type</Label>
					<select
						id="credential_type"
						name="credential_type"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						<option value="api_key">API Key</option>
						<option value="secret">Secret</option>
						<option value="certificate">Certificate</option>
					</select>
				</div>
				<div class="space-y-2">
					<Label for="valid_days">Valid for (days, optional)</Label>
					<Input id="valid_days" name="valid_days" type="number" placeholder="e.g. 90" />
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (showIssueDialog = false)}>Cancel</Button>
				<Button type="submit">Issue</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Secret display dialog -->
<Dialog.Root bind:open={showSecretDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Credential secret</Dialog.Title>
			<Dialog.Description>
				Copy this secret now. It will not be shown again.
			</Dialog.Description>
		</Dialog.Header>
		<div class="py-4">
			<div class="flex items-center gap-2 rounded-md border bg-muted p-3">
				<code class="flex-1 break-all font-mono text-sm">{currentSecret}</code>
				<Button variant="outline" size="sm" onclick={copySecret}>
					{copied ? 'Copied!' : 'Copy'}
				</Button>
			</div>
			<p class="mt-2 text-xs text-destructive">This secret will not be shown again.</p>
		</div>
		<Dialog.Footer>
			<Button onclick={() => { showSecretDialog = false; currentSecret = ''; }}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Rotate credential dialog -->
<Dialog.Root bind:open={showRotateDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Rotate credential</Dialog.Title>
			<Dialog.Description>
				This will invalidate the current credential and generate a new one.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/rotateCredential"
			use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success' && result.data) {
						const data = result.data as Record<string, unknown>;
						if (data.secret) {
							currentSecret = String(data.secret);
							showRotateDialog = false;
							showSecretDialog = true;
							addToast('success', 'Credential rotated');
							await invalidateAll();
						}
					} else if (result.type === 'failure') {
						addToast('error', String(result.data?.error ?? 'Failed to rotate credential'));
						showRotateDialog = false;
					}
				};
			}}
		>
			<input type="hidden" name="credential_id" value={rotateCredentialId} />
			<div class="space-y-4 py-4">
				<div class="space-y-2">
					<Label for="grace_period_hours">Grace period (hours, optional)</Label>
					<Input id="grace_period_hours" name="grace_period_hours" type="number" placeholder="e.g. 24" />
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (showRotateDialog = false)}>Cancel</Button>
				<Button type="submit">Rotate</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Revoke credential dialog -->
<Dialog.Root bind:open={showRevokeDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Revoke credential</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to revoke this credential? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/revokeCredential"
			use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Credential revoked');
						showRevokeDialog = false;
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', String(result.data?.error ?? 'Failed to revoke credential'));
						showRevokeDialog = false;
					}
				};
			}}
		>
			<input type="hidden" name="credential_id" value={revokeCredentialId} />
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (showRevokeDialog = false)}>Cancel</Button>
				<Button type="submit" variant="destructive">Revoke</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
