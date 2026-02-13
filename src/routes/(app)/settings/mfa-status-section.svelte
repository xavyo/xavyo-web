<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import * as Dialog from '$lib/components/ui/dialog';
	import { totpDisableSchema, recoveryRegenerateSchema } from '$lib/schemas/settings';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { MfaStatus } from '$lib/api/types';
	import TotpSetupWizard from './totp-setup-wizard.svelte';
	import RecoveryCodesDialog from './recovery-codes-dialog.svelte';

	interface Props {
		mfaStatus: MfaStatus | null;
		onMfaUpdated: () => void;
	}

	let { mfaStatus, onMfaUpdated }: Props = $props();

	let showSetupWizard = $state(false);

	// Disable dialog state
	let showDisableDialog = $state(false);
	let disablePassword = $state('');
	let disableCode = $state('');
	let disableErrors: Record<string, string> = $state({});
	let disableError = $state('');
	let isDisabling = $state(false);

	// Regenerate dialog state
	let showRegenerateDialog = $state(false);
	let regeneratePassword = $state('');
	let regenerateErrors: Record<string, string> = $state({});
	let regenerateError = $state('');
	let isRegenerating = $state(false);

	// Recovery codes dialog state
	let showRecoveryCodesDialog = $state(false);
	let recoveryCodes = $state<string[]>([]);

	let mfaEnabled = $derived(mfaStatus?.totp_enabled ?? false);

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return 'Never';
		try {
			return new Date(dateStr).toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return 'Unknown';
		}
	}

	function clearDisableForm() {
		disablePassword = '';
		disableCode = '';
		disableErrors = {};
		disableError = '';
	}

	function clearRegenerateForm() {
		regeneratePassword = '';
		regenerateErrors = {};
		regenerateError = '';
	}

	async function handleDisable(event: SubmitEvent) {
		event.preventDefault();
		disableErrors = {};
		disableError = '';

		const parsed = totpDisableSchema.safeParse({
			password: disablePassword,
			code: disableCode
		});

		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const field = issue.path[0];
				if (typeof field === 'string') {
					disableErrors[field] = issue.message;
				}
			}
			return;
		}

		isDisabling = true;

		try {
			const response = await fetch('/api/mfa/totp/disable', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					password: parsed.data.password,
					code: parsed.data.code
				})
			});

			if (!response.ok) {
				if (response.status === 401) {
					disableErrors.password = 'Incorrect password';
					return;
				}
				if (response.status === 400) {
					disableErrors.code = 'Invalid TOTP code';
					return;
				}

				const data = await response.json().catch(() => null);
				disableError =
					(data as Record<string, unknown> | null)?.message?.toString() ??
					'Failed to disable MFA. Please try again.';
				return;
			}

			addToast('success', 'Two-factor authentication has been disabled');
			showDisableDialog = false;
			clearDisableForm();
			onMfaUpdated();
		} catch {
			disableError = 'An unexpected error occurred. Please try again.';
		} finally {
			isDisabling = false;
		}
	}

	async function handleRegenerate(event: SubmitEvent) {
		event.preventDefault();
		regenerateErrors = {};
		regenerateError = '';

		const parsed = recoveryRegenerateSchema.safeParse({
			password: regeneratePassword
		});

		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const field = issue.path[0];
				if (typeof field === 'string') {
					regenerateErrors[field] = issue.message;
				}
			}
			return;
		}

		isRegenerating = true;

		try {
			const response = await fetch('/api/mfa/recovery/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password: parsed.data.password })
			});

			if (!response.ok) {
				if (response.status === 401) {
					regenerateErrors.password = 'Incorrect password';
					return;
				}

				const data = await response.json().catch(() => null);
				regenerateError =
					(data as Record<string, unknown> | null)?.message?.toString() ??
					'Failed to regenerate recovery codes. Please try again.';
				return;
			}

			const data = (await response.json()) as { recovery_codes: string[]; message: string };
			recoveryCodes = data.recovery_codes;
			showRegenerateDialog = false;
			clearRegenerateForm();
			showRecoveryCodesDialog = true;
		} catch {
			regenerateError = 'An unexpected error occurred. Please try again.';
		} finally {
			isRegenerating = false;
		}
	}

	function handleSetupComplete() {
		showSetupWizard = false;
		onMfaUpdated();
	}

	function handleSetupCancel() {
		showSetupWizard = false;
	}

	function handleRecoveryCodesClose() {
		showRecoveryCodesDialog = false;
		recoveryCodes = [];
		onMfaUpdated();
	}
</script>

