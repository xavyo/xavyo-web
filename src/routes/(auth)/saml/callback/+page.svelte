<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let formEl: HTMLFormElement | undefined = $state();

	onMount(() => {
		// Auto-submit the SAML response form to the SP's ACS URL
		if (formEl && data.acs_url) {
			formEl.submit();
		}
	});
</script>

{#if data.error}
	<Card>
		<CardHeader>
			<h1 class="text-2xl font-semibold tracking-tight">SAML SSO Error</h1>
		</CardHeader>
		<CardContent>
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{data.error}</AlertDescription>
			</Alert>
			<p class="text-sm text-muted-foreground">
				<a href="/login" class="text-primary underline-offset-4 hover:underline">Return to login</a>
			</p>
		</CardContent>
	</Card>
{:else if data.acs_url}
	<Card>
		<CardHeader>
			<h1 class="text-2xl font-semibold tracking-tight">Completing sign-in...</h1>
			<p class="text-sm text-muted-foreground">You are being redirected to the application.</p>
		</CardHeader>
		<CardContent>
			<form bind:this={formEl} method="POST" action={data.acs_url}>
				<input type="hidden" name="SAMLResponse" value={data.saml_response} />
				{#if data.relay_state}
					<input type="hidden" name="RelayState" value={data.relay_state} />
				{/if}
				<noscript>
					<p class="mb-2 text-sm">JavaScript is disabled. Click the button below to continue.</p>
					<button type="submit" class="rounded-md bg-primary px-4 py-2 text-primary-foreground">
						Continue
					</button>
				</noscript>
			</form>
		</CardContent>
	</Card>
{/if}
