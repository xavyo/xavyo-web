declare global {
	namespace App {
		interface Locals {
			user?: {
				id: string;
				email: string;
				roles: string[];
			};
			accessToken?: string;
			tenantId?: string;
		}
	}
}

export {};
