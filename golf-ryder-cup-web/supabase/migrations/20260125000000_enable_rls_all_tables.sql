-- Migration: Enable RLS on all tables
-- Description: Fixes Supabase security warnings by enabling RLS and creating policies
-- Date: January 25, 2026

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

-- Core tables
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE side_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tee_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE hole_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE PERMISSIVE POLICIES
-- (App uses share codes for access control, not user auth)
-- ============================================

-- MATCHES
DROP POLICY
IF EXISTS "matches_select_all" ON matches;
DROP POLICY
IF EXISTS "matches_insert_all" ON matches;
DROP POLICY
IF EXISTS "matches_update_all" ON matches;
DROP POLICY
IF EXISTS "matches_delete_all" ON matches;

CREATE POLICY "matches_select_all" ON matches FOR
SELECT USING (true);
CREATE POLICY "matches_insert_all" ON matches FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "matches_update_all" ON matches FOR
UPDATE USING (true);
CREATE POLICY "matches_delete_all" ON matches FOR
DELETE USING (true);

-- AUDIT_LOG
DROP POLICY
IF EXISTS "audit_log_select_all" ON audit_log;
DROP POLICY
IF EXISTS "audit_log_insert_all" ON audit_log;
DROP POLICY
IF EXISTS "audit_log_update_all" ON audit_log;
DROP POLICY
IF EXISTS "audit_log_delete_all" ON audit_log;

CREATE POLICY "audit_log_select_all" ON audit_log FOR
SELECT USING (true);
CREATE POLICY "audit_log_insert_all" ON audit_log FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "audit_log_update_all" ON audit_log FOR
UPDATE USING (true);
CREATE POLICY "audit_log_delete_all" ON audit_log FOR
DELETE USING (true);

-- ACHIEVEMENTS
DROP POLICY
IF EXISTS "achievements_select_all" ON achievements;
DROP POLICY
IF EXISTS "achievements_insert_all" ON achievements;
DROP POLICY
IF EXISTS "achievements_update_all" ON achievements;
DROP POLICY
IF EXISTS "achievements_delete_all" ON achievements;

CREATE POLICY "achievements_select_all" ON achievements FOR
SELECT USING (true);
CREATE POLICY "achievements_insert_all" ON achievements FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "achievements_update_all" ON achievements FOR
UPDATE USING (true);
CREATE POLICY "achievements_delete_all" ON achievements FOR
DELETE USING (true);

-- SIDE_BETS
DROP POLICY
IF EXISTS "side_bets_select_all" ON side_bets;
DROP POLICY
IF EXISTS "side_bets_insert_all" ON side_bets;
DROP POLICY
IF EXISTS "side_bets_update_all" ON side_bets;
DROP POLICY
IF EXISTS "side_bets_delete_all" ON side_bets;

CREATE POLICY "side_bets_select_all" ON side_bets FOR
SELECT USING (true);
CREATE POLICY "side_bets_insert_all" ON side_bets FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "side_bets_update_all" ON side_bets FOR
UPDATE USING (true);
CREATE POLICY "side_bets_delete_all" ON side_bets FOR
DELETE USING (true);

-- COMMENTS
DROP POLICY
IF EXISTS "comments_select_all" ON comments;
DROP POLICY
IF EXISTS "comments_insert_all" ON comments;
DROP POLICY
IF EXISTS "comments_update_all" ON comments;
DROP POLICY
IF EXISTS "comments_delete_all" ON comments;

CREATE POLICY "comments_select_all" ON comments FOR
SELECT USING (true);
CREATE POLICY "comments_insert_all" ON comments FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "comments_update_all" ON comments FOR
UPDATE USING (true);
CREATE POLICY "comments_delete_all" ON comments FOR
DELETE USING (true);

-- PHOTOS
DROP POLICY
IF EXISTS "photos_select_all" ON photos;
DROP POLICY
IF EXISTS "photos_insert_all" ON photos;
DROP POLICY
IF EXISTS "photos_update_all" ON photos;
DROP POLICY
IF EXISTS "photos_delete_all" ON photos;

CREATE POLICY "photos_select_all" ON photos FOR
SELECT USING (true);
CREATE POLICY "photos_insert_all" ON photos FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "photos_update_all" ON photos FOR
UPDATE USING (true);
CREATE POLICY "photos_delete_all" ON photos FOR
DELETE USING (true);

-- TRIPS
DROP POLICY
IF EXISTS "trips_select_all" ON trips;
DROP POLICY
IF EXISTS "trips_insert_all" ON trips;
DROP POLICY
IF EXISTS "trips_update_all" ON trips;
DROP POLICY
IF EXISTS "trips_delete_all" ON trips;

CREATE POLICY "trips_select_all" ON trips FOR
SELECT USING (true);
CREATE POLICY "trips_insert_all" ON trips FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "trips_update_all" ON trips FOR
UPDATE USING (true);
CREATE POLICY "trips_delete_all" ON trips FOR
DELETE USING (true);

