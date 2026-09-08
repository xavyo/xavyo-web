<script lang="ts">
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import FunnelSteps from '$lib/components/auth/funnel-steps.svelte';
	import { evaluatePassword } from '$lib/utils/password';
	import { Eye, EyeOff, Check } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message, submitting } = superForm(data.form);

	let showPassword = $state(false);

	const password = $derived(($form.password ?? '').toString());
	const strength = $derived(evaluatePassword(password));

	const strengthColor = $derived(
		['bg-muted', 'bg-destructive', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][strength.score]
	);

	const canSubmit = $derived(
		($form.email ?? '').toString().length > 0 && password.length >= 8
	);

	const tenantParam = $derived(
		$page.url.searchParams.get('tenant')
			? `?tenant=${$page.url.searchParams.get('tenant')}`
			: ''
	);
</script>

<Card>
	<CardHeader>
		<FunnelSteps current={1} />
		<h1 class="text-2xl font-semibold tracking-tight">Create your account</h1>
		<p class="text-sm text-muted-foreground">Enter your details to get started</p>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					name="email"
					type="email"
					autocomplete="email"
					placeholder="you@example.com"
					aria-invalid={$errors.email ? 'true' : undefined}
					value={String($form.email ?? '')}
					oninput={(e) => {
						$form.email = e.currentTarget.value;
					}}
				/>
				{#if $errors.email}
					<p class="text-sm text-destructive">{$errors.email}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="password">Password</Label>
				<div class="relative">
					<Input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						autocomplete="new-password"
						placeholder="Create a strong password"
						class="pr-10"
						aria-invalid={$errors.password ? 'true' : undefined}
						value={password}
						oninput={(e) => {
							$form.password = e.currentTarget.value;
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

				{#if $errors.password}
					<p class="text-sm text-destructive">{$errors.password}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="displayName">Display name <span class="text-muted-foreground">(optional)</span></Label>
				<Input
					id="displayName"
					name="displayName"
					type="text"
					autocomplete="name"
					placeholder="Jane Doe"
					value={String($form.displayName ?? '')}
					oninput={(e) => {
						$form.displayName = e.currentTarget.value;
					}}
				/>
				{#if $errors.displayName}
					<p class="text-sm text-destructive">{$errors.displayName}</p>
				{/if}
			</div>

			<Button type="submit" class="w-full" disabled={!canSubmit || $submitting}>
				{$submitting ? 'Creating account…' : 'Create account'}
			</Button>
		</form>
	</CardContent>
	<CardFooter>
		<p class="text-sm text-muted-foreground">
			Already have an account? <a
				href="/login{tenantParam}"
				class="text-primary underline-offset-4 hover:underline">Log in</a
			>
		</p>
	</CardFooter>
</Card>
