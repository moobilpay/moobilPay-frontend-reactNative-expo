import { useWindowDimensions, Platform } from 'react-native';

const MAX_APP_WIDTH = 500;

/**
 * Returns a capped width for layout calculations.
 * On web, the window can be very wide (1920px+), so we cap it to MAX_APP_WIDTH
 * to keep the mobile-like layout intact.
 */
export function useResponsiveWidth() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const width = Platform.OS === 'web'
    ? Math.min(windowWidth, MAX_APP_WIDTH)
    : windowWidth;

  return { width, windowWidth, windowHeight, maxWidth: MAX_APP_WIDTH };
}
