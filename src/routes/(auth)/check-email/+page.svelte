<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import FunnelSteps from '$lib/components/auth/funnel-steps.svelte';
	import { Mail } from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form: actionResult }: { data: PageData; form: ActionData } = $props();

	let resending = $state(false);
	let cooldown = $state(0);
	let timer: ReturnType<typeof setInterval> | null = null;

	function startCooldown() {
		cooldown = 60;
		timer = setInterval(() => {
			cooldown -= 1;
			if (cooldown <= 0) {
				cooldown = 0;
				if (timer) clearInterval(timer);
				timer = null;
			}
		}, 1000);
	}

	onMount(() => {
		return () => {
			if (timer) clearInterval(timer);
		};
	});

	const email = $derived(data.email);
	const canResend = $derived(!resending && cooldown === 0 && !!email);
	const tenantParam = $derived(
		$page.url.searchParams.get('tenant')
			? `?tenant=${$page.url.searchParams.get('tenant')}`
			: ''
	);
</script>

<div class="space-y-6">
	<FunnelSteps current={2} />

	<div class="flex flex-col items-center text-center">
		<div
			class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
			aria-hidden="true"
		>
			<Mail class="h-7 w-7" />
		</div>
		<h1 class="text-2xl font-semibold tracking-tight">Check your inbox</h1>
		<p class="mt-2 max-w-sm text-sm text-muted-foreground">
			We created your workspace. Confirm this address to enter it as administrator.
		</p>
		{#if email}
			<p
				class="mt-4 rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground"
			>
				{email}
			</p>
		{/if}
	</div>

	{#if !data.verificationEmailSent}
		<Alert variant="destructive">
			<AlertDescription>
				We could not send the verification email. Use Resend below, or check SMTP / ops
				configuration.
			</AlertDescription>
		</Alert>
	{/if}

	{#if actionResult?.success}
		<Alert>
			<AlertDescription>Verification email sent. Please check your inbox.</AlertDescription>
		</Alert>
	{/if}

	<form
		method="POST"
		action="?/resend"
		use:enhance={() => {
			resending = true;
			return async ({ update }) => {
				resending = false;
				startCooldown();
				await update();
			};
		}}
	>
		<input type="hidden" name="email" value={email} />
		{#if data.tenant}
			<input type="hidden" name="tenant" value={data.tenant} />
		{/if}
		<Button type="submit" variant="outline" class="w-full rounded-full" disabled={!canResend}>
			{#if resending}
				Sending…
			{:else if cooldown > 0}
				Resend available in {cooldown}s
			{:else}
				Resend email
			{/if}
		</Button>
	</form>

	<div class="rounded-xl border bg-muted/40 px-4 py-3 text-left text-sm text-muted-foreground">
		<p class="font-medium text-foreground">Can’t find your email?</p>
		<p class="mt-1">Check your junk folder, or resend the verification link above.</p>
	</div>

	<p class="text-center text-sm">
		<a href="/login{tenantParam}" class="font-medium text-primary underline-offset-4 hover:underline"
			>Back to login</a
		>
	</p>
</div>
