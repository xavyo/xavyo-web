<script lang="ts">
	import { Label } from '$lib/components/ui/label';

	interface Props {
		startDate?: string;
		endDate?: string;
		onchange?: (range: { start_date: string; end_date: string }) => void;
	}

	let { startDate = '', endDate = '', onchange }: Props = $props();

	let start = $state(startDate);
	let end = $state(endDate);
	let validationError = $state('');

	function handleChange() {
		if (start && end && start > end) {
			validationError = 'End date must not precede start date';
			return;
		}
		validationError = '';
		onchange?.({
			start_date: start ? `${start}T00:00:00Z` : '',
			end_date: end ? `${end}T23:59:59Z` : ''
		});
	}
</script>

<div class="flex flex-wrap items-end gap-3">
	<div class="space-y-1">
		<Label for="start-date" class="text-xs">From</Label>
		<input
			id="start-date"
			type="date"
			class="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
			bind:value={start}
			onchange={handleChange}
		/>
	</div>
	<div class="space-y-1">
		<Label for="end-date" class="text-xs">To</Label>
		<input
			id="end-date"
			type="date"
			class="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
			bind:value={end}
			onchange={handleChange}
		/>
	</div>
	{#if validationError}
		<p class="text-sm text-destructive">{validationError}</p>
	{/if}
</div>
