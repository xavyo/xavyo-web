<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { goto } from '$app/navigation';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { base64urlToBuffer, bufferToBase64url } from '$lib/utils/webauthn';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let useRecovery = $state(false);
	let webauthnBusy = $state(false);
	let webauthnError = $state('');

	async function handleWebauthn() {
		webauthnError = '';
		webauthnBusy = true;
		try {
			const startRes = await fetch('/mfa/webauthn/authenticate/start', { method: 'POST' });
			if (!startRes.ok) {
				const d = await startRes.json().catch(() => null);
				webauthnError = d?.error ?? 'Failed to start security key verification.';
				return;
			}
			const options = (await startRes.json()) as Record<string, unknown>;
			const publicKey = (options.publicKey ?? options) as Record<string, unknown>;

			if (typeof publicKey.challenge === 'string') {
				publicKey.challenge = base64urlToBuffer(publicKey.challenge);
			}
			if (Array.isArray(publicKey.allowCredentials)) {
				publicKey.allowCredentials = (publicKey.allowCredentials as Record<string, unknown>[]).map(
					(c) => ({ ...c, id: typeof c.id === 'string' ? base64urlToBuffer(c.id) : c.id })
				);
			}

			const assertion = (await navigator.credentials.get({
				publicKey: publicKey as unknown as PublicKeyCredentialRequestOptions
			})) as PublicKeyCredential | null;
			if (!assertion) {
				webauthnError = 'Security key verification was cancelled.';
				return;
			}

			const r = assertion.response as AuthenticatorAssertionResponse;
			const finishBody = {
				id: assertion.id,
				rawId: bufferToBase64url(assertion.rawId),
				type: assertion.type,
				response: {
					authenticatorData: bufferToBase64url(r.authenticatorData),
					clientDataJSON: bufferToBase64url(r.clientDataJSON),
					signature: bufferToBase64url(r.signature),
					userHandle: r.userHandle ? bufferToBase64url(r.userHandle) : null
				}
			};

			const finishRes = await fetch('/mfa/webauthn/authenticate/finish', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(finishBody)
			});
			if (!finishRes.ok) {
				const d = await finishRes.json().catch(() => null);
				webauthnError = d?.error ?? 'Security key verification failed.';
				return;
			}

			await goto('/dashboard', { invalidateAll: true });
		} catch (e) {
			if (e instanceof DOMException && e.name === 'NotAllowedError') {
				webauthnError = 'Security key verification was cancelled or timed out.';
			} else {
				webauthnError = 'Security key verification failed.';
			}
		} finally {
			webauthnBusy = false;
		}
	}

	// svelte-ignore state_referenced_locally
	const {
		form: totpForm,
		errors: totpErrors,
		enhance: totpEnhance,
		message: totpMessage
	} = superForm(data.totpForm);

	// svelte-ignore state_referenced_locally
	const {
		form: recoveryForm,
		errors: recoveryErrors,
		enhance: recoveryEnhance,
		message: recoveryMessage
	} = superForm(data.recoveryForm);
</script>

<Card>
	<CardHeader>
		<h1 class="text-2xl font-semibold tracking-tight">Two-factor authentication</h1>
		<p class="text-sm text-muted-foreground">
			{#if useRecovery}
				Enter a recovery code to access your account
			{:else}
				Enter the 6-digit code from your authenticator app
			{/if}
		</p>
	</CardHeader>
	<CardContent>
		{#if webauthnError}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{webauthnError}</AlertDescription>
			</Alert>
		{/if}

		{#if !useRecovery}
			{#if $totpMessage}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$totpMessage}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/totp" use:totpEnhance class="space-y-4">
				<div class="space-y-2">
					<Label for="code">Authentication code</Label>
					<Input
						id="code"
						name="code"
						type="text"
						inputmode="numeric"
						autocomplete="one-time-code"
						maxlength={6}
						placeholder="000000"
						value={String($totpForm.code ?? '')}
					/>
					{#if $totpErrors.code}
						<p class="text-sm text-destructive">{$totpErrors.code}</p>
					{/if}
				</div>
				<Button type="submit" class="w-full">Verify</Button>
			</form>
		{:else}
			{#if $recoveryMessage}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$recoveryMessage}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/recovery" use:recoveryEnhance class="space-y-4">
				<div class="space-y-2">
					<Label for="recovery-code">Recovery code</Label>
					<Input
						id="recovery-code"
						name="code"
						type="text"
						autocomplete="off"
						placeholder="xxxx-xxxx-xxxx"
						value={String($recoveryForm.code ?? '')}
					/>
					{#if $recoveryErrors.code}
						<p class="text-sm text-destructive">{$recoveryErrors.code}</p>
					{/if}
				</div>
				<Button type="submit" class="w-full">Verify</Button>
			</form>
		{/if}
	</CardContent>
	<CardFooter>
		<div class="flex w-full flex-col gap-2 text-center text-sm text-muted-foreground">
			<button
				type="button"
				class="text-primary underline-offset-4 hover:underline disabled:opacity-50"
				onclick={handleWebauthn}
				disabled={webauthnBusy}
			>
				{webauthnBusy ? 'Waiting for security key…' : 'Use a security key'}
			</button>
			{#if useRecovery}
				<button type="button" class="text-primary underline-offset-4 hover:underline" onclick={() => (useRecovery = false)}>
					Use authenticator app instead
				</button>
			{:else}
				<button type="button" class="text-primary underline-offset-4 hover:underline" onclick={() => (useRecovery = true)}>
					Use a recovery code
				</button>
			{/if}
			<a href="/login" class="underline-offset-4 hover:underline">Back to login</a>
		</div>
	</CardFooter>
</Card>
