/**
 * Security configuration for session and idle timeouts.
 * Aligned with ISO 27001 and aviation-grade safety standards.
 */

export const SESSION_CONFIG = {
  // 60 minutes of inactivity before automatic logout
  IDLE_TIMEOUT_MS: 60 * 60 * 1000,
  
  // 3 minutes before idle timeout, show the warning dialog
  WARNING_THRESHOLD_MS: 3 * 60 * 1000,
  
  // 12 hours hard limit for any session (Security best practice)
  MAX_SESSION_MS: 12 * 60 * 60 * 1000,
  
  // 5 minutes before the 12-hour limit, show the hard-limit warning
  MAX_SESSION_WARNING_MS: 5 * 60 * 1000,
  
  // Storage keys for multi-tab synchronization
  STORAGE_KEY_LAST_ACTIVITY: 'pilot_last_activity',
  STORAGE_KEY_SESSION_START: 'pilot_session_start',
  
  // Broadcast channel name for cross-tab communication
  SYNC_CHANNEL_NAME: 'pilot_session_sync',
  
  // Custom event for silent auto-save
  AUTO_SAVE_EVENT: 'pilot:auto-save',
} as const;
