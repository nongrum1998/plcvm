/**
 * Phases of the face verification state machine.
 *
 * - `camera`    — live camera with blink-liveness detection (Phase 1)
 * - `capturing` — photo being taken and processed (Phase 2)
 * - `preview`   — first photo preview in registration mode
 * - `submitting`— API call in flight
 * - `result`    — server response displayed
 * - `declaration`— self-declaration form shown
 * - `error`     — unrecoverable error state
 */
export type FaceVerificationPhase =
  | 'camera'
  | 'capturing'
  | 'preview'
  | 'submitting'
  | 'result'
  | 'declaration'
  | 'error';

/**
 * Values accepted by the declaration controls and sent in a DLC request.
 *
 * The API represents the answers as literal strings: `'0'` means no and
 * `'1'` means yes. The narrow union prevents unsupported declaration values
 * from entering the typed request contract.
 */
export type DeclarationAnswer = '0' | '1';

/**
 * The two declaration answers carried from screen state to the preview and
 * submission request.
 *
 * The object keeps the declaration labels (`nec` and `nmc`) aligned with the
 * `/dlc` API body and prevents a second declaration representation from being
 * introduced.
 */
export interface DlcDeclarationDetails {
  /** Non-employment declaration answer. */
  nec: DeclarationAnswer;
  /** Re-marriage declaration answer. */
  nmc: DeclarationAnswer;
}

/**
 * Exact plain-object body sent to `POST /dlc` for a DLC submission.
 *
 * `DlcSubmitPayload` is passed directly to the shared HTTP client; its
 * interceptor performs Fernet encryption before transport. `image` is the raw
 * captured JPEG base64 and is neither transformed nor persisted by this
 * contract.
 */
export interface DlcSubmitPayload {
  /** Application name reported by the current device. */
  deviceName: string;
  /** Platform device identifier, with the hook's existing fallback. */
  deviceId: string;
  /** Authenticated user's PPO identifier. */
  ppo_id: string;
  /** Authenticated user's PPO number. */
  ppo_no: string;
  /** Non-employment declaration answer. */
  nec: DeclarationAnswer;
  /** Re-marriage declaration answer. */
  nmc: DeclarationAnswer;
  /** Reserved place value required by the current API contract. */
  place: string;
  /** Raw captured JPEG base64, kept in memory only. */
  image: string;
}

/**
 * Decrypted application envelope returned by `POST /dlc`.
 *
 * The shared HTTP wrapper exposes this body through `ApiResponse.data` while
 * keeping its outer HTTP success flag separate. The `/dlc` contract requires a
 * boolean application-level `status` and a human-readable message; the
 * submission hook normalizes `status` into `ApiResponse.success` before the
 * screen renders a result.
 */
export interface DlcResponseEnvelope {
  /** Application-level processing result from the backend. */
  status: boolean;
  /** Human-readable result or rejection reason from the backend. */
  message: string;
  /** Optional opaque result data; the current flow does not consume it. */
  data?: unknown;
}

/**
 * Props passed to the FaceVerificationScreen from the route.
 */
export interface FaceVerificationRouteParams {
  registrationStatus: 0 | 1;
}
