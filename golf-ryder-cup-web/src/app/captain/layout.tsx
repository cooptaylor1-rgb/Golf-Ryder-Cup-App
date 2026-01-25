import { Suspense } from 'react';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/utils/metadata';
import { PageSkeleton } from '@/components/ui';

export const metadata: Metadata = pageMetadata.captain;

export default function CaptainLayout({
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
