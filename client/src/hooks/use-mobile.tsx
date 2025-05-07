import * as React from "react";

export enum BreakpointSize {
  xs = "xs", // mobile small
  sm = "sm", // mobile large
  md = "md", // tablet
  lg = "lg", // desktop
  xl = "xl", // large desktop
}

export const breakpoints = {
  xs: 480,  // Small mobile devices
  sm: 640,  // Mobile devices
  md: 768,  // Tablets
  lg: 1024, // Laptops/desktops
  xl: 1280, // Large desktops
};

/**
 * Custom hook to detect screen size and provide responsive utilities
 * @returns An object with responsive utilities
 */
export function useMobile() {
  const [screenSize, setScreenSize] = React.useState<BreakpointSize | null>(null);
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Helper function to determine current screen size
    const getScreenSize = (): BreakpointSize => {
      const width = window.innerWidth;
      if (width < breakpoints.xs) return BreakpointSize.xs;
      if (width < breakpoints.sm) return BreakpointSize.sm;
      if (width < breakpoints.md) return BreakpointSize.md;
      if (width < breakpoints.lg) return BreakpointSize.lg;
      return BreakpointSize.xl;
    };

    // Function to update state based on current screen size
    const updateScreenSize = () => {
      const currentSize = getScreenSize();
      setScreenSize(currentSize);
      setIsMobile(
        currentSize === BreakpointSize.xs || 
        currentSize === BreakpointSize.sm
      );
    };

    // Set initial value
    updateScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", updateScreenSize);

    // Clean up event listener
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return {
    isMobile,
    screenSize,
    isXs: screenSize === BreakpointSize.xs,
    isSm: screenSize === BreakpointSize.sm,
    isMd: screenSize === BreakpointSize.md,
    isLg: screenSize === BreakpointSize.lg,
    isXl: screenSize === BreakpointSize.xl,
    isTabletOrMobile: screenSize === BreakpointSize.xs || 
                     screenSize === BreakpointSize.sm || 
                     screenSize === BreakpointSize.md,
    isDesktopOrLarger: screenSize === BreakpointSize.lg || 
                      screenSize === BreakpointSize.xl,
  };
}
