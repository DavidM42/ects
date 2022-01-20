import type { EndpointOutput } from '@sveltejs/kit';

import { mode } from '$app/env';

export async function get(): Promise<EndpointOutput> {
    if (mode === 'development') {
        return {
            body: 'User-agent: *\nDisallow: /'
        };
    } else if (mode === 'production') {
        return {
            body: 'User-agent: *\nAllow: /'
        };
    }
    return {
        body: ""
    }
}