import type { Href } from 'expo-router';

type PageRouteMap<T> = {
  [K in keyof T]: T[K] extends object ? PageRouteMap<T[K]> : Href;
};

const routes = {
  // TAB
  HOME: '/' as Href,
  DLC: '/dlc' as Href,
  PENSION_SLIP: '/statement' as Href,
  AUTH: {
    HOME: '/auth' as Href,
    REGISTER: '/auth/register' as Href,
    REG_INSTRUCTION: '/auth/reg-instruction' as Href,
  },
  CHANGE_PASSWORD: '/change-password' as Href,
  DLC_STATUS: '/dlc-status' as Href,
  PROFILE: {
    HOME: '/profile' as Href,
    UPDATE: '/profile/update' as Href,
  },
  CONTACT_US: '/contact-us' as Href,
  ABOUT_US: '/about' as Href,
  FACE_RECOGNITION: '/face-recognition' as Href,
  PRIVACY: '/privacy-policy' as Href,
  USER_MANUAL: {
    HOME: '/user-manual',
    DLC: '/user-manual/dlc',
    CHANGE_PASSWORD: '/user-manual/change-password',
    GETTING_STARTED: '/user-manual/getting-started',
  },
  PDF_PREVIEW: '/pdf-preview' as Href,
  WITHDRAWAL: '/withdrawal' as Href,
} as const;

export const PAGE_ROUTES: PageRouteMap<typeof routes> = routes;
