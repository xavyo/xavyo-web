<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult: ({ result, cancel }) => {
			// When login succeeds and we have a redirectTo target (e.g. SAML callback),
			// cancel superForm's default redirect handling and navigate manually.
			if (result.type === 'redirect' && data.redirectTo && data.redirectTo.startsWith('/')) {
				cancel();
				goto(data.redirectTo);
			}
		}
	});

	const b = $derived(data.branding);
	const tenantParam = $derived(
		$page.url.searchParams.get('tenant')
			? `?tenant=${$page.url.searchParams.get('tenant')}`
			: ''
	);
</script>

<Card>
	<CardHeader>
		<h1 class="text-2xl font-semibold tracking-tight">{b?.login_page_title ?? 'Welcome back'}</h1>
		<p class="text-sm text-muted-foreground">Enter your credentials to log in</p>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" action="/login{data.redirectTo ? `?redirectTo=${encodeURIComponent(data.redirectTo)}` : ''}" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input id="email" name="email" type="email" placeholder="you@example.com" value={String($form.email ?? '')} />
				{#if $errors.email}
					<p class="text-sm text-destructive">{$errors.email}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input id="password" name="password" type="password" value={String($form.password ?? '')} />
				{#if $errors.password}
					<p class="text-sm text-destructive">{$errors.password}</p>
				{/if}
			</div>

			<Button type="submit" class="w-full">Log in</Button>
		</form>
	</CardContent>
	{#if data.availableMethods?.magic_link || data.availableMethods?.email_otp}
		<div class="px-6 pb-2">
			<Separator class="mb-4" />
			<p class="mb-2 text-center text-sm text-muted-foreground">Or sign in without a password</p>
			<div class="flex gap-2">
				{#if data.availableMethods.magic_link}
					<a
						href="/passwordless/magic-link{tenantParam}"
						class="flex-1 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
					>
						Magic link
					</a>
				{/if}
				{#if data.availableMethods.email_otp}
					<a
						href="/passwordless/email-otp{tenantParam}"
						class="flex-1 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
					>
						Email code
					</a>
				{/if}
			</div>
		</div>
	{/if}
	<CardFooter>
		<div class="flex w-full flex-col gap-2 text-sm text-muted-foreground">
			<a href="/forgot-password{tenantParam}" class="text-primary underline-offset-4 hover:underline">Forgot your password?</a>
			<p>
				Don't have an account? <a href="/signup{tenantParam}" class="text-primary underline-offset-4 hover:underline">Sign up</a>
			</p>
		</div>
	</CardFooter>
</Card>
