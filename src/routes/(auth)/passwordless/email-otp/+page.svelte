<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { page } from '$app/stores';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form: requestForm, errors: requestErrors, enhance: requestEnhance, message: requestMessage } = superForm(data.requestForm);
	const { form: verifyForm, errors: verifyErrors, enhance: verifyEnhance, message: verifyMessage } = superForm(data.verifyForm);

	let codeSent = $derived(!!$page.form?.codeSent);
	let sentEmail = $derived(($page.form?.email as string) ?? '');
</script>

<Card>
	<CardHeader>
		<h1 class="text-2xl font-semibold tracking-tight">Sign in with email code</h1>
		<p class="text-sm text-muted-foreground">
			{#if codeSent}
				Enter the 6-digit code sent to {sentEmail}
			{:else}
				We'll send a verification code to your email
			{/if}
		</p>
	</CardHeader>
	<CardContent>
		{#if codeSent}
			{#if $verifyMessage}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$verifyMessage}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/verify" use:verifyEnhance class="space-y-4">
				<input type="hidden" name="email" value={sentEmail} />
				<div class="space-y-2">
					<Label for="code">Verification code</Label>
					<Input id="code" name="code" type="text" inputmode="numeric" maxlength={6} placeholder="000000" class="text-center text-lg tracking-widest" value={String($verifyForm.code ?? '')} />
					{#if $verifyErrors.code}
						<p class="text-sm text-destructive">{$verifyErrors.code}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full">Verify</Button>
			</form>

			<div class="mt-4 text-center">
				<form method="POST" action="?/request" class="inline">
					<input type="hidden" name="email" value={sentEmail} />
					<button type="submit" class="text-sm text-primary underline-offset-4 hover:underline">Resend code</button>
				</form>
			</div>
		{:else}
			{#if $requestMessage}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$requestMessage}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/request" use:requestEnhance class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" name="email" type="email" placeholder="you@example.com" value={String($requestForm.email ?? '')} />
					{#if $requestErrors.email}
						<p class="text-sm text-destructive">{$requestErrors.email}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full">Send code</Button>
			</form>
		{/if}
	</CardContent>
	<CardFooter>
		<a href="/login" class="text-sm text-muted-foreground underline-offset-4 hover:underline">Back to login</a>
	</CardFooter>
</Card>
