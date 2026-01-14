import * as React from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

/**
 * Detect device type using User Agent (reliable, doesn't change on rotate)
 */
function getDeviceTypeFromUA(): DeviceType {
  if (typeof navigator === "undefined") return "desktop";
  
  const ua = navigator.userAgent.toLowerCase();
  
  // Check for tablets first (iPad, Android tablet, etc.)
  const isTablet = 
    /ipad/.test(ua) ||
    (/android/.test(ua) && !/mobile/.test(ua)) ||
    /tablet/.test(ua) ||
    /kindle/.test(ua) ||
    /silk/.test(ua) ||
    /playbook/.test(ua);
  
  if (isTablet) return "tablet";
  
  // Check for mobile phones
  const isMobile = 
    /iphone|ipod/.test(ua) ||
    (/android/.test(ua) && /mobile/.test(ua)) ||
    /windows phone/.test(ua) ||
    /blackberry/.test(ua) ||
    /opera mini|opera mobi/.test(ua) ||
    /mobile/.test(ua);
  
  if (isMobile) return "mobile";
  
  return "desktop";
}

function getOrientation(): "portrait" | "landscape" {
  if (typeof window === "undefined") return "portrait";
  return window.matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait";
}

function isFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
}

/**
 * Detect device type via User Agent + orientation + fullscreen state
 * - data-device="mobile|tablet|desktop" (from UA, stable)
 * - data-orientation="portrait|landscape"
 * - data-fullscreen="true|false"
 * - data-compact-mode="true" when mobile/tablet + landscape + fullscreen
 */
export function useDeviceType(): { 
  device: DeviceType; 
  orientation: "portrait" | "landscape";
  isFullscreen: boolean;
  isCompactMode: boolean;
} {
  const [state, setState] = React.useState(() => {
    const device = getDeviceTypeFromUA();
    const orientation = getOrientation();
    const fullscreen = isFullscreen();
    // Compact mode: mobile/tablet in landscape AND fullscreen
    const isCompactMode = device !== "desktop" && orientation === "landscape" && fullscreen;
    return { device, orientation, isFullscreen: fullscreen, isCompactMode };
  });

  React.useEffect(() => {
    const html = document.documentElement;

    const applyMarkers = (device: DeviceType, orientation: "portrait" | "landscape", fullscreen: boolean, compact: boolean) => {
      html.dataset.device = device;
      html.dataset.orientation = orientation;
      html.dataset.fullscreen = String(fullscreen);
      html.dataset.compactMode = String(compact);

      html.classList.remove("device-mobile", "device-tablet", "device-desktop");
      html.classList.add(`device-${device}`);

      html.classList.remove("orient-portrait", "orient-landscape");
      html.classList.add(`orient-${orientation}`);

      html.classList.toggle("fullscreen-mode", fullscreen);
      html.classList.toggle("compact-mode", compact);
    };

    const update = () => {
      const device = getDeviceTypeFromUA();
      const orientation = getOrientation();
      const fullscreen = isFullscreen();
      const compact = device !== "desktop" && orientation === "landscape" && fullscreen;
      setState({ device, orientation, isFullscreen: fullscreen, isCompactMode: compact });
      applyMarkers(device, orientation, fullscreen, compact);
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });
    document.addEventListener("fullscreenchange", update);
    document.addEventListener("webkitfullscreenchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      document.removeEventListener("fullscreenchange", update);
      document.removeEventListener("webkitfullscreenchange", update);
    };
  }, []);

  return state;
}
