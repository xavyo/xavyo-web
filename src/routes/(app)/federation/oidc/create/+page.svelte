<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import IdpForm from '$lib/components/federation/idp-form.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const sf = superForm(data.form, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Identity provider created successfully');
			}
		}
	});
</script>

<PageHeader title="Add identity provider" description="Configure a new OIDC identity provider for federated authentication" />

<IdpForm superform={sf} mode="create" />
