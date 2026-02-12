<script lang="ts">
	let { name, id }: { name: string; id: string } = $props();

	const href = `/settings/oauth-clients/${id}`;
</script>

<a {href} class="font-medium text-primary hover:underline">{name}</a>
