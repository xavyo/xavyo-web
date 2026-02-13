<script lang="ts">
	import { PasswordStrength } from '$lib/components/ui/password-strength';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { passwordChangeSchema } from '$lib/schemas/settings';
	import { addToast } from '$lib/stores/toast.svelte';

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let revokeOtherSessions = $state(true);
	let isSubmitting = $state(false);
	let errors: Record<string, string> = $state({});
	let formError = $state('');

	function clearForm() {
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
		revokeOtherSessions = true;
		errors = {};
		formError = '';
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		errors = {};
		formError = '';

		const parsed = passwordChangeSchema.safeParse({
			current_password: currentPassword,
			new_password: newPassword,
			confirm_password: confirmPassword,
			revoke_other_sessions: revokeOtherSessions
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
			const response = await fetch('/api/me/password', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					current_password: parsed.data.current_password,
					new_password: parsed.data.new_password,
					revoke_other_sessions: parsed.data.revoke_other_sessions
				})
			});

			if (!response.ok) {
				if (response.status === 401) {
					errors.current_password = 'Current password is incorrect';
					return;
				}

				const data = await response.json().catch(() => null);
				formError =
					(data as Record<string, unknown> | null)?.message?.toString() ??
					'Failed to change password. Please try again.';
				return;
			}

			const data = (await response.json()) as { message: string; sessions_revoked: number };

			const sessionsMsg =
				data.sessions_revoked > 0
					? ` ${data.sessions_revoked} other session${data.sessions_revoked === 1 ? '' : 's'} revoked.`
					: '';

			addToast('success', `Password changed successfully.${sessionsMsg}`);
			clearForm();
		} catch {
			formError = 'An unexpected error occurred. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Change password</h2>
		<p class="text-sm text-muted-foreground">
			Update your password to keep your account secure.
		</p>
	</CardHeader>
	<CardContent>
		{#if formError}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{formError}</AlertDescription>
			</Alert>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="current-password">Current password</Label>
				<Input
					id="current-password"
					type="password"
					autocomplete="current-password"
					bind:value={currentPassword}
					disabled={isSubmitting}
				/>
				{#if errors.current_password}
					<p class="text-sm text-destructive">{errors.current_password}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="new-password">New password</Label>
				<Input
					id="new-password"
					type="password"
					autocomplete="new-password"
					placeholder="Minimum 8 characters"
					bind:value={newPassword}
					disabled={isSubmitting}
				/>
				<PasswordStrength password={newPassword} />
				{#if errors.new_password}
					<p class="text-sm text-destructive">{errors.new_password}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="confirm-password">Confirm new password</Label>
				<Input
					id="confirm-password"
					type="password"
					autocomplete="new-password"
					bind:value={confirmPassword}
					disabled={isSubmitting}
				/>
				{#if errors.confirm_password}
					<p class="text-sm text-destructive">{errors.confirm_password}</p>
				{/if}
			</div>

			<label class="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					bind:checked={revokeOtherSessions}
					disabled={isSubmitting}
					class="h-4 w-4 rounded border-input"
				/>
				Revoke all other sessions
			</label>

			<div class="pt-2">
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}
						Changing password...
					{:else}
						Change password
					{/if}
				</Button>
			</div>
		</form>
	</CardContent>
</Card>
