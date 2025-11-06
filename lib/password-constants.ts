/**
 * Password-related constants used across the application
 */

/**
 * Temporary password marker used for newly created users
 * This marker indicates that the user must set up their password on first login
 * 
 * Value: '$2a$12$TEMP.PASSWORD.NEEDS.SETUP.REQUIRED.FOR.NEW.USER'
 * 
 * This is NOT a valid bcrypt hash and cannot be used to authenticate.
 * When a user with this marker tries to login, they will be redirected
 * to the password setup page.
 */
export const TEMP_PASSWORD_MARKER = '$2a$12$TEMP.PASSWORD.NEEDS.SETUP.REQUIRED.FOR.NEW.USER'

/**
 * Check if a password hash is the temporary marker
 */
export function isTempPasswordMarker(passwordHash: string): boolean {
  return passwordHash === TEMP_PASSWORD_MARKER
}

