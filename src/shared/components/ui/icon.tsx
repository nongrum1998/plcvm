import { ColorValue } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  AlertIcon,
  AlertTriangle,
  ArrowLeft01FreeIcons,
  Book01Icon,
  Camera01Icon,
  CheckmarkCircle01Icon,
  CheckmarkCircle02Icon,
  ChevronDownIcon,
  Contact01Icon,
  DashboardSquare01Icon,
  EllipseIcon,
  EyeClosedIcon,
  EyeIcon,
  InfoIcon,
  Mail01Icon,
  MapPinIcon,
  MenuIcon,
  PrinterIcon,
  Shield01Icon,
  SmartPhone01Icon,
  TelephoneIcon,
  Tick01Icon,
  UserCircle02Icon,
  UserUnlock01Icon,
  Rocket01Icon,
  FileNotFoundIcon,
  SecurityBlockIcon,
  ToolsIcon,
  PropertyDeleteIcon,
  ReceiptTextIcon,
  Download01Icon,
  FileCheckIcon,
  SubnodeDeleteIcon,
} from './icons';
import { cn } from '@utils';

/** Semantic names for the icon set available to the shared UI components. */
export type IconName =
  | 'eye-open'
  | 'eye-close'
  | 'user-unlock'
  | 'arrow-left'
  | 'menu'
  | 'info'
  | 'information-circle'
  | 'camera-01'
  | 'user-01'
  | 'alert-triangle'
  | 'contact-01'
  | 'alert-circle'
  | 'book-01'
  | 'shield'
  | 'check-circle'
  | 'check-circle-2'
  | 'circle'
  | 'check'
  | 'chevron-down'
  | 'map-pin'
  | 'phone'
  | 'printer'
  | 'mail'
  | 'rocket-01'
  | 'security-block'
  | 'tool'
  | 'smartphone'
  | 'property-delete'
  | 'receipt'
  | 'file-not-found'
  | 'file-check-02'
  | 'sub-node-delete-icon'
  | 'download-01';

type Props = {
  /** Semantic icon name. Unknown names fall back to the menu glyph. */
  name: IconName;
  /** Square icon edge length in points. Defaults to 24. */
  size?: number;
  /** Explicit tint. Takes precedence over any colour set via `className`. */
  color?: ColorValue;
  /** NativeWind classes, typically a `text-*` colour utility. */
  className?: string;
};

/**
 * Resolves a semantic {@link IconName} to its underlying Hugeicons glyph.
 *
 * Unknown names deliberately fall back to the menu glyph rather than throwing,
 * so a bad name degrades to a visible placeholder instead of crashing a screen.
 *
 * @param name Semantic icon name to resolve.
 * @returns The Hugeicons icon component for that name.
 */
const getHugeIcon = (name: IconName) => {
  switch (name) {
    case 'eye-open':
      return EyeIcon;
    case 'eye-close':
      return EyeClosedIcon;
    case 'user-unlock':
      return UserUnlock01Icon;
    case 'arrow-left':
      return ArrowLeft01FreeIcons;
    case 'info':
      return InfoIcon;
    case 'menu':
      return MenuIcon;
    case 'alert-circle':
      return AlertIcon;
    case 'alert-triangle':
      return AlertTriangle;
    case 'information-circle':
      return DashboardSquare01Icon;
    case 'camera-01':
      return Camera01Icon;
    case 'user-01':
      return UserCircle02Icon;
    case 'contact-01':
      return Contact01Icon;
    case 'book-01':
      return Book01Icon;
    case 'shield':
      return Shield01Icon;
    case 'check-circle':
      return CheckmarkCircle01Icon;
    case 'check-circle-2':
      return CheckmarkCircle02Icon;
    case 'circle':
      return EllipseIcon;
    case 'check':
      return Tick01Icon;
    case 'chevron-down':
      return ChevronDownIcon;
    case 'map-pin':
      return MapPinIcon;
    case 'phone':
      return TelephoneIcon;
    case 'printer':
      return PrinterIcon;
    case 'mail':
      return Mail01Icon;
    case 'smartphone':
      return SmartPhone01Icon;
    case 'rocket-01':
      return Rocket01Icon;
    case 'file-not-found':
      return FileNotFoundIcon;
    case 'security-block':
      return SecurityBlockIcon;
    case 'tool':
      return ToolsIcon;
    case 'property-delete':
      return PropertyDeleteIcon;
    case 'receipt':
      return ReceiptTextIcon;
    case 'download-01':
      return Download01Icon;
    case 'file-check-02':
      return FileCheckIcon;
    case 'sub-node-delete-icon':
      return SubnodeDeleteIcon;
    default:
      return MenuIcon;
  }
};

/**
 * Renders a Hugeicons glyph selected by semantic {@link IconName}.
 *
 * Icons are imported through per-icon subpaths (see `./icons`) rather than the
 * `@hugeicons/core-free-icons` barrel, which Metro cannot tree-shake.
 *
 * @param props.name Semantic icon name to render.
 * @param props.size Square edge length in points. Defaults to 24.
 * @param props.color Explicit tint, taking precedence over `className`.
 * @param props.className NativeWind classes, typically a `text-*` colour.
 * @example
 * <Icon name="file-not-found" className="text-white" size={48} />
 */
export const Icon = ({ name, size, className, color }: Props) => {
  return (
    <HugeiconsIcon
      color={color}
      icon={getHugeIcon(name)}
      size={size || 24}
      className={cn('', className)}
    />
  );
};
