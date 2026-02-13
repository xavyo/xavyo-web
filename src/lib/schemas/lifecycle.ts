import { z } from 'zod/v3';

export const createLifecycleConfigSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
	object_type: z.enum(['user', 'entitlement', 'role']),
	description: z.string().max(1000).optional(),
	auto_assign_initial_state: z.boolean().optional().default(true)
});

export const updateLifecycleConfigSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	description: z.string().max(1000).optional().nullable(),
	is_active: z.boolean().optional(),
	auto_assign_initial_state: z.boolean().optional()
});

export const createStateSchema = z.object({
	name: z.string().min(1, 'State name is required'),
	description: z.string().optional(),
	is_initial: z.boolean().default(false),
	is_terminal: z.boolean().default(false),
	entitlement_action: z.enum(['none', 'pause', 'revoke']),
	position: z.number().int().min(0).default(0)
});

export const updateStateSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional().nullable(),
	is_initial: z.boolean().optional(),
	is_terminal: z.boolean().optional(),
	entitlement_action: z.enum(['none', 'pause', 'revoke']).optional(),
	position: z.number().int().min(0).optional()
});

export const createTransitionSchema = z.object({
	name: z.string().min(1, 'Transition name is required'),
	from_state_id: z.string().uuid('Invalid source state'),
	to_state_id: z.string().uuid('Invalid target state'),
	requires_approval: z.boolean().optional().default(false),
	grace_period_hours: z.number().int().positive().optional()
});

export const updateConditionsSchema = z.object({
	conditions: z.array(
		z.object({
			condition_type: z.string().min(1, 'Condition type is required'),
			attribute_path: z.string().min(1, 'Attribute path is required'),
			expression: z.string().min(1, 'Expression is required')
		})
	)
});

export const evaluateConditionsSchema = z.object({
	context: z.record(z.unknown())
});

export const updateActionsSchema = z.object({
	entry_actions: z
		.array(
			z.object({
				action_type: z.string().min(1, 'Action type is required'),
				parameters: z.record(z.unknown())
			})
		)
		.optional(),
	exit_actions: z
		.array(
			z.object({
				action_type: z.string().min(1, 'Action type is required'),
				parameters: z.record(z.unknown())
			})
		)
		.optional()
});
