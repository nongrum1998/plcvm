import { PageHeader } from '@sharedTypes';

export const PAGE_HEADERS = {
  // TABS
  '/': { title: 'Pensioner', showDrawer: true },
  '/dlc': { title: 'Submit Digital Life Certificate', showDrawer: true },
  '/statement': { title: 'Pensioner Statements', showDrawer: true },

  // pages
  '/profile': { title: 'My Profile', showBackButton: true },
  '/withdrawal': { title: 'Withdrawal', showBackButton: true },
  '/auth': { title: 'Pensioner', showBackButton: true },
  '/auth/register': { title: 'Register/Update-Password', showBackButton: true },
  '/auth/reg-instruction': { title: 'Instructions', showBackButton: true },
  '/contact-us': { title: 'Contact Us', showBackButton: true },
  '/change-password': { title: 'Change Password', showBackButton: true },
  '/profile/update': { title: 'Update Profile', showBackButton: true },
  '/about': { title: 'About Us', showBackButton: true },
  '/face-recognition': { title: 'Photo Verification', showBackButton: true },
  '/pdf-preview': { title: 'PDF Preview', showBackButton: true },

  '/dlc-status': { title: 'Digital Life Certificate', showBackButton: true },

  '/user-manual': { title: 'App User Manual', showBackButton: true, showDrawer: false },

  '/user-manual/getting-started': {
    title: 'Getting Started',
    showBackButton: true,
    showDrawer: false,
  },
  '/user-manual/change-password': {
    title: 'Change Password',
    showBackButton: true,
  },
  '/user-manual/dlc': {
    title: 'Digital Life Certificate',
    showBackButton: true,
  },
  '/privacy-policy': { title: 'Privacy Policy', showBackButton: true, showDrawer: false },
} as const satisfies PageHeader;

export type PageHeaderRoute = keyof typeof PAGE_HEADERS;
