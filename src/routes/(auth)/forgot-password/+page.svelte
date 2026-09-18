<script lang="ts">
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form);

	const tenantParam = $derived(
		$page.url.searchParams.get('tenant')
			? `?tenant=${$page.url.searchParams.get('tenant')}`
			: ''
	);
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
		<p class="mt-1 text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
	</div>

	{#if $message}
		<Alert>
			<AlertDescription>{$message}</AlertDescription>
		</Alert>
	{/if}

	<form method="POST" use:enhance class="space-y-4">
		<div class="space-y-2">
			<Label for="email">Email</Label>
			<Input id="email" name="email" type="email" placeholder="you@example.com" value={String($form.email ?? '')} />
			{#if $errors.email}
				<p class="text-sm text-destructive">{$errors.email}</p>
			{/if}
		</div>

		<Button type="submit" class="w-full">Send reset link</Button>
	</form>

	<p class="text-sm text-muted-foreground">
		Remember your password? <a href="/login{tenantParam}" class="font-medium text-primary underline-offset-4 hover:underline">Log in</a>
	</p>
</div>
