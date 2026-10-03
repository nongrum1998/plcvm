import { ImageFooter } from '../layout/image-footer';

/**
 * Images rendered by the app-wide footer, in display order.
 *
 * `source` must be a static `require` so Metro can bundle the asset; a
 * dynamic lookup would not be resolvable at build time.
 */
const footerImages = [
  {
    source: require('@assets/images/NIC.png'),
    alt: 'nic image',
  },
  {
    source: require('@assets/images/Digital-India.png'),
    alt: 'digital-india',
  },
];

/**
 * App-wide footer showing the NIC and Digital India marks above the build
 * version.
 *
 * A thin binding of the presentational {@link ImageFooter} to this app's
 * branding assets. Use this component rather than `ImageFooter` directly
 * unless you need a different set of marks.
 */
export const FooterImg = () => <ImageFooter images={footerImages} />;
