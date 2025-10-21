import { describe, expect, it } from "vitest";

import {
  createInitialLayoutState,
  detectInitialIsMobile,
  type InitialLayoutStateSnapshot,
} from "~/lib/layout/initial-layout";

describe("detectInitialIsMobile", () => {
  it("respects sec-ch-ua-mobile header", () => {
    expect(
      detectInitialIsMobile({
        mobileHint: "?1",
        defaultValue: false,
      }),
    ).toBe(true);

    expect(
      detectInitialIsMobile({
        mobileHint: "?0",
        defaultValue: true,
      }),
    ).toBe(false);
  });

  it("uses viewport width hint when available", () => {
    expect(
      detectInitialIsMobile({
        viewportWidthHint: 719,
        smBreakpoint: 720,
        defaultValue: false,
      }),
    ).toBe(true);

    expect(
      detectInitialIsMobile({
        viewportWidthHint: 1024,
        smBreakpoint: 720,
        defaultValue: true,
      }),
    ).toBe(false);
  });

  it("falls back to user-agent matching", () => {
    expect(
      detectInitialIsMobile({
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        defaultValue: false,
      }),
    ).toBe(true);

    expect(
      detectInitialIsMobile({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        defaultValue: true,
      }),
    ).toBe(true);
  });

  it("defaults to conservative mobile fallback", () => {
    expect(detectInitialIsMobile()).toBe(true);
  });
});

function getLayoutState(
  overrides: Partial<Parameters<typeof createInitialLayoutState>[0]> = {},
): InitialLayoutStateSnapshot {
  return createInitialLayoutState({
    showNavigation: true,
    showRightWidgets: true,
    appBarHeight: "64px",
    leftDrawerWidth: "320px",
    rightDrawerWidth: "340px",
    smBreakpoint: 960,
    defaultValue: true,
    ...overrides,
  });
}

describe("createInitialLayoutState", () => {
  it("returns zero insets when navigation is hidden", () => {
    const state = getLayoutState({ showNavigation: false });

    expect(state.insets).toEqual({
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    });
    expect(state.leftDrawer).toBe(false);
    expect(state.rightDrawer).toBe(false);
  });

  it("keeps drawers closed for mobile devices", () => {
    const state = getLayoutState({ mobileHint: "?1" });

    expect(state.isMobile).toBe(true);
    expect(state.leftDrawer).toBe(false);
    expect(state.rightDrawer).toBe(false);
    expect(state.insets.left).toBe("0px");
    expect(state.insets.right).toBe("0px");
  });

  it("enables drawers for desktop devices", () => {
    const state = getLayoutState({ mobileHint: "?0" });

    expect(state.isMobile).toBe(false);
    expect(state.leftDrawer).toBe(true);
    expect(state.rightDrawer).toBe(true);
    expect(state.insets.left).toBe("320px");
    expect(state.insets.right).toBe("340px");
  });

  it("keeps SSR and hydration insets consistent for mobile hints", () => {
    const serverState = getLayoutState({ mobileHint: "?1" });
    const hydrationState = getLayoutState({
      mobileHint: undefined,
      viewportWidthHint: undefined,
      userAgent: undefined,
      defaultValue: serverState.isMobile,
    });

    expect(hydrationState.insets).toEqual(serverState.insets);
  });

  it("keeps SSR and hydration insets consistent for desktop hints", () => {
    const serverState = getLayoutState({ mobileHint: "?0" });
    const hydrationState = getLayoutState({
      mobileHint: undefined,
      viewportWidthHint: undefined,
      userAgent: undefined,
      defaultValue: serverState.isMobile,
    });

    expect(hydrationState.insets).toEqual(serverState.insets);
  });
});
