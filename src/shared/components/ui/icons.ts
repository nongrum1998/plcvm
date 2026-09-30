import Alert01Default from '@hugeicons/core-free-icons/Alert01Icon';
import ArrowLeft01Icon from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import Book01Icon from '@hugeicons/core-free-icons/Book01Icon';
import Camera01Icon from '@hugeicons/core-free-icons/Camera01Icon';
import CheckmarkCircle01Icon from '@hugeicons/core-free-icons/CheckmarkCircle01Icon';
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';
import ChevronDownIcon from '@hugeicons/core-free-icons/ChevronDownIcon';
import Contact01Icon from '@hugeicons/core-free-icons/Contact01Icon';
import DashboardSquare01Icon from '@hugeicons/core-free-icons/DashboardSquare01Icon';
import EllipseIcon from '@hugeicons/core-free-icons/EllipseIcon';
import EyeClosedIcon from '@hugeicons/core-free-icons/EyeClosedIcon';
import EyeIcon from '@hugeicons/core-free-icons/EyeIcon';
import FileNotFoundIcon from '@hugeicons/core-free-icons/FileNotFoundIcon';
import InfoIcon from '@hugeicons/core-free-icons/InfoIcon';
import Mail01Icon from '@hugeicons/core-free-icons/Mail01Icon';
import MapPinIcon from '@hugeicons/core-free-icons/MapPinIcon';
import MenuIcon from '@hugeicons/core-free-icons/MenuIcon';
import PrinterIcon from '@hugeicons/core-free-icons/PrinterIcon';
import Rocket01Icon from '@hugeicons/core-free-icons/Rocket01Icon';
import SecurityBlockIcon from '@hugeicons/core-free-icons/SecurityBlockIcon';
import Shield01Icon from '@hugeicons/core-free-icons/Shield01Icon';
import SmartPhone01Icon from '@hugeicons/core-free-icons/SmartPhone01Icon';
import TelephoneIcon from '@hugeicons/core-free-icons/TelephoneIcon';
import Tick01Icon from '@hugeicons/core-free-icons/Tick01Icon';
import ToolsIcon from '@hugeicons/core-free-icons/ToolsIcon';
import UserCircle02Icon from '@hugeicons/core-free-icons/UserCircle02Icon';
import UserUnlock01Icon from '@hugeicons/core-free-icons/UserUnlock01Icon';
import AlertCircleIcon from '@hugeicons/core-free-icons/AlertCircleIcon';
import PropertyDeleteIcon from '@hugeicons/core-free-icons/PropertyDeleteIcon';
import ReceiptTextIcon from '@hugeicons/core-free-icons/ReceiptTextIcon';
import Download01Icon from '@hugeicons/core-free-icons/Download01Icon';
import FileCheckIcon from '@hugeicons/core-free-icons/FileCheckIcon';

/**
 * Central icon re-export layer.
 *
 * Importing from `@hugeicons/core-free-icons` (the package barrel) bundles ALL
 * 6,000+ icons because Metro cannot tree-shake the 672KB `index.js`. Importing
 * from individual subpaths here bundles only the icons actually used.
 *
 * NOTE: `AlertIcon` and `AlertTriangle` are ALIASES defined by the barrel for
 * the single underlying `Alert01Icon` file — they import the same default under
 * two different local names. `ArrowLeft01FreeIcons` likewise aliases
 * `ArrowLeft01Icon`. The subpath must point at the real filename, not the alias.
 */
export {
  Alert01Default as AlertIcon,
  Alert01Default as AlertTriangle,
  ArrowLeft01Icon as ArrowLeft01FreeIcons,
  AlertCircleIcon,
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
  FileNotFoundIcon,
  InfoIcon,
  Mail01Icon,
  MapPinIcon,
  MenuIcon,
  PrinterIcon,
  Rocket01Icon,
  SecurityBlockIcon,
  Shield01Icon,
  SmartPhone01Icon,
  TelephoneIcon,
  Tick01Icon,
  ToolsIcon,
  UserCircle02Icon,
  UserUnlock01Icon,
  PropertyDeleteIcon,
  ReceiptTextIcon,
  Download01Icon,
  FileCheckIcon,
};
