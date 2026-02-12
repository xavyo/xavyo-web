import { z } from 'zod/v3';

export const PEER_GROUP_TYPES = ['department', 'role', 'location', 'custom'] as const;

export const createPeerGroupSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
	group_type: z.enum(PEER_GROUP_TYPES, { required_error: 'Group type is required' }),
	attribute_key: z.string().min(1, 'Attribute key is required').max(100),
	attribute_value: z.string().min(1, 'Attribute value is required').max(255)
});

export type CreatePeerGroupSchema = z.infer<typeof createPeerGroupSchema>;
