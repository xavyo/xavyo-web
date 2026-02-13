<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import * as Dialog from '$lib/components/ui/dialog';
	import { webauthnNameSchema } from '$lib/schemas/settings';
	import { addToast } from '$lib/stores/toast.svelte';
	import { bufferToBase64url, base64urlToBuffer } from '$lib/utils/webauthn';
	import type { WebAuthnCredential } from '$lib/api/types';

	interface Props {
		credentials: WebAuthnCredential[];
		onCredentialsChanged: () => void;
	}

	let { credentials, onCredentialsChanged }: Props = $props();

	let isSupported = $derived(
		typeof window !== 'undefined' && !!window.PublicKeyCredential
	);

	// Register state
	let showRegisterDialog = $state(false);
	let registerName = $state('');
	let registerNameError = $state('');
	let isRegistering = $state(false);

	// Rename state
	let showRenameDialog = $state(false);
	let renameCredentialId = $state('');
	let renameName = $state('');
	let renameNameError = $state('');
	let isRenaming = $state(false);

	// Delete state
	let showDeleteDialog = $state(false);
	let deleteCredentialId = $state('');
	let deleteCredentialName = $state('');
	let isDeleting = $state(false);
	let isLastCredential = $derived(credentials.length === 1);

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString();
	}

	function openRegisterDialog() {
		registerName = '';
		registerNameError = '';
		showRegisterDialog = true;
	}

	async function handleRegister() {
		registerNameError = '';

		const parsed = webauthnNameSchema.safeParse({ name: registerName });
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				if (issue.path[0] === 'name') {
					registerNameError = issue.message;
				}
			}
			return;
		}

		isRegistering = true;

		try {
			// Step 1: Start registration — get options from server
			const startResponse = await fetch('/api/mfa/webauthn/register/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: parsed.data.name || undefined })
			});

			if (!startResponse.ok) {
				const data = await startResponse.json().catch(() => null);
				addToast(
					'error',
					(data as Record<string, unknown> | null)?.message?.toString() ??
						'Failed to start registration. Please try again.'
				);
				return;
			}

			const options = (await startResponse.json()) as Record<string, unknown>;

			// Step 2: Decode base64url fields for the browser API
			const publicKey = options.publicKey as Record<string, unknown>;

			if (publicKey.challenge && typeof publicKey.challenge === 'string') {
				publicKey.challenge = base64urlToBuffer(publicKey.challenge);
			}

			const user = publicKey.user as Record<string, unknown> | undefined;
			if (user?.id && typeof user.id === 'string') {
				user.id = base64urlToBuffer(user.id);
			}

			if (Array.isArray(publicKey.excludeCredentials)) {
				publicKey.excludeCredentials = (
					publicKey.excludeCredentials as Record<string, unknown>[]
				).map((cred) => ({
					...cred,
					id:
						typeof cred.id === 'string'
							? base64urlToBuffer(cred.id)
							: cred.id
				}));
			}

			// Step 3: Call browser WebAuthn API
			const credential = (await navigator.credentials.create({
				publicKey: publicKey as unknown as PublicKeyCredentialCreationOptions
			})) as PublicKeyCredential | null;

			if (!credential) {
				addToast('error', 'Registration was cancelled.');
				return;
			}

			const attestationResponse =
				credential.response as AuthenticatorAttestationResponse;

			// Step 4: Encode response for the server
			const finishBody = {
				id: credential.id,
				rawId: bufferToBase64url(credential.rawId),
				type: credential.type,
				response: {
					attestationObject: bufferToBase64url(
						attestationResponse.attestationObject
					),
					clientDataJSON: bufferToBase64url(
						attestationResponse.clientDataJSON
					)
				}
			};

			// Step 5: Finish registration
			const finishResponse = await fetch('/api/mfa/webauthn/register/finish', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(finishBody)
			});

			if (!finishResponse.ok) {
				const data = await finishResponse.json().catch(() => null);
				addToast(
					'error',
					(data as Record<string, unknown> | null)?.message?.toString() ??
						'Failed to complete registration. Please try again.'
				);
				return;
			}

			showRegisterDialog = false;
			addToast('success', 'Security key registered successfully.');
			onCredentialsChanged();
		} catch (err: unknown) {
			if (err instanceof DOMException && err.name === 'NotAllowedError') {
				addToast(
					'error',
					'Registration was cancelled or timed out. Please try again.'
				);
			} else {
				addToast('error', 'An unexpected error occurred during registration.');
			}
		} finally {
			isRegistering = false;
		}
	}

	function openRenameDialog(credential: WebAuthnCredential) {
		renameCredentialId = credential.id;
		renameName = credential.name ?? '';
		renameNameError = '';
		showRenameDialog = true;
	}

	async function handleRename() {
		renameNameError = '';

		if (!renameName.trim()) {
			renameNameError = 'Name is required';
			return;
		}

		if (renameName.length > 100) {
			renameNameError = 'Name must be 100 characters or less';
			return;
		}

		isRenaming = true;

		try {
			const response = await fetch(
				`/api/mfa/webauthn/credentials?id=${encodeURIComponent(renameCredentialId)}`,
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name: renameName.trim() })
				}
			);

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				addToast(
					'error',
					(data as Record<string, unknown> | null)?.message?.toString() ??
						'Failed to rename credential. Please try again.'
				);
				return;
			}

			showRenameDialog = false;
			addToast('success', 'Security key renamed.');
			onCredentialsChanged();
		} catch {
			addToast('error', 'An unexpected error occurred. Please try again.');
		} finally {
			isRenaming = false;
		}
	}

	function openDeleteDialog(credential: WebAuthnCredential) {
		deleteCredentialId = credential.id;
		deleteCredentialName = credential.name || 'Unnamed key';
		showDeleteDialog = true;
	}

	async function handleDelete() {
		isDeleting = true;

		try {
			const response = await fetch(
				`/api/mfa/webauthn/credentials?id=${encodeURIComponent(deleteCredentialId)}`,
				{
					method: 'DELETE'
				}
			);

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				addToast(
					'error',
					(data as Record<string, unknown> | null)?.message?.toString() ??
						'Failed to delete credential. Please try again.'
				);
				return;
			}

			showDeleteDialog = false;
			addToast('success', 'Security key removed.');
			onCredentialsChanged();
		} catch {
			addToast('error', 'An unexpected error occurred. Please try again.');
		} finally {
			isDeleting = false;
		}
	}
