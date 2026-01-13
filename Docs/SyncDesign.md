# Sync Design Document

**Status:** Design Only (P3 - Not Implemented)
**Version:** Draft v1.0
**Last Updated:** January 13, 2026
**Target Release:** v1.3+

---

## Executive Summary

This document outlines the architecture for optional real-time sync between devices for shared trip management. The design prioritizes **offline-first operation** with eventual consistency, ensuring the app remains fully functional without any network connectivity.

**Key Principle:** The app MUST work 100% offline. Sync is an enhancement, not a requirement.

---

## Goals

1. **Captain Control** — Captain owns trip structure (sessions, pairings, rules)
2. **Distributed Scoring** — Multiple users can score different matches simultaneously
3. **Conflict-Free** — No data loss or silent overwrites
4. **Offline Resilient** — Changes queue and replay when online
5. **Privacy Aware** — Users control what they share

---

## Non-Goals (v1.3)

- Real-time chat/messaging
- External API integrations (GHIN, etc.)
- Server-hosted trips (all data stays on devices)
- User accounts or authentication

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Device A (Captain)                  │
│  ┌─────────────┐    ┌─────────────┐    ┌────────────┐  │
│  │ UI Layer    │───▶│ Event Store │───▶│ Reducer    │  │
│  │ (React)     │    │ (IndexedDB) │    │ (Computed) │  │
│  └─────────────┘    └──────┬──────┘    └────────────┘  │
│                            │                             │
│                     ┌──────▼──────┐                     │
│                     │ Sync Layer  │                     │
│                     │ (Optional)  │                     │
│                     └──────┬──────┘                     │
└────────────────────────────┼────────────────────────────┘
                             │
                             │ WebRTC / WebSocket
                             │ (Peer-to-Peer or Relay)
                             │
┌────────────────────────────┼────────────────────────────┐
│                     ┌──────▼──────┐                     │
│                     │ Sync Layer  │                     │
│                     │ (Optional)  │                     │
│                     └──────┬──────┘                     │
│                            │                             │
│  ┌─────────────┐    ┌──────▼──────┐    ┌────────────┐  │
│  │ UI Layer    │───▶│ Event Store │───▶│ Reducer    │  │
│  │ (React)     │    │ (IndexedDB) │    │ (Computed) │  │
│  └─────────────┘    └─────────────┘    └────────────┘  │
│                      Device B (Scorer)                   │
└─────────────────────────────────────────────────────────┘
```

---

## Data Model: Event Sourcing

### Core Concept

Instead of syncing "current state," we sync **events** (actions that happened). Each device maintains its own event log and derives state by replaying events in order.

### Event Structure

```typescript
interface SyncEvent {
  id: string;              // UUID v7 (time-sortable)
  tripId: string;          // Which trip this belongs to
  type: EventType;         // What happened
  payload: unknown;        // Event-specific data
  timestamp: ISODateString;
  deviceId: string;        // Which device created this
  userId?: string;         // Optional user identifier
  sequence: number;        // Local sequence number
}

type EventType =
  // Trip events
  | 'TRIP_CREATED'
  | 'TRIP_UPDATED'
  // Session events
  | 'SESSION_CREATED'
  | 'SESSION_UPDATED'
  | 'SESSION_LOCKED'
  | 'SESSION_UNLOCKED'
  // Match events
  | 'MATCH_CREATED'
  | 'MATCH_UPDATED'
  | 'MATCH_STARTED'
  | 'MATCH_FINALIZED'
  | 'MATCH_REOPENED'
  // Score events
  | 'HOLE_SCORED'
  | 'HOLE_SCORE_REVERTED'
  // Player events
  | 'PLAYER_ADDED'
  | 'PLAYER_UPDATED'
  | 'PLAYER_ASSIGNED_TO_TEAM';
```

### Event Examples

```typescript
// Scoring a hole
const scoreEvent: SyncEvent = {
  id: '019431a0-1234-7def-8000-abcdef123456',
  tripId: 'trip-abc',
  type: 'HOLE_SCORED',
  payload: {
    matchId: 'match-123',
    holeNumber: 7,
    winner: 'team_a',  // 'team_a' | 'team_b' | 'halved'
    previousState: { ... },
  },
  timestamp: '2026-01-13T14:32:00Z',
  deviceId: 'device-xyz',
  userId: 'captain-joe',
  sequence: 42,
};

