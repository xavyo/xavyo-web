import { z } from 'zod/v3';

export const createMiningJobSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	min_users: z.coerce.number().int().min(1).max(100).default(3),
	min_entitlements: z.coerce.number().int().min(1).max(50).default(2),
	confidence_threshold: z.coerce.number().min(0).max(1).default(0.6),
	include_excessive_privilege: z.boolean().default(true),
	include_consolidation: z.boolean().default(true),
	consolidation_threshold: z.coerce.number().min(0).max(100).default(70),
	deviation_threshold: z.coerce.number().min(0).max(100).default(50),
	peer_group_attribute: z.string().default('')
});

export const promoteCandidateSchema = z.object({
	role_name: z.string().min(1).max(200).optional(),
	description: z.string().max(1000).optional()
});

export const dismissCandidateSchema = z.object({
	reason: z.string().max(1000).optional()
});

export const reviewPrivilegeSchema = z.object({
	action: z.enum(['accept', 'remediate']),
	notes: z.string().max(1000).optional()
});

export const dismissConsolidationSchema = z.object({
	reason: z.string().max(1000).optional()
});

export const createSimulationSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	scenario_type: z.enum([
		'add_entitlement',
		'remove_entitlement',
		'add_role',
		'remove_role',
		'modify_role'
	]),
	target_role_id: z.string().uuid().optional(),
	changes: z.object({
		change_type: z.string().optional(),
		role_id: z.string().uuid().optional(),
		entitlement_id: z.string().uuid().optional(),
		entitlement_ids: z.array(z.string().uuid()).optional(),
		user_ids: z.array(z.string().uuid()).optional(),
		role_name: z.string().optional(),
		role_description: z.string().optional()
	})
});

export type CreateMiningJobInput = z.infer<typeof createMiningJobSchema>;
export type PromoteCandidateInput = z.infer<typeof promoteCandidateSchema>;
export type DismissCandidateInput = z.infer<typeof dismissCandidateSchema>;
export type ReviewPrivilegeInput = z.infer<typeof reviewPrivilegeSchema>;
export type DismissConsolidationInput = z.infer<typeof dismissConsolidationSchema>;
export type CreateSimulationInput = z.infer<typeof createSimulationSchema>;
