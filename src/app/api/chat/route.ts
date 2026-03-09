import { API_BASE_URL } from '@/lib/api';

export async function POST(req: Request) {
    const body = await req.json();

    try {
        const res = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new Error(`FastAPI returned status ${res.status}`);
        }

        const data = await res.json();
        return Response.json(data);

    } catch (error) {
        console.error('[FastAPI proxy error]', error);
        return Response.json(
            { error: true, reply: "⚠️ I'm having trouble connecting to the AI service right now. Please make sure the backend is running and try again." },
            { status: 503 }
        );
    }
}
