<script lang="ts">
	import AlertList from '$lib/components/audit/alert-list.svelte';

	interface Props {
		onUnacknowledgedCountChange?: (count: number) => void;
	}

	let { onUnacknowledgedCountChange }: Props = $props();
</script>

<AlertList {onUnacknowledgedCountChange} />
