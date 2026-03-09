import { API_BASE_URL } from '@/lib/api';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const qs = searchParams.toString();
        const url = `${API_BASE_URL}/api/leads${qs ? `?${qs}` : ''}`;

        const authorization = req.headers.get('Authorization') ?? '';

        const res = await fetch(url, {
            headers: {
                Authorization: authorization,
            },
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            return new Response(text, { status: res.status });
        }

        const data = await res.json();
        return Response.json(data);

    } catch (error) {
        console.error('[Leads proxy error]', error);
        return Response.json(
            { error: 'Unable to reach leads service.' },
            { status: 503 }
        );
    }
}
