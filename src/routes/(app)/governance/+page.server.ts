import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const tab = url.searchParams.get('tab') ?? undefined;
	return { tab };
};
