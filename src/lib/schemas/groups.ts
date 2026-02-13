import { z } from 'zod/v3';

export const createGroupSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional()
});

export const updateGroupSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255).optional(),
	description: z.string().max(1000).optional()
});

export const addMembersSchema = z.object({
	member_ids: z.string().min(1, 'At least one user ID is required')
});

export type CreateGroupSchema = typeof createGroupSchema;
export type UpdateGroupSchema = typeof updateGroupSchema;
export type AddMembersSchema = typeof addMembersSchema;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type AddMembersInput = z.infer<typeof addMembersSchema>;
