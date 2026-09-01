declare global {
	namespace App {
		interface Locals {
			user?: {
				id: string;
				email: string;
				roles: string[];
				display_name: string | null;
			};
			accessToken?: string;
			tenantId?: string;
		}
	}
}

export {};
