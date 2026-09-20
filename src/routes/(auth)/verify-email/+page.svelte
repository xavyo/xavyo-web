<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import FunnelSteps from '$lib/components/auth/funnel-steps.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form: actionData }: { data: PageData; form: ActionData } = $props();

	let verifying = $state(false);

	const tenantParam = $derived(
		$page.url.searchParams.get('tenant')
			? `?tenant=${$page.url.searchParams.get('tenant')}`
			: ''
	);

	const token = $derived($page.url.searchParams.get('token') ?? '');
	const verified = $derived(actionData?.verified ?? false);
	const errorMsg = $derived(actionData?.error ?? data.error);
	const alreadyVerified = $derived(actionData?.alreadyVerified ?? false);
	const message = $derived(actionData?.message);
	const showConfirm = $derived(data.hasToken && !verified && !errorMsg && !alreadyVerified);
</script>

<div class="space-y-6">
	<FunnelSteps current={2} />

	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Verify your email</h1>
		{#if showConfirm}
			<p class="mt-1.5 text-sm text-muted-foreground">
				Confirm this address to enter your workspace as administrator.
			</p>
		{/if}
	</div>

	{#if errorMsg}
		<Alert variant="destructive">
			<AlertDescription>{errorMsg}</AlertDescription>
		</Alert>
		<p class="text-sm text-muted-foreground">
			Request a new link from
			<a
				href={`${resolve('/check-email')}${tenantParam}`}
				class="font-medium text-primary underline-offset-4 hover:underline">check your inbox</a
			>
			or log in and resend.
		</p>
	{:else if alreadyVerified}
		<Alert>
			<AlertDescription>Your email has already been verified.</AlertDescription>
		</Alert>
	{:else if verified && message}
		<Alert>
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	{:else if showConfirm}
		<p class="text-sm text-muted-foreground">
			Click below to finish verification. This step is intentional so email scanners do not
			consume the link.
		</p>
		<form
			method="POST"
			use:enhance={() => {
				verifying = true;
				return async ({ update }) => {
					verifying = false;
					await update();
				};
			}}
		>
			<input type="hidden" name="token" value={token} />
			<Button type="submit" class="w-full" disabled={verifying}>
				{verifying ? 'Verifying…' : 'Verify email'}
			</Button>
		</form>
	{/if}

	<a
		href={`${resolve('/login')}${tenantParam}`}
		class="text-sm font-medium text-primary underline-offset-4 hover:underline"
		>{alreadyVerified || verified ? 'Continue to login' : 'Go to login'}</a
	>
</div>
