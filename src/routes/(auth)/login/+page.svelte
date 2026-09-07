<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import type { PageData } from './$types';
	import { safeInternalPath } from '$lib/utils/redirect';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		onResult: ({ result, cancel }) => {
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
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">
			{b?.login_page_title ?? 'Welcome back'}
		</h1>
		<p class="mt-1 text-sm text-muted-foreground">Sign in with your work email</p>
	</div>

	{#if $message}
		<Alert variant="destructive">
			<AlertDescription>{$message}</AlertDescription>
		</Alert>
	{/if}

	<form
		method="POST"
		action="/login{data.redirectTo ? `?redirectTo=${encodeURIComponent(data.redirectTo)}` : ''}"
		use:enhance
		class="space-y-4"
	>
		<div class="space-y-2">
			<Label for="email">Work email</Label>
			<Input
				id="email"
				name="email"
				type="email"
				placeholder="you@company.com"
				autocomplete="username"
				value={String($form.email ?? '')}
			/>
			{#if $errors.email}
				<p class="text-sm text-destructive">{$errors.email}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<div class="flex items-center justify-between gap-2">
				<Label for="password">Password</Label>
				<a
					href="/forgot-password{tenantParam}"
					class="text-xs font-medium text-primary underline-offset-4 hover:underline"
				>
					Forgot password?
				</a>
			</div>
			<Input
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				value={String($form.password ?? '')}
			/>
			{#if $errors.password}
				<p class="text-sm text-destructive">{$errors.password}</p>
			{/if}
		</div>

		<Button type="submit" class="w-full">Sign in</Button>
	</form>

	{#if data.availableMethods?.magic_link || data.availableMethods?.email_otp}
		<div>
			<Separator class="mb-4" />
			<p class="mb-3 text-center text-sm text-muted-foreground">Or continue without a password</p>
			<div class="flex gap-2">
				{#if data.availableMethods.magic_link}
					<a
						href="/passwordless/magic-link{tenantParam}"
						class="inline-flex flex-1 items-center justify-center rounded-md border border-input bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
					>
						Magic link
					</a>
				{/if}
				{#if data.availableMethods.email_otp}
					<a
						href="/passwordless/email-otp{tenantParam}"
						class="inline-flex flex-1 items-center justify-center rounded-md border border-input bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
					>
						Email code
					</a>
				{/if}
			</div>
		</div>
	{/if}

	<p class="text-sm text-muted-foreground">
		Don't have an account?
		<a href="/signup{tenantParam}" class="font-medium text-primary underline-offset-4 hover:underline"
			>Sign up</a
		>
	</p>
</div>
