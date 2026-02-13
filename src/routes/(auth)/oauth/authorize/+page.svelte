<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import type { PageData, ActionData } from './$types';

	let { data, form: actionData }: { data: PageData; form: ActionData } = $props();

	let submitting: 'approve' | 'deny' | null = $state(null);

	const scopeLabels: Record<string, string> = {
		openid: 'Verify your identity',
		profile: 'Access your profile information',
		email: 'Access your email address',
		offline_access: 'Stay signed in (refresh tokens)'
	};

	function getScopeLabel(scope: string): string {
		return scopeLabels[scope] ?? scope;
	}

	function handleSubmit(action: 'approve' | 'deny') {
		return () => {
			submitting = action;
			return async ({ update }: { update: () => Promise<void> }) => {
				submitting = null;
				await update();
			};
		};
	}
</script>

{#if data.error}
	<Card class="max-w-md">
		<CardHeader>
			<h2 class="text-xl font-semibold text-destructive">Authorization Error</h2>
		</CardHeader>
		<CardContent class="space-y-4">
			<Alert variant="destructive">
				<AlertDescription>
					{data.errorDescription ?? 'An error occurred with the authorization request.'}
				</AlertDescription>
			</Alert>
			<p class="text-sm text-muted-foreground">
				Please check the authorization request parameters and try again, or contact the
				application administrator.
			</p>
		</CardContent>
		<CardFooter>
			<a
				href="/login"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Back to login
			</a>
		</CardFooter>
	</Card>
{:else if data.clientInfo}
	<Card class="max-w-md">
		<CardHeader>
			<h2 class="text-xl font-semibold tracking-tight">Authorize Application</h2>
			<p class="text-sm text-muted-foreground">
				<span class="font-medium text-foreground">{data.clientInfo.client_name}</span>
				wants to access your account
			</p>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if actionData?.error}
				<Alert variant="destructive">
					<AlertDescription>{actionData.error}</AlertDescription>
				</Alert>
			{/if}

			{#if data.clientInfo.scopes.length > 0}
				<div class="rounded-lg border bg-muted/50 p-4">
					<p class="mb-2 text-sm font-medium text-foreground">
						This application will be able to:
					</p>
					<ul class="space-y-2">
						{#each data.clientInfo.scopes as scope}
							<li class="flex items-center gap-2 text-sm text-muted-foreground">
								<svg
									class="h-4 w-4 shrink-0 text-primary"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M9 12l2 2 4-4" />
									<circle cx="12" cy="12" r="10" />
								</svg>
								{getScopeLabel(scope)}
							</li>
						{/each}
					</ul>
				</div>
			{:else}
				<div class="rounded-lg border bg-muted/50 p-4">
					<p class="text-sm text-muted-foreground">
						This application is requesting basic access to your account.
					</p>
				</div>
			{/if}

			<p class="text-xs text-muted-foreground">
				Signed in as <span class="font-medium">{data.userEmail}</span>
			</p>
		</CardContent>
		<CardFooter class="flex gap-3">
			<form method="POST" action="?/deny" class="flex-1" use:enhance={handleSubmit('deny')}>
				<input type="hidden" name="client_id" value={data.oauthParams.client_id} />
				<input type="hidden" name="redirect_uri" value={data.oauthParams.redirect_uri} />
				<input type="hidden" name="scope" value={data.oauthParams.scope} />
				<input type="hidden" name="state" value={data.oauthParams.state} />
				<Button
					type="submit"
					variant="outline"
					class="w-full"
					disabled={submitting !== null}
				>
					{submitting === 'deny' ? 'Denying...' : 'Deny'}
				</Button>
			</form>
			<form
				method="POST"
				action="?/approve"
				class="flex-1"
				use:enhance={handleSubmit('approve')}
			>
				<input type="hidden" name="client_id" value={data.oauthParams.client_id} />
				<input type="hidden" name="redirect_uri" value={data.oauthParams.redirect_uri} />
				<input type="hidden" name="scope" value={data.oauthParams.scope} />
				<input type="hidden" name="state" value={data.oauthParams.state} />
				<input type="hidden" name="code_challenge" value={data.oauthParams.code_challenge} />
				<input
					type="hidden"
					name="code_challenge_method"
					value={data.oauthParams.code_challenge_method}
				/>
				<input type="hidden" name="nonce" value={data.oauthParams.nonce} />
				<Button type="submit" class="w-full" disabled={submitting !== null}>
					{submitting === 'approve' ? 'Allowing...' : 'Allow'}
				</Button>
			</form>
		</CardFooter>
	</Card>
{/if}
