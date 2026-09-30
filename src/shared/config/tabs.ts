import { TabRouteT } from '@sharedTypes/tab';

/**
 * Common tabs accessible by all roles.
 */
export const COMMON_TABS: TabRouteT[] = [
  { name: 'index', title: 'Home' },
  { name: 'statement/index', title: 'Salary' },
  { name: 'leaves/index', title: 'Leaves' },
  { name: 'profile/index', title: 'Profile' },
];

/**
 * Tabs specifically for Super Admin.
 */
export const SUPER_ADMIN_TABS: TabRouteT[] = [...COMMON_TABS];

/**
 * Default tabs for standard users.
 */
export const DEFAULT_USER_TABS: TabRouteT[] = [...COMMON_TABS];
