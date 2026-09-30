import type { ReactNode } from 'react';

/** Props accepted by the {@linkcode PolicySection} clause card component. */
export interface PolicySectionProps {
  /** Clause heading rendered bold in primary color, e.g. "1. Information Collected". */
  title: string;
  /** Body content rendered inside the card beneath the heading. */
  children: ReactNode;
}
