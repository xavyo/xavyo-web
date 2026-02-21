<script lang="ts">
	import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
</script>

<Card>
	<CardHeader>
		<div class="flex justify-center text-4xl">&#9993;</div>
		<h1 class="text-center text-2xl font-semibold tracking-tight">Check your email</h1>
		<p class="text-center text-sm text-muted-foreground">
			We've sent a magic link to your email address. Click the link to sign in.
		</p>
	</CardHeader>
	<CardContent>
		<p class="text-center text-sm text-muted-foreground">
			The link will expire in a few minutes. If you don't see the email, check your spam folder.
		</p>
	</CardContent>
	<CardFooter>
		<div class="flex w-full flex-col gap-2 text-center text-sm text-muted-foreground">
			<a href="/passwordless/magic-link" class="text-primary underline-offset-4 hover:underline">Send another link</a>
			<a href="/login" class="underline-offset-4 hover:underline">Back to login</a>
		</div>
	</CardFooter>
</Card>