-- PLAYERS
DROP POLICY
IF EXISTS "players_select_all" ON players;
DROP POLICY
IF EXISTS "players_insert_all" ON players;
DROP POLICY
IF EXISTS "players_update_all" ON players;
DROP POLICY
IF EXISTS "players_delete_all" ON players;

CREATE POLICY "players_select_all" ON players FOR
SELECT USING (true);
CREATE POLICY "players_insert_all" ON players FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "players_update_all" ON players FOR
UPDATE USING (true);
CREATE POLICY "players_delete_all" ON players FOR
DELETE USING (true);

-- TEAMS
DROP POLICY
IF EXISTS "teams_select_all" ON teams;
DROP POLICY
IF EXISTS "teams_insert_all" ON teams;
DROP POLICY
IF EXISTS "teams_update_all" ON teams;
DROP POLICY
IF EXISTS "teams_delete_all" ON teams;

CREATE POLICY "teams_select_all" ON teams FOR
SELECT USING (true);
CREATE POLICY "teams_insert_all" ON teams FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "teams_update_all" ON teams FOR
UPDATE USING (true);
CREATE POLICY "teams_delete_all" ON teams FOR
DELETE USING (true);

-- TEAM_MEMBERS
DROP POLICY
IF EXISTS "team_members_select_all" ON team_members;
DROP POLICY
IF EXISTS "team_members_insert_all" ON team_members;
DROP POLICY
IF EXISTS "team_members_update_all" ON team_members;
DROP POLICY
IF EXISTS "team_members_delete_all" ON team_members;

CREATE POLICY "team_members_select_all" ON team_members FOR
SELECT USING (true);
CREATE POLICY "team_members_insert_all" ON team_members FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "team_members_update_all" ON team_members FOR
UPDATE USING (true);
CREATE POLICY "team_members_delete_all" ON team_members FOR
DELETE USING (true);

-- SESSIONS
DROP POLICY
IF EXISTS "sessions_select_all" ON sessions;
DROP POLICY
IF EXISTS "sessions_insert_all" ON sessions;
DROP POLICY
IF EXISTS "sessions_update_all" ON sessions;
DROP POLICY
IF EXISTS "sessions_delete_all" ON sessions;

CREATE POLICY "sessions_select_all" ON sessions FOR
SELECT USING (true);
CREATE POLICY "sessions_insert_all" ON sessions FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "sessions_update_all" ON sessions FOR
UPDATE USING (true);
CREATE POLICY "sessions_delete_all" ON sessions FOR
DELETE USING (true);

-- COURSES
DROP POLICY
IF EXISTS "courses_select_all" ON courses;
DROP POLICY
IF EXISTS "courses_insert_all" ON courses;
DROP POLICY
IF EXISTS "courses_update_all" ON courses;
DROP POLICY
IF EXISTS "courses_delete_all" ON courses;

CREATE POLICY "courses_select_all" ON courses FOR
SELECT USING (true);
CREATE POLICY "courses_insert_all" ON courses FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "courses_update_all" ON courses FOR
UPDATE USING (true);
CREATE POLICY "courses_delete_all" ON courses FOR
DELETE USING (true);

-- TEE_SETS
DROP POLICY
IF EXISTS "tee_sets_select_all" ON tee_sets;
DROP POLICY
IF EXISTS "tee_sets_insert_all" ON tee_sets;
DROP POLICY
IF EXISTS "tee_sets_update_all" ON tee_sets;
DROP POLICY
IF EXISTS "tee_sets_delete_all" ON tee_sets;

CREATE POLICY "tee_sets_select_all" ON tee_sets FOR
SELECT USING (true);
CREATE POLICY "tee_sets_insert_all" ON tee_sets FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "tee_sets_update_all" ON tee_sets FOR
UPDATE USING (true);
CREATE POLICY "tee_sets_delete_all" ON tee_sets FOR
DELETE USING (true);

-- HOLE_RESULTS
DROP POLICY
IF EXISTS "hole_results_select_all" ON hole_results;
DROP POLICY
IF EXISTS "hole_results_insert_all" ON hole_results;
DROP POLICY
IF EXISTS "hole_results_update_all" ON hole_results;
DROP POLICY
IF EXISTS "hole_results_delete_all" ON hole_results;

CREATE POLICY "hole_results_select_all" ON hole_results FOR
SELECT USING (true);
CREATE POLICY "hole_results_insert_all" ON hole_results FOR
INSERT WITH CHECK
    (true)
;
CREATE POLICY "hole_results_update_all" ON hole_results FOR
UPDATE USING (true);
CREATE POLICY "hole_results_delete_all" ON hole_results FOR
DELETE USING (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- After running, check: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
