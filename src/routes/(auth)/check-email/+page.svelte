<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
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

<Card>
	<CardHeader>
		<h1 class="text-2xl font-semibold tracking-tight">Check your email</h1>
		<p class="text-sm text-muted-foreground">Verify your email address to continue</p>
	</CardHeader>
	<CardContent class="space-y-4">
		{#if actionResult?.success}
			<Alert>
				<AlertDescription>Verification email sent. Please check your inbox.</AlertDescription>
			</Alert>
		{/if}

		<p class="text-sm text-foreground">
			We've sent a verification link to {#if email}<strong>{email}</strong>{:else}your email address{/if}. Please check your inbox and click the link to verify your account.
		</p>
		<p class="text-sm text-muted-foreground">
			Didn't receive it? Check your spam folder or resend the verification email.
		</p>

		<form method="POST" action="?/resend" use:enhance={() => {
			resending = true;
			return async ({ update }) => {
				resending = false;
				startCooldown();
				await update();
			};
		}}>
			<input type="hidden" name="email" value={email} />
			<Button type="submit" variant="outline" class="w-full" disabled={!canResend}>
				{#if resending}
					Sending...
				{:else if cooldown > 0}
					Resend available in {cooldown}s
				{:else}
					Resend verification email
				{/if}
			</Button>
		</form>
	</CardContent>
	<CardFooter>
		<a href="/login{tenantParam}" class="text-sm text-primary underline-offset-4 hover:underline">Back to login</a>
	</CardFooter>
</Card>
