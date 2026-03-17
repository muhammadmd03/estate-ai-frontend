import { API_BASE_URL } from '@/lib/api';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ client_id: string }> }
) {
    try {
        const { client_id } = await params;
        const res = await fetch(`${API_BASE_URL}/api/widget-config/${encodeURIComponent(client_id)}`, {
            // No auth required — this is a public endpoint
            headers: { 'Content-Type': 'application/json' },
            // Cache for 60 s to avoid hammering the backend on every widget open
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            return new Response(text, { status: res.status });
        }

        const data = await res.json();
        return Response.json(data);

    } catch (error) {
        console.error('[widget-config proxy error]', error);
        return Response.json(
            { error: 'Unable to reach widget-config service.' },
            { status: 503 }
        );
    }
}
