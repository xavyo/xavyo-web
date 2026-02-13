<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import {
		LayoutDashboard, Users, Drama, Bot, ArrowRightLeft, Settings, ClipboardList,
		Network, Shield, ShieldCheck, FileBarChart, Workflow, KeyRound, Layers, Mail,
		Plug, Activity, RefreshCw, ScanSearch, UsersRound, CheckCircle, Award, Webhook,
		LockKeyhole, Upload, Key, GitMerge, Scale, Link, Milestone, Stamp, ShoppingBag,
		RotateCw, Pickaxe, ClipboardCheck, Radio, ScrollText, Clock, FileInput, Hourglass,
		UserCheck, AlertTriangle, FlaskConical, Blocks, HandMetal, Radar, FileQuestion
	} from 'lucide-svelte';
	import Sidebar from '$lib/components/layout/sidebar.svelte';
	import type { NavSection } from '$lib/components/layout/sidebar.svelte';
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

	const navSections: NavSection[] = $derived.by(() => {
		const sections: NavSection[] = [
			{
				label: 'Dashboard',
				collapsible: false,
				items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }]
			},
			{
				label: 'Self-Service',
				collapsible: true,
				items: [
					{ label: 'Request Catalog', href: '/governance/catalog', icon: ShoppingBag },
					{ label: 'My Requests', href: '/my-requests', icon: FileQuestion },
					{ label: 'My Approvals', href: '/my-approvals', icon: CheckCircle },
					{ label: 'My Certifications', href: '/my-certifications', icon: Award }
				]
			}
		];

		if (data.isAdmin) {
			sections.push(
				{
					label: 'Identity',
					collapsible: true,
					items: [
						{ label: 'Users', href: '/users', icon: Users },
						{ label: 'Groups', href: '/groups', icon: UsersRound },
						{ label: 'Personas', href: '/personas', icon: Drama },
						{ label: 'Persona Context', href: '/personas/context', icon: UserCheck },
						{ label: 'Expiring Personas', href: '/personas/expiring', icon: Hourglass },
						{ label: 'Invitations', href: '/invitations', icon: Mail }
					]
				},
				{
					label: 'Non-Human Identity',
					collapsible: true,
					items: [
						{ label: 'NHI', href: '/nhi', icon: Bot },
						{ label: 'A2A Tasks', href: '/nhi/a2a', icon: ArrowRightLeft },
						{ label: 'NHI Requests', href: '/nhi/requests', icon: FileInput },
						{ label: 'NHI Governance', href: '/nhi/governance', icon: ShieldCheck },
						{ label: 'NHI Staleness', href: '/nhi/staleness', icon: AlertTriangle }
					]
				},
				{
					label: 'Governance',
					collapsible: true,
					items: [
						{ label: 'Overview', href: '/governance', icon: Shield },
						{ label: 'Roles', href: '/governance/roles', icon: KeyRound },
						{ label: 'Meta-Roles', href: '/governance/meta-roles', icon: Layers },
						{ label: 'Approval Config', href: '/governance/approval-config', icon: Workflow },
						{ label: 'Birthright Policies', href: '/governance/birthright-policies', icon: Milestone },
						{ label: 'Power of Attorney', href: '/governance/power-of-attorney', icon: Stamp },
						{ label: 'Authorization', href: '/governance/authorization', icon: LockKeyhole },
						{ label: 'Lifecycle', href: '/governance/lifecycle', icon: RotateCw },
						{ label: 'Object Templates', href: '/governance/object-templates', icon: Blocks },
						{ label: 'Manual Tasks', href: '/governance/manual-tasks', icon: HandMetal }
					]
				},
				{
					label: 'Compliance & Analytics',
					collapsible: true,
					items: [
						{ label: 'Audit', href: '/audit', icon: ClipboardList },
						{ label: 'Reports', href: '/governance/reports', icon: FileBarChart },
						{ label: 'Certifications', href: '/governance/certifications', icon: ClipboardCheck },
						{ label: 'Micro Certs', href: '/governance/micro-certifications', icon: Award },
						{ label: 'Outlier Detection', href: '/governance/outliers', icon: ScanSearch },
						{ label: 'Peer Groups', href: '/governance/peer-groups', icon: UsersRound },
						{ label: 'Role Mining', href: '/governance/role-mining', icon: Pickaxe },
						{ label: 'Simulations', href: '/governance/simulations', icon: FlaskConical },
						{ label: 'Deduplication', href: '/governance/dedup', icon: GitMerge },
						{ label: 'Correlation', href: '/governance/correlation', icon: Link },
						{ label: 'Licenses', href: '/governance/licenses', icon: Scale },
						{ label: 'Detection Rules', href: '/governance/detection-rules', icon: Radar }
					]
				},
				{
					label: 'Infrastructure',
					collapsible: true,
					items: [
						{ label: 'Connectors', href: '/connectors', icon: Plug },
						{ label: 'Provisioning Ops', href: '/connectors/operations', icon: Activity },
						{ label: 'Reconciliation', href: '/connectors/reconciliation', icon: RefreshCw },
						{ label: 'Federation', href: '/federation', icon: Network },
						{ label: 'SIEM', href: '/governance/siem', icon: Radio },
						{ label: 'Provisioning Scripts', href: '/governance/provisioning-scripts', icon: ScrollText },
						{ label: 'Operations', href: '/governance/operations', icon: Clock },
						{ label: 'Webhooks', href: '/settings/webhooks', icon: Webhook },
						{ label: 'Imports', href: '/settings/imports', icon: Upload },
						{ label: 'SCIM', href: '/settings/scim', icon: Key }
					]
				}
			);
		}

		sections.push({
			label: 'Settings',
			collapsible: false,
			items: [
				{
					label: 'Settings',
					href: '/settings',
					icon: Settings,
					badge: data.unacknowledgedAlertCount ?? 0
				}
			]
		});

		return sections;
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
		<Sidebar sections={navSections} currentPath={$page.url.pathname} />
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
				<Sidebar sections={navSections} currentPath={$page.url.pathname} onNavigate={closeSidebar} />
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
