import { Suspense } from 'react';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/utils/metadata';
import { PageSkeleton } from '@/components/ui';

export const metadata: Metadata = pageMetadata.standings;

export default function StandingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            {children}
        </Suspense>
    );
}
