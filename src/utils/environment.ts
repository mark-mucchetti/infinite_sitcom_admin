/**
 * Environment configuration utilities for WPVI Admin
 * Reads configuration from the project root environment.json file
 */

export type EnvironmentMode = 'test' | 'production';

export interface EnvironmentConfig {
  mode: EnvironmentMode;
  comment?: string;
}

/**
 * Get the current environment mode from the API's X-Environment-Mode header
 * This ensures admin and backend are always in sync
 */
export async function getEnvironmentFromAPI(): Promise<EnvironmentMode> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8055'}/`);
    const mode = response.headers.get('X-Environment-Mode') as EnvironmentMode;
    return mode || 'test';
  } catch (error) {
    console.warn('Failed to get environment from API, defaulting to test mode', error);
    return 'test';
  }
}

/**
 * Check if we're in production mode
 */
export function isProduction(mode: EnvironmentMode): boolean {
  return mode === 'production';
}

/**
 * Get environment display info
 */
export function getEnvironmentDisplay(mode: EnvironmentMode) {
  return {
    text: mode.toUpperCase(),
    color: mode === 'production' ? 'text-red-600' : 'text-green-600',
    bgColor: mode === 'production' ? 'bg-red-100' : 'bg-green-100',
    borderColor: mode === 'production' ? 'border-red-200' : 'border-green-200',
    icon: mode === 'production' ? '🚨' : '✅'
  };
}