/**
 * Empty State Component
 *
 * Friendly empty state displays with icons, messages, and actions.
 * Used when there's no data to show.
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
    Trophy,
    Users,
    Calendar,
    MapPin,
    BarChart3,
    Inbox,
    type LucideIcon,
} from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
    children?: ReactNode;
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
    className,
    children,
}: EmptyStateProps) {
    return (
        <div className={cn('py-12 px-4 text-center', className)}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <Icon className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            {description && (
                <p className="text-surface-500 dark:text-surface-400 text-sm max-w-xs mx-auto">
                    {description}
                </p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="btn-primary mt-4"
                >
                    {action.label}
                </button>
            )}
            {children}
        </div>
    );
}

// Pre-built empty states for common scenarios
export function NoTripsEmpty({ onCreateTrip }: { onCreateTrip: () => void }) {
    return (
        <EmptyState
            icon={Trophy}
            title="No trips yet"
            description="Create your first golf trip to start tracking your Ryder Cup matches."
            action={{
                label: 'Create Trip',
                onClick: onCreateTrip,
            }}
        />
    );
}

export function NoMatchesEmpty({ onSetupMatchups }: { onSetupMatchups: () => void }) {
    return (
        <EmptyState
            icon={Users}
            title="No matches"
            description="Set up your session matchups to start scoring."
            action={{
                label: 'Set Up Matchups',
                onClick: onSetupMatchups,
            }}
        />
    );
}

export function NoSessionsEmpty({
    isCaptain,
    onCreateSession,
}: {
    isCaptain: boolean;
    onCreateSession: () => void;
}) {
    return (
        <EmptyState
            icon={Calendar}
            title="No sessions created"
            description={
                isCaptain
                    ? "Create your first session to start building matchups."
                    : "Sessions will appear here once created by the captain."
            }
            action={
                isCaptain
                    ? {
                        label: 'Create Session',
                        onClick: onCreateSession,
                    }
                    : undefined
            }
        />
    );
}

export function NoPlayersEmpty({ onAddPlayers }: { onAddPlayers: () => void }) {
    return (
        <EmptyState
            icon={Users}
            title="No players"
            description="Add players to your trip to start building teams."
            action={{
                label: 'Add Players',
                onClick: onAddPlayers,
            }}
        />
    );
}

export function NoStandingsEmpty() {
    return (
        <EmptyState
            icon={BarChart3}
            title="No standings yet"
            description="Standings will appear once matches are completed."
        />
    );
}

export function NoCoursesEmpty({ onAddCourse }: { onAddCourse: () => void }) {
    return (
        <EmptyState
            icon={MapPin}
            title="No courses"
            description="Add a golf course to use for scoring."
            action={{
                label: 'Add Course',
                onClick: onAddCourse,
            }}
        />
    );
}

export default EmptyState;
