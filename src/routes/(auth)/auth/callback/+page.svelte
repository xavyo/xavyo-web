<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { safeInternalPath } from '$lib/utils/redirect';

	let errorMessage = $state('');

	onMount(async () => {
		const raw = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
		const frag = new URLSearchParams(raw);

		const err = frag.get('error');
		if (err) {
			errorMessage = err;
			return;
		}

		const refreshToken = frag.get('refresh_token');
		const accessToken = frag.get('access_token');
		if (!refreshToken) {
			errorMessage = 'Sign-in could not be completed: no session token was returned.';
			return;
		}

		// Remove the tokens from the URL/history before doing anything else.
		history.replaceState(null, '', window.location.pathname + window.location.search);

		try {
			const res = await fetch('/api/auth/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refresh_token: refreshToken, access_token: accessToken })
			});
			if (!res.ok) {
				errorMessage = 'Sign-in could not be completed. Please try again.';
				return;
			}
			const dest =
				safeInternalPath(
					new URL(window.location.href).searchParams.get('redirectTo'),
					window.location.origin
				) ?? '/dashboard';
			await goto(dest);
		} catch {
			errorMessage = 'Sign-in could not be completed. Please try again.';
		}
	});
</script>

<div class="flex flex-col items-center justify-center gap-4 p-8 text-center">
	{#if errorMessage}
		<Alert variant="destructive">
			<AlertDescription>{errorMessage}</AlertDescription>
		</Alert>
		<a href="/login" class="text-sm text-primary underline-offset-4 hover:underline">
			Back to sign in
		</a>
	{:else}
		<div
			class="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary"
			aria-hidden="true"
		></div>
		<p class="text-sm text-muted-foreground">Completing sign-in…</p>
	{/if}
</div>
