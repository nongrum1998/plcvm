import type { ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

/**
 * Props for the {@link SectionCard} component.
 *
 * Renders a senior-friendly card with a numbered circular badge and a bold
 * title header, followed by arbitrary child content.
 */
export interface UserManualSectionCardProps {
  /** Badge text displayed inside the circular header (e.g. "1"). */
  stepNumber?: string;
  /** Card title rendered next to the badge in large high-contrast text. */
  title: string;
  /** Card body content rendered below the header divider. */
  children: ReactNode;
}

/**
 * Props for the {@link UserManualStepImage} component.
 *
 * Displays an instructional screenshot with an optional dark caption bar,
 * or a large dashed placeholder when no image source is provided.
 */
export interface UserManualStepImageProps {
  /** Image source to render; omit to show the placeholder instead. */
  source?: ImageSourcePropType;
  /** Short "Look for this" hint shown in the dark caption bar. */
  caption?: string;
  /** Text shown inside the placeholder when no source is given. */
  placeholderText?: string;
}