// Locking a session
const lockEvent: SyncEvent = {
  id: '019431a0-5678-7def-8000-abcdef789012',
  tripId: 'trip-abc',
  type: 'SESSION_LOCKED',
  payload: {
    sessionId: 'session-456',
    lockedBy: 'captain-joe',
    reason: 'match_started',
  },
  timestamp: '2026-01-13T08:00:00Z',
  deviceId: 'device-captain',
  sequence: 15,
};
```

---

## Conflict Resolution

### Strategy: Last-Write-Wins with Roles

1. **Structural Changes (Captain Only)**
   - Sessions, matches, pairings → Captain's events always win
   - Non-captains cannot emit structural events

2. **Scoring Changes (Assigned Scorer)**
   - Only the assigned match scorer can emit score events
   - If no assigned scorer, any participant can score
   - Conflicts resolved by timestamp

3. **Concurrent Edits**
   - Same hole scored by two devices → Use event with latest timestamp
   - Log conflict in audit trail for review

### Reducer Logic

```typescript
function reduceEvents(events: SyncEvent[]): TripState {
  // Sort by timestamp, then by sequence
  const sorted = events.sort((a, b) => {
    const timeDiff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.sequence - b.sequence;
  });

  // Apply each event to build state
  let state = initialTripState();
  for (const event of sorted) {
    state = applyEvent(state, event);
  }
  return state;
}

function applyEvent(state: TripState, event: SyncEvent): TripState {
  switch (event.type) {
    case 'HOLE_SCORED':
      return applyHoleScored(state, event.payload);
    case 'SESSION_LOCKED':
      return applySessionLocked(state, event.payload);
    // ... etc
  }
}
```

---

## Offline Queue & Replay

### Local Queue Structure

```typescript
interface OfflineQueue {
  tripId: string;
  events: SyncEvent[];      // Pending events not yet synced
  lastSyncedSequence: number;
  lastSyncedAt: ISODateString | null;
}
```

### Sync Flow

1. **User makes change offline**
   - Event created with local timestamp and sequence
   - Event saved to IndexedDB event store
   - Event added to offline queue
   - UI updates immediately (optimistic)

2. **Device comes online**
   - Sync layer connects to peers
   - Send queued events
   - Receive remote events
   - Merge and re-reduce state

3. **Conflict detected**
   - Log to audit trail
   - Apply conflict resolution rules
   - Notify user if their change was overwritten

---

## Roles & Permissions

### Role Definitions

```typescript
type TripRole = 'captain' | 'scorer' | 'spectator';

interface TripParticipant {
  id: string;
  name: string;
  role: TripRole;
  assignedMatches?: string[];  // Match IDs this user can score
}
```

### Permission Matrix

| Action | Captain | Scorer | Spectator |
|--------|---------|--------|-----------|
| View trip | ✅ | ✅ | ✅ |
| Edit trip settings | ✅ | ❌ | ❌ |
| Create/edit sessions | ✅ | ❌ | ❌ |
| Lock/unlock sessions | ✅ | ❌ | ❌ |
| Create/edit matches | ✅ | ❌ | ❌ |
| Score assigned match | ✅ | ✅ | ❌ |
| Score any match | ✅ | ❌ | ❌ |
| Finalize match | ✅ | ✅* | ❌ |
| Reopen match | ✅ | ❌ | ❌ |
| Export trip | ✅ | ✅ | ❌ |

*Scorer can finalize only their assigned match

---

## Transport Options (P3 Implementation)

### Option A: Peer-to-Peer (WebRTC)

**Pros:**

- No server required
- Truly local/private
- Works on LAN without internet

**Cons:**

- Complex NAT traversal
- Needs signaling server for discovery
- Limited to ~8-10 peers

**Use Case:** Small group on same course WiFi

### Option B: Relay Server (WebSocket)

**Pros:**

- Simpler implementation
- Better for larger groups
- Works across networks

**Cons:**

- Requires server infrastructure
- Monthly hosting cost
- Privacy considerations

**Use Case:** Large trips, remote participants

### Recommended Approach

Start with **WebRTC for local sync** (same network), with optional relay fallback for remote participants. Use existing services like PeerJS or Y.js for CRDT sync.

---

## Storage Interface (Code Seam)

### Current Implementation

```typescript
// src/lib/storage/localStore.ts
export interface StorageInterface {
  // Trips
  getTrip(id: string): Promise<Trip | null>;
  saveTrip(trip: Trip): Promise<void>;
  deleteTrip(id: string): Promise<void>;
  listTrips(): Promise<Trip[]>;

