'use client';

import React, { useState, useEffect } from 'react';
import { runPreFlightCheck, getPreFlightSummary, PreFlightCheckResult } from '@/lib/services/preFlightValidationService';
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, Loader2, RefreshCw, Rocket } from 'lucide-react';

interface PreFlightChecklistProps {
  tripId: string;
  onAllClear?: () => void;
}

export function PreFlightChecklist({ tripId, onAllClear }: PreFlightChecklistProps) {
  const [result, setResult] = useState<PreFlightCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const runCheck = async () => {
    setLoading(true);
    try {
      const checkResult = await runPreFlightCheck(tripId);
      setResult(checkResult);

      // Auto-expand sections with issues
      const sectionsWithIssues = new Set<string>();
      checkResult.checks.forEach(check => {
        if (check.status !== 'pass') {
          sectionsWithIssues.add(check.category);
        }
      });
      setExpandedSections(sectionsWithIssues);

      if (checkResult.allPassed && onAllClear) {
        onAllClear();
      }
    } catch (error) {
      console.error('Pre-flight check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, [tripId]);

  const toggleSection = (category: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'fail':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600 dark:text-gray-300">Running pre-flight checks...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center p-8 text-red-500">
        Failed to run pre-flight checks
      </div>
    );
  }

  const summary = getPreFlightSummary(result);
  const categories = [...new Set(result.checks.map(c => c.category))];

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className={`rounded-xl p-6 border-2 ${result.allPassed
          ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
          : 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700'
        }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {result.allPassed ? (
              <Rocket className="w-10 h-10 text-green-600" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-yellow-600" />
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {result.allPassed ? 'All Systems Go!' : 'Pre-Flight Review Needed'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {summary}
              </p>
            </div>
          </div>
          <button
            onClick={runCheck}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Re-run checks"
          >
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {result.checks.filter(c => c.status === 'pass').length} Passed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {result.checks.filter(c => c.status === 'warning').length} Warnings
            </span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {result.checks.filter(c => c.status === 'fail').length} Failed
            </span>
          </div>
        </div>
      </div>

      {/* Category Sections */}
      {categories.map(category => {
        const categoryChecks = result.checks.filter(c => c.category === category);
        const allPassed = categoryChecks.every(c => c.status === 'pass');
        const hasFails = categoryChecks.some(c => c.status === 'fail');
        const isExpanded = expandedSections.has(category);

        return (
          <div key={category} className="border rounded-lg overflow-hidden dark:border-gray-700">
            <button
              onClick={() => toggleSection(category)}
              className={`w-full flex items-center justify-between p-4 text-left transition-colors ${allPassed
                  ? 'bg-gray-50 dark:bg-gray-800'
                  : hasFails
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-yellow-50 dark:bg-yellow-900/20'
                }`}
            >
              <div className="flex items-center gap-3">
                {allPassed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : hasFails ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                  {category}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({categoryChecks.filter(c => c.status === 'pass').length}/{categoryChecks.length} passed)
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {isExpanded && (
              <div className="p-4 space-y-3 bg-white dark:bg-gray-900">
                {categoryChecks.map((check, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${getStatusColor(check.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {check.label}
                        </p>
                        {check.details && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {check.details}
                          </p>
                        )}
                        {check.fix && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                            <span className="font-medium">Fix:</span> {check.fix}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PreFlightChecklist;
