'use client';

import React, { useState, useEffect } from 'react';
import {
  generateTeeSheet,
  suggestTeeTimeConfig,
  formatTeeSheetForDisplay,
  generatePrintableTeeSheet,
  TeeTimeSlot,
  TeeSheetDisplayItem,
} from '@/lib/services/teeTimeService';
import { Session, Match, Player, Team } from '@/lib/types';
import {
  Clock,
  Calendar,
  Printer,
  Download,
  RefreshCw,
  Settings,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TeeTimeGeneratorProps {
  session: Session;
  matches: Match[];
  players: Player[];
  teams: Team[];
  onSave?: (teeSheet: TeeTimeSlot[]) => void;
}

export function TeeTimeGenerator({
  session,
  matches,
  players,
  teams,
  onSave,
}: TeeTimeGeneratorProps) {
  const [teeSheet, setTeeSheet] = useState<TeeTimeSlot[]>([]);
  const [displayItems, setDisplayItems] = useState<TeeSheetDisplayItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Config state
  const [startTime, setStartTime] = useState('08:00');
  const [intervalMinutes, setIntervalMinutes] = useState(10);
  const [format, setFormat] = useState<'staggered' | 'shotgun' | 'wave'>('staggered');
  const [waveCount, setWaveCount] = useState(2);

  // Initialize with suggested config
  useEffect(() => {
    const suggested = suggestTeeTimeConfig(matches.length);
    setStartTime(suggested.suggestedStartTime);
    setIntervalMinutes(suggested.intervalMinutes);
    setFormat(suggested.format);
  }, [matches.length]);

  // Generate tee sheet when config changes
  useEffect(() => {
    if (matches.length === 0) return;

    const config = {
      startTime,
      intervalMinutes,
      format,
      waveCount: format === 'wave' ? waveCount : undefined,
    };

    const generated = generateTeeSheet(matches, config);
    setTeeSheet(generated);

    // Format for display
    const items = generated.map(slot => formatTeeSheetForDisplay(slot, players, teams));
    setDisplayItems(items);
  }, [matches, startTime, intervalMinutes, format, waveCount, players, teams]);

  const handlePrint = () => {
    const printContent = generatePrintableTeeSheet(
      teeSheet,
      session.name,
      session.date,
      players,
      teams
    );

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tee Sheet - ${session.name}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { margin-bottom: 5px; }
              h3 { color: #666; margin-top: 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background: #f5f5f5; }
              .team-usa { color: #2563eb; }
              .team-europe { color: #dc2626; }
            </style>
          </head>
          <body>
            <pre>${printContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExport = () => {
    const printContent = generatePrintableTeeSheet(
      teeSheet,
      session.name,
      session.date,
      players,
      teams
    );

    const blob = new Blob([printContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tee-sheet-${session.name.replace(/[^a-z0-9]/gi, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (matches.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No matches to schedule</p>
        <p className="text-sm mt-1">Create some matches first to generate tee times</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Tee Time Generator
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {matches.length} groups • {format === 'shotgun' ? 'Shotgun Start' : format === 'wave' ? `${waveCount} Waves` : 'Staggered'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Print"
          >
            <Printer className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Export"
          >
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${showSettings
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interval (min)
              </label>
              <input
                type="number"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 10)}
                min={6}
                max={20}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'staggered' | 'shotgun' | 'wave')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="staggered">Staggered</option>
                <option value="shotgun">Shotgun</option>
                <option value="wave">Wave</option>
              </select>
            </div>

            {format === 'wave' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Waves
                </label>
                <input
                  type="number"
                  value={waveCount}
                  onChange={(e) => setWaveCount(parseInt(e.target.value) || 2)}
                  min={2}
                  max={4}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tee Sheet */}
      <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Time</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Hole</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Match</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Players</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {displayItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-mono font-medium text-gray-900 dark:text-white">
                      {item.time}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  #{item.startingHole}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {item.matchLabel}
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {item.players.map((player, pidx) => (
                      <div
                        key={pidx}
                        className={`text-sm ${player.teamName.toLowerCase().includes('usa')
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-red-600 dark:text-red-400'
                          }`}
                      >
                        {player.name} ({player.handicap})
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      {onSave && (
        <div className="flex justify-end">
          <button
            onClick={() => onSave(teeSheet)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Save Tee Sheet
          </button>
        </div>
      )}
    </div>
  );
}

export default TeeTimeGenerator;
