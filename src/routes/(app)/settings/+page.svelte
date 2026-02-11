<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { User, Shield, Monitor, Smartphone } from 'lucide-svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import ProfileTab from './profile-tab.svelte';
	import SecurityTab from './security-tab.svelte';
	import SessionsTab from './sessions-tab.svelte';
	import DevicesTab from './devices-tab.svelte';

	let { data } = $props();

	// Get tab from URL query param, default to 'profile'
	let activeTab = $derived($page.url.searchParams.get('tab') ?? 'profile');

	function handleTabChange(value: string) {
		goto(`/settings?tab=${value}`, { replaceState: true });
	}
</script>

<PageHeader title="Settings" description="Manage your account settings and preferences" />

<Tabs value={activeTab} onValueChange={handleTabChange}>
	<TabsList>
		<TabsTrigger value="profile"><User class="mr-2 h-4 w-4" />Profile</TabsTrigger>
		<TabsTrigger value="security"><Shield class="mr-2 h-4 w-4" />Security</TabsTrigger>
		<TabsTrigger value="sessions"><Monitor class="mr-2 h-4 w-4" />Sessions</TabsTrigger>
		<TabsTrigger value="devices"><Smartphone class="mr-2 h-4 w-4" />Devices</TabsTrigger>
	</TabsList>
	<TabsContent value="profile">
		<ProfileTab profile={data.profile} form={data.form} />
	</TabsContent>
	<TabsContent value="security">
		<SecurityTab securityOverview={data.securityOverview} mfaStatus={data.mfaStatus} />
	</TabsContent>
	<TabsContent value="sessions">
		<SessionsTab />
	</TabsContent>
	<TabsContent value="devices">
		<DevicesTab />
	</TabsContent>
</Tabs>
