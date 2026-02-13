<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { category }: { category: string } = $props();

	const labels: Record<string, string> = {
		attribute_mapping: 'Attribute Mapping',
		value_generation: 'Value Generation',
		conditional_logic: 'Conditional Logic',
		data_formatting: 'Data Formatting',
		custom: 'Custom'
	};
</script>

<Badge variant="outline">
	{labels[category] ?? category}
</Badge>
