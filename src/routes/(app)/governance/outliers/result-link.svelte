<script lang="ts">
	let { userId, id }: { userId: string; id: string } = $props();

	const href = $derived(`/governance/outliers/results/${id}`);
</script>

<a {href} class="font-medium text-primary hover:underline">{userId.substring(0, 8)}...</a>
