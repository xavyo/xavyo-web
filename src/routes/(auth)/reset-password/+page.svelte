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

	const tenantParam = $derived(
		$page.url.searchParams.get('tenant')
			? `?tenant=${$page.url.searchParams.get('tenant')}`
			: ''
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
						<a href="/login{tenantParam}" class="text-primary underline-offset-4 hover:underline ml-1">Go to login</a>
					{/if}
				</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<input type="hidden" name="token" value={$page.url.searchParams.get('token') ?? ''} />

			<div class="space-y-2">
				<Label for="newPassword">New password</Label>
				<Input id="newPassword" name="newPassword" type="password" placeholder="Min. 8 characters" value={String($form.newPassword ?? '')} />
				{#if $errors.newPassword}
					<p class="text-sm text-destructive">{$errors.newPassword}</p>
				{/if}
			</div>

			{#if $errors.token}
				<p class="text-sm text-destructive">Invalid or expired reset link. Please request a new one.</p>
			{/if}

			<Button type="submit" class="w-full">Reset password</Button>
		</form>
	</CardContent>
	<CardFooter>
		<p class="text-sm text-muted-foreground">
			<a href="/login{tenantParam}" class="text-primary underline-offset-4 hover:underline">Back to login</a>
		</p>
	</CardFooter>
</Card>
