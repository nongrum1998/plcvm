export interface ApiResponse<T> {
  /** Whether the request was processed successfully. */
  success: boolean;
  /** Human-readable status message from the server, or a fallback. */
  message: string;
  /** HTTP status code. Omitted when no server response was received
   *  (e.g. network failure, request-setup error). */
  status?: number;
  /** Response payload — `null` on failure. */
  data?: T | null;
  /** Structured error details returned on failure. */
  error?: { msg: string } | string | Record<string, unknown>;
  /** Per-field validation errors returned on failure. */
  errors?: Record<string, unknown>;
}
/** Shape of error bodies the backend may return. */
export type BackendErrorBody = {
  message?: string;
  error?: string | Record<string, unknown>;
  errors?: Record<string, unknown>;
  msg?: string;
};
