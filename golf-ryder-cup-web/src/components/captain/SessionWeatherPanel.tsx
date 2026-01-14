'use client';

import React, { useState, useEffect } from 'react';
import { getSessionWeather, WeatherData, WeatherConditions } from '@/lib/services/weatherService';
import { Session, Course } from '@/lib/types';
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Umbrella,
} from 'lucide-react';

interface SessionWeatherPanelProps {
  session: Session;
  course?: Course;
  onWeatherUpdate?: (weather: WeatherData) => void;
}

export function SessionWeatherPanel({ session, course, onWeatherUpdate }: SessionWeatherPanelProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (!course?.location) {
      setError('No course location available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const weatherData = await getSessionWeather(
        session.id,
        session.date,
        course.location
      );

      if (weatherData) {
        setWeather(weatherData);
        onWeatherUpdate?.(weatherData);
      } else {
        setError('Unable to fetch weather data');
      }
    } catch (err) {
      setError('Weather service unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [session.id, session.date, course?.location]);

  const getWeatherIcon = (conditions?: WeatherConditions) => {
    if (!conditions) return <Cloud className="w-8 h-8 text-gray-400" />;

    if (conditions.precipitation > 50) {
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    }
    if (conditions.cloudCover > 70) {
      return <Cloud className="w-8 h-8 text-gray-500" />;
    }
    return <Sun className="w-8 h-8 text-yellow-500" />;
  };

  const getPlayabilityColor = (conditions?: WeatherConditions) => {
    if (!conditions) return 'text-gray-500';

    // Perfect conditions
    if (conditions.temperature >= 60 && conditions.temperature <= 85 &&
      conditions.windSpeed < 15 && conditions.precipitation < 20) {
      return 'text-green-600 dark:text-green-400';
    }

    // Challenging but playable
    if (conditions.temperature >= 45 && conditions.temperature <= 95 &&
      conditions.windSpeed < 25 && conditions.precipitation < 50) {
      return 'text-yellow-600 dark:text-yellow-400';
    }

    // Difficult conditions
    return 'text-red-600 dark:text-red-400';
  };

  const getRecommendation = (conditions?: WeatherConditions): string => {
    if (!conditions) return 'Weather data unavailable';

    const issues: string[] = [];

    if (conditions.precipitation > 60) {
      issues.push('Bring rain gear');
    }
    if (conditions.windSpeed > 20) {
      issues.push('Club up in the wind');
    }
    if (conditions.temperature > 85) {
      issues.push('Stay hydrated');
    }
    if (conditions.temperature < 50) {
      issues.push('Dress in layers');
    }
    if (conditions.uvIndex > 7) {
      issues.push('Apply sunscreen');
    }

    if (issues.length === 0) {
      return 'Perfect conditions for golf!';
    }

    return issues.join(' • ');
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-700 dark:text-yellow-400">{error}</span>
          </div>
          <button
            onClick={fetchWeather}
            className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded"
          >
            <RefreshCw className="w-4 h-4 text-yellow-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {getWeatherIcon(weather?.conditions)}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {weather?.conditions?.temperature
                  ? `${Math.round(weather.conditions.temperature)}°F`
                  : '--°F'}
              </span>
              <span className={`text-sm font-medium ${getPlayabilityColor(weather?.conditions)}`}>
                {weather?.conditions?.precipitation && weather.conditions.precipitation > 50
                  ? 'Rain Expected'
                  : weather?.conditions?.temperature && weather.conditions.temperature > 85
                    ? 'Hot'
                    : 'Good for Golf'}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {session.name} • {new Date(session.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expanded Details */}
      {expanded && weather?.conditions && (
        <div className="px-4 pb-4 space-y-4">
          {/* Weather Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Wind className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {weather.conditions.windSpeed} mph
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
            </div>

            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Droplets className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {weather.conditions.humidity}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
            </div>

            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Umbrella className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {weather.conditions.precipitation}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rain</p>
            </div>

            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Sun className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {weather.conditions.uvIndex}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">UV Index</p>
            </div>
          </div>

          {/* Wind Direction */}
          {weather.conditions.windDirection && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Wind className="w-4 h-4" />
              Wind from {weather.conditions.windDirection}
            </div>
          )}

          {/* Recommendation */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 {getRecommendation(weather.conditions)}
            </p>
          </div>

          {/* Refresh */}
          <div className="flex justify-end">
            <button
              onClick={fetchWeather}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionWeatherPanel;
