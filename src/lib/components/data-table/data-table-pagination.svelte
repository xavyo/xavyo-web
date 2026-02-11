<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let {
		pageIndex,
		pageCount,
		canPreviousPage,
		canNextPage,
		onPreviousPage,
		onNextPage
	}: {
		pageIndex: number;
		pageCount: number;
		canPreviousPage: boolean;
		canNextPage: boolean;
		onPreviousPage: () => void;
		onNextPage: () => void;
	} = $props();
</script>

<div class="flex items-center justify-between px-2 py-4">
	<p class="text-sm text-muted-foreground">
		Page {pageIndex + 1} of {pageCount}
	</p>
	<div class="flex items-center gap-2">
		<Button
			variant="outline"
			size="sm"
			onclick={onPreviousPage}
			disabled={!canPreviousPage}
		>
			Previous
		</Button>
		<Button
			variant="outline"
			size="sm"
			onclick={onNextPage}
			disabled={!canNextPage}
		>
			Next
		</Button>
	</div>
</div>
