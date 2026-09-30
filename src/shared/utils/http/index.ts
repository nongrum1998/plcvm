/**
 * @file Public API for the shared HTTP client.
 *
 * Exposes the configured axios instance, the typed `http` wrapper, and the
 * shared client constants. Internal modules (interceptor factories and the
 * normalizers) are intentionally not re-exported.
 */

export { default, http } from './client';
export * from './constants';
