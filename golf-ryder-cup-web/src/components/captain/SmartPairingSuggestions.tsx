'use client';

import React, { useState, useMemo } from 'react';
import {
  generatePairingSuggestions,
  extractPairingHistory,
  analyzeSessionPairings,
  calculateFairnessScore,
  PairingHistoryEntry,
  PairingSuggestion,
} from '@/lib/services/smartPairingService';
import { Player, Team, Session, Match } from '@/lib/types';
import {
  Users,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  History,
  Star,
  ArrowRight,
  Info,
} from 'lucide-react';

interface SmartPairingSuggestionsProps {
  players: Player[];
  teams: Team[];
  sessions: Session[];
  matches: Match[];
  currentSessionId?: string;
  onApplySuggestion?: (suggestion: PairingSuggestion) => void;
}

export function SmartPairingSuggestions({
  players,
  teams,
  sessions,
  matches,
  currentSessionId,
  onApplySuggestion,
}: SmartPairingSuggestionsProps) {
  const [selectedFormat, setSelectedFormat] = useState<'fourball' | 'foursomes' | 'singles'>('fourball');
  const [showHistory, setShowHistory] = useState(false);

  // Extract pairing history from past matches
  const pairingHistory = useMemo(() => {
    return extractPairingHistory(matches, players, sessions);
  }, [matches, players, sessions]);

  // Generate suggestions
  const suggestions = useMemo(() => {
    const teamPlayerMap = new Map<string, Player[]>();
    teams.forEach(team => {
      const teamPlayers = players.filter(p =>
        matches.some(m =>
          (m.team1PlayerIds?.includes(p.id) && m.team1Id === team.id) ||
          (m.team2PlayerIds?.includes(p.id) && m.team2Id === team.id)
        )
      );
      teamPlayerMap.set(team.id, teamPlayers.length > 0 ? teamPlayers : players.filter((_, i) => i % 2 === (team.name.includes('USA') ? 0 : 1)));
    });

    return generatePairingSuggestions(
      teams,
      teamPlayerMap,
      pairingHistory,
      { format: selectedFormat }
    );
  }, [teams, players, matches, pairingHistory, selectedFormat]);

  // Analyze current session if provided
  const currentSessionAnalysis = useMemo(() => {
    if (!currentSessionId) return null;
    const sessionMatches = matches.filter(m => m.sessionId === currentSessionId);
    return analyzeSessionPairings(sessionMatches, pairingHistory);
  }, [currentSessionId, matches, pairingHistory]);

  // Calculate overall fairness
  const overallFairness = useMemo(() => {
    return calculateFairnessScore(pairingHistory, players.length);
  }, [pairingHistory, players.length]);

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Unknown';
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Smart Pairing Suggestions
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-powered recommendations based on history
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-2 rounded-lg transition-colors ${showHistory
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          title="View pairing history"
        >
          <History className="w-5 h-5" />
        </button>
      </div>

      {/* Fairness Score */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Overall Pairing Fairness</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(overallFairness * 100)}%
            </p>
          </div>
          <div className={`p-3 rounded-full ${overallFairness >= 0.8
              ? 'bg-green-100 dark:bg-green-900/30'
              : overallFairness >= 0.6
                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
            {overallFairness >= 0.8 ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : overallFairness >= 0.6 ? (
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {overallFairness >= 0.8
            ? 'Pairings are well-distributed across players'
            : overallFairness >= 0.6
              ? 'Some players have played together frequently'
              : 'Consider mixing up pairings more'}
        </p>
      </div>

      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Match Format
        </label>
        <div className="flex gap-2">
          {(['fourball', 'foursomes', 'singles'] as const).map(format => (
            <button
              key={format}
              onClick={() => setSelectedFormat(format)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFormat === format
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {format.charAt(0).toUpperCase() + format.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Recommended Pairings
        </h4>
        {suggestions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No suggestions available. Add more players to generate pairings.
          </p>
        ) : (
          suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="p-4 border dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${suggestion.score >= 80
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : suggestion.score >= 60
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                      Score: {suggestion.score}
                    </span>
                    {suggestion.score >= 80 && (
                      <Star className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>

                  {/* Team 1 */}
                  <div className="mb-2">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                      {getTeamName(suggestion.team1Id)}
                    </p>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Users className="w-4 h-4 text-gray-400" />
                      {suggestion.team1Players.map(getPlayerName).join(' & ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-center my-2">
                    <span className="text-sm text-gray-400">vs</span>
                  </div>

                  {/* Team 2 */}
                  <div>
                    <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                      {getTeamName(suggestion.team2Id)}
                    </p>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Users className="w-4 h-4 text-gray-400" />
                      {suggestion.team2Players.map(getPlayerName).join(' & ')}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mt-3 flex items-start gap-2">
                    <Info className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {suggestion.reason}
                    </p>
                  </div>
                </div>

                {onApplySuggestion && (
                  <button
                    onClick={() => onApplySuggestion(suggestion)}
                    className="ml-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    title="Apply this pairing"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pairing History */}
      {showHistory && (
        <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Pairing History
            </h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {pairingHistory.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No pairing history yet
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Players</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Times</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">W-L-T</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Last</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {pairingHistory.slice(0, 20).map((entry, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {entry.playerIds.map(getPlayerName).join(' & ')}
                      </td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                        {entry.timesPlayed}
                      </td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                        {entry.wins}-{entry.losses}-{entry.ties}
                      </td>
                      <td className="px-4 py-2 text-gray-500 dark:text-gray-400 text-xs">
                        {entry.lastPlayedDate
                          ? new Date(entry.lastPlayedDate).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Current Session Analysis */}
      {currentSessionAnalysis && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Current Session Analysis
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSessionAnalysis.newPairings}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">New Pairings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSessionAnalysis.repeatPairings}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Repeat Pairings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(currentSessionAnalysis.varietyScore * 100)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Variety Score</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartPairingSuggestions;
