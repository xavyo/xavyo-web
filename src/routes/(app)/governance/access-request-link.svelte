<script lang="ts">
	let { id }: { id: string } = $props();

	const href = `/governance/access-requests/${id}`;
	const truncated = id.substring(0, 12) + '...';
</script>

<a {href} class="font-medium text-primary hover:underline">{truncated}</a>
