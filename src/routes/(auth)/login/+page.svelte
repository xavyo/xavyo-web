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
	import { Github } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { safeInternalPath } from '$lib/utils/redirect';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult: ({ result, cancel }) => {
			// When login succeeds and we have a redirectTo target (e.g. SAML callback),
			// cancel superForm's default redirect handling and navigate manually.
			const origin = $page.url.origin;
			const safe = safeInternalPath(data.redirectTo, origin);
			if (result.type === 'redirect' && safe) {
				cancel();
				goto(safe);
			}
		}
	});

	const b = $derived(data.branding);
	const tenantParam = $derived(
		$page.url.searchParams.get('tenant')
			? `?tenant=${$page.url.searchParams.get('tenant')}`
			: ''
	);

	function socialHref(provider: string): string {
		const params = new URLSearchParams();
		const tenant = $page.url.searchParams.get('tenant');
		if (tenant) params.set('tenant', tenant);
		if (data.redirectTo) params.set('redirectTo', data.redirectTo);
		const qs = params.toString();
		return `/api/auth/social/${provider}/authorize${qs ? `?${qs}` : ''}`;
	}

	let ssoBusy = $state(false);
	let ssoError = $state('');

	async function handleSso() {
		ssoError = '';
		const email = String($form.email ?? '').trim();
		if (!email) {
			ssoError = 'Enter your work email to continue with single sign-on.';
			return;
		}
		ssoBusy = true;
		try {
			const res = await fetch('/api/auth/federation/discover', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});
			const result = (await res.json()) as { authentication_method?: string };
			if (result.authentication_method === 'federated') {
				const params = new URLSearchParams();
				params.set('login_hint', email);
				const tenant = $page.url.searchParams.get('tenant');
				if (tenant) params.set('tenant', tenant);
				window.location.href = `/api/auth/federation/authorize?${params.toString()}`;
			} else {
				ssoError =
					'No single sign-on is configured for that email domain. Please sign in with your password.';
			}
		} catch {
			ssoError = 'Could not check single sign-on. Please try again.';
		} finally {
			ssoBusy = false;
		}
	}
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
				<Input id="email" name="email" type="email" placeholder="you@example.com" bind:value={$form.email} />
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
	{#if data.socialProviders?.length}
		<div class="px-6 pb-2">
			<Separator class="mb-4" />
			<p class="mb-3 text-center text-sm text-muted-foreground">Or continue with</p>
			<div class="flex flex-col gap-2">
				{#each data.socialProviders as sp (sp.provider)}
					<a
						href={socialHref(sp.provider)}
						data-sveltekit-reload
						class="inline-flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
					>
						{#if sp.provider === 'github'}
							<Github class="h-4 w-4" aria-hidden="true" />
						{:else}
							<span
								class="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] font-semibold"
								aria-hidden="true">{sp.name.charAt(0)}</span
							>
						{/if}
						Continue with {sp.name}
					</a>
				{/each}
			</div>
		</div>
	{/if}
	<div class="px-6 pb-2">
		<Separator class="mb-4" />
		<p class="mb-2 text-center text-sm text-muted-foreground">Single sign-on</p>
		{#if ssoError}
			<p class="mb-2 text-sm text-destructive">{ssoError}</p>
		{/if}
		<Button type="button" variant="outline" class="w-full" onclick={handleSso} disabled={ssoBusy}>
			{ssoBusy ? 'Checking…' : 'Sign in with SSO'}
		</Button>
	</div>
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
