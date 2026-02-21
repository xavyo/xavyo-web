<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let useRecovery = $state(false);

	const {
		form: totpForm,
		errors: totpErrors,
		enhance: totpEnhance,
		message: totpMessage
	} = superForm(data.totpForm);

	const {
		form: recoveryForm,
		errors: recoveryErrors,
		enhance: recoveryEnhance,
		message: recoveryMessage
	} = superForm(data.recoveryForm);
</script>

<Card>
	<CardHeader>
		<h1 class="text-2xl font-semibold tracking-tight">Two-factor authentication</h1>
		<p class="text-sm text-muted-foreground">
			{#if useRecovery}
				Enter a recovery code to access your account
			{:else}
				Enter the 6-digit code from your authenticator app
			{/if}
		</p>
	</CardHeader>
	<CardContent>
		{#if !useRecovery}
			{#if $totpMessage}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$totpMessage}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/totp" use:totpEnhance class="space-y-4">
				<input type="hidden" name="partial_token" value={$totpForm.partial_token} />
				<div class="space-y-2">
					<Label for="code">Authentication code</Label>
					<Input
						id="code"
						name="code"
						type="text"
						inputmode="numeric"
						autocomplete="one-time-code"
						maxlength={6}
						placeholder="000000"
						value={String($totpForm.code ?? '')}
					/>
					{#if $totpErrors.code}
						<p class="text-sm text-destructive">{$totpErrors.code}</p>
					{/if}
				</div>
				<Button type="submit" class="w-full">Verify</Button>
			</form>
		{:else}
			{#if $recoveryMessage}
				<Alert variant="destructive" class="mb-4">
					<AlertDescription>{$recoveryMessage}</AlertDescription>
				</Alert>
			{/if}

			<form method="POST" action="?/recovery" use:recoveryEnhance class="space-y-4">
				<input type="hidden" name="partial_token" value={$recoveryForm.partial_token} />
				<div class="space-y-2">
					<Label for="recovery-code">Recovery code</Label>
					<Input
						id="recovery-code"
						name="code"
						type="text"
						autocomplete="off"
						placeholder="xxxx-xxxx-xxxx"
						value={String($recoveryForm.code ?? '')}
					/>
					{#if $recoveryErrors.code}
						<p class="text-sm text-destructive">{$recoveryErrors.code}</p>
					{/if}
				</div>
				<Button type="submit" class="w-full">Verify</Button>
			</form>
		{/if}
	</CardContent>
	<CardFooter>
		<div class="flex w-full flex-col gap-2 text-center text-sm text-muted-foreground">
			{#if useRecovery}
				<button type="button" class="text-primary underline-offset-4 hover:underline" onclick={() => (useRecovery = false)}>
					Use authenticator app instead
				</button>
			{:else}
				<button type="button" class="text-primary underline-offset-4 hover:underline" onclick={() => (useRecovery = true)}>
					Use a recovery code
				</button>
			{/if}
			<a href="/login" class="underline-offset-4 hover:underline">Back to login</a>
		</div>
	</CardFooter>
</Card>
