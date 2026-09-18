<script lang="ts">
	let { name, href }: { name: string; href: string } = $props();
</script>

<a {href} class="font-medium text-primary hover:underline">{name}</a>
