<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { emailChangeSchema, emailVerifySchema } from '$lib/schemas/settings';
	import { addToast } from '$lib/stores/toast.svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onEmailChanged: () => void;
	}

	let { open = $bindable(), onOpenChange, onEmailChanged }: Props = $props();

	let phase = $state<'initiate' | 'verify'>('initiate');
	let newEmail = $state('');
	let currentPassword = $state('');
	let token = $state('');
	let expiresAt = $state('');
	let errors: Record<string, string> = $state({});
	let formError = $state('');
	let isSubmitting = $state(false);

	function clearForm() {
		phase = 'initiate';
		newEmail = '';
		currentPassword = '';
		token = '';
		expiresAt = '';
		errors = {};
		formError = '';
	}

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) {
			clearForm();
		}
		onOpenChange(isOpen);
	}

	async function handleInitiate(event: SubmitEvent) {
		event.preventDefault();
		errors = {};
		formError = '';

		const parsed = emailChangeSchema.safeParse({
			new_email: newEmail,
			current_password: currentPassword
		});

		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const field = issue.path[0];
				if (typeof field === 'string') {
					errors[field] = issue.message;
				}
			}
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/me/email/change', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					new_email: parsed.data.new_email,
					current_password: parsed.data.current_password
				})
			});

			if (!response.ok) {
				if (response.status === 409) {
					errors.new_email = 'This email is already in use';
					return;
				}
				if (response.status === 401) {
					errors.current_password = 'Incorrect password';
					return;
				}
				const data = await response.json().catch(() => null);
				formError =
					(data as Record<string, unknown> | null)?.message?.toString() ??
					'Failed to initiate email change';
				return;
			}

			const data = (await response.json()) as { message: string; expires_at: string };
			expiresAt = data.expires_at;
			phase = 'verify';
		} catch {
			formError = 'An unexpected error occurred. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	async function handleVerify(event: SubmitEvent) {
		event.preventDefault();
		errors = {};
		formError = '';

		const parsed = emailVerifySchema.safeParse({ token });

		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				if (issue.path[0] === 'token') {
					errors.token = issue.message;
				}
			}
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/me/email/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: parsed.data.token })
			});

			if (!response.ok) {
				if (response.status === 400) {
					errors.token = 'Invalid or expired verification token';
					return;
				}
				const data = await response.json().catch(() => null);
				formError =
					(data as Record<string, unknown> | null)?.message?.toString() ??
					'Failed to verify email';
				return;
			}

			addToast('success', `Email changed to ${newEmail}`);
			handleOpenChange(false);
			onEmailChanged();
		} catch {
			formError = 'An unexpected error occurred. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				{phase === 'initiate' ? 'Change email address' : 'Verify new email'}
			</Dialog.Title>
			<Dialog.Description>
				{phase === 'initiate'
					? 'Enter your new email address and current password to start the change.'
					: `A verification code has been sent to ${newEmail}. Check your inbox.`}
			</Dialog.Description>
		</Dialog.Header>

		{#if formError}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{formError}</AlertDescription>
			</Alert>
		{/if}

		{#if phase === 'initiate'}
			<form onsubmit={handleInitiate} class="space-y-4 py-4">
				<div class="space-y-2">
					<Label for="new_email">New email address</Label>
					<Input
						id="new_email"
						type="email"
						placeholder="you@example.com"
						value={newEmail}
						oninput={(e: Event) => {
							newEmail = (e.target as HTMLInputElement).value;
						}}
					/>
					{#if errors.new_email}
						<p class="text-sm text-destructive">{errors.new_email}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="current_password">Current password</Label>
					<Input
						id="current_password"
						type="password"
						placeholder="Enter your current password"
						value={currentPassword}
						oninput={(e: Event) => {
							currentPassword = (e.target as HTMLInputElement).value;
						}}
					/>
					{#if errors.current_password}
						<p class="text-sm text-destructive">{errors.current_password}</p>
					{/if}
				</div>

				<Dialog.Footer>
					<Button
						variant="outline"
						type="button"
						onclick={() => handleOpenChange(false)}
						disabled={isSubmitting}>Cancel</Button
					>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Sending...' : 'Send verification'}
					</Button>
				</Dialog.Footer>
			</form>
		{:else}
			<form onsubmit={handleVerify} class="space-y-4 py-4">
				{#if expiresAt}
					<p class="text-sm text-muted-foreground">
						The verification code expires at {new Date(expiresAt).toLocaleTimeString()}.
					</p>
				{/if}

				<div class="space-y-2">
					<Label for="token">Verification code</Label>
					<Input
						id="token"
						type="text"
						placeholder="Enter the 43-character verification code"
						value={token}
						oninput={(e: Event) => {
							token = (e.target as HTMLInputElement).value;
						}}
					/>
					{#if errors.token}
						<p class="text-sm text-destructive">{errors.token}</p>
					{/if}
				</div>

				<Dialog.Footer>
					<Button
						variant="outline"
						type="button"
						onclick={() => {
							phase = 'initiate';
							errors = {};
							formError = '';
						}}
						disabled={isSubmitting}>Back</Button
					>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Verifying...' : 'Verify'}
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
