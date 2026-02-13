<script lang="ts">
	let { name, id }: { name: string; id: string } = $props();

	const href = `/governance/peer-groups/${id}`;
</script>

<a {href} class="font-medium text-primary hover:underline">{name}</a>
