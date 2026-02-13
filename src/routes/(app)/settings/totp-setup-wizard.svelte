<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { totpVerifySchema } from '$lib/schemas/settings';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { TotpSetupResponse } from '$lib/api/types';
	import RecoveryCodesDialog from './recovery-codes-dialog.svelte';

	interface Props {
		onComplete: () => void;
		onCancel: () => void;
	}

	let { onComplete, onCancel }: Props = $props();

	let currentStep = $state<1 | 2 | 3>(1);
	let isLoading = $state(true);
	let setupData = $state<TotpSetupResponse | null>(null);
	let setupError = $state('');

	// Step 2 state
	let verifyCode = $state('');
	let verifyErrors: Record<string, string> = $state({});
	let verifyError = $state('');
	let isVerifying = $state(false);

	// Step 3 state
	let recoveryCodes = $state<string[]>([]);
	let acknowledged = $state(false);
	let copyFeedback = $state(false);

	// Extract secret from otpauth URI for manual entry
	let manualSecret = $derived(() => {
		if (!setupData?.otpauth_uri) return '';
		try {
			const url = new URL(setupData.otpauth_uri);
			return url.searchParams.get('secret') ?? setupData.secret;
		} catch {
			return setupData.secret;
		}
	});

	onMount(async () => {
		await fetchSetup();
	});

	async function fetchSetup() {
		isLoading = true;
		setupError = '';

		try {
			const response = await fetch('/api/mfa/totp/setup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				setupError =
					(data as Record<string, unknown> | null)?.message?.toString() ??
					'Failed to set up TOTP. Please try again.';
				return;
			}

			setupData = (await response.json()) as TotpSetupResponse;
		} catch {
			setupError = 'An unexpected error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	async function handleVerify(event: SubmitEvent) {
		event.preventDefault();
		verifyErrors = {};
		verifyError = '';

		const parsed = totpVerifySchema.safeParse({ code: verifyCode });

		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const field = issue.path[0];
				if (typeof field === 'string') {
					verifyErrors[field] = issue.message;
				}
			}
			return;
		}

		isVerifying = true;

		try {
			const response = await fetch('/api/mfa/totp/verify-setup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code: parsed.data.code })
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				if (response.status === 400) {
					verifyErrors.code = 'Invalid code. Please check and try again.';
				} else {
					verifyError =
						(data as Record<string, unknown> | null)?.message?.toString() ??
						'Verification failed. Please try again.';
				}
				return;
			}

			const data = (await response.json()) as { recovery_codes: string[]; message: string };
			recoveryCodes = data.recovery_codes;
			addToast('success', 'TOTP authentication enabled successfully');
			currentStep = 3;
		} catch {
			verifyError = 'An unexpected error occurred. Please try again.';
		} finally {
			isVerifying = false;
		}
	}

	async function copySecret() {
		try {
			await navigator.clipboard.writeText(manualSecret());
		} catch {
			// Clipboard API may fail in some contexts
		}
	}

	async function copyAllCodes() {
		try {
			await navigator.clipboard.writeText(recoveryCodes.join('\n'));
			copyFeedback = true;
			setTimeout(() => {
				copyFeedback = false;
			}, 2000);
		} catch {
			// Clipboard API may fail
		}
	}

	function downloadCodes() {
		const content = [
			'Xavyo Recovery Codes',
			'====================',
			'',
			'Save these codes in a secure place.',
			'Each code can only be used once.',
			'',
			...recoveryCodes
		].join('\n');

		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'recovery-codes.txt';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	function handleComplete() {
		onComplete();
	}
</script>

<Card class="max-w-lg">
	<CardHeader>
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-semibold">Set up authenticator app</h2>
				<p class="text-sm text-muted-foreground">
					{#if currentStep === 1}
						Scan the QR code with your authenticator app
					{:else if currentStep === 2}
						Enter the code from your authenticator app
					{:else}
						Save your recovery codes
					{/if}
				</p>
			</div>
			<div class="flex gap-1">
				{#each [1, 2, 3] as step}
					<div
						class="h-2 w-8 rounded-full {step <= currentStep ? 'bg-primary' : 'bg-muted'}"
					></div>
				{/each}
			</div>
		</div>
	</CardHeader>
	<CardContent>
		{#if currentStep === 1}
			<!-- Step 1: Setup -->
			{#if isLoading}
				<div class="flex items-center justify-center py-12">
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
				</div>
			{:else if setupError}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{setupError}</AlertDescription>
				</Alert>
				<div class="flex gap-2">
					<Button variant="outline" onclick={onCancel}>Cancel</Button>
					<Button onclick={fetchSetup}>Retry</Button>
				</div>
			{:else if setupData}
				<div class="space-y-4">
					<div class="flex justify-center rounded-md border bg-white p-4">
						<img
							src="data:image/png;base64,{setupData.qr_code}"
							alt="TOTP QR Code"
							class="h-48 w-48"
						/>
					</div>

					<div class="space-y-2">
						<p class="text-sm text-muted-foreground">
							Can't scan the QR code? Enter this secret manually:
						</p>
						<div class="flex items-center gap-2 rounded-md border bg-muted p-3">
							<code class="flex-1 break-all font-mono text-sm">{manualSecret()}</code>
							<Button variant="outline" size="sm" onclick={copySecret}>
								Copy
							</Button>
						</div>
					</div>

					<div class="flex gap-2 pt-2">
						<Button variant="outline" onclick={onCancel}>Cancel</Button>
						<Button onclick={() => (currentStep = 2)}>Next</Button>
					</div>
				</div>
			{/if}
		{:else if currentStep === 2}
			<!-- Step 2: Verify -->
			{#if verifyError}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{verifyError}</AlertDescription>
				</Alert>
			{/if}

			<form onsubmit={handleVerify} class="space-y-4">
				<div class="space-y-2">
					<Label for="totp-code">Verification code</Label>
					<Input
						id="totp-code"
						type="text"
						inputmode="numeric"
						autocomplete="one-time-code"
						placeholder="000000"
						maxlength={6}
						bind:value={verifyCode}
						disabled={isVerifying}
					/>
					{#if verifyErrors.code}
						<p class="text-sm text-destructive">{verifyErrors.code}</p>
					{/if}
					<p class="text-xs text-muted-foreground">
						Enter the 6-digit code shown in your authenticator app.
					</p>
				</div>

				<div class="flex gap-2 pt-2">
					<Button variant="outline" type="button" onclick={onCancel} disabled={isVerifying}>
						Cancel
					</Button>
					<Button type="submit" disabled={isVerifying}>
						{#if isVerifying}
							Verifying...
						{:else}
							Verify
						{/if}
					</Button>
				</div>
			</form>
		{:else}
			<!-- Step 3: Recovery Codes -->
			<div class="space-y-4">
				<Alert>
					<AlertDescription>
						Save these recovery codes in a secure place. Each code can only be used once to
						regain access to your account if you lose your authenticator.
					</AlertDescription>
				</Alert>

				<div class="grid grid-cols-2 gap-2 rounded-md border bg-muted p-4">
					{#each recoveryCodes as code}
						<code class="text-center font-mono text-sm">{code}</code>
					{/each}
				</div>

				<div class="flex gap-2">
					<Button variant="outline" size="sm" onclick={copyAllCodes}>
						{#if copyFeedback}
							Copied!
						{:else}
							Copy all
						{/if}
					</Button>
					<Button variant="outline" size="sm" onclick={downloadCodes}>
						Download
					</Button>
				</div>

				<label class="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						bind:checked={acknowledged}
						class="h-4 w-4 rounded border-input"
					/>
					I have saved my recovery codes
				</label>

				<div class="pt-2">
					<Button disabled={!acknowledged} onclick={handleComplete}>
						Complete setup
					</Button>
				</div>
			</div>
		{/if}
	</CardContent>
</Card>
