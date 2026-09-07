<script lang="ts">
</script>

<div class="space-y-6">
	<div class="text-center">
		<div class="flex justify-center text-4xl">&#9993;</div>
		<h1 class="text-2xl font-semibold tracking-tight">Check your email</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			We've sent a magic link to your email address. Click the link to sign in.
		</p>
	</div>

	<p class="text-center text-sm text-muted-foreground">
		The link will expire in a few minutes. If you don't see the email, check your spam folder.
	</p>

	<div class="flex flex-col gap-2 text-center text-sm text-muted-foreground">
		<a href="/passwordless/magic-link" class="font-medium text-primary underline-offset-4 hover:underline">Send another link</a>
		<a href="/login" class="underline-offset-4 hover:underline">Back to login</a>
	</div>
</div>
