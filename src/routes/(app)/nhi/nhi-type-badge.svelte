<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { NhiType } from '$lib/api/types';

	let { type }: { type: NhiType } = $props();

	const labelMap: Record<NhiType, string> = {
		tool: 'Tool',
		agent: 'Agent',
		service_account: 'Service Account'
	};
</script>

<Badge variant="outline">{labelMap[type]}</Badge>
