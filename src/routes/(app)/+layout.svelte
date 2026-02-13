<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { LayoutDashboard, Users, Drama, Bot, ArrowRightLeft, Settings, ClipboardList, Network, Shield, ShieldCheck, FileQuestion, FileBarChart, Workflow, KeyRound, Layers, Mail, Plug, Activity, RefreshCw, ScanSearch, UsersRound, CheckCircle, Award, Webhook, LockKeyhole, Upload, Key, GitMerge, Scale, Link, Milestone, Stamp, ShoppingBag, RotateCw, Pickaxe, ClipboardCheck, Radio, ScrollText, Clock, FileInput, Hourglass, UserCheck, AlertTriangle, FlaskConical, Blocks, HandMetal, Radar } from 'lucide-svelte';
	import Sidebar from '$lib/components/layout/sidebar.svelte';
	import type { NavItem } from '$lib/components/layout/sidebar.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import ToastContainer from '$lib/components/layout/toast-container.svelte';
	import { initThemeListener } from '$lib/stores/theme.svelte';
	import AssumedIdentityIndicator from '$lib/components/poa/assumed-identity-indicator.svelte';
	import ContextIndicator from '$lib/components/persona/context-indicator.svelte';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	let sidebarOpen = $state(false);

	const navItems: NavItem[] = $derived.by(() => {
		const items: NavItem[] = [
			{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
			{ label: 'Users', href: '/users', icon: Users },
			{ label: 'Personas', href: '/personas', icon: Drama },
			{ label: 'Persona Context', href: '/personas/context', icon: UserCheck },
			{ label: 'NHI', href: '/nhi', icon: Bot },
			{ label: 'A2A Tasks', href: '/nhi/a2a', icon: ArrowRightLeft },
			{ label: 'NHI Requests', href: '/nhi/requests', icon: FileInput },
			{ label: 'Request Catalog', href: '/governance/catalog', icon: ShoppingBag },
			{ label: 'My Requests', href: '/my-requests', icon: FileQuestion },
			{ label: 'My Approvals', href: '/my-approvals', icon: CheckCircle },
			{ label: 'My Certifications', href: '/my-certifications', icon: Award }
		];
		if (data.isAdmin) {
			items.push({ label: 'Groups', href: '/groups', icon: UsersRound });
			items.push({ label: 'Expiring Personas', href: '/personas/expiring', icon: Hourglass });
			items.push({ label: 'Connectors', href: '/connectors', icon: Plug });
			items.push({ label: 'Provisioning Ops', href: '/connectors/operations', icon: Activity });
			items.push({ label: 'Reconciliation', href: '/connectors/reconciliation', icon: RefreshCw });
			items.push({ label: 'Invitations', href: '/invitations', icon: Mail });
			items.push({ label: 'Federation', href: '/federation', icon: Network });
			items.push({ label: 'Audit', href: '/audit', icon: ClipboardList });
			items.push({ label: 'Governance', href: '/governance', icon: Shield });
			items.push({ label: 'Roles', href: '/governance/roles', icon: KeyRound });
			items.push({ label: 'Meta-Roles', href: '/governance/meta-roles', icon: Layers });
			items.push({ label: 'NHI Governance', href: '/nhi/governance', icon: ShieldCheck });
			items.push({ label: 'NHI Staleness', href: '/nhi/staleness', icon: AlertTriangle });
			items.push({ label: 'Approval Config', href: '/governance/approval-config', icon: Workflow });
			items.push({ label: 'Reports', href: '/governance/reports', icon: FileBarChart });
			items.push({ label: 'Outlier Detection', href: '/governance/outliers', icon: ScanSearch });
			items.push({ label: 'Peer Groups', href: '/governance/peer-groups', icon: UsersRound });
			items.push({ label: 'Authorization', href: '/governance/authorization', icon: LockKeyhole });
			items.push({ label: 'Deduplication', href: '/governance/dedup', icon: GitMerge });
			items.push({ label: 'Correlation', href: '/governance/correlation', icon: Link });
			items.push({ label: 'Licenses', href: '/governance/licenses', icon: Scale });
			items.push({ label: 'Simulations', href: '/governance/simulations', icon: FlaskConical });
			items.push({ label: 'Birthright Policies', href: '/governance/birthright-policies', icon: Milestone });
			items.push({ label: 'Power of Attorney', href: '/governance/power-of-attorney', icon: Stamp });
			items.push({ label: 'Lifecycle', href: '/governance/lifecycle', icon: RotateCw });
			items.push({ label: 'Object Templates', href: '/governance/object-templates', icon: Blocks });
			items.push({ label: 'Role Mining', href: '/governance/role-mining', icon: Pickaxe });
			items.push({ label: 'Micro Certs', href: '/governance/micro-certifications', icon: ClipboardCheck });
			items.push({ label: 'SIEM', href: '/governance/siem', icon: Radio });
			items.push({ label: 'Provisioning Scripts', href: '/governance/provisioning-scripts', icon: ScrollText });
			items.push({ label: 'Operations', href: '/governance/operations', icon: Clock });
			items.push({ label: 'Manual Tasks', href: '/governance/manual-tasks', icon: HandMetal });
			items.push({ label: 'Detection Rules', href: '/governance/detection-rules', icon: Radar });
			items.push({ label: 'Webhooks', href: '/settings/webhooks', icon: Webhook });
			items.push({ label: 'Imports', href: '/settings/imports', icon: Upload });
			items.push({ label: 'SCIM', href: '/settings/scim', icon: Key });
		}
		items.push({
			label: 'Settings',
			href: '/settings',
			icon: Settings,
			badge: data.unacknowledgedAlertCount ?? 0
		});
		return items;
	});

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}

	onMount(() => {
		const cleanup = initThemeListener();
		return cleanup;
	});
</script>

<div class="flex h-screen overflow-hidden bg-background">
	<!-- Desktop sidebar -->
	<div class="hidden md:block">
		<Sidebar items={navItems} currentPath={$page.url.pathname} />
	</div>

	<!-- Mobile sidebar overlay -->
	{#if sidebarOpen}
		<div class="fixed inset-0 z-40 md:hidden">
			<button
				class="absolute inset-0 bg-black/50 transition-opacity duration-200"
				onclick={closeSidebar}
				aria-label="Close sidebar"
			></button>
			<div class="relative z-50 h-full w-64 animate-in slide-in-from-left duration-200">
				<Sidebar items={navItems} currentPath={$page.url.pathname} onNavigate={closeSidebar} />
			</div>
		</div>
	{/if}

	<!-- Main content -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<Header email={data.user?.email ?? ''} onToggleSidebar={toggleSidebar} />
		{#if data.currentAssumption?.is_assuming && data.currentAssumption.donor_id}
			<div class="px-4 pt-2 sm:px-6">
				<AssumedIdentityIndicator
					donorName={data.currentAssumption.donor_name ?? ''}
					donorId={data.currentAssumption.donor_id}
					poaId={data.currentAssumption.poa_id ?? ''}
				/>
			</div>
		{/if}
		{#if data.personaContext?.is_persona_active && data.personaContext.active_persona}
			<div class="px-4 pt-2 sm:px-6">
				<ContextIndicator personaName={data.personaContext.active_persona.name ?? 'Unknown'} isActive={true} />
			</div>
		{/if}
		<main class="flex-1 overflow-y-auto p-4 sm:p-6">
			{@render children()}
		</main>
	</div>

	<ToastContainer />
</div>
