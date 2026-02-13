import { z } from 'zod/v3';

export const createPolicySimulationSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	simulation_type: z.enum(['sod_rule', 'birthright_policy']),
	policy_id: z.string().uuid().optional().nullable(),
	policy_config: z.string().min(1, 'Policy configuration is required')
});

export const executePolicySimulationSchema = z.object({
	user_ids: z.array(z.string().uuid()).optional()
});

export const createBatchSimulationSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	batch_type: z.enum(['role_add', 'role_remove', 'entitlement_add', 'entitlement_remove']),
	selection_mode: z.enum(['user_list', 'filter']),
	user_ids: z.string().optional(),
	filter_department: z.string().optional(),
	filter_status: z.string().optional(),
	filter_role_ids: z.string().optional(),
	filter_entitlement_ids: z.string().optional(),
	filter_title: z.string().optional(),
	filter_metadata: z.string().optional(),
	change_role_id: z.string().uuid().optional(),
	change_entitlement_id: z.string().uuid().optional(),
	change_justification: z.string().optional()
});

export const applyBatchSchema = z.object({
	justification: z.string().min(1, 'Justification is required').max(1000),
	acknowledge_scope: z.literal(true, {
		errorMap: () => ({ message: 'You must acknowledge the scope of changes' })
	})
});

export const updateNotesSchema = z.object({
	notes: z.string().max(5000)
});

export const createComparisonSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	comparison_type: z.enum(['simulation_vs_simulation', 'simulation_vs_current']),
	simulation_a_id: z.string().uuid('Simulation A is required'),
	simulation_a_type: z.enum(['policy', 'batch']),
	simulation_b_id: z.string().uuid().optional(),
	simulation_b_type: z.enum(['policy', 'batch']).optional()
});

export type CreatePolicySimulationInput = z.infer<typeof createPolicySimulationSchema>;
export type CreateBatchSimulationInput = z.infer<typeof createBatchSimulationSchema>;
export type ApplyBatchInput = z.infer<typeof applyBatchSchema>;
export type UpdateNotesInput = z.infer<typeof updateNotesSchema>;
export type CreateComparisonInput = z.infer<typeof createComparisonSchema>;
