<script lang="ts">
	interface Props {
		version: string;
	}

	let { version }: Props = $props();
</script>

<footer class="border-t px-4 py-2 text-xs text-muted-foreground">
	Xavyo v{version}
</footer>
