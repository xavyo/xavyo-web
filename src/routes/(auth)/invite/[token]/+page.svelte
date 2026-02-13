<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form);

	const validation = $derived(data.validation);
</script>

{#if validation.valid}
	<Card>
		<CardHeader>
			<h1 class="text-2xl font-semibold tracking-tight">Accept your invitation</h1>
			<p class="text-sm text-muted-foreground">
				{#if validation.tenant_name}
					You've been invited to join <span class="font-medium text-foreground">{validation.tenant_name}</span>
				{:else}
					You've been invited to join the platform
				{/if}
			</p>
			{#if validation.email}
				<p class="text-sm text-muted-foreground">
					Signing up as <span class="font-medium text-foreground">{validation.email}</span>
				</p>
			{/if}
		</CardHeader>
		<CardContent>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input
						id="password"
						name="password"
						type="password"
						placeholder="Min. 8 characters"
						value={String($form.password ?? '')}
					/>
					{#if $errors.password}
						<p class="text-sm text-destructive">{$errors.password}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="confirm_password">Confirm password</Label>
					<Input
						id="confirm_password"
						name="confirm_password"
						type="password"
						placeholder="Repeat your password"
						value={String($form.confirm_password ?? '')}
					/>
					{#if $errors.confirm_password}
						<p class="text-sm text-destructive">{$errors.confirm_password}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full">Create account</Button>
			</form>
		</CardContent>
		<CardFooter>
			<p class="text-sm text-muted-foreground">
				Already have an account? <a href="/login" class="text-primary underline-offset-4 hover:underline">Log in</a>
			</p>
		</CardFooter>
	</Card>
{:else if validation.reason === 'expired'}
	<Card>
		<CardHeader>
			<h1 class="text-2xl font-semibold tracking-tight">Invitation expired</h1>
			<p class="text-sm text-muted-foreground">This invitation has expired</p>
		</CardHeader>
		<CardContent>
			<p class="text-sm text-muted-foreground">
				{validation.message ?? 'Please contact your administrator to request a new invitation.'}
			</p>
		</CardContent>
		<CardFooter>
			<p class="text-sm text-muted-foreground">
				<a href="/login" class="text-primary underline-offset-4 hover:underline">Go to login</a>
			</p>
		</CardFooter>
	</Card>
{:else if validation.reason === 'already_accepted'}
	<Card>
		<CardHeader>
			<h1 class="text-2xl font-semibold tracking-tight">Invitation already used</h1>
			<p class="text-sm text-muted-foreground">This invitation has already been accepted</p>
		</CardHeader>
		<CardContent>
			<p class="text-sm text-muted-foreground">
				If you already created your account, you can log in below.
			</p>
		</CardContent>
		<CardFooter>
			<p class="text-sm text-muted-foreground">
				<a href="/login" class="text-primary underline-offset-4 hover:underline">Go to login</a>
			</p>
		</CardFooter>
	</Card>
{:else}
	<Card>
		<CardHeader>
			<h1 class="text-2xl font-semibold tracking-tight">Invalid invitation</h1>
			<p class="text-sm text-muted-foreground">This invitation link is not valid</p>
		</CardHeader>
		<CardContent>
			<p class="text-sm text-muted-foreground">
				The invitation link may be malformed or does not exist. Please check the link and try again, or contact your administrator.
			</p>
		</CardContent>
		<CardFooter>
			<p class="text-sm text-muted-foreground">
				<a href="/login" class="text-primary underline-offset-4 hover:underline">Go to login</a>
			</p>
		</CardFooter>
	</Card>
{/if}
