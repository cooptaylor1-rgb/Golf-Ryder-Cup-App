/**
 * Captain Components - Barrel Export
 *
 * Components for trip captains/organizers to manage:
 * - Trip setup and configuration
 * - Player roster and team assignment
 * - Match scheduling and lineups
 * - Player invitations
 * - Announcements and communication
 */

// Captain Dashboard
export {
  CaptainDashboard,
  type TripSetupStatus,
  type SessionSummary,
  type TeamSummary,
} from './CaptainDashboard';

// Lineup Builder
export {
  LineupBuilder,
  type Player,
  type MatchSlot,
  type SessionConfig,
} from './LineupBuilder';

// Fairness Scoring
export {
  FairnessCard,
  useFairness,
  calculateFairnessScore,
  calculateHandicapBalance,
  calculateExperienceBalance,
  calculatePlayTimeBalance,
  calculateCombinedHandicap,
  calculateHandicapDiff,
  getFairnessBreakdown,
  generateOptimalPairings,
  suggestSwaps,
  DEFAULT_FAIRNESS_CONFIG,
  type FairnessScore,
  type FairnessBreakdown,
  type FairnessConfig,
  type MatchPairing,
  type SuggestedPairing,
} from './FairnessScoring';

// Announcement System
export {
  AnnouncementComposer,
  AnnouncementHistory,
  AnnouncementBanner,
  QuickAnnouncementModal,
  type Announcement,
  type AnnouncementPriority,
  type AnnouncementCategory,
  type AnnouncementTemplate,
} from './AnnouncementSystem';

// Invitation Manager
export {
  InvitationManager,
  QRCodeCard,
  type Invitation,
  type InvitationStatus,
  type TripInviteInfo,
} from './InvitationManager';

// Captain Toolkit Components
export { PreFlightChecklist } from './PreFlightChecklist';
export { BulkImportModal } from './BulkImportModal';
export { TeeTimeGenerator } from './TeeTimeGenerator';
export { DraftBoard } from './DraftBoard';
export { SmartPairingSuggestions } from './SmartPairingSuggestions';
export { SideBetsTracker } from './SideBetsTracker';
export { SessionWeatherPanel } from './SessionWeatherPanel';
export { CaptainToolkit } from './CaptainToolkit';