{#if showSetupWizard}
	<TotpSetupWizard onComplete={handleSetupComplete} onCancel={handleSetupCancel} />
{:else if mfaEnabled && mfaStatus}
	<!-- MFA Enabled Status -->
	<Card class="max-w-lg">
		<CardHeader>
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-xl font-semibold">Two-factor authentication</h2>
					<p class="text-sm text-muted-foreground">
						Your account is protected with an authenticator app.
					</p>
				</div>
				<span
					class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400"
				>
					TOTP enabled
				</span>
			</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="grid gap-3">
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Setup date</span>
						<span class="text-sm">{formatDate(mfaStatus.setup_at)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Last used</span>
						<span class="text-sm">{formatDate(mfaStatus.last_used_at)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Recovery codes remaining</span>
						<span
							class="text-sm {mfaStatus.recovery_codes_remaining < 3
								? 'font-medium text-destructive'
								: ''}"
						>
							{mfaStatus.recovery_codes_remaining}
							{#if mfaStatus.recovery_codes_remaining < 3}
								(low)
							{/if}
						</span>
					</div>
				</div>

				{#if mfaStatus.recovery_codes_remaining < 3}
					<Alert variant="destructive">
						<AlertDescription>
							You have fewer than 3 recovery codes remaining. Consider regenerating them to
							ensure you can still access your account.
						</AlertDescription>
					</Alert>
				{/if}

				<div class="flex gap-2 pt-2">
					<Button variant="outline" onclick={() => (showRegenerateDialog = true)}>
						Regenerate recovery codes
					</Button>
					<Button variant="destructive" onclick={() => (showDisableDialog = true)}>
						Disable MFA
					</Button>
				</div>
			</div>
		</CardContent>
	</Card>
{:else}
	<!-- MFA Not Enabled -->
	<Card class="max-w-lg">
		<CardHeader>
			<h2 class="text-xl font-semibold">Two-factor authentication</h2>
			<p class="text-sm text-muted-foreground">
				Add an extra layer of security to your account by requiring a verification code in
				addition to your password.
			</p>
		</CardHeader>
		<CardContent>
			<Alert class="mb-4">
				<AlertDescription>
					Two-factor authentication is not enabled. We recommend enabling it to protect your
					account.
				</AlertDescription>
			</Alert>
			<Button onclick={() => (showSetupWizard = true)}>Set up MFA</Button>
		</CardContent>
	</Card>
{/if}

<!-- Disable MFA Dialog -->
<Dialog.Root bind:open={showDisableDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Disable two-factor authentication</Dialog.Title>
			<Dialog.Description>
				This will remove the extra security layer from your account. You will need your
				password and a current TOTP code to confirm.
			</Dialog.Description>
		</Dialog.Header>

		{#if disableError}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{disableError}</AlertDescription>
			</Alert>
		{/if}

		<form onsubmit={handleDisable} class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="disable-password">Password</Label>
				<Input
					id="disable-password"
					type="password"
					autocomplete="current-password"
					bind:value={disablePassword}
					disabled={isDisabling}
				/>
				{#if disableErrors.password}
					<p class="text-sm text-destructive">{disableErrors.password}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="disable-code">TOTP code</Label>
				<Input
					id="disable-code"
					type="text"
					inputmode="numeric"
					autocomplete="one-time-code"
					placeholder="000000"
					maxlength={6}
					bind:value={disableCode}
					disabled={isDisabling}
				/>
				{#if disableErrors.code}
					<p class="text-sm text-destructive">{disableErrors.code}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Button
					variant="outline"
					type="button"
					onclick={() => {
						showDisableDialog = false;
						clearDisableForm();
					}}
					disabled={isDisabling}
				>
					Cancel
				</Button>
				<Button variant="destructive" type="submit" disabled={isDisabling}>
					{#if isDisabling}
						Disabling...
					{:else}
						Disable MFA
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Regenerate Recovery Codes Dialog -->
<Dialog.Root bind:open={showRegenerateDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Regenerate recovery codes</Dialog.Title>
			<Dialog.Description>
				This will invalidate all existing recovery codes and generate new ones. Enter your
				password to confirm.
			</Dialog.Description>
		</Dialog.Header>

		{#if regenerateError}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{regenerateError}</AlertDescription>
			</Alert>
		{/if}

		<form onsubmit={handleRegenerate} class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="regenerate-password">Password</Label>
				<Input
					id="regenerate-password"
					type="password"
					autocomplete="current-password"
					bind:value={regeneratePassword}
					disabled={isRegenerating}
				/>
				{#if regenerateErrors.password}
					<p class="text-sm text-destructive">{regenerateErrors.password}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Button
					variant="outline"
					type="button"
					onclick={() => {
						showRegenerateDialog = false;
						clearRegenerateForm();
					}}
					disabled={isRegenerating}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isRegenerating}>
					{#if isRegenerating}
						Regenerating...
					{:else}
						Regenerate codes
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Recovery Codes Display Dialog (after regeneration) -->
<RecoveryCodesDialog
	open={showRecoveryCodesDialog}
	{recoveryCodes}
	onClose={handleRecoveryCodesClose}
/>
