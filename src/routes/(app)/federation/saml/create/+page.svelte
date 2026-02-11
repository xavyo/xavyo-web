<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import SpForm from '$lib/components/federation/sp-form.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const sf = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Service provider created successfully');
			}
		}
	});
</script>

<PageHeader title="Add service provider" description="Configure a new SAML service provider" />

<SpForm superform={sf} mode="create" />
