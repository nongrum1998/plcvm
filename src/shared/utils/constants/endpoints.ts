/**
 * Central registry of all API endpoint paths used by the app.
 *
 * Grouped by feature area (auth, user, verification, DLC, documentation, and
 * pension statements). Some values are built from environment variables:
 * DAT-related endpoints use `EXPO_PUBLIC_DAT_API_URL` and are therefore only
 * defined when that variable is set at build time. Treat all values as
 * readonly; reference them instead of hardcoding path strings.
 */
export const ENDPOINTS = {
  /** Authentication-related endpoints for the pensioner portal and DAT API. */
  AUTH: {
    /** Main app login. */
    LOGIN: '/login',
    /** Main app logout. */
    LOGOUT: '/logout',
    /** Token validation endpoint for the main app. */
    VALIDATE_TOKEN: '/api/validate_token/',
    /** Fetches the current authenticated user. */
    USER: '/user',
  },

  /** User profile and account management endpoints. */
  USER: {
    /** Checks whether a pensioner is already registered. */
    REGISTRATION_STATUS: '/get_ppo_status',
    /** Creates a new pensioner record. */
    CREATE_PENSIONER: '/facial_registration',
    /** Changes the user's password. */
    CHANGE_PASSWORD: '/change_password',
    /** Updates the user's profile. */
    UPDATE_PROFILE: '/save_user',
  },

  /** DLC (life certificate) endpoints. */
  DLC: {
    /** Creates a life certificate. */
    CREATE: '/dlc',
    STATUS: '/dlc_status',
  },

  /** External documentation URLs. */
  DOCUMENTATION: {
    /** Pensioner manual hosted on shillong.meg.nic.in. */
    MANUAL: 'https://shillong.meg.nic.in/manual.html',
    /** Privacy policy hosted on shillong.meg.nic.in. */
    POLICY: 'https://shillong.meg.nic.in/privacy_policy.html',
  },
  /** Pension statement endpoints on the DAT API. */
  PENSIONER_STATEMENTS: {
    /** Fetches the six-month pension statement, requires
     * `EXPO_PUBLIC_DAT_API_URL`. */
    PAYMENT_SLIP: `/paymentslip`,
  },
  CODE_DIRECTORIES: '/getcodedirectories',
} as const;
