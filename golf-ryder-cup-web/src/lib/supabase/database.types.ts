/**
 * Supabase Database Types
 *
 * Auto-generated types for Supabase tables.
 * Regenerate with: npm run supabase:types
 *
 * To regenerate these types:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Link project: supabase link --project-ref YOUR_PROJECT_REF
 * 3. Generate types: supabase gen types typescript --local > src/lib/supabase/database.types.ts
 *
 * Or use the npm script after setting up .env:
 * npm run supabase:types
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            trips: {
                Row: {
                    id: string;
                    name: string;
                    start_date: string;
                    end_date: string;
                    share_code: string | null;
                    created_by_device_id: string | null;
                    team_a_name: string;
                    team_b_name: string;
                    team_a_color: string | null;
                    team_b_color: string | null;
                    default_match_format: string | null;
                    default_scoring_type: string | null;
                    created_at: string;
                    updated_at: string;
                    last_synced_at: string | null;
                };
                Insert: {
                    id?: string;
                    name: string;
                    start_date: string;
                    end_date: string;
                    share_code?: string | null;
                    created_by_device_id?: string | null;
                    team_a_name?: string;
                    team_b_name?: string;
                    team_a_color?: string | null;
                    team_b_color?: string | null;
                    default_match_format?: string | null;
                    default_scoring_type?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    last_synced_at?: string | null;
                };
                Update: {
                    id?: string;
                    name?: string;
                    start_date?: string;
                    end_date?: string;
                    share_code?: string | null;
                    created_by_device_id?: string | null;
                    team_a_name?: string;
                    team_b_name?: string;
                    team_a_color?: string | null;
                    team_b_color?: string | null;
                    default_match_format?: string | null;
                    default_scoring_type?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    last_synced_at?: string | null;
                };
            };
            players: {
                Row: {
                    id: string;
                    trip_id: string;
                    first_name: string;
                    last_name: string;
                    nickname: string | null;
                    avatar_url: string | null;
                    email: string | null;
                    phone: string | null;
                    handicap_index: number | null;
                    ghin_number: string | null;
                    is_captain: boolean;
                    team: string | null;
                    device_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    trip_id: string;
                    first_name: string;
                    last_name: string;
                    nickname?: string | null;
                    avatar_url?: string | null;
                    email?: string | null;
                    phone?: string | null;
                    handicap_index?: number | null;
                    ghin_number?: string | null;
                    is_captain?: boolean;
                    team?: string | null;
                    device_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    trip_id?: string;
                    first_name?: string;
                    last_name?: string;
                    nickname?: string | null;
                    avatar_url?: string | null;
                    email?: string | null;
                    phone?: string | null;
                    handicap_index?: number | null;
                    ghin_number?: string | null;
                    is_captain?: boolean;
                    team?: string | null;
                    device_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            teams: {
                Row: {
                    id: string;
                    trip_id: string;
                    name: string;
                    color: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    trip_id: string;
                    name: string;
                    color?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    trip_id?: string;
                    name?: string;
                    color?: string | null;
                    created_at?: string;
                };
            };
            sessions: {
                Row: {
                    id: string;
                    trip_id: string;
                    name: string;
                    date: string;
                    format: string;
                    points_available: number;
                    status: string;
                    is_locked: boolean;
                    locked_at: string | null;
                    locked_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    trip_id: string;
                    name: string;
                    date: string;
                    format?: string;
                    points_available?: number;
                    status?: string;
                    is_locked?: boolean;
                    locked_at?: string | null;
                    locked_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    trip_id?: string;
                    name?: string;
                    date?: string;
                    format?: string;
                    points_available?: number;
                    status?: string;
                    is_locked?: boolean;
                    locked_at?: string | null;
                    locked_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            matches: {
                Row: {
                    id: string;
                    session_id: string;
                    trip_id: string;
                    match_number: number;
                    format: string;
                    status: string;
                    team_a_player_ids: string[];
                    team_b_player_ids: string[];
                    course_id: string | null;
                    tee_set_id: string | null;
                    tee_time: string | null;
                    starting_hole: number;
                    current_hole: number | null;
                    team_a_score: number;
                    team_b_score: number;
                    winner: string | null;
                    points_awarded: number | null;
                    created_at: string;
                    updated_at: string;
                    last_synced_at: string | null;
                };
                Insert: {
                    id?: string;
                    session_id: string;
                    trip_id: string;
                    match_number?: number;
                    format?: string;
                    status?: string;
                    team_a_player_ids?: string[];
                    team_b_player_ids?: string[];
                    course_id?: string | null;
                    tee_set_id?: string | null;
                    tee_time?: string | null;
                    starting_hole?: number;
                    current_hole?: number | null;
                    team_a_score?: number;
                    team_b_score?: number;
                    winner?: string | null;
                    points_awarded?: number | null;
                    created_at?: string;
                    updated_at?: string;
                    last_synced_at?: string | null;
                };
                Update: {
                    id?: string;
                    session_id?: string;
                    trip_id?: string;
                    match_number?: number;
                    format?: string;
                    status?: string;
                    team_a_player_ids?: string[];
                    team_b_player_ids?: string[];
                    course_id?: string | null;
                    tee_set_id?: string | null;
                    tee_time?: string | null;
                    starting_hole?: number;
                    current_hole?: number | null;
                    team_a_score?: number;
                    team_b_score?: number;
                    winner?: string | null;
                    points_awarded?: number | null;
                    created_at?: string;
                    updated_at?: string;
                    last_synced_at?: string | null;
                };
            };
            hole_results: {
                Row: {
                    id: string;
                    match_id: string;
                    hole_number: number;
                    team_a_gross: number | null;
                    team_b_gross: number | null;
                    team_a_net: number | null;
                    team_b_net: number | null;
                    winner: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    match_id: string;
                    hole_number: number;
                    team_a_gross?: number | null;
                    team_b_gross?: number | null;
                    team_a_net?: number | null;
                    team_b_net?: number | null;
                    winner?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    match_id?: string;
                    hole_number?: number;
                    team_a_gross?: number | null;
                    team_b_gross?: number | null;
                    team_a_net?: number | null;
                    team_b_net?: number | null;
                    winner?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            scoring_events: {
                Row: {
                    id: string;
                    match_id: string;
                    event_type: string;
                    hole_number: number | null;
                    data: Json;
                    created_at: string;
                    synced_at: string | null;
                    processed: boolean;
                };
                Insert: {
                    id?: string;
                    match_id: string;
                    event_type: string;
                    hole_number?: number | null;
                    data: Json;
                    created_at?: string;
                    synced_at?: string | null;
                    processed?: boolean;
                };
                Update: {
                    id?: string;
                    match_id?: string;
                    event_type?: string;
                    hole_number?: number | null;
                    data?: Json;
                    created_at?: string;
                    synced_at?: string | null;
                    processed?: boolean;
                };
            };
            course_library: {
                Row: {
                    id: string;
                    name: string;
                    location: string | null;
                    source: string;
                    usage_count: number;
                    is_verified: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    location?: string | null;
                    source?: string;
                    usage_count?: number;
                    is_verified?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    location?: string | null;
                    source?: string;
                    usage_count?: number;
                    is_verified?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            course_library_tee_sets: {
                Row: {
                    id: string;
                    course_library_id: string;
                    name: string;
                    color: string | null;
                    rating: number | null;
                    slope: number | null;
                    par: number | null;
                    hole_pars: number[] | null;
                    hole_handicaps: number[] | null;
                    hole_yardages: number[] | null;
                    total_yardage: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    course_library_id: string;
                    name: string;
                    color?: string | null;
                    rating?: number | null;
                    slope?: number | null;
                    par?: number | null;
                    hole_pars?: number[] | null;
                    hole_handicaps?: number[] | null;
                    hole_yardages?: number[] | null;
                    total_yardage?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    course_library_id?: string;
                    name?: string;
                    color?: string | null;
                    rating?: number | null;
                    slope?: number | null;
                    par?: number | null;
                    hole_pars?: number[] | null;
                    hole_handicaps?: number[] | null;
                    hole_yardages?: number[] | null;
                    total_yardage?: number | null;
                    created_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}

// ============================================
// HELPER TYPES
// ============================================

export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update'];

// Convenience type aliases
export type DbTrip = Tables<'trips'>;
export type DbPlayer = Tables<'players'>;
export type DbTeam = Tables<'teams'>;
export type DbSession = Tables<'sessions'>;
export type DbMatch = Tables<'matches'>;
export type DbHoleResult = Tables<'hole_results'>;
export type DbScoringEvent = Tables<'scoring_events'>;
export type DbCourseLibrary = Tables<'course_library'>;
export type DbCourseLibraryTeeSet = Tables<'course_library_tee_sets'>;
