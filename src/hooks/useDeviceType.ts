import * as React from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

const BREAKPOINTS = {
  mobileMax: 767,
  tabletMax: 1023,
} as const;

function getDeviceType(width: number): DeviceType {
  if (width <= BREAKPOINTS.mobileMax) return "mobile";
  if (width <= BREAKPOINTS.tabletMax) return "tablet";
  return "desktop";
}

function getOrientation(): "portrait" | "landscape" {
  return window.matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait";
}

/**
 * Detect device type + attach markers to <html>:
 * - data-device="mobile|tablet|desktop"
 * - data-orientation="portrait|landscape"
 * - classes: device-mobile/device-tablet/device-desktop, orient-portrait/orient-landscape
 */
export function useDeviceType(): { device: DeviceType; orientation: "portrait" | "landscape" } {
  const [state, setState] = React.useState(() => {
    if (typeof window === "undefined") return { device: "desktop" as DeviceType, orientation: "portrait" as const };
    return { device: getDeviceType(window.innerWidth), orientation: getOrientation() };
  });

  React.useEffect(() => {
    const html = document.documentElement;

    const applyMarkers = (device: DeviceType, orientation: "portrait" | "landscape") => {
      html.dataset.device = device;
      html.dataset.orientation = orientation;

      html.classList.remove("device-mobile", "device-tablet", "device-desktop");
      html.classList.add(`device-${device}`);

      html.classList.remove("orient-portrait", "orient-landscape");
      html.classList.add(`orient-${orientation}`);
    };

    const update = () => {
      const device = getDeviceType(window.innerWidth);
      const orientation = getOrientation();
      setState({ device, orientation });
      applyMarkers(device, orientation);
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return state;
}
