import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { coreProjectMdiIcons } from "~/lib/vuetify/projectMdiIcons";

type VuetifyModule = typeof import("~/plugins/vuetify");

let getRegisteredMdiAliases: VuetifyModule["getRegisteredMdiAliases"] | undefined;
let loadProjectMdiIcons: VuetifyModule["loadProjectMdiIcons"] | undefined;

beforeAll(async () => {
  const globalThisRef = globalThis as typeof globalThis & {
    defineNuxtPlugin?: (plugin: unknown) => unknown;
  };

  globalThisRef.defineNuxtPlugin = (plugin) => plugin;

  const module = await import("~/plugins/vuetify");

  getRegisteredMdiAliases = module.getRegisteredMdiAliases;
  loadProjectMdiIcons = module.loadProjectMdiIcons;
});

afterAll(() => {
  const globalThisRef = globalThis as typeof globalThis & {
    defineNuxtPlugin?: (plugin: unknown) => unknown;
  };

  delete globalThisRef.defineNuxtPlugin;
});

describe("vuetify icon aliases", () => {
  it("includes eager project icons by default", () => {
    const aliases = getRegisteredMdiAliases?.();
    const expected = coreProjectMdiIcons["mdi-menu"];

    expect(aliases?.["mdi-menu"]).toBe(`svg:${expected}`);
    expect(aliases?.["mdi:menu"]).toBe(`svg:${expected}`);
  });

  it("registers lazy project icons on demand", async () => {
    const iconName = "mdi-menu-down";

    await loadProjectMdiIcons?.([iconName]);

    const aliases = getRegisteredMdiAliases?.();
    const { fullProjectMdiIcons } = await import("~/lib/vuetify/projectMdiIcons.full");
    const expected = fullProjectMdiIcons[iconName];

    expect(aliases?.[iconName]).toBe(`svg:${expected}`);
    expect(aliases?.["mdi:menu-down"]).toBe(`svg:${expected}`);
  });
});
