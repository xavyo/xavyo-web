<script lang="ts">
	let { name, id }: { name: string; id: string } = $props();

	const href = $derived(`/governance/applications/${id}`);
</script>

<a {href} class="font-medium text-primary hover:underline">{name}</a>
