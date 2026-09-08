<script lang="ts">
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { evaluatePassword } from '$lib/utils/password';
	import { Eye, EyeOff, Check } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message, submitting } = superForm(data.form);

	let showPassword = $state(false);
	const password = $derived(($form.newPassword ?? '').toString());
	const strength = $derived(evaluatePassword(password));
	const strengthColor = $derived(
		['bg-muted', 'bg-destructive', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][strength.score]
	);

	const tenantParam = $derived(
		$page.url.searchParams.get('tenant')
			? `?tenant=${$page.url.searchParams.get('tenant')}`
			: ''
	);

	// After a successful reset, link to login with reset_tenant to clear any stale tenant cookie
	const loginAfterResetUrl = $derived(
		tenantParam ? `/login${tenantParam}` : '/login?reset_tenant=true'
	);
</script>

<Card>
	<CardHeader>
		<h1 class="text-2xl font-semibold tracking-tight">Reset your password</h1>
		<p class="text-sm text-muted-foreground">Enter your new password below</p>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert class="mb-4">
				<AlertDescription>
					{$message}
					{#if typeof $message === 'string' && $message.includes('successfully')}
						<a href={loginAfterResetUrl} class="text-primary underline-offset-4 hover:underline ml-1">Go to login</a>
					{/if}
				</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<input type="hidden" name="token" value={$page.url.searchParams.get('token') ?? ''} />

			<div class="space-y-2">
				<Label for="newPassword">New password</Label>
				<div class="relative">
					<Input
						id="newPassword"
						name="newPassword"
						type={showPassword ? 'text' : 'password'}
						autocomplete="new-password"
						placeholder="Create a strong password"
						class="pr-10"
						aria-invalid={$errors.newPassword ? 'true' : undefined}
						value={password}
						oninput={(e) => {
							$form.newPassword = e.currentTarget.value;
						}}
					/>
					<button
						type="button"
						class="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
						aria-pressed={showPassword}
						onclick={() => (showPassword = !showPassword)}
					>
						{#if showPassword}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
					</button>
				</div>

				{#if password.length > 0}
					<div class="space-y-2 pt-1">
						<div class="flex items-center gap-2">
							<div class="flex h-1.5 flex-1 gap-1">
								{#each [1, 2, 3, 4] as seg (seg)}
									<div
										class="flex-1 rounded-full transition-colors {seg <= strength.score
											? strengthColor
											: 'bg-muted'}"
									></div>
								{/each}
							</div>
							<span class="w-16 text-right text-xs text-muted-foreground">{strength.label}</span>
						</div>
						<ul class="grid grid-cols-1 gap-1 sm:grid-cols-2">
							{#each strength.checks as check (check.label)}
								<li
									class="flex items-center gap-1.5 text-xs {check.met
										? 'text-green-600'
										: 'text-muted-foreground'}"
								>
									<Check class="h-3 w-3 {check.met ? 'opacity-100' : 'opacity-30'}" />
									{check.label}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if $errors.newPassword}
					<p class="text-sm text-destructive">{$errors.newPassword}</p>
				{/if}
			</div>

			{#if $errors.token}
				<p class="text-sm text-destructive">Invalid or expired reset link. Please request a new one.</p>
			{/if}

			<Button type="submit" class="w-full" disabled={password.length < 8 || $submitting}>
				{$submitting ? 'Resetting…' : 'Reset password'}
			</Button>
		</form>
	</CardContent>
	<CardFooter>
		<p class="text-sm text-muted-foreground">
			<a href="/login{tenantParam}" class="text-primary underline-offset-4 hover:underline">Back to login</a>
		</p>
	</CardFooter>
</Card>
