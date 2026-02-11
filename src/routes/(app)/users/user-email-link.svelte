<script lang="ts">
	let { email, href }: { email: string; href: string } = $props();
</script>

<a {href} class="font-medium text-primary hover:underline">{email}</a>
