import { API_BASE_URL } from '@/lib/api';
import { NextRequest } from 'next/server';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const authorization = req.headers.get('Authorization') ?? '';

        const res = await fetch(`${API_BASE_URL}/api/leads/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: authorization,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        return Response.json(data, { status: res.status });

    } catch (error) {
        console.error('[Lead update proxy error]', error);
        return Response.json(
            { error: 'Unable to reach leads service.' },
            { status: 503 }
        );
    }
}
