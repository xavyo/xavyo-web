<script lang="ts">
	interface Props {
		version: string;
	}

	let { version }: Props = $props();
</script>

<footer class="border-t border-border/70 bg-card/40 px-4 py-2 text-xs text-muted-foreground sm:px-6">
	<span class="font-medium text-foreground/70">xavyo</span>
	<span class="mx-1.5 text-border">·</span>
	v{version}
</footer>
