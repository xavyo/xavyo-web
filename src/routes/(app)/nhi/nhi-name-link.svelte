<script lang="ts">
	import type { NhiType } from '$lib/api/types';

	let { name, id, nhiType }: { name: string; id: string; nhiType: NhiType } = $props();

	const typePathMap: Record<NhiType, string> = {
		tool: 'tools',
		agent: 'agents',
		service_account: 'service-accounts'
	};

	const href = `/nhi/${typePathMap[nhiType]}/${id}`;
</script>

<a {href} class="font-medium text-primary hover:underline">{name}</a>
