'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import WidgetLayout from '@/components/widget/WidgetLayout';

function WidgetPage() {
    const searchParams = useSearchParams();
    const clientId = searchParams.get('client_id') ?? 'client_001';
    const apiKey   = searchParams.get('api_key')   ?? '';

    return (
        <WidgetLayout
            clientId={clientId}
            apiKey={apiKey}
        />
    );
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <WidgetPage />
        </Suspense>
    );
}
