import { API_BASE_URL } from '@/lib/api';

export async function POST(req: Request) {
    const body = await req.json();

    try {
        const res = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        return Response.json(data, { status: res.status });

    } catch (error) {
        console.error('[Login proxy error]', error);
        return Response.json(
            { detail: 'Unable to reach authentication service.' },
            { status: 503 }
        );
    }
}
