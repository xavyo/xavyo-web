<script lang="ts">
	let { id }: { id: string } = $props();

	const href = $derived(`/governance/access-requests/${id}`);
	const truncated = $derived(id.substring(0, 12) + '...');
</script>

<a {href} class="font-medium text-primary hover:underline">{truncated}</a>
