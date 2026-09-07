<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import type { PageData, ActionData } from './$types';

	let { data, form: actionData }: { data: PageData; form: ActionData } = $props();

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
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Email Verification</h1>
	</div>

	{#if errorMsg}
		<Alert variant="destructive">
			<AlertDescription>{errorMsg}</AlertDescription>
		</Alert>
	{:else if alreadyVerified}
		<Alert>
			<AlertDescription>Your email has already been verified.</AlertDescription>
		</Alert>
	{:else if verified && message}
		<Alert>
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	{:else if data.hasToken && !verified}
		<p class="text-sm text-muted-foreground">Click the button below to verify your email address.</p>
		<form method="POST" use:enhance>
			<input type="hidden" name="token" value={token} />
			<Button type="submit" class="w-full">Verify Email</Button>
		</form>
	{/if}

	<a href="/login{tenantParam}" class="text-sm font-medium text-primary underline-offset-4 hover:underline">Go to login</a>
</div>
