<script lang="ts">
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form);

	const canSubmit = $derived(
		($form.email ?? '').toString().length > 0 &&
		($form.password ?? '').toString().length > 0
	);

	const tenantParam = $derived(
		$page.url.searchParams.get('tenant')
			? `?tenant=${$page.url.searchParams.get('tenant')}`
			: ''
	);
</script>

<Card>
	<CardHeader>
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
				<Input id="email" name="email" type="email" placeholder="you@example.com" value={String($form.email ?? '')} oninput={(e) => { $form.email = e.currentTarget.value; }} />
				{#if $errors.email}
					<p class="text-sm text-destructive">{$errors.email}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input id="password" name="password" type="password" placeholder="Min. 8 characters" value={String($form.password ?? '')} oninput={(e) => { $form.password = e.currentTarget.value; }} />
				{#if $errors.password}
					<p class="text-sm text-destructive">{$errors.password}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="displayName">Display name (optional)</Label>
				<Input id="displayName" name="displayName" type="text" placeholder="John Doe" value={String($form.displayName ?? '')} />
				{#if $errors.displayName}
					<p class="text-sm text-destructive">{$errors.displayName}</p>
				{/if}
			</div>

			<Button type="submit" class="w-full" disabled={!canSubmit}>Sign up</Button>
		</form>
	</CardContent>
	<CardFooter>
		<p class="text-sm text-muted-foreground">
			Already have an account? <a href="/login{tenantParam}" class="text-primary underline-offset-4 hover:underline">Log in</a>
		</p>
	</CardFooter>
</Card>