</script>

<Card class="max-w-lg">
	<CardHeader>
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-semibold">Security keys</h2>
				<p class="text-sm text-muted-foreground">
					Manage your WebAuthn/FIDO2 security keys for two-factor authentication.
				</p>
			</div>
			{#if isSupported}
				<Button variant="outline" size="sm" onclick={openRegisterDialog} disabled={isRegistering}>
					Register security key
				</Button>
			{/if}
		</div>
	</CardHeader>
	<CardContent>
		{#if !isSupported}
			<Alert>
				<AlertDescription>
					Security keys are not supported by your browser. Please use a modern browser that
					supports WebAuthn/FIDO2.
				</AlertDescription>
			</Alert>
		{:else if credentials.length === 0}
			<div class="flex flex-col items-center justify-center py-6 text-center">
				<p class="text-sm text-muted-foreground">No security keys registered yet.</p>
				<button
					class="mt-2 text-sm font-medium text-primary hover:underline"
					onclick={openRegisterDialog}
				>
					Register your first security key
				</button>
			</div>
		{:else}
			<div class="space-y-3">
				{#each credentials as credential (credential.id)}
					<div class="flex items-center justify-between rounded-md border p-3">
						<div class="space-y-1">
							<span class="text-sm font-medium">
								{credential.name || 'Unnamed key'}
							</span>
							<p class="text-xs text-muted-foreground">
								Registered {formatDate(credential.created_at)}
							</p>
						</div>
						<div class="flex gap-1">
							<Button
								variant="outline"
								size="sm"
								onclick={() => openRenameDialog(credential)}
							>
								Rename
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={() => openDeleteDialog(credential)}
							>
								Delete
							</Button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>

<!-- Register security key dialog (name prompt) -->
<Dialog.Root bind:open={showRegisterDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Register security key</Dialog.Title>
			<Dialog.Description>
				Optionally give your security key a name, then follow your browser's prompt.
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="register-key-name">Name (optional)</Label>
				<Input
					id="register-key-name"
					placeholder="e.g. YubiKey 5"
					bind:value={registerName}
					disabled={isRegistering}
				/>
				{#if registerNameError}
					<p class="text-sm text-destructive">{registerNameError}</p>
				{/if}
			</div>
		</div>
		<Dialog.Footer>
			<Button
				variant="outline"
				type="button"
				onclick={() => (showRegisterDialog = false)}
				disabled={isRegistering}
			>
				Cancel
			</Button>
			<Button onclick={handleRegister} disabled={isRegistering}>
				{#if isRegistering}
					Registering...
				{:else}
					Continue
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Rename credential dialog -->
<Dialog.Root bind:open={showRenameDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Rename security key</Dialog.Title>
			<Dialog.Description>Enter a new name for this security key.</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="rename-key-name">Name</Label>
				<Input
					id="rename-key-name"
					bind:value={renameName}
					disabled={isRenaming}
				/>
				{#if renameNameError}
					<p class="text-sm text-destructive">{renameNameError}</p>
				{/if}
			</div>
		</div>
		<Dialog.Footer>
			<Button
				variant="outline"
				type="button"
				onclick={() => (showRenameDialog = false)}
				disabled={isRenaming}
			>
				Cancel
			</Button>
			<Button onclick={handleRename} disabled={isRenaming}>
				{#if isRenaming}
					Renaming...
				{:else}
					Save
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete credential dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete security key</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to remove "{deleteCredentialName}"?
			</Dialog.Description>
		</Dialog.Header>
		<div class="py-4">
			{#if isLastCredential}
				<Alert variant="destructive">
					<AlertDescription>
						This is your only security key. Removing it will disable WebAuthn authentication.
					</AlertDescription>
				</Alert>
			{:else}
				<p class="text-sm text-muted-foreground">
					This action cannot be undone.
				</p>
			{/if}
		</div>
		<Dialog.Footer>
			<Button
				variant="outline"
				type="button"
				onclick={() => (showDeleteDialog = false)}
				disabled={isDeleting}
			>
				Cancel
			</Button>
			<Button variant="destructive" onclick={handleDelete} disabled={isDeleting}>
				{#if isDeleting}
					Deleting...
				{:else}
					Delete
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
