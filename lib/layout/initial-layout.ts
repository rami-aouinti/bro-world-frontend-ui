export interface DetectInitialIsMobileOptions {
  mobileHint?: string | null;
  viewportWidthHint?: number | null;
  userAgent?: string | null;
  smBreakpoint?: number | null | undefined;
  defaultValue?: boolean;
}

const MOBILE_USER_AGENT_REGEX =
  /mobile|iphone|ipod|ipad|android|iemobile|blackberry|kindle|silk|opera (?:mini|mobi)|fennec|windows phone|webos/i;

export function detectInitialIsMobile(options: DetectInitialIsMobileOptions = {}): boolean {
  const { mobileHint, viewportWidthHint, userAgent, smBreakpoint, defaultValue = true } = options;

  if (mobileHint === "?1") {
    return true;
  }

  if (mobileHint === "?0") {
    return false;
  }

  const normalizedBreakpoint =
    typeof smBreakpoint === "number" && Number.isFinite(smBreakpoint) && smBreakpoint > 0
      ? smBreakpoint
      : null;

  if (
    typeof viewportWidthHint === "number" &&
    Number.isFinite(viewportWidthHint) &&
    viewportWidthHint > 0 &&
    normalizedBreakpoint !== null
  ) {
    return viewportWidthHint < normalizedBreakpoint;
  }

  if (typeof userAgent === "string" && userAgent.length > 0) {
    if (MOBILE_USER_AGENT_REGEX.test(userAgent.toLowerCase())) {
      return true;
    }
  }

  return defaultValue;
}

export interface LayoutInsets {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export interface CreateInitialLayoutStateOptions extends DetectInitialIsMobileOptions {
  showNavigation: boolean;
  showRightWidgets: boolean;
  appBarHeight: string | null | undefined;
  leftDrawerWidth?: string;
  rightDrawerWidth?: string;
}

export interface InitialLayoutStateSnapshot {
  isMobile: boolean;
  leftDrawer: boolean;
  rightDrawer: boolean;
  insets: LayoutInsets;
}

export function createInitialLayoutState(
  options: CreateInitialLayoutStateOptions,
): InitialLayoutStateSnapshot {
  const {
    showNavigation,
    showRightWidgets,
    appBarHeight,
    leftDrawerWidth = "320px",
    rightDrawerWidth = "340px",
    defaultValue = true,
    ...detectOptions
  } = options;

  const isMobile = detectInitialIsMobile({ ...detectOptions, defaultValue });

  if (!showNavigation) {
    return {
      isMobile,
      leftDrawer: false,
      rightDrawer: false,
      insets: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    } as const;
  }

  const topInset =
    typeof appBarHeight === "string" && appBarHeight.length > 0 ? appBarHeight : "0px";
  const leftInset = isMobile ? "0px" : leftDrawerWidth;
  const rightInset = !isMobile && showRightWidgets ? rightDrawerWidth : "0px";

  return {
    isMobile,
    leftDrawer: !isMobile,
    rightDrawer: !isMobile && showRightWidgets,
    insets: {
      top: topInset,
      right: rightInset,
      bottom: "0px",
      left: leftInset,
    },
  } as const;
}