  // Events (new for sync)
  saveEvent(event: SyncEvent): Promise<void>;
  getEvents(tripId: string, since?: number): Promise<SyncEvent[]>;

  // Offline queue
  queueEvent(event: SyncEvent): Promise<void>;
  getQueuedEvents(): Promise<SyncEvent[]>;
  clearQueue(throughSequence: number): Promise<void>;
}

// Local implementation (current)
export const localStore: StorageInterface = {
  // ... IndexedDB implementation
};

// Future remote implementation (stub only)
export interface RemoteStore extends StorageInterface {
  connect(tripCode: string): Promise<void>;
  disconnect(): Promise<void>;
  onRemoteEvent(callback: (event: SyncEvent) => void): void;
}
```

---

## Migration Strategy

### Phase 1: Event Logging (v1.3)

- Add event logging alongside current state storage
- No sync yet, just building event history
- Audit log already captures most events

### Phase 2: Local Reducer (v1.3)

- Derive state from events locally
- Verify reducer produces same state as current storage
- Run in parallel, validate consistency

### Phase 3: Sync Protocol (v1.4)

- Add peer discovery
- Implement event exchange
- Conflict resolution
- User-facing "Share Trip" flow

---

## Privacy Model

### Data Ownership

- Trip data stays on participant devices
- No central server stores trip data (peer relay is transient)
- Captain can "revoke" trip sharing

### Sharing Controls

```typescript
interface TripSharingSettings {
  isShared: boolean;
  shareCode?: string;        // 6-character code for joining
  allowScoring: boolean;     // Can joiners score?
  allowExport: boolean;      // Can joiners export?
  expiresAt?: ISODateString; // Auto-stop sharing
}
```

### Join Flow

1. Captain enables sharing → generates 6-char code
2. Participant enters code → joins as "Pending"
3. Captain approves → assigns role (scorer/spectator)
4. Sync begins

---

## Security Considerations

### Threats

1. **Malicious Events** — Fake events from non-participants
2. **Event Replay** — Re-sending old events to corrupt state
3. **Impersonation** — Pretending to be captain

### Mitigations

- Share codes are short-lived and regenerable
- Events signed with device ID (not cryptographic, but traceable)
- Captain can kick participants
- Event sequence numbers prevent replay
- Full audit log for forensics

---

## Implementation Checklist (P3)

### Code Seams (v1.2) ✅

- [x] Storage interface defined
- [x] Local store implementation
- [ ] Event type definitions (stub)
- [ ] Queue table in IndexedDB

### Event Logging (v1.3)

- [ ] Emit events on state changes
- [ ] Store events in IndexedDB
- [ ] Build reducer from events
- [ ] Verify state consistency

### Sync Protocol (v1.4)

- [ ] Peer discovery mechanism
- [ ] Event exchange protocol
- [ ] Conflict resolution
- [ ] Offline queue replay
- [ ] "Share Trip" UI flow

---

## Appendix: Alternatives Considered

### A. Full State Sync (Rejected)

Sync entire trip state on every change.

- **Problem:** Large payloads, conflict hell, no offline support

### B. Operational Transform (Considered)

Like Google Docs real-time editing.

- **Problem:** Overkill for our use case, complex to implement

### C. CRDT (Considered)

Conflict-free replicated data types.

- **Decision:** Event sourcing is simpler for our domain model
- **Note:** May adopt Y.js or Automerge later if needed

---

## References

- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CRDT Introduction](https://crdt.tech/)
- [PeerJS Documentation](https://peerjs.com/)
- [Y.js CRDT Library](https://github.com/yjs/yjs)

---

**Document Status:** Draft - Design Only
**Next Steps:** Review with team, refine event types, prototype reducer
